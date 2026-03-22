import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const { id } = event.params;
	const body = await event.request.json();
	const db = getSystemDb();

	const user = db.select().from(users).where(eq(users.id, id)).get();
	if (!user) return json({ error: 'Usuário não encontrado' }, { status: 404 });

	// Block promoting anyone to sysadmin — only one sysadmin allowed (created via env)
	if (body.role === 'sysadmin') {
		return json({ error: 'Não é permitido atribuir o cargo sysadmin via interface' }, { status: 403 });
	}

	// Block demoting the existing sysadmin
	if (user.role === 'sysadmin' && body.role !== undefined && body.role !== 'sysadmin') {
		return json({ error: 'Não é possível alterar o cargo do sysadmin' }, { status: 403 });
	}

	const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
	if (body.role !== undefined) updates.role = body.role;
	if (body.isActive !== undefined) updates.isActive = body.isActive;
	if (body.organizationId !== undefined) updates.organizationId = body.organizationId;
	if (body.name !== undefined) updates.name = body.name;

	db.update(users).set(updates).where(eq(users.id, id)).run();

	logAudit(event, {
		whatTable: 'users',
		whatRecordId: id,
		how: 'UPDATE',
		why: `Usuário "${user.name}" atualizado via sysadmin`
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const { id } = event.params;
	const db = getSystemDb();

	const user = db.select().from(users).where(eq(users.id, id)).get();
	if (!user) return json({ error: 'Usuário não encontrado' }, { status: 404 });

	// Prevent deleting the sysadmin
	if (user.role === 'sysadmin') {
		return json({ error: 'Não é possível excluir o sysadmin' }, { status: 403 });
	}

	// Prevent self-deletion
	if (id === event.locals.user!.id) {
		return json({ error: 'Não é possível excluir a si mesmo' }, { status: 400 });
	}

	db.update(users).set({
		isActive: false,
		deletedAt: new Date().toISOString(),
		deletedBy: event.locals.user!.id,
		updatedAt: new Date().toISOString()
	}).where(eq(users.id, id)).run();

	logAudit(event, {
		whatTable: 'users',
		whatRecordId: id,
		how: 'DELETE',
		why: `Usuário "${user.name}" desativado via sysadmin (soft delete)`
	});

	return json({ success: true });
};
