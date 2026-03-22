import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { participants } from '$lib/server/db/schema-org';
import { parseSpreadsheet } from '$lib/server/spreadsheet-parser';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canImportSpreadsheet');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const formData = await event.request.formData();
		const file = formData.get('file') as File | null;

		if (!file) {
			return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
		}

		const buffer = await file.arrayBuffer();
		const result = parseSpreadsheet(buffer, file.name);

		if (result.errors.length > 0 && result.rows.length === 0) {
			return json({
				error: 'Nenhuma linha válida na planilha',
				errors: result.errors
			}, { status: 400 });
		}

		// Insert valid rows into the database
		const inserted = [];
		for (const row of result.rows) {
			const id = randomUUID();
			orgDb.insert(participants).values({
				id,
				name: row.nome,
				email: row.email,
				role: row.cargo,
				status: 'inscrito',
				enrollmentDate: row.dataInscricao,
				cycleEndDate: row.dataFimCiclo
			}).run();
			inserted.push({ id, name: row.nome });
		}

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: 'batch-import',
			how: 'CREATE',
			why: `Importação de planilha: ${inserted.length} participantes importados de "${file.name}"`,
			howManyAffected: inserted.length
		});

		return json({
			imported: inserted.length,
			errors: result.errors,
			totalRows: result.totalRows
		}, { status: 201 });
	} catch (error) {
		console.error('Erro na importação:', error);
		return json({ error: 'Erro ao processar planilha' }, { status: 500 });
	}
};
