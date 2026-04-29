// src/routes/forms/[slug]/+page.server.ts
import { error, redirect } from '@sveltejs/kit';
import { getOrgDb } from '$lib/server/db';
import {
	getFormByPublicToken,
	resolveParticipantIdByUserId,
	submitFormResponse
} from '$lib/server/form-service';
import { logAudit } from '$lib/server/middleware/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ params, url, locals }) => {
	// Find organization from URL params
	const orgSlug = params.orgSlug;
	const db = getOrgDb(orgSlug);

	// Public route resolution is token-only to avoid predictable identifiers.
	const form = getFormByPublicToken(db, params.formSlug);

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
	submit: async (event) => {
			const { request, params, url, locals, getClientAddress } = event;
			console.log(`[forms/[formSlug]] submit: iniciando submissão - token=${params.formSlug.slice(0, 8)}...`);
			const orgSlug = params.orgSlug;
			console.log(`[forms/[formSlug]] submit: orgSlug=${orgSlug}`);
		const db = getOrgDb(orgSlug);

		// Resolve by secure token only.
		const form = getFormByPublicToken(db, params.formSlug);

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
			participantId: resolveParticipantIdByUserId(db, locals.user?.id, locals.user?.email),
			submitterId: locals.user?.id,
			submitterName: locals.user?.name,
			submitterEmail: locals.user?.email,
			sourceIp: getClientAddress(),
			sourceUserAgent: request.headers.get('user-agent') || undefined
		});

		console.log(`[forms/[slug]] submit: sucesso - responseId=${response.id}`);
		if (locals.user) {
			logAudit(event, {
				whatTable: 'form_responses',
				whatRecordId: response.id,
				how: 'CREATE',
				why: `Resposta enviada para formulário: ${form.title}`
			});
		}
		return {
			success: true,
			responseId: response.id
		};
	}
};