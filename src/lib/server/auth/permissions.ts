import { error, type RequestEvent } from '@sveltejs/kit';
import { ROLE_PERMISSIONS } from '$lib/constants/feature-flags';
import type { Role, FeatureFlag, FeatureFlags, UserSession } from '$lib/types/auth';

/**
 * Resolve permissions for a role.
 */
export function resolvePermissions(role: Role): FeatureFlags {
	return ROLE_PERMISSIONS[role];
}

/**
 * Require authenticated user. Throws 401 if not logged in, 403 if role is 'dumb'.
 */
export function requireAuth(event: RequestEvent): UserSession {
	const user = event.locals.user;
	if (!user) throw error(401, 'Não autenticado');
	if (user.role === 'dumb') throw error(403, 'Acesso negado');
	return user;
}

/**
 * Require a specific permission flag. Throws 403 if not allowed.
 */
export function requirePermission(event: RequestEvent, flag: FeatureFlag): UserSession {
	const user = requireAuth(event);
	if (!event.locals.permissions[flag]) {
		throw error(403, `Permissão necessária: ${flag}`);
	}
	return user;
}

/**
 * Require one of the specified roles. Throws 403 if role not in list.
 */
export function requireRole(event: RequestEvent, ...roles: Role[]): UserSession {
	const user = requireAuth(event);
	if (!roles.includes(user.role)) {
		throw error(403, 'Função não autorizada');
	}
	return user;
}
