import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificates, participants } from '$lib/server/db/schema-org';
import { eq, and, gte, lte, desc, inArray } from 'drizzle-orm';
import { getCertificatesDir } from '$lib/server/certificate-generator';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ certificates: [] });

	const url = event.url;
	const status  = url.searchParams.get('status')   ?? 'gerado';
	const dateFrom = url.searchParams.get('dateFrom') ?? '';
	const dateTo   = url.searchParams.get('dateTo')   ?? '';

	try {
		const conditions = [];

		if (status !== 'all') {
			conditions.push(eq(certificates.status, status));
		}
		if (dateFrom) {
			conditions.push(gte(certificates.createdAt, dateFrom));
		}
		if (dateTo) {
			// dateTo inclusive: adiciona T23:59:59
			conditions.push(lte(certificates.createdAt, dateTo + 'T23:59:59'));
		}

		const rows = orgDb
			.select({
				id:               certificates.id,
				participantId:    certificates.participantId,
				participantName:  participants.name,
				participantEmail: participants.email,
				templateId:       certificates.templateId,
				workloadHours:    certificates.workloadHours,
				periodStart:      certificates.periodStart,
				periodEnd:        certificates.periodEnd,
				status:           certificates.status,
				sentAt:           certificates.sentAt,
				sentToEmail:      certificates.sentToEmail,
				createdAt:        certificates.createdAt
			})
			.from(certificates)
			.leftJoin(participants, eq(certificates.participantId, participants.id))
			.where(conditions.length ? and(...conditions) : undefined)
			.orderBy(desc(certificates.createdAt))
			.all();

		return json({ certificates: rows });
	} catch (error) {
		console.error('Erro ao listar certificados:', error);
		return json({ certificates: [] });
	}
};

export const DELETE: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const slug = event.locals.organization?.slug;
	if (!slug) return json({ error: 'Organização não configurada' }, { status: 400 });

	const { ids } = await event.request.json();
	if (!Array.isArray(ids) || ids.length === 0) {
		return json({ error: 'Nenhum ID fornecido' }, { status: 400 });
	}

	try {
		// Busca os PDFs antes de deletar do banco
		const rows = orgDb
			.select({ id: certificates.id, pdfPath: certificates.pdfPath })
			.from(certificates)
			.where(inArray(certificates.id, ids))
			.all();

		// Remove do banco
		orgDb.delete(certificates).where(inArray(certificates.id, ids)).run();

		for (const row of rows) {
			logAudit(event, {
				whatTable: 'certificates',
				whatRecordId: row.id,
				how: 'DELETE',
				why: `Certificado apagado (PDF: ${row.pdfPath || '—'})`
			});
		}

		// Remove os arquivos do disco
		const certDir = getCertificatesDir(slug);
		for (const row of rows) {
			if (row.pdfPath) {
				const filePath = path.join(certDir, row.pdfPath);
				if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
			}
		}

		return json({ deleted: rows.length });
	} catch (error) {
		console.error('Erro ao apagar certificados:', error);
		return json({ error: 'Erro ao apagar certificados' }, { status: 500 });
	}
};
