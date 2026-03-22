import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { workgroups } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { isNull } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json([]);

	const rows = orgDb.select().from(workgroups).where(isNull(workgroups.deletedAt)).all();
	return json(rows);
};

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		if (!body.name?.trim()) return json({ error: 'Nome obrigatório' }, { status: 400 });

		const id = randomUUID();
		orgDb.insert(workgroups).values({
			id,
			name: body.name.trim(),
			description: body.description?.trim() || null
		}).run();

		logAudit(event, {
			whatTable: 'workgroups',
			whatRecordId: id,
			how: 'CREATE',
			why: `Grupo de trabalho criado: ${body.name}`
		});

		return json({ id, name: body.name }, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar workgroup:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
