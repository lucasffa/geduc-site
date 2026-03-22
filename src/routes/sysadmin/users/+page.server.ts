import type { PageServerLoad } from './$types';
import { getSystemDb } from '$lib/server/db';
import { users, organizations } from '$lib/server/db/schema-system';
import { isNull, eq, sql } from 'drizzle-orm';

export const load: PageServerLoad = () => {
	const db = getSystemDb();

	const allUsers = db
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
		.orderBy(sql`${users.createdAt} DESC`)
		.all();

	const orgs = db
		.select({ id: organizations.id, name: organizations.name })
		.from(organizations)
		.where(isNull(organizations.deletedAt))
		.all();

	return { users: allUsers, organizations: orgs };
};
