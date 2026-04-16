// src/routes/forms/[slug]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import { getFormBySlug, getFormByPublicToken, submitFormResponse } from '$lib/server/form-service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	// Find organization from URL params
	const orgSlug = params.orgSlug;
	const db = getOrgDb(orgSlug);

	// Try slug first, then public token
	let form = getFormBySlug(db, params.formSlug);
	if (!form) {
		form = getFormByPublicToken(db, params.formSlug);
	}

	if (!form) {
		throw error(404, 'Formulário não encontrado');
	}

	if (!form.isActive) {
		throw error(404, 'Formulário não está disponível');
	}

	// Private forms require authentication
	if (!form.isPublic || form.requiresAuth) {
		if (!locals.user) {
			throw redirect(302, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
		}
	}

	return {
		form,
		orgSlug
	};
};

export const actions: Actions = {
	submit: async ({ request, params, url, locals, getClientAddress }) => {
			console.log(`[forms/[formSlug]] submit: iniciando submissão - slug=${params.formSlug}`);
			const orgSlug = params.orgSlug;
			console.log(`[forms/[formSlug]] submit: orgSlug=${orgSlug}`);
		const db = getOrgDb(orgSlug);

		// Get form
		let form = getFormBySlug(db, params.formSlug);
		if (!form) {
			form = getFormByPublicToken(db, params.formSlug);
		}

		if (!form) {
			console.error(`[forms/[formSlug]] submit: ERRO - formulário não encontrado slug=${params.formSlug}`);
			throw error(404, 'Formulário não encontrado');
		}
		console.log(`[forms/[formSlug]] submit: formulário encontrado - ${form.title}`);

		// Parse form data
		const formData = await request.formData();
		const answers: Record<string, unknown> = {};

		for (const [key, value] of formData.entries()) {
			if (key.startsWith('field_')) {
				const fieldId = key.replace('field_', '');
				// Handle multiple values (checkboxes)
				if (answers[fieldId] && Array.isArray(answers[fieldId])) {
					(answers[fieldId] as unknown[]).push(value);
				} else if (answers[fieldId]) {
					answers[fieldId] = [answers[fieldId], value];
				} else {
					answers[fieldId] = value;
				}
			}
		}

		// Submit response
		console.log(`[forms/[slug]] submit: gravando resposta - fields=${Object.keys(answers).length}`);
		const response = submitFormResponse(db, {
			formId: form.id,
			answers,
			submitterId: locals.user?.id,
			submitterName: locals.user?.name,
			submitterEmail: locals.user?.email,
			sourceIp: getClientAddress(),
			sourceUserAgent: request.headers.get('user-agent') || undefined
		});

		console.log(`[forms/[slug]] submit: sucesso - responseId=${response.id}`);
		return {
			success: true,
			responseId: response.id
		};
	}
};