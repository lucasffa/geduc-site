import type { Role } from '$lib/types/auth';

export const ROLES: readonly Role[] = ['sysadmin', 'admin', 'volunteer', 'mentee', 'dumb'] as const;

export const ROLE_LABELS: Record<Role, string> = {
	sysadmin: 'Administrador do Sistema',
	admin: 'Administrador',
	volunteer: 'Voluntário',
	mentee: 'Mentorado',
	dumb: 'Sem Acesso'
};

/** Roles that can be assigned when inviting users to an organization */
export const INVITABLE_ROLES: readonly Role[] = ['admin', 'volunteer', 'mentee', 'dumb'] as const;

/** Role hierarchy (higher index = more privileges) */
export const ROLE_HIERARCHY: Record<Role, number> = {
	dumb: 0,
	mentee: 1,
	volunteer: 2,
	admin: 3,
	sysadmin: 4
};
