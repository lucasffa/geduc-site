import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { participantViews } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	try {
		const existing = orgDb.select().from(participantViews).where(eq(participantViews.id, id)).get();
		if (!existing) return json({ error: 'View não encontrada' }, { status: 404 });

		const body = await event.request.json();
		const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };

		if (body.name !== undefined) updates.name = body.name.trim();
		if (body.filters !== undefined) updates.filters = JSON.stringify(body.filters);
		if (body.position !== undefined) updates.position = body.position;

		orgDb.update(participantViews).set(updates).where(eq(participantViews.id, id)).run();

		const updated = orgDb.select().from(participantViews).where(eq(participantViews.id, id)).get();

		logAudit(event, {
			whatTable: 'participant_views',
			whatRecordId: id,
			how: 'UPDATE',
			why: `View atualizada: ${updated?.name}`
		});

		return json(updated);
	} catch (error) {
		console.error('Erro ao atualizar view:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	try {
		const existing = orgDb.select().from(participantViews).where(eq(participantViews.id, id)).get();
		if (!existing) return json({ error: 'View não encontrada' }, { status: 404 });

		orgDb.delete(participantViews).where(eq(participantViews.id, id)).run();

		logAudit(event, {
			whatTable: 'participant_views',
			whatRecordId: id,
			how: 'DELETE',
			why: `View removida: ${existing.name}`
		});

		return json({ ok: true });
	} catch (error) {
		console.error('Erro ao remover view:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
