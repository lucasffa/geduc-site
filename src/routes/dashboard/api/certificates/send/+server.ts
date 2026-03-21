import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { certificates, participants } from '$lib/server/db/schema';
import { sendCertificateEmail } from '$lib/server/resend';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { certificateId } = body;

		if (!certificateId) {
			return json({ error: 'certificateId é obrigatório' }, { status: 400 });
		}

		const [cert] = await db
			.select()
			.from(certificates)
			.where(eq(certificates.id, certificateId));

		if (!cert) {
			return json({ error: 'Certificado não encontrado' }, { status: 404 });
		}

		const [participant] = await db
			.select()
			.from(participants)
			.where(eq(participants.id, cert.participantId));

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

		const result = await sendCertificateEmail(
			participant.email,
			participant.name,
			pdfBuffer,
			filename
		);

		if (result.success) {
			await db
				.update(certificates)
				.set({
					status: 'enviado',
					sentAt: new Date(),
					sentToEmail: participant.email
				})
				.where(eq(certificates.id, certificateId));

			await db
				.update(participants)
				.set({ status: 'certificado_enviado', updatedAt: new Date() })
				.where(eq(participants.id, participant.id));

			return json({ success: true });
		} else {
			await db
				.update(certificates)
				.set({ status: 'falha' })
				.where(eq(certificates.id, certificateId));

			return json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error('Erro ao enviar certificado:', error);
		return json({ error: 'Erro ao enviar certificado' }, { status: 500 });
	}
};
