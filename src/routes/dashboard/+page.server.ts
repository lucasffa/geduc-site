import type { PageServerLoad } from './$types';
import { isNull, sql, count, eq } from 'drizzle-orm';
import { participants, statusHistory, certificates } from '$lib/server/db/schema-org';

export const load: PageServerLoad = ({ locals }) => {
	const orgDb = locals.orgDb;
	if (!orgDb) {
		return {
			stats: { total: 0, byStatus: {}, byRole: {}, certificates: { total: 0, sent: 0 }, recentActivity: [] }
		};
	}

	// Total participants (not soft-deleted)
	const totalResult = orgDb
		.select({ count: count() })
		.from(participants)
		.where(isNull(participants.deletedAt))
		.get();
	const total = totalResult?.count ?? 0;

	// By status
	const statusRows = orgDb
		.select({
			status: participants.status,
			count: count()
		})
		.from(participants)
		.where(isNull(participants.deletedAt))
		.groupBy(participants.status)
		.all();
	const byStatus: Record<string, number> = {};
	for (const row of statusRows) {
		byStatus[row.status] = row.count;
	}

	// By role
	const roleRows = orgDb
		.select({
			role: participants.role,
			count: count()
		})
		.from(participants)
		.where(isNull(participants.deletedAt))
		.groupBy(participants.role)
		.all();
	const byRole: Record<string, number> = {};
	for (const row of roleRows) {
		byRole[row.role] = row.count;
	}

	// Certificates
	const certTotal = orgDb
		.select({ count: count() })
		.from(certificates)
		.where(isNull(certificates.deletedAt))
		.get();
	const certSent = orgDb
		.select({ count: count() })
		.from(certificates)
		.where(sql`${certificates.deletedAt} IS NULL AND ${certificates.status} = 'enviado'`)
		.get();

	// Recent activity
	const recentActivity = orgDb
		.select({
			id: statusHistory.id,
			fromStatus: statusHistory.fromStatus,
			toStatus: statusHistory.toStatus,
			changedAt: statusHistory.changedAt,
			changedBy: statusHistory.changedBy,
			participantId: statusHistory.participantId
		})
		.from(statusHistory)
		.orderBy(sql`${statusHistory.changedAt} DESC`)
		.limit(10)
		.all();

	return {
		stats: {
			total,
			byStatus,
			byRole,
			certificates: {
				total: certTotal?.count ?? 0,
				sent: certSent?.count ?? 0
			},
			recentActivity: recentActivity.map((a) => ({
				id: a.id,
				date: a.changedAt,
				description: `Status: ${a.fromStatus || '—'} → ${a.toStatus}`,
				type: a.toStatus
			}))
		}
	};
};
