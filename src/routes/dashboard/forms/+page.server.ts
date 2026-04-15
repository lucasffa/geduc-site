// src/routes/dashboard/forms/+page.server.ts
import { error } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import {
	listFormsWithResponseCount,
	deleteForm,
	duplicateForm
} from '$lib/server/form-service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Não autorizado');
	}

	if (!locals.user.organizationId) {
		return { forms: [] };
	}

	const db = getOrgDb(locals.user.organizationId);
	const forms = listFormsWithResponseCount(db);

	return { forms };
};

export const actions: Actions = {
	deleteOne: async ({ request, locals }) => {
		if (!locals.user?.organizationId) throw error(401);

		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) throw error(400, 'ID obrigatório');

		const db = getOrgDb(locals.user.organizationId);
		deleteForm(db, id);

		return { success: true };
	},

	duplicateOne: async ({ request, locals }) => {
		if (!locals.user?.organizationId) throw error(401);

		const data = await request.formData();
		const id = data.get('id') as string;
		if (!id) throw error(400, 'ID obrigatório');

		const db = getOrgDb(locals.user.organizationId);
		duplicateForm(db, id, locals.user.id, locals.user.name);

		return { success: true };
	},

	bulkDelete: async ({ request, locals }) => {
		if (!locals.user?.organizationId) throw error(401);

		const data = await request.formData();
		const ids = data.getAll('ids') as string[];

		const db = getOrgDb(locals.user.organizationId);
		for (const id of ids) {
			deleteForm(db, id);
		}

		return { success: true, deleted: ids.length };
	},

	bulkDuplicate: async ({ request, locals }) => {
		if (!locals.user?.organizationId) throw error(401);

		const data = await request.formData();
		const ids = data.getAll('ids') as string[];

		const db = getOrgDb(locals.user.organizationId);
		for (const id of ids) {
			duplicateForm(db, id, locals.user.id, locals.user.name);
		}

		return { success: true, duplicated: ids.length };
	}
};