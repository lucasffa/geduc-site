import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificateTemplates } from '$lib/server/db/schema-org';
import { getTemplatesDir } from '$lib/server/certificate-generator';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const slug = event.locals.organization?.slug;
	if (!slug) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const formData = await event.request.formData();
		const file = formData.get('file') as File | null;
		const name = formData.get('name') as string | null;

		if (!file) {
			return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
		}

		if (!file.name.endsWith('.pdf')) {
			return json({ error: 'O arquivo deve ser um PDF' }, { status: 400 });
		}

		const templateId = randomUUID();
		const templateName = name || file.name.replace('.pdf', '');
		const templateDir = getTemplatesDir(slug);
		const buffer = await file.arrayBuffer();

		fs.writeFileSync(
			path.join(templateDir, `${templateId}.pdf`),
			Buffer.from(buffer)
		);

		orgDb.insert(certificateTemplates).values({
			id: templateId,
			name: templateName,
			originalFilename: file.name,
			createdBy: event.locals.user?.id || null
		}).run();

		logAudit(event, {
			whatTable: 'certificate_templates',
			whatRecordId: templateId,
			how: 'CREATE',
			why: `Template de certificado "${templateName}" enviado`
		});

		return json({
			success: true,
			id: templateId,
			templateName,
			message: `Template "${templateName}" salvo com sucesso`
		}, { status: 201 });
	} catch (error) {
		console.error('Erro ao fazer upload do template:', error);
		return json({ error: 'Erro ao salvar template' }, { status: 500 });
	}
};

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ templates: [] });

	try {
		const templates = orgDb
			.select()
			.from(certificateTemplates)
			.all();

		return json({ templates });
	} catch (error) {
		console.error('Erro ao listar templates:', error);
		return json({ templates: [] });
	}
};
