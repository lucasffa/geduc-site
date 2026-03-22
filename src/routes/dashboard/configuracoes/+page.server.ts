import type { PageServerLoad } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { orgSettings } from '$lib/server/db/schema-org';
import { DEFAULT_CUSTOM_ROLES } from '$lib/constants/participant-status';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = (event) => {
	requirePermission(event, 'canManageOrganization');

	const orgDb = event.locals.orgDb;
	let enforceStatusTransitions = true;
	let customRoles = DEFAULT_CUSTOM_ROLES;

	if (orgDb) {
		const transitionSetting = orgDb
			.select()
			.from(orgSettings)
			.where(eq(orgSettings.key, 'enforce_status_transitions'))
			.get();
		enforceStatusTransitions = transitionSetting?.value !== 'false';

		const rolesSetting = orgDb
			.select()
			.from(orgSettings)
			.where(eq(orgSettings.key, 'custom_roles'))
			.get();
		if (rolesSetting?.value) {
			try { customRoles = JSON.parse(rolesSetting.value); } catch {}
		}
	}

	return {
		organization: event.locals.organization,
		permissions: event.locals.permissions,
		enforceStatusTransitions,
		customRoles
	};
};
