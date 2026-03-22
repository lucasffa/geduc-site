import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { statusHistory } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { eq, sql } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewDashboard');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json([]);

	const id = event.params.id;

	try {
		const history = orgDb
			.select()
			.from(statusHistory)
			.where(eq(statusHistory.participantId, id))
			.orderBy(sql`${statusHistory.changedAt} DESC`)
			.all();

		return json(history);
	} catch (error) {
		console.error('Erro ao buscar histórico:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
