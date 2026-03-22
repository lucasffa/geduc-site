import type { PageServerLoad } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';

export const load: PageServerLoad = (event) => {
	requirePermission(event, 'canManageOrganization');

	return {
		organization: event.locals.organization,
		permissions: event.locals.permissions
	};
};
