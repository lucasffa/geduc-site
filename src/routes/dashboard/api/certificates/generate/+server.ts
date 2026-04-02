import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { participants, certificates, certificateTemplates } from '$lib/server/db/schema-org';
import { certificateConfigSchema } from '$lib/validations/participant';
import { generateCertificatePdf, getCertificatesDir, getTemplatesDir, getFontsDir } from '$lib/server/certificate-generator';
import { eq, inArray, isNull, and } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const slug = event.locals.organization?.slug;
	if (!slug) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const parsed = certificateConfigSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const { participantIds, workloadHours, periodStart, periodEnd, templateId, fields } = parsed.data;

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

		// Resolve template path if a template was selected
		let templatePath: string | undefined;
		let resolvedTemplateId: string | null = null;
		if (templateId) {
			const template = orgDb
				.select()
				.from(certificateTemplates)
				.where(eq(certificateTemplates.id, templateId))
				.get();

			if (template) {
				const templatesDir = getTemplatesDir(slug);
				const candidatePath = path.join(templatesDir, `${template.id}.pdf`);
				if (fs.existsSync(candidatePath)) {
					templatePath = candidatePath;
					resolvedTemplateId = template.id;
				}
			}
		}

		const certDir  = getCertificatesDir(slug);
		const fontsDir = getFontsDir(slug);
		const generated = [];

		for (const p of participantList) {
			const certId = randomUUID();
			const validationCode = randomUUID();

			const pdfBytes = await generateCertificatePdf(
				{ participantName: p.name, role: p.role, workloadHours, periodStart, periodEnd, validationCode },
				templatePath,
				{ fields: fields as any, fontsDir }
			);
			const filename = `${certId}.pdf`;
			const filePath = path.join(certDir, filename);
			fs.writeFileSync(filePath, pdfBytes);

			orgDb.insert(certificates).values({
				id: certId,
				participantId: p.id,
				templateId: resolvedTemplateId,
				workloadHours,
				periodStart,
				periodEnd,
				pdfPath: filename,
				validationCode,
				status: 'gerado'
			}).run();

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
