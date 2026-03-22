import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { participants } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { inArray, isNull, and } from 'drizzle-orm';
import * as XLSX from 'xlsx';
import { STATUS_LABELS } from '$lib/constants/participant-status';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const { ids, format } = body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({ error: 'Nenhum participante selecionado' }, { status: 400 });
		}

		if (!['csv', 'xlsx'].includes(format)) {
			return json({ error: 'Formato inválido' }, { status: 400 });
		}

		const rows = orgDb
			.select()
			.from(participants)
			.where(and(inArray(participants.id, ids), isNull(participants.deletedAt)))
			.all();

		if (rows.length === 0) {
			return json({ error: 'Nenhum participante encontrado' }, { status: 404 });
		}

		const exportData = rows.map((r) => ({
			Nome: r.name,
			'E-mail': r.email,
			Cargo: r.role || '',
			Status: STATUS_LABELS[r.status as keyof typeof STATUS_LABELS] || r.status,
			'Data Inscrição': r.enrollmentDate || '',
			'Carga Horária': r.workloadHours ?? '',
			Observações: r.notes || '',
			'Criado em': r.createdAt
		}));

		const wb = XLSX.utils.book_new();
		const ws = XLSX.utils.json_to_sheet(exportData);
		XLSX.utils.book_append_sheet(wb, ws, 'Participantes');

		let buffer: Buffer;
		let contentType: string;
		let extension: string;

		if (format === 'csv') {
			const csv = XLSX.utils.sheet_to_csv(ws);
			buffer = Buffer.from(csv, 'utf-8');
			contentType = 'text/csv; charset=utf-8';
			extension = 'csv';
		} else {
			buffer = Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
			contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
			extension = 'xlsx';
		}

		logAudit(event, {
			whatTable: 'participants',
			how: 'READ',
			why: `Export ${format.toUpperCase()}: ${rows.length} participantes`,
			howManyAffected: rows.length
		});

		return new Response(buffer, {
			headers: {
				'Content-Type': contentType,
				'Content-Disposition': `attachment; filename="participantes.${extension}"`
			}
		});
	} catch (error) {
		console.error('Erro ao exportar:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
