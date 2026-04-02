import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { certificateTemplates } from '$lib/server/db/schema-org';
import { getTemplatesDir } from '$lib/server/certificate-generator';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) throw error(404);

	const slug = event.locals.organization?.slug;
	if (!slug) throw error(404);

	const { id } = event.params;

	const template = orgDb
		.select()
		.from(certificateTemplates)
		.where(eq(certificateTemplates.id, id))
		.get();

	if (!template) throw error(404, 'Template não encontrado');

	const filePath = path.join(getTemplatesDir(slug), `${template.id}.pdf`);
	if (!fs.existsSync(filePath)) throw error(404, 'Arquivo não encontrado');

	const buffer = fs.readFileSync(filePath);

	return new Response(buffer, {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': 'inline',
			'Cache-Control': 'private, max-age=3600'
		}
	});
};
