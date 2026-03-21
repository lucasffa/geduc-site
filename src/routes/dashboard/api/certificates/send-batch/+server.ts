import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { certificates, participants } from '$lib/server/db/schema';
import { sendCertificateEmail } from '$lib/server/resend';
import { eq, inArray } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { certificateIds } = body;

		if (!Array.isArray(certificateIds) || certificateIds.length === 0) {
			return json({ error: 'certificateIds deve ser um array não-vazio' }, { status: 400 });
		}

		const certs = await db
			.select()
			.from(certificates)
			.where(inArray(certificates.id, certificateIds));

		const results: { id: number; success: boolean; error?: string }[] = [];

		for (const cert of certs) {
			const [participant] = await db
				.select()
				.from(participants)
				.where(eq(participants.id, cert.participantId));

			if (!participant || !cert.pdfPath) {
				results.push({ id: cert.id, success: false, error: 'Dados incompletos' });
				continue;
			}

			const pdfFullPath = path.resolve('static', cert.pdfPath.replace(/^\//, ''));
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
				filename
			);

			if (result.success) {
				await db
					.update(certificates)
					.set({ status: 'enviado', sentAt: new Date(), sentToEmail: participant.email })
					.where(eq(certificates.id, cert.id));

				await db
					.update(participants)
					.set({ status: 'certificado_enviado', updatedAt: new Date() })
					.where(eq(participants.id, participant.id));

				results.push({ id: cert.id, success: true });
			} else {
				await db
					.update(certificates)
					.set({ status: 'falha' })
					.where(eq(certificates.id, cert.id));

				results.push({ id: cert.id, success: false, error: result.error });
			}
		}

		const successCount = results.filter((r) => r.success).length;
		const failCount = results.filter((r) => !r.success).length;

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
