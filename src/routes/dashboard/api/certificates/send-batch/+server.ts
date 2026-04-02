import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificates, participants } from '$lib/server/db/schema-org';
import { sendCertificateEmail, getOrgEmailConfig } from '$lib/server/resend';
import { getCertificatesDir } from '$lib/server/certificate-generator';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canSendEmails');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const slug = event.locals.organization?.slug;
	if (!slug) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const { certificateIds } = body;

		if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
			return json({ error: 'certificateIds deve ser um array não-vazio' }, { status: 400 });
		}

		const certs = orgDb
			.select()
			.from(certificates)
			.where(inArray(certificates.id, certificateIds))
			.all();

		const userId = event.locals.user!.id;
		const orgId = event.locals.organization?.id;
		const orgEmailConfig = getOrgEmailConfig(
			orgDb,
			event.locals.organization?.brandName || event.locals.organization?.name || 'GEDUC',
			event.locals.organization?.primaryColor
		);
		const certDir = getCertificatesDir(slug);
		const results: { id: string; success: boolean; error?: string }[] = [];

		for (const cert of certs) {
			const participant = orgDb
				.select()
				.from(participants)
				.where(eq(participants.id, cert.participantId))
				.get();

			if (!participant || !cert.pdfPath) {
				results.push({ id: cert.id, success: false, error: 'Dados incompletos' });
				continue;
			}

			const pdfFullPath = path.join(certDir, cert.pdfPath);
			if (!fs.existsSync(pdfFullPath)) {
				results.push({ id: cert.id, success: false, error: 'PDF não encontrado' });
				continue;
			}

			const pdfBuffer = new Uint8Array(fs.readFileSync(pdfFullPath));
			const filename = `certificado_${participant.name.replace(/\s+/g, '_')}.pdf`;

			const result = await sendCertificateEmail(
				participant.email,
				participant.name,
				pdfBuffer,
				filename,
				userId,
				orgId,
				orgEmailConfig
			);

			if (result.success) {
				orgDb
					.update(certificates)
					.set({ status: 'enviado', sentAt: new Date().toISOString(), sentToEmail: participant.email })
					.where(eq(certificates.id, cert.id))
					.run();

				orgDb
					.update(participants)
					.set({ status: 'certificado_enviado', updatedAt: new Date().toISOString() })
					.where(eq(participants.id, participant.id))
					.run();

				results.push({ id: cert.id, success: true });
			} else {
				orgDb
					.update(certificates)
					.set({ status: 'falha' })
					.where(eq(certificates.id, cert.id))
					.run();

				results.push({ id: cert.id, success: false, error: result.error });
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const failCount = results.filter((r) => !r.success).length;

		logAudit(event, {
			whatTable: 'certificates',
			whatRecordId: 'batch-send',
			how: 'UPDATE',
			why: `Envio em lote: ${successCount} enviados, ${failCount} falhas`,
			howManyAffected: successCount
		});

		return json({
			total: results.length,
			success: successCount,
			failed: failCount,
			details: results
		});
	} catch (error) {
		console.error('Erro no envio em lote:', error);
		return json({ error: 'Erro no envio em lote' }, { status: 500 });
	}
};
