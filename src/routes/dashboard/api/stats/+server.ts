import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { participants, certificates, statusHistory } from '$lib/server/db/schema';
import { sql, count, eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	try {
		// Total participants
		const [totalResult] = await db.select({ count: count() }).from(participants);

		// Count by status
		const byStatus = await db
			.select({
				status: participants.status,
				count: count()
			})
			.from(participants)
			.groupBy(participants.status);

		// Count by role
		const byRole = await db
			.select({
				role: participants.role,
				count: count()
			})
			.from(participants)
			.groupBy(participants.role);

		// Certificates stats
		const [certTotal] = await db.select({ count: count() }).from(certificates);
		const [certSent] = await db
			.select({ count: count() })
			.from(certificates)
			.where(eq(certificates.status, 'enviado'));

		// Recent activity (last 10 status changes)
		const recentActivity = await db
			.select({
				id: statusHistory.id,
				participantId: statusHistory.participantId,
				fromStatus: statusHistory.fromStatus,
				toStatus: statusHistory.toStatus,
				changedAt: statusHistory.changedAt,
				changedBy: statusHistory.changedBy,
				participantName: participants.name
			})
			.from(statusHistory)
			.leftJoin(participants, eq(statusHistory.participantId, participants.id))
			.orderBy(sql`${statusHistory.changedAt} DESC`)
			.limit(10);

		return json({
			total: totalResult.count,
			byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s.count])),
			byRole: Object.fromEntries(byRole.map((r) => [r.role, r.count])),
			certificates: {
				total: certTotal.count,
				sent: certSent.count
			},
			recentActivity
		});
	} catch (error) {
		console.error('Erro ao buscar estatísticas:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
