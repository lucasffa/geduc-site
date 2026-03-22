import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = ({ locals }) => {
	if (!locals.user || locals.user.role !== 'sysadmin') {
		throw redirect(302, '/auth/login');
	}

	return {
		user: locals.user,
		permissions: locals.permissions
	};
};
