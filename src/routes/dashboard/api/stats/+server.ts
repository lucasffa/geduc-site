import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { participants, certificates, statusHistory } from '$lib/server/db/schema-org';
import { sql, count, eq, isNull } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewStats');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ total: 0, byStatus: {}, byRole: {}, certificates: { total: 0, sent: 0 }, recentActivity: [] });

	try {
		// Total participants (active only)
		const totalResult = orgDb.select({ count: count() }).from(participants)
			.where(isNull(participants.deletedAt)).get();

		// Count by status
		const byStatus = orgDb
			.select({ status: participants.status, count: count() })
			.from(participants)
			.where(isNull(participants.deletedAt))
			.groupBy(participants.status)
			.all();

		// Count by role
		const byRole = orgDb
			.select({ role: participants.role, count: count() })
			.from(participants)
			.where(isNull(participants.deletedAt))
			.groupBy(participants.role)
			.all();

		// Certificates stats
		const certTotal = orgDb.select({ count: count() }).from(certificates)
			.where(isNull(certificates.deletedAt)).get();
		const certSent = orgDb
			.select({ count: count() })
			.from(certificates)
			.where(eq(certificates.status, 'enviado'))
			.get();

		// Recent activity (last 10 status changes)
		const recentActivity = orgDb
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
			.limit(10)
			.all();

		return json({
			total: totalResult?.count ?? 0,
			byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s.count])),
			byRole: Object.fromEntries(byRole.map((r) => [r.role, r.count])),
			certificates: {
				total: certTotal?.count ?? 0,
				sent: certSent?.count ?? 0
			},
			recentActivity
		});
	} catch (error) {
		console.error('Erro ao buscar estatísticas:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
