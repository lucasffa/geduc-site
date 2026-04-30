// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import { validateSession } from '$lib/server/auth';
import { resolvePermissions } from '$lib/server/auth/permissions';
import { getSystemDb, getOrgDb, initSystemDb } from '$lib/server/db';
import { ensureSysadmin } from '$lib/server/db/seed';
import { organizations } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';
import { ROLE_PERMISSIONS } from '$lib/constants/feature-flags';
import type { OrganizationInfo } from '$lib/types/auth';

// Initialize system DB + ensure sysadmin on server start (idempotent)
initSystemDb();
ensureSysadmin().catch((err) => console.error('[seed] Failed to ensure sysadmin:', err));

export const handle: Handle = ({ event, resolve }) => {
	// Default locals
	event.locals.user = null;
	event.locals.organization = null;
	event.locals.permissions = ROLE_PERMISSIONS.dumb;
	event.locals.orgDb = null;

	// Read session
	const sessionToken = event.cookies.get('session_id');
	console.log(`[hooks] handle: ${event.request.method} ${event.url.pathname}, sessionToken presente=${!!sessionToken}`);

	if (sessionToken) {
		const user = validateSession(sessionToken);

		if (user) {
			console.log(`[hooks] handle: usuário autenticado - ${user.email} (role=${user.role})`);
			event.locals.user = user;
			event.locals.permissions = resolvePermissions(user.role);

			// Load organization if user belongs to one
			if (user.organizationId) {
				console.log(`[hooks] handle: carregando organização - id=${user.organizationId}`);
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
					console.log(`[hooks] handle: organização encontrada - ${org.slug} (${org.name})`);
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
						event.locals.orgDb = getOrgDb(org.id);
						console.log(`[hooks] handle: database da organização carregado`);
					} catch (error) {
						console.error(`[hooks] handle: ERRO ao carregar database da organização`, error);
						// Org DB may not exist yet
					}
				} else {
					console.warn(`[hooks] handle: organização não encontrada para id=${user.organizationId}`);
				}
			}
		}
	}

	// Route guards
	const path = event.url.pathname;
	console.log(`[hooks] handle: validando route guards para ${path}`);

	// Dashboard requires authentication (and not dumb)
	if (path.startsWith('/dashboard')) {
		if (!event.locals.user || event.locals.user.role === 'dumb') {
			console.warn(`[hooks] handle: acesso negado ao dashboard - user=${event.locals.user?.email || 'nenhum'}, role=${event.locals.user?.role || 'nenhuma'}`);
			throw redirect(302, '/auth/login');
		}
	}

	// Sysadmin panel requires sysadmin role
	if (path.startsWith('/sysadmin')) {
		if (!event.locals.user || event.locals.user.role !== 'sysadmin') {
			console.warn(`[hooks] handle: acesso negado ao sysadmin - user=${event.locals.user?.email || 'nenhum'}, role=${event.locals.user?.role || 'nenhuma'}`);
			throw redirect(302, '/auth/login');
		}
	}

	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', 'pt-br')
	});
};
