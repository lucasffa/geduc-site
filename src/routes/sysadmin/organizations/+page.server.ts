import type { PageServerLoad } from './$types';
import { getSystemDb } from '$lib/server/db';
import { organizations, users } from '$lib/server/db/schema-system';
import { isNull, eq, sql, count } from 'drizzle-orm';

export const load: PageServerLoad = () => {
	const db = getSystemDb();

	const orgs = db
		.select()
		.from(organizations)
		.where(isNull(organizations.deletedAt))
		.orderBy(sql`${organizations.createdAt} DESC`)
		.all();

	// Count users per org
	const userCounts = db
		.select({
			organizationId: users.organizationId,
			count: count()
		})
		.from(users)
		.where(isNull(users.deletedAt))
		.groupBy(users.organizationId)
		.all();

	const countMap = Object.fromEntries(
		userCounts.map(r => [r.organizationId, r.count])
	);

	return {
		organizations: orgs.map(org => ({
			...org,
			userCount: countMap[org.id] || 0
		}))
	};
};
