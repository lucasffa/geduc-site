import type { LayoutServerLoad } from './$types';
import { ROLE_LABELS } from '$lib/constants/roles';

export const load: LayoutServerLoad = ({ locals }) => {
	return {
		user: locals.user,
		organization: locals.organization,
		permissions: locals.permissions,
		brandName: locals.organization?.brandName || locals.organization?.name || 'GEDUC',
		logoUrl: locals.organization?.logoUrl || null,
		roleName: locals.user ? ROLE_LABELS[locals.user.role] : ''
	};
};
