import { error, redirect } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import { createForm } from '$lib/server/form-service';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Não autorizado');
	}

	return {
		user: locals.user
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const isPublic = formData.get('isPublic') === 'true';
		const requiresAuth = formData.get('requiresAuth') === 'true';
		const definitionJson = formData.get('definition') as string;

		if (!title?.trim()) {
			return {
				error: 'Título é obrigatório'
			};
		}

		let definition;
		try {
			definition = JSON.parse(definitionJson || '{"fields":[]}');
		} catch {
			return {
				error: 'Definição do formulário inválida'
			};
		}

		const db = getOrgDb(locals.user.organizationId || 'default');

		const form = createForm(db, {
			title: title.trim(),
			description: description?.trim(),
			isPublic,
			requiresAuth,
			definition,
			authorId: locals.user.id,
			authorName: locals.user.name,
			authorRole: locals.user.role
		});

		throw redirect(302, `/dashboard/forms/${form.id}`);
	}
};