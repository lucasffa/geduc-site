import { error } from '@sveltejs/kit';
import { getFormById, listFormResponses } from '$lib/server/form-service';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!locals.user) {
		throw error(401, 'Não autorizado');
	}

	if (!locals.organization || !locals.orgDb) {
		throw error(403, 'Você precisa pertencer a uma organização');
	}

	const formId = params.id;
	const form = getFormById(locals.orgDb, formId);

	if (!form) {
		throw error(404, 'Formulário não encontrado');
	}

	const responses = listFormResponses(locals.orgDb, formId);

	return {
		form,
		responses
	};
};
