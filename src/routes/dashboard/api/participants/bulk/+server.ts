import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { participants, statusHistory } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq, inArray, isNull, and } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const { ids, action, newStatus, newRole } = body;

		if (!Array.isArray(ids) || ids.length === 0) {
			return json({ error: 'Nenhum participante selecionado' }, { status: 400 });
		}

		const validActions = ['deactivate', 'change_status', 'change_role'];
		if (!validActions.includes(action)) {
			return json({ error: 'Ação inválida' }, { status: 400 });
		}

		// Fetch affected participants
		const affected = orgDb
			.select()
			.from(participants)
			.where(and(inArray(participants.id, ids), isNull(participants.deletedAt)))
			.all();

		if (affected.length === 0) {
			return json({ error: 'Nenhum participante encontrado' }, { status: 404 });
		}

		const now = new Date().toISOString();
		const userId = event.locals.user?.id || 'sistema';

		if (action === 'deactivate') {
			for (const p of affected) {
				orgDb.update(participants)
					.set({ status: 'desativado', updatedAt: now })
					.where(eq(participants.id, p.id))
					.run();

				orgDb.insert(statusHistory).values({
					id: randomUUID(),
					participantId: p.id,
					fromStatus: p.status,
					toStatus: 'desativado',
					changedBy: userId
				}).run();
			}
		} else if (action === 'change_status') {
			if (!newStatus) return json({ error: 'Novo status é obrigatório' }, { status: 400 });

			for (const p of affected) {
				orgDb.update(participants)
					.set({ status: newStatus, updatedAt: now })
					.where(eq(participants.id, p.id))
					.run();

				orgDb.insert(statusHistory).values({
					id: randomUUID(),
					participantId: p.id,
					fromStatus: p.status,
					toStatus: newStatus,
					changedBy: userId
				}).run();
			}
		} else if (action === 'change_role') {
			if (!newRole) return json({ error: 'Novo cargo é obrigatório' }, { status: 400 });

			for (const p of affected) {
				orgDb.update(participants)
					.set({ role: newRole, updatedAt: now })
					.where(eq(participants.id, p.id))
					.run();
			}
		}

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: affected.map((p) => p.id).join(','),
			how: 'UPDATE',
			why: `Bulk ${action}: ${affected.length} participantes`,
			howManyAffected: affected.length
		});

		return json({ ok: true, affected: affected.length });
	} catch (error) {
		console.error('Erro em bulk action:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
