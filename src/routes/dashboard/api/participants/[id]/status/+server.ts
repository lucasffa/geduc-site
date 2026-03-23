import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { participants, statusHistory, orgSettings } from '$lib/server/db/schema-org';
import { statusTransitionSchema } from '$lib/validations/participant';
import { VALID_TRANSITIONS } from '$lib/constants/participant-status';
import type { ParticipantStatus } from '$lib/constants/participant-status';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq, and, isNull } from 'drizzle-orm';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	try {
		const body = await event.request.json();
		const parsed = statusTransitionSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const participant = orgDb
			.select()
			.from(participants)
			.where(and(eq(participants.id, id), isNull(participants.deletedAt)))
			.get();

		if (!participant) return json({ error: 'Participante não encontrado' }, { status: 404 });

		const currentStatus = participant.status as ParticipantStatus;
		const newStatus = parsed.data.newStatus;

		// Check if transition validation is enforced
		const setting = orgDb
			.select()
			.from(orgSettings)
			.where(eq(orgSettings.key, 'enforce_status_transitions'))
			.get();
		const enforceTransitions = setting?.value !== 'false';

		if (enforceTransitions) {
			const validNext = VALID_TRANSITIONS[currentStatus];
			if (validNext && !validNext.includes(newStatus)) {
				return json({
					error: `Transição inválida: ${currentStatus} → ${newStatus}`,
					validTransitions: validNext
				}, { status: 400 });
			}
		}

		orgDb.update(participants)
			.set({ status: newStatus, updatedAt: new Date().toISOString() })
			.where(eq(participants.id, id))
			.run();

		orgDb.insert(statusHistory).values({
			id: randomUUID(),
			participantId: id,
			fromStatus: currentStatus,
			toStatus: newStatus,
			changedBy: event.locals.user?.id || 'sistema'
		}).run();

		const updated = orgDb.select().from(participants).where(eq(participants.id, id)).get();

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: id,
			how: 'UPDATE',
			why: `Status: ${currentStatus} → ${newStatus}`
		});

		return json(updated);
	} catch (error) {
		console.error('Erro na transição de status:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
