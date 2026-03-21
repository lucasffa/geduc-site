import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getTemplatesDir } from '$lib/server/certificate-generator';
import fs from 'fs';
import path from 'path';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

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

		const templateName = name || file.name.replace('.pdf', '');
		const templateDir = getTemplatesDir();
		const buffer = await file.arrayBuffer();

		fs.writeFileSync(
			path.join(templateDir, `${templateName}.pdf`),
			Buffer.from(buffer)
		);

		logAudit(event, {
			whatTable: 'certificates',
			whatRecordId: templateName,
			how: 'CREATE',
			why: `Template de certificado "${templateName}" enviado`
		});

		return json({
			success: true,
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

	try {
		const templateDir = getTemplatesDir();
		const files = fs.readdirSync(templateDir).filter((f) => f.endsWith('.pdf'));
		const templates = files.map((f) => ({
			name: f.replace('.pdf', ''),
			filename: f
		}));

		return json({ templates });
	} catch (error) {
		console.error('Erro ao listar templates:', error);
		return json({ templates: [] });
	}
};
