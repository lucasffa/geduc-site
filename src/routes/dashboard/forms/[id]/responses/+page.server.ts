import { error } from '@sveltejs/kit';
import { getFormById, listFormResponses } from '$lib/server/form-service';
import { logAudit } from '$lib/server/middleware/audit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const { locals, params } = event;
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
	logAudit(event, {
		whatTable: 'form_responses',
		whatRecordId: formId,
		how: 'READ',
		why: `Consulta de respostas do formulário: ${form.title}`
	});

	return {
		form,
		responses
	};
};
