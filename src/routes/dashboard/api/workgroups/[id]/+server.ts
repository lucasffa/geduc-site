import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { workgroups } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;
	const body = await event.request.json();

	const updates: Record<string, unknown> = {};

	if (typeof body.name === 'string') {
		if (!body.name.trim()) return json({ error: 'Nome obrigatório' }, { status: 400 });
		updates.name = body.name.trim();
	}
	if (typeof body.description === 'string') {
		updates.description = body.description.trim() || null;
	}
	if (typeof body.isActive === 'boolean') {
		updates.isActive = body.isActive;
	}

	if (Object.keys(updates).length === 0) {
		return json({ error: 'Nenhuma alteração enviada' }, { status: 400 });
	}

	updates.updatedAt = new Date().toISOString();

	orgDb.update(workgroups)
		.set(updates)
		.where(eq(workgroups.id, id))
		.run();

	logAudit(event, {
		whatTable: 'workgroups',
		whatRecordId: id,
		how: 'UPDATE',
		why: `Grupo de trabalho atualizado: ${JSON.stringify(updates)}`
	});

	return json({ success: true });
};

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	orgDb.update(workgroups)
		.set({
			deletedAt: new Date().toISOString(),
			deletedBy: event.locals.user?.id || null,
			isActive: false
		})
		.where(eq(workgroups.id, id))
		.run();

	logAudit(event, {
		whatTable: 'workgroups',
		whatRecordId: id,
		how: 'DELETE',
		why: 'Grupo de trabalho removido (soft delete)'
	});

	return json({ success: true });
};
