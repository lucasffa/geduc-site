import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageUsers');

	const id = event.params.id;
	const db = getSystemDb();

	try {
		const body = await event.request.json();
		const updates: Record<string, unknown> = {};

		if (typeof body.isActive === 'boolean') updates.isActive = body.isActive;
		if (typeof body.role === 'string') updates.role = body.role;
		if (typeof body.name === 'string') updates.name = body.name;

		updates.updatedAt = new Date().toISOString();

		db.update(users)
			.set(updates)
			.where(and(eq(users.id, id), isNull(users.deletedAt)))
			.run();

		logAudit(event, {
			whatTable: 'users',
			whatRecordId: id,
			how: 'UPDATE',
			why: 'Usuário atualizado'
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao atualizar usuário:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canManageUsers');

	const id = event.params.id;
	const db = getSystemDb();

	try {
		db.update(users)
			.set({
				deletedAt: new Date().toISOString(),
				deletedBy: event.locals.user?.id || null,
				isActive: false
			})
			.where(eq(users.id, id))
			.run();

		logAudit(event, {
			whatTable: 'users',
			whatRecordId: id,
			how: 'DELETE',
			why: 'Usuário removido (soft delete)'
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao remover usuário:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
