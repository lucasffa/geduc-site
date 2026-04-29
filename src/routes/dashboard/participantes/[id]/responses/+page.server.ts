import { error } from '@sveltejs/kit';
import { listResponsesByParticipant } from '$lib/server/form-service';
import { participants } from '$lib/server/db/schema-org';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, params } = event;
	if (!locals.user) {
		throw error(401, 'Não autorizado');
	}

	if (!locals.organization || !locals.orgDb) {
		throw error(403, 'Você precisa pertencer a uma organização');
	}

	const participantId = params.id;
	const participant = locals.orgDb
		.select()
		.from(participants)
		.where(eq(participants.id, participantId))
		.get();

	if (!participant) {
		throw error(404, 'Participante não encontrado');
	}

	const responses = listResponsesByParticipant(locals.orgDb, participant.id, participant.email);

	logAudit(event, {
		whatTable: 'form_responses',
		whatRecordId: participant.id,
		how: 'READ',
		why: `Consulta de respostas por participante: ${participant.name}`
	});

	return {
		participant: {
			id: participant.id,
			name: participant.name,
			email: participant.email,
			role: participant.role,
			status: participant.status
		},
		responses
	};
};
