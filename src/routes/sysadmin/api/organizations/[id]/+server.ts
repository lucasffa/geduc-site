import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSystemDb, createOrgDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const { id } = event.params;
	const db = getSystemDb();

	const org = db.select().from(organizations).where(eq(organizations.id, id)).get();
	if (!org) return json({ error: 'Organização não encontrada' }, { status: 404 });

	// Handle /create-db action
	const action = new URL(event.request.url).searchParams.get('action');
	if (action === 'create-db') {
		try {
			console.log(`[sysadmin/api/organizations/${id}] tentando criar database para ${org.slug}`);
			createOrgDb(org.slug);
			console.log(`[sysadmin/api/organizations/${id}] database criada com sucesso`);

			logAudit(event, {
				whatTable: 'organizations',
				whatRecordId: id,
				how: 'UPDATE',
				why: `Database da organização "${org.name}" (${org.slug}) criada/recuperada`
			});

			return json({ success: true, message: `Database criada para ${org.slug}` });
		} catch (e) {
			console.error(`[sysadmin/api/organizations/${id}] ERRO ao criar database:`, e);
			const errorMsg = e instanceof Error ? e.message : String(e);
			return json({ error: `Falha ao criar database: ${errorMsg}` }, { status: 500 });
		}
	}

	return json({ error: 'Ação inválida' }, { status: 400 });
};

export const PATCH: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const { id } = event.params;
	const body = await event.request.json();
	const db = getSystemDb();

	const org = db.select().from(organizations).where(eq(organizations.id, id)).get();
	if (!org) return json({ error: 'Organização não encontrada' }, { status: 404 });

	const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
	if (body.name !== undefined) updates.name = body.name;
	if (body.brandName !== undefined) updates.brandName = body.brandName;
	if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;
	if (body.primaryColor !== undefined) updates.primaryColor = body.primaryColor;
	if (body.isActive !== undefined) updates.isActive = body.isActive;

	db.update(organizations).set(updates).where(eq(organizations.id, id)).run();

	logAudit(event, {
		whatTable: 'organizations',
		whatRecordId: id,
		how: 'UPDATE',
		why: `Organização "${org.name}" atualizada`
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const { id } = event.params;
	const db = getSystemDb();

	const org = db.select().from(organizations).where(eq(organizations.id, id)).get();
	if (!org) return json({ error: 'Organização não encontrada' }, { status: 404 });

	// Soft delete
	db.update(organizations).set({
		isActive: false,
		deletedAt: new Date().toISOString(),
		deletedBy: event.locals.user!.id,
		updatedAt: new Date().toISOString()
	}).where(eq(organizations.id, id)).run();

	logAudit(event, {
		whatTable: 'organizations',
		whatRecordId: id,
		how: 'DELETE',
		why: `Organização "${org.name}" desativada (soft delete)`
	});

	return json({ success: true });
};
