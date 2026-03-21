import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants, certificates } from '$lib/server/db/schema';
import { certificateConfigSchema } from '$lib/validations/participant';
import { generateCertificatePdf, getCertificatesDir, getTemplatesDir } from '$lib/server/certificate-generator';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = certificateConfigSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const { participantIds, workloadHours, periodStart, periodEnd, templateName } = parsed.data;

		// Get participants
		const participantList = await db
			.select()
			.from(participants)
			.where(inArray(participants.id, participantIds));

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
			const [cert] = await db.insert(certificates).values({
				participantId: p.id,
				templateName: templateName || 'default',
				workloadHours,
				periodStart,
				periodEnd,
				pdfPath: `/certificates/${filename}`,
				status: 'gerado'
			}).returning();

			// Update participant status
			await db
				.update(participants)
				.set({ status: 'certificado_processando', updatedAt: new Date() })
				.where(eq(participants.id, p.id));

			generated.push(cert);
		}

		return json({ generated, count: generated.length }, { status: 201 });
	} catch (error) {
		console.error('Erro ao gerar certificados:', error);
		return json({ error: 'Erro ao gerar certificados' }, { status: 500 });
	}
};
