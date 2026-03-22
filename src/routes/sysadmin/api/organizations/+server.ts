import { json, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { getSystemDb, createOrgDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';
import { isNull, sql, count } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const db = getSystemDb();
	const rows = db
		.select()
		.from(organizations)
		.where(isNull(organizations.deletedAt))
		.orderBy(sql`${organizations.createdAt} DESC`)
		.all();

	return json({ data: rows });
};

export const POST: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const body = await event.request.json();
	const { name, slug, brandName, logoUrl, primaryColor } = body;

	if (!name || !slug) {
		return json({ error: 'Nome e slug são obrigatórios' }, { status: 400 });
	}

	// Validate slug format
	if (!/^[a-z0-9-]+$/.test(slug)) {
		return json({ error: 'Slug deve conter apenas letras minúsculas, números e hífens' }, { status: 400 });
	}

	const db = getSystemDb();

	// Check uniqueness
	const existing = db.select().from(organizations)
		.where(sql`${organizations.slug} = ${slug}`)
		.get();

	if (existing) {
		return json({ error: 'Slug já está em uso' }, { status: 409 });
	}

	const id = randomUUID();
	db.insert(organizations).values({
		id,
		name,
		slug,
		brandName: brandName || name,
		logoUrl: logoUrl || null,
		primaryColor: primaryColor || '#324acb'
	}).run();

	// Create org database file
	try {
		createOrgDb(slug);
	} catch (e) {
		console.error('Erro ao criar DB da organização:', e);
	}

	logAudit(event, {
		whatTable: 'organizations',
		whatRecordId: id,
		how: 'CREATE',
		why: `Organização "${name}" (${slug}) criada`
	});

	return json({ id, slug }, { status: 201 });
};
