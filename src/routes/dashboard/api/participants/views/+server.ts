import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { participantViews } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewDashboard');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json([]);

	const views = orgDb
		.select()
		.from(participantViews)
		.orderBy(sql`${participantViews.position} ASC`)
		.all();

	return json(views);
};

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const { name, filters, position } = body;

		if (!name || typeof name !== 'string' || !name.trim()) {
			return json({ error: 'Nome é obrigatório' }, { status: 400 });
		}

		const id = randomUUID();
		orgDb.insert(participantViews).values({
			id,
			name: name.trim(),
			filters: JSON.stringify(filters || {}),
			position: position ?? 0
		}).run();

		const created = orgDb.select().from(participantViews).where(sql`${participantViews.id} = ${id}`).get();

		logAudit(event, {
			whatTable: 'participant_views',
			whatRecordId: id,
			how: 'CREATE',
			why: `View criada: ${name.trim()}`
		});

		return json(created, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar view:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
