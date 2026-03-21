import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants } from '$lib/server/db/schema';
import { participantUpdateSchema } from '$lib/validations/participant';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async ({ params, request }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const parsed = participantUpdateSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const updateData: Record<string, unknown> = { ...parsed.data, updatedAt: new Date() };

		const [updated] = await db
			.update(participants)
			.set(updateData)
			.where(eq(participants.id, id))
			.returning();

		if (!updated) {
			return json({ error: 'Participante não encontrado' }, { status: 404 });
		}

		return json(updated);
	} catch (error) {
		console.error('Erro ao atualizar participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	try {
		const [deleted] = await db
			.delete(participants)
			.where(eq(participants.id, id))
			.returning();

		if (!deleted) {
			return json({ error: 'Participante não encontrado' }, { status: 404 });
		}

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao remover participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
