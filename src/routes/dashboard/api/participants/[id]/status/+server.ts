import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants, statusHistory } from '$lib/server/db/schema';
import { statusTransitionSchema } from '$lib/validations/participant';
import { VALID_TRANSITIONS } from '$lib/constants/participant-status';
import type { ParticipantStatus } from '$lib/constants/participant-status';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const parsed = statusTransitionSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		// Get current participant
		const [participant] = await db
			.select()
			.from(participants)
			.where(eq(participants.id, id));

		if (!participant) {
			return json({ error: 'Participante não encontrado' }, { status: 404 });
		}

		const currentStatus = participant.status as ParticipantStatus;
		const newStatus = parsed.data.newStatus;

		// Validate transition
		const validNext = VALID_TRANSITIONS[currentStatus];
		if (validNext && !validNext.includes(newStatus)) {
			return json({
				error: `Transição inválida: ${currentStatus} → ${newStatus}`,
				validTransitions: validNext
			}, { status: 400 });
		}

		// Update status
		const [updated] = await db
			.update(participants)
			.set({ status: newStatus, updatedAt: new Date() })
			.where(eq(participants.id, id))
			.returning();

		// Record status history
		await db.insert(statusHistory).values({
			participantId: id,
			fromStatus: currentStatus,
			toStatus: newStatus,
			changedBy: parsed.data.changedBy || 'sistema'
		});

		return json(updated);
	} catch (error) {
		console.error('Erro na transição de status:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
