import { error } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import { listForms } from '$lib/server/form-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Não autorizado');
	}

	const db = getOrgDb(locals.user.organizationId || 'default');
	const forms = listForms(db);

	return {
		forms
	};
};