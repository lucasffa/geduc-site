import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { participants, certificates } from '$lib/server/db/schema-org';
import { certificateConfigSchema } from '$lib/validations/participant';
import { generateCertificatePdf, getCertificatesDir, getTemplatesDir } from '$lib/server/certificate-generator';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const parsed = certificateConfigSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const { participantIds, workloadHours, periodStart, periodEnd, templateName } = parsed.data;

		// Get participants (active, not deleted)
		const participantList = orgDb
			.select()
			.from(participants)
			.where(and(
				inArray(participants.id, participantIds),
				isNull(participants.deletedAt)
			))
			.all();

		if (participantList.length === 0) {
			return json({ error: 'Nenhum participante encontrado' }, { status: 404 });
		}

		// Check template
		const templatesDir = getTemplatesDir();
		const templatePath = templateName && templateName !== 'default'
			? path.join(templatesDir, `${templateName}.pdf`)
			: undefined;

		const certDir = getCertificatesDir();
		const generated = [];

		for (const p of participantList) {
			const pdfBytes = await generateCertificatePdf(
				{
					participantName: p.name,
					role: p.role,
					workloadHours,
					periodStart,
					periodEnd
				},
				templatePath
			);

			const filename = `certificado_${p.id}_${Date.now()}.pdf`;
			const filePath = path.join(certDir, filename);
			fs.writeFileSync(filePath, pdfBytes);

			// Save to DB
			const certId = randomUUID();
			orgDb.insert(certificates).values({
				id: certId,
				participantId: p.id,
				templateName: templateName || 'default',
				workloadHours,
				periodStart,
				periodEnd,
				pdfPath: `/certificates/${filename}`,
				status: 'gerado'
			}).run();

			// Update participant status
			orgDb
				.update(participants)
				.set({ status: 'certificado_processando', updatedAt: new Date().toISOString() })
				.where(eq(participants.id, p.id))
				.run();

			generated.push({ id: certId, participantId: p.id });
		}

		logAudit(event, {
			whatTable: 'certificates',
			whatRecordId: 'batch-generate',
			how: 'CREATE',
			why: `${generated.length} certificados gerados`,
			howManyAffected: generated.length
		});

		return json({ generated, count: generated.length }, { status: 201 });
	} catch (error) {
		console.error('Erro ao gerar certificados:', error);
		return json({ error: 'Erro ao gerar certificados' }, { status: 500 });
	}
};
