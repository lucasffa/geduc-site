import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { certificates, participants } from '$lib/server/db/schema-org';
import { sendTestEmail } from '$lib/server/resend';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canSendEmails');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const { certificateId, testEmail } = body;

		if (!certificateId || !testEmail) {
			return json({ error: 'certificateId e testEmail são obrigatórios' }, { status: 400 });
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

		const pdfFullPath = path.resolve('static', cert.pdfPath!.replace(/^\//, ''));
		if (!fs.existsSync(pdfFullPath)) {
			return json({ error: 'Arquivo PDF não encontrado' }, { status: 404 });
		}

		const pdfBuffer = new Uint8Array(fs.readFileSync(pdfFullPath));
		const filename = `certificado_teste_${participant.name.replace(/\s+/g, '_')}.pdf`;

		const userId = event.locals.user!.id;
		const orgId = event.locals.organization?.id;

		const result = await sendTestEmail(testEmail, participant.name, pdfBuffer, filename, userId, orgId);

		if (result.success) {
			return json({ success: true, message: `E-mail de teste enviado para ${testEmail}` });
		} else {
			return json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		console.error('Erro ao enviar e-mail de teste:', error);
		return json({ error: 'Erro ao enviar e-mail de teste' }, { status: 500 });
	}
};
