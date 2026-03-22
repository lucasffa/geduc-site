export type Role = 'sysadmin' | 'admin' | 'volunteer' | 'mentee' | 'dumb';

export type ApiKeyOwnerType = 'user' | 'organization';

export interface UserSession {
	id: string;
	email: string;
	name: string;
	role: Role;
	organizationId: string | null;
}

export interface OrganizationInfo {
	id: string;
	slug: string;
	name: string;
	brandName: string | null;
	logoUrl: string | null;
	primaryColor: string;
}

export type FeatureFlag =
	| 'canViewDashboard'
	| 'canManageParticipants'
	| 'canManageCertificates'
	| 'canSendEmails'
	| 'canImportSpreadsheet'
	| 'canViewStats'
	| 'canManageUsers'
	| 'canInviteUsers'
	| 'canManageWorkgroups'
	| 'canManageOrganization'
	| 'canViewAuditLog'
	| 'canManageApiKeys'
	| 'canDeleteParticipants'
	| 'canExportData';

export type FeatureFlags = Record<FeatureFlag, boolean>;
