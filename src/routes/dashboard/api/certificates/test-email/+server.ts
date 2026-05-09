import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificates, participants } from '$lib/server/db/schema-org';
import { sendTestEmail, getOrgEmailConfig } from '$lib/server/resend';
import { getCertificatesDir } from '$lib/server/certificate-generator';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { logger } from '$lib/utils/logger';

const COMPONENT = 'test-email';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canSendEmails');

	const userId = event.locals.user!.id;
	logger.info('POST /api/certificates/test-email received', { userId }, COMPONENT);

	const orgDb = event.locals.orgDb;
	if (!orgDb) {
		logger.warn('Rejected: no orgDb', { userId }, COMPONENT);
		return json({ error: 'Organização não configurada' }, { status: 400 });
	}

	const slug = event.locals.organization?.slug;
	if (!slug) {
		logger.warn('Rejected: no org slug', { userId }, COMPONENT);
		return json({ error: 'Organização não configurada' }, { status: 400 });
	}

	try {
		const body = await event.request.json();
		const { certificateId, testEmail } = body;
		logger.debug('Payload parsed', { certificateId, testEmail }, COMPONENT);

		if (!certificateId || !testEmail) {
			logger.warn('Rejected: missing fields', { certificateId, testEmail }, COMPONENT);
			return json({ error: 'certificateId e testEmail são obrigatórios' }, { status: 400 });
		}

		const cert = orgDb
			.select()
			.from(certificates)
			.where(eq(certificates.id, certificateId))
			.get();

		if (!cert) {
			logger.warn('Certificate not found', { certificateId }, COMPONENT);
			return json({ error: 'Certificado não encontrado' }, { status: 404 });
		}
		logger.debug('Certificate loaded', { certId: cert.id, participantId: cert.participantId, pdfPath: cert.pdfPath }, COMPONENT);

		const participant = orgDb
			.select()
			.from(participants)
			.where(eq(participants.id, cert.participantId))
			.get();

		if (!participant) {
			logger.warn('Participant not found', { participantId: cert.participantId }, COMPONENT);
			return json({ error: 'Participante não encontrado' }, { status: 404 });
		}

		const certDir = getCertificatesDir(slug);
		const pdfFullPath = path.join(certDir, cert.pdfPath!);
		if (!fs.existsSync(pdfFullPath)) {
			logger.error('PDF file missing on disk', { pdfFullPath }, COMPONENT);
			return json({ error: 'Arquivo PDF não encontrado' }, { status: 404 });
		}

		const pdfBuffer = new Uint8Array(fs.readFileSync(pdfFullPath));
		const filename = `certificado_teste_${participant.name.replace(/\s+/g, '_')}.pdf`;
		logger.debug('PDF loaded', { pdfFullPath, sizeBytes: pdfBuffer.byteLength, filename }, COMPONENT);

		const orgId = event.locals.organization?.id;
		const orgEmailConfig = getOrgEmailConfig(
			orgDb,
			event.locals.organization?.brandName || event.locals.organization?.name || 'GEDUC',
			event.locals.organization?.primaryColor
		);
		logger.info('Calling sendTestEmail', {
			to: testEmail,
			userId,
			orgId,
			emailDomain: orgEmailConfig.emailDomain,
			emailFrom: orgEmailConfig.emailFrom,
			orgName: orgEmailConfig.orgName
		}, COMPONENT);

		const result = await sendTestEmail(testEmail, participant.name, pdfBuffer, filename, userId, orgId, orgEmailConfig);

		if (result.success) {
			logger.info('Resend SDK reported success', { to: testEmail, providerMessageId: (result as any).id ?? null }, COMPONENT);
			logAudit(event, {
				whatTable: 'certificates',
				whatRecordId: cert.id,
				how: 'READ',
				why: `E-mail de teste enviado para ${testEmail} (cert. de ${participant.name})`
			});
			return json({ success: true, message: `E-mail de teste enviado para ${testEmail}` });
		} else {
			logger.error('Resend SDK reported failure', { to: testEmail, error: result.error }, COMPONENT);
			logAudit(event, {
				whatTable: 'certificates',
				whatRecordId: cert.id,
				how: 'READ',
				why: `Falha ao enviar e-mail de teste para ${testEmail}: ${result.error}`
			});
			return json({ error: result.error }, { status: 500 });
		}
	} catch (error) {
		logger.error('Erro ao enviar e-mail de teste', error, COMPONENT);
		return json({ error: 'Erro ao enviar e-mail de teste' }, { status: 500 });
	}
};
