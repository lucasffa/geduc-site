import type { Role, FeatureFlags, FeatureFlag } from '$lib/types/auth';

export const ALL_FLAGS: readonly FeatureFlag[] = [
	'canViewDashboard',
	'canManageParticipants',
	'canManageCertificates',
	'canSendEmails',
	'canImportSpreadsheet',
	'canViewStats',
	'canManageUsers',
	'canInviteUsers',
	'canManageWorkgroups',
	'canManageOrganization',
	'canViewAuditLog',
	'canManageApiKeys',
	'canDeleteParticipants',
	'canExportData'
] as const;

function flags(enabled: FeatureFlag[]): FeatureFlags {
	const result = {} as FeatureFlags;
	for (const flag of ALL_FLAGS) {
		result[flag] = enabled.includes(flag);
	}
	return result;
}

export const ROLE_PERMISSIONS: Record<Role, FeatureFlags> = {
	sysadmin: flags([...ALL_FLAGS]),
	admin: flags([...ALL_FLAGS]),
	volunteer: flags([
		'canViewDashboard',
		'canManageParticipants',
		'canManageCertificates',
		'canSendEmails',
		'canImportSpreadsheet',
		'canViewStats',
		'canManageApiKeys',
		'canExportData'
	]),
	mentee: flags(['canViewDashboard', 'canViewStats']),
	dumb: flags([])
};
