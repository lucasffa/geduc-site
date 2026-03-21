import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { statusHistory, participants } from '$lib/server/db/schema';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) {
		return json({ error: 'ID inválido' }, { status: 400 });
	}

	try {
		const history = await db
			.select()
			.from(statusHistory)
			.where(eq(statusHistory.participantId, id))
			.orderBy(sql`${statusHistory.changedAt} DESC`);

		return json({ history });
	} catch (error) {
		console.error('Erro ao buscar histórico:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
