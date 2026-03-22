import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

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
