import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { certificateFonts } from '$lib/server/db/schema-org';
import { getFontsDir } from '$lib/server/certificate-generator';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const ALLOWED_EXTS = ['.ttf', '.otf'];

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ fonts: [] });

	try {
		const fonts = orgDb.select().from(certificateFonts).all();
		return json({ fonts });
	} catch (error) {
		console.error('Erro ao listar fontes:', error);
		return json({ fonts: [] });
	}
};

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

		if (!file) return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });

		const ext = path.extname(file.name).toLowerCase();
		if (!ALLOWED_EXTS.includes(ext)) {
			return json({ error: 'Apenas arquivos TTF ou OTF são aceitos' }, { status: 400 });
		}

		const fontId   = randomUUID();
		const fontName = name?.trim() || path.basename(file.name, ext);
		const fontsDir = getFontsDir(slug);
		const buffer   = await file.arrayBuffer();

		fs.writeFileSync(path.join(fontsDir, `${fontId}${ext}`), Buffer.from(buffer));

		orgDb.insert(certificateFonts).values({
			id: fontId,
			name: fontName,
			originalFilename: file.name,
			createdBy: event.locals.user?.id || null
		}).run();

		logAudit(event, {
			whatTable: 'certificate_fonts',
			whatRecordId: fontId,
			how: 'CREATE',
			why: `Fonte "${fontName}" enviada`
		});

		return json({ success: true, id: fontId, name: fontName }, { status: 201 });
	} catch (error) {
		console.error('Erro ao salvar fonte:', error);
		return json({ error: 'Erro ao salvar fonte' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	requirePermission(event, 'canManageCertificates');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const slug = event.locals.organization?.slug;
	if (!slug) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const { fontId } = await event.request.json();
		if (!fontId) return json({ error: 'ID da fonte não informado' }, { status: 400 });

		const font = orgDb.select().from(certificateFonts).where(eq(certificateFonts.id, fontId)).get();
		if (!font) return json({ error: 'Fonte não encontrada' }, { status: 404 });

		// Remove arquivo(s) do disco
		const fontsDir = getFontsDir(slug);
		for (const ext of ALLOWED_EXTS) {
			const fp = path.join(fontsDir, `${fontId}${ext}`);
			if (fs.existsSync(fp)) fs.unlinkSync(fp);
		}

		orgDb.delete(certificateFonts).where(eq(certificateFonts.id, fontId)).run();

		logAudit(event, {
			whatTable: 'certificate_fonts',
			whatRecordId: fontId,
			how: 'DELETE',
			why: `Fonte "${font.name}" removida`
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao remover fonte:', error);
		return json({ error: 'Erro ao remover fonte' }, { status: 500 });
	}
};
