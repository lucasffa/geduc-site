import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { resolvePermissions } from '$lib/server/auth/permissions';
import { getSystemDb, getOrgDb, initSystemDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';
import { ROLE_PERMISSIONS } from '$lib/constants/feature-flags';
import type { OrganizationInfo } from '$lib/types/auth';

// Initialize system DB on server start
initSystemDb();

export const handle: Handle = ({ event, resolve }) => {
	// Default locals
	event.locals.user = null;
	event.locals.organization = null;
	event.locals.permissions = ROLE_PERMISSIONS.dumb;
	event.locals.orgDb = null;

	// Read session
	const sessionToken = event.cookies.get('session_id');

	if (sessionToken) {
		const user = validateSession(sessionToken);

		if (user) {
			event.locals.user = user;
			event.locals.permissions = resolvePermissions(user.role);

			// Load organization if user belongs to one
			if (user.organizationId) {
				const db = getSystemDb();
				const org = db
					.select()
					.from(organizations)
					.where(
						and(
							eq(organizations.id, user.organizationId),
							isNull(organizations.deletedAt)
						)
					)
					.get();

				if (org) {
					const orgInfo: OrganizationInfo = {
						id: org.id,
						slug: org.slug,
						name: org.name,
						brandName: org.brandName,
						logoUrl: org.logoUrl,
						primaryColor: org.primaryColor || '#324acb'
					};
					event.locals.organization = orgInfo;

					try {
						event.locals.orgDb = getOrgDb(org.slug);
					} catch {
						// Org DB may not exist yet
					}
				}
			}
		}
	}

	// Route guards
	const path = event.url.pathname;

	// Dashboard requires authentication (and not dumb)
	if (path.startsWith('/dashboard')) {
		if (!event.locals.user || event.locals.user.role === 'dumb') {
			throw redirect(302, '/auth/login');
		}
	}

	// Sysadmin panel requires sysadmin role
	if (path.startsWith('/sysadmin')) {
		if (!event.locals.user || event.locals.user.role !== 'sysadmin') {
			throw redirect(302, '/auth/login');
		}
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', 'pt-br')
	});
};
