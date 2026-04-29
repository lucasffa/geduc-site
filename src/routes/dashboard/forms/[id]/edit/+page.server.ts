import { error, redirect } from '@sveltejs/kit';
import { getFormById, updateForm } from '$lib/server/form-service';
import { logAudit } from '$lib/server/middleware/audit';
import { parseAndValidateFormDefinition } from '$lib/server/form-definition-schema';
import type { PageServerLoad, Actions } from './$types';

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

	return {
		form
	};
};

export const actions: Actions = {
	update: async (event) => {
		const { request, locals, params } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const isPublic = formData.get('isPublic') === 'true';
		const requiresAuth = formData.get('requiresAuth') === 'true';
		const isActive = formData.get('isActive') === 'true';
		const definitionJson = formData.get('definition') as string;

		console.log(`[dashboard/forms/[id]/edit] update: atualizando formulário id=${params.id}`);

		if (!title?.trim()) {
			return {
				error: 'Título é obrigatório'
			};
		}

		let definition;
		if (definitionJson) {
			try {
				definition = parseAndValidateFormDefinition(definitionJson);
			} catch (e) {
				return { error: 'Definição do formulário inválida' };
			}
		}

		const updated = updateForm(locals.orgDb, params.id, {
			title: title.trim(),
			description: description?.trim(),
			isPublic,
			requiresAuth,
			isActive,
			...(definition ? { definition } : {})
		});

		if (!updated) {
			throw error(404, 'Formulário não encontrado');
		}

		console.log(`[dashboard/forms/[id]/edit] update: sucesso - formulário atualizado`);

		logAudit(event, {
			whatTable: 'forms',
			whatRecordId: params.id,
			how: 'UPDATE',
			why: `Formulário atualizado: ${title.trim()}`
		});

		throw redirect(302, `/dashboard/forms?updated=${params.id}`);
	},

	delete: async (event) => {
		const { locals, params } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const { deleteForm } = await import('$lib/server/form-service');
		const existing = getFormById(locals.orgDb, params.id);

		console.log(`[dashboard/forms/[id]/edit] delete: deletando formulário id=${params.id}`);
		deleteForm(locals.orgDb, params.id);
		console.log(`[dashboard/forms/[id]/edit] delete: sucesso`);

		logAudit(event, {
			whatTable: 'forms',
			whatRecordId: params.id,
			how: 'DELETE',
			why: `Formulário excluído: ${existing?.title || params.id}`
		});

		throw redirect(302, '/dashboard/forms');
	}
};
