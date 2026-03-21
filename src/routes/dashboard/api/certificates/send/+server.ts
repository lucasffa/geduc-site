import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificates, participants } from '$lib/server/db/schema-org';
import { sendCertificateEmail } from '$lib/server/resend';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canSendEmails');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

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

		// Read PDF file
		const pdfFullPath = path.resolve('static', cert.pdfPath!.replace(/^\//, ''));
		if (!fs.existsSync(pdfFullPath)) {
			return json({ error: 'Arquivo PDF não encontrado' }, { status: 404 });
		}
		const pdfBuffer = new Uint8Array(fs.readFileSync(pdfFullPath));
		const filename = `certificado_${participant.name.replace(/\s+/g, '_')}.pdf`;

		const userId = event.locals.user!.id;
		const orgId = event.locals.organization?.id;

		const result = await sendCertificateEmail(
			participant.email,
			participant.name,
			pdfBuffer,
			filename,
			userId,
			orgId
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
