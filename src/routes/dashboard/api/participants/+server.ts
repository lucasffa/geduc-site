import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { participants } from '$lib/server/db/schema-org';
import { participantSchema } from '$lib/validations/participant';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq, sql, count, isNull, and } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewDashboard');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ data: [], pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } });

	const { url } = event;
	const status = url.searchParams.get('status');
	const role = url.searchParams.get('role');
	const search = url.searchParams.get('search');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = (page - 1) * limit;

	try {
		const conditions = [isNull(participants.deletedAt)];
		if (status) conditions.push(eq(participants.status, status));
		if (role) conditions.push(eq(participants.role, role));
		if (search) {
			conditions.push(
				sql`(LOWER(${participants.name}) LIKE ${`%${search.toLowerCase()}%`} OR LOWER(${participants.email}) LIKE ${`%${search.toLowerCase()}%`})`
			);
		}

		const where = sql.join(conditions, sql` AND `);

		const data = orgDb.select().from(participants).where(where).limit(limit).offset(offset).orderBy(sql`${participants.createdAt} DESC`).all();
		const totalResult = orgDb.select({ count: count() }).from(participants).where(where).get();

		return json({
			data,
			pagination: {
				page, limit,
				total: totalResult?.count ?? 0,
				totalPages: Math.ceil((totalResult?.count ?? 0) / limit)
			}
		});
	} catch (error) {
		console.error('Erro ao buscar participantes:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageParticipants');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const parsed = participantSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const id = randomUUID();
		orgDb.insert(participants).values({
			id,
			name: parsed.data.name,
			email: parsed.data.email,
			role: parsed.data.role,
			status: parsed.data.status || 'inscrito',
			enrollmentDate: parsed.data.enrollmentDate || null,
			cycleEndDate: parsed.data.cycleEndDate || null,
			workloadHours: parsed.data.workloadHours || null,
			notes: parsed.data.notes || null
		}).run();

		const created = orgDb.select().from(participants).where(eq(participants.id, id)).get();

		logAudit(event, {
			whatTable: 'participants',
			whatRecordId: id,
			how: 'CREATE',
			why: 'Participante criado via formulário'
		});

		return json(created, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
