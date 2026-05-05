import type { UserSession, FeatureFlags, OrganizationInfo } from '$lib/types/auth';
import type { OrgDb } from '$lib/server/db';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserSession | null;
			organization: OrganizationInfo | null;
			permissions: FeatureFlags;
			orgDb: OrgDb | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};