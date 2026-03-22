import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { participants } from '$lib/server/db/schema-org';
import { participantUpdateSchema } from '$lib/validations/participant';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq, and, isNull } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	try {
		const body = await event.request.json();
		const parsed = participantUpdateSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const existing = orgDb.select().from(participants).where(and(eq(participants.id, id), isNull(participants.deletedAt))).get();
		if (!existing) return json({ error: 'Participante não encontrado' }, { status: 404 });

		orgDb.update(participants)
			.set({ ...parsed.data, updatedAt: new Date().toISOString() })
			.where(eq(participants.id, id))
			.run();

		const updated = orgDb.select().from(participants).where(eq(participants.id, id)).get();

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: id,
			how: 'UPDATE',
			why: 'Participante atualizado via formulário'
		});

		return json(updated);
	} catch (error) {
		console.error('Erro ao atualizar participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canDeleteParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	try {
		const existing = orgDb.select().from(participants).where(and(eq(participants.id, id), isNull(participants.deletedAt))).get();
		if (!existing) return json({ error: 'Participante não encontrado' }, { status: 404 });

		// Soft delete
		orgDb.update(participants)
			.set({
				deletedAt: new Date().toISOString(),
				deletedBy: event.locals.user?.id || null,
				isActive: false
			})
			.where(eq(participants.id, id))
			.run();

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: id,
			how: 'DELETE',
			why: 'Participante removido (soft delete)'
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao remover participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
