import { error, redirect } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import { getFormBySlug, getFormByPublicToken, submitFormResponse } from '$lib/server/form-service';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	// Try to find organization from URL or default
	const orgSlug = url.searchParams.get('org') || 'default';
	const db = getOrgDb(orgSlug);

	// Try slug first, then public token
	let form = getFormBySlug(db, params.slug);
	if (!form) {
		form = getFormByPublicToken(db, params.slug);
	}

	if (!form) {
		throw error(404, 'Formulário não encontrado');
	}

	if (!form.isActive) {
		throw error(404, 'Formulário não está disponível');
	}

	if (!form.isPublic) {
		throw error(404, 'Formulário não é público');
	}

	// Check auth requirement
	if (form.requiresAuth && !locals.user) {
		throw redirect(302, `/auth/login?redirect=${encodeURIComponent(url.pathname)}`);
	}

	return {
		form,
		orgSlug
	};
};

export const actions: Actions = {
	submit: async ({ request, params, url, locals, getClientAddress }) => {
		const orgSlug = url.searchParams.get('org') || 'default';
		const db = getOrgDb(orgSlug);

		// Get form
		let form = getFormBySlug(db, params.slug);
		if (!form) {
			form = getFormByPublicToken(db, params.slug);
		}

		if (!form) {
			throw error(404, 'Formulário não encontrado');
		}

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
		const response = submitFormResponse(db, {
			formId: form.id,
			answers,
			submitterId: locals.user?.id,
			submitterName: locals.user?.name,
			submitterEmail: locals.user?.email,
			sourceIp: getClientAddress(),
			sourceUserAgent: request.headers.get('user-agent') || undefined
		});

		return {
			success: true,
			responseId: response.id
		};
	}
};