import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants } from '$lib/server/db/schema';
import { participantSchema } from '$lib/validations/participant';
import { eq, ilike, or, sql, count } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const status = url.searchParams.get('status');
	const role = url.searchParams.get('role');
	const search = url.searchParams.get('search');
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '50');
	const offset = (page - 1) * limit;

	try {
		const conditions = [];
		if (status) {
			conditions.push(eq(participants.status, status));
		}
		if (role) {
			conditions.push(eq(participants.role, role));
		}
		if (search) {
			conditions.push(
				or(
					ilike(participants.name, `%${search}%`),
					ilike(participants.email, `%${search}%`)
				)!
			);
		}

		const whereClause = conditions.length > 0
			? conditions.reduce((acc, cond) => sql`${acc} AND ${cond}`)
			: undefined;

		const [data, totalResult] = await Promise.all([
			db.select().from(participants)
				.where(whereClause)
				.limit(limit)
				.offset(offset)
				.orderBy(participants.createdAt),
			db.select({ count: count() }).from(participants).where(whereClause)
		]);

		return json({
			data,
			pagination: {
				page,
				limit,
				total: totalResult[0].count,
				totalPages: Math.ceil(totalResult[0].count / limit)
			}
		});
	} catch (error) {
		console.error('Erro ao buscar participantes:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const parsed = participantSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 400 });
		}

		const [created] = await db.insert(participants).values({
			name: parsed.data.name,
			email: parsed.data.email,
			role: parsed.data.role,
			status: parsed.data.status,
			enrollmentDate: parsed.data.enrollmentDate || null,
			cycleEndDate: parsed.data.cycleEndDate || null,
			workloadHours: parsed.data.workloadHours || null,
			notes: parsed.data.notes || null
		}).returning();

		return json(created, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar participante:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
