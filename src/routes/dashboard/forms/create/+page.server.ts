import { error, redirect } from '@sveltejs/kit';
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
		console.log('[dashboard/forms/create] create: iniciando criação de novo formulário');
		
		if (!locals.user) {
			console.error('[dashboard/forms/create] create: ERRO - usuário não autenticado');
			throw error(401, 'Não autorizado');
		}
		console.log(`[dashboard/forms/create] create: usuário - ${locals.user.email}`);

		if (!locals.organization || !locals.orgDb) {
			console.error('[dashboard/forms/create] create: ERRO - usuário sem organização');
			return {
				error: 'Você precisa pertencer a uma organização para criar formulários'
			};
		}
		console.log(`[dashboard/forms/create] create: organização - ${locals.organization.slug}`);

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const isPublic = formData.get('isPublic') === 'true';
		const requiresAuth = formData.get('requiresAuth') === 'true';
		const definitionJson = formData.get('definition') as string;
		console.log(`[dashboard/forms/create] create: title="${title}", isPublic=${isPublic}, requiresAuth=${requiresAuth}`);

		if (!title?.trim()) {
			console.error('[dashboard/forms/create] create: ERRO - título vazio');
			return {
				error: 'Título é obrigatório'
			};
		}

		let definition;
		try {
			definition = JSON.parse(definitionJson || '{"fields":[]}');
			console.log(`[dashboard/forms/create] create: definição parseada com ${definition.fields?.length || 0} campos`);
		} catch (e) {
			console.error('[dashboard/forms/create] create: ERRO ao fazer parse da definição', e);
			return {
				error: 'Definição do formulário inválida'
			};
		}

		console.log('[dashboard/forms/create] create: chamando createForm()');
		const form = createForm(locals.orgDb, {
			title: title.trim(),
			description: description?.trim(),
			isPublic,
			requiresAuth,
			definition,
			authorId: locals.user.id,
			authorName: locals.user.name,
			authorRole: locals.user.role
		});
		console.log(`[dashboard/forms/create] create: sucesso - formulário criado id=${form.id}`);

		throw redirect(302, `/dashboard/forms?created=${form.id}`);
	}
};