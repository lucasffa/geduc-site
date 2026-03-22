import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { users, organizations } from '$lib/server/db/schema-system';
import { isNull, eq, sql, like } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const url = event.url;
	const search = url.searchParams.get('search') || '';
	const role = url.searchParams.get('role') || '';
	const orgId = url.searchParams.get('orgId') || '';
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
	const offset = (page - 1) * limit;

	const db = getSystemDb();

	let query = db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			organizationId: users.organizationId,
			orgName: organizations.name,
			isActive: users.isActive,
			lastLoginAt: users.lastLoginAt,
			createdAt: users.createdAt
		})
		.from(users)
		.leftJoin(organizations, eq(users.organizationId, organizations.id))
		.where(isNull(users.deletedAt))
		.$dynamic();

	if (search) {
		query = query.where(sql`(LOWER(${users.name}) LIKE ${`%${search.toLowerCase()}%`} OR LOWER(${users.email}) LIKE ${`%${search.toLowerCase()}%`})`);
	}
	if (role) {
		query = query.where(eq(users.role, role as typeof users.role.enumValues[number]));
	}
	if (orgId) {
		query = query.where(eq(users.organizationId, orgId));
	}

	const rows = query
		.orderBy(sql`${users.createdAt} DESC`)
		.limit(limit)
		.offset(offset)
		.all();

	const totalResult = db
		.select({ count: sql<number>`count(*)` })
		.from(users)
		.where(isNull(users.deletedAt))
		.get();

	return json({
		data: rows,
		total: totalResult?.count ?? 0,
		page,
		limit
	});
};
