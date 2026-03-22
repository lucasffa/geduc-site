import type { PageServerLoad } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { getSystemDb } from '$lib/server/db';
import { users, invitations } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';

export const load: PageServerLoad = (event) => {
	requirePermission(event, 'canManageUsers');

	const orgId = event.locals.organization?.id;
	if (!orgId) return { users: [], invitations: [] };

	const db = getSystemDb();

	const orgUsers = db
		.select({
			id: users.id,
			email: users.email,
			name: users.name,
			role: users.role,
			isActive: users.isActive,
			lastLoginAt: users.lastLoginAt,
			createdAt: users.createdAt
		})
		.from(users)
		.where(and(eq(users.organizationId, orgId), isNull(users.deletedAt)))
		.all();

	const pendingInvitations = db
		.select()
		.from(invitations)
		.where(and(eq(invitations.organizationId, orgId), isNull(invitations.acceptedAt)))
		.all()
		.filter((inv) => new Date(inv.expiresAt) > new Date());

	return {
		users: orgUsers,
		invitations: pendingInvitations,
		permissions: event.locals.permissions
	};
};
