import type { PageServerLoad } from './$types';
import { getSystemDb } from '$lib/server/db';
import { organizations, users, auditLog } from '$lib/server/db/schema-system';
import { sql, isNull, count } from 'drizzle-orm';

export const load: PageServerLoad = () => {
	const db = getSystemDb();

	const orgCount = db.select({ count: count() }).from(organizations)
		.where(isNull(organizations.deletedAt)).get();

	const userCount = db.select({ count: count() }).from(users)
		.where(isNull(users.deletedAt)).get();

	const activeUsers = db.select({ count: count() }).from(users)
		.where(sql`${users.isActive} = 1 AND ${users.deletedAt} IS NULL`).get();

	const recentAudit = db.select({ count: count() }).from(auditLog).get();

	const usersByRole = db
		.select({ role: users.role, count: count() })
		.from(users)
		.where(isNull(users.deletedAt))
		.groupBy(users.role)
		.all();

	return {
		stats: {
			organizations: orgCount?.count ?? 0,
			totalUsers: userCount?.count ?? 0,
			activeUsers: activeUsers?.count ?? 0,
			auditEntries: recentAudit?.count ?? 0,
			usersByRole: Object.fromEntries(usersByRole.map(r => [r.role, r.count]))
		}
	};
};
