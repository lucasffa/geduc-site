import type { RequestHandler } from './$types';
import { error } from '@sveltejs/kit';
import { requirePermission } from '$lib/server/middleware/auth';
import { certificates } from '$lib/server/db/schema-org';
import { getCertificatesDir } from '$lib/server/certificate-generator';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) throw error(400, 'Organização não configurada');

	const slug = event.locals.organization?.slug;
	if (!slug) throw error(400, 'Organização não configurada');

	const cert = orgDb
		.select()
		.from(certificates)
		.where(eq(certificates.id, event.params.id))
		.get();

	if (!cert || !cert.pdfPath) throw error(404, 'Certificado não encontrado');

	const certDir = getCertificatesDir(slug);
	const filePath = path.join(certDir, cert.pdfPath);

	if (!fs.existsSync(filePath)) throw error(404, 'Arquivo PDF não encontrado');

	const pdfBuffer = fs.readFileSync(filePath);

	return new Response(pdfBuffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `inline; filename="${cert.pdfPath}"`
		}
	});
};
