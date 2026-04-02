import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificates, participants } from '$lib/server/db/schema-org';
import { sendCertificateEmail, getOrgEmailConfig } from '$lib/server/resend';
import { getCertificatesDir } from '$lib/server/certificate-generator';
import { eq } from 'drizzle-orm';
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
		const { certificateId } = body;

		if (!certificateId) {
			return json({ error: 'certificateId é obrigatório' }, { status: 400 });
		}

		const cert = orgDb
			.select()
			.from(certificates)
			.where(eq(certificates.id, certificateId))
			.get();

		if (!cert) {
			return json({ error: 'Certificado não encontrado' }, { status: 404 });
		}

		const participant = orgDb
			.select()
			.from(participants)
			.where(eq(participants.id, cert.participantId))
			.get();

		if (!participant) {
			return json({ error: 'Participante não encontrado' }, { status: 404 });
		}

		const certDir = getCertificatesDir(slug);
		const pdfFullPath = path.join(certDir, cert.pdfPath!);
		if (!fs.existsSync(pdfFullPath)) {
			return json({ error: 'Arquivo PDF não encontrado' }, { status: 404 });
		}
		const pdfBuffer = new Uint8Array(fs.readFileSync(pdfFullPath));
		const filename = `certificado_${participant.name.replace(/\s+/g, '_')}.pdf`;

		const userId = event.locals.user!.id;
		const orgId = event.locals.organization?.id;
		const orgEmailConfig = getOrgEmailConfig(
			orgDb,
			event.locals.organization?.brandName || event.locals.organization?.name || 'GEDUC',
			event.locals.organization?.primaryColor
		);

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
				.set({
					status: 'enviado',
					sentAt: new Date().toISOString(),
					sentToEmail: participant.email
				})
				.where(eq(certificates.id, certificateId))
				.run();

			orgDb
				.update(participants)
				.set({ status: 'certificado_enviado', updatedAt: new Date().toISOString() })
				.where(eq(participants.id, participant.id))
				.run();

			logAudit(event, {
				whatTable: 'certificates',
				whatRecordId: certificateId,
				how: 'UPDATE',
				why: `Certificado enviado para ${participant.email}`
			});

			return json({ success: true });
		} else {
			orgDb
				.update(certificates)
				.set({ status: 'falha' })
				.where(eq(certificates.id, certificateId))
				.run();

			return json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error('Erro ao enviar certificado:', error);
		return json({ error: 'Erro ao enviar certificado' }, { status: 500 });
	}
};
