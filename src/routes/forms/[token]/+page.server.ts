// src/routes/forms/[token]/+page.server.ts
import { error, fail, redirect } from '@sveltejs/kit';
import { and, eq, isNull } from 'drizzle-orm';
import { getOrgDb, getSystemDb, type OrgDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import {
	getFormById,
	getFormInvitationByToken,
	markFormInvitationUsed,
	resolveParticipantIdByUserId,
	submitFormResponse
} from '$lib/server/form-service';
import type { FormInvitationRecord, FormRecord } from '$lib/types/forms';
import type { Actions, PageServerLoad } from './$types';

type InvitationContext = {
	db: OrgDb;
	orgSlug: string;
	form: FormRecord;
	invitation: FormInvitationRecord;
};

function extractAnswers(formData: FormData): Record<string, unknown> {
	const answers: Record<string, unknown> = {};

	for (const [key, value] of formData.entries()) {
		if (!key.startsWith('field_')) continue;

		if (answers[key] && Array.isArray(answers[key])) {
			(answers[key] as unknown[]).push(value);
		} else if (answers[key]) {
			answers[key] = [answers[key], value];
		} else {
			answers[key] = value;
		}
	}

	return answers;
}

function findInvitationContext(token: string): InvitationContext | null {
	const systemDb = getSystemDb();
	const orgRows = systemDb
		.select({ slug: organizations.slug })
		.from(organizations)
		.where(and(eq(organizations.isActive, true), isNull(organizations.deletedAt)))
		.all();

	for (const org of orgRows) {
		try {
			const db = getOrgDb(org.slug);
			const invitation = getFormInvitationByToken(db, token);
			if (!invitation) continue;

			const form = getFormById(db, invitation.formId);
			if (!form) continue;

			return { db, orgSlug: org.slug, form, invitation };
		} catch (err) {
			console.warn(`[forms/[token]] failed to inspect org ${org.slug}`, err);
		}
	}

	return null;
}

export const load: PageServerLoad = async ({ params }) => {
	const context = findInvitationContext(params.token);

	if (!context) {
		throw error(404, 'Convite não encontrado');
	}

	if (!context.form.isActive) {
		throw error(404, 'Formulário não está disponível');
	}

	if (context.invitation.used) {
		throw error(410, 'Este convite já foi usado');
	}

	return {
		form: context.form,
		invitation: {
			email: context.invitation.email,
			token: context.invitation.token
		},
		orgSlug: context.orgSlug
	};
};

export const actions: Actions = {
	submit: async (event) => {
		const { request, params, getClientAddress } = event;
		const context = findInvitationContext(params.token);

		if (!context) {
			throw error(404, 'Convite não encontrado');
		}

		if (!context.form.isActive) {
			throw error(404, 'Formulário não está disponível');
		}

		if (context.invitation.used) {
			return fail(409, { error: 'Este convite já foi usado.' });
		}

		const formData = await request.formData();
		const answers = extractAnswers(formData);
		const sourceIp = getClientAddress();
		const sourceUserAgent = request.headers.get('user-agent') || undefined;
		const submitted = context.db.transaction((tx) => {
			const txDb = tx as OrgDb;
			const invitationWasClaimed = markFormInvitationUsed(txDb, context.invitation.id);

			if (!invitationWasClaimed) {
				return false;
			}

			submitFormResponse(txDb, {
				formId: context.form.id,
				answers,
				participantId: resolveParticipantIdByUserId(txDb, undefined, context.invitation.email),
				submitterEmail: context.invitation.email,
				sourceIp,
				sourceUserAgent,
				metadata: {
					accessMode: 'invitation',
					invitationId: context.invitation.id
				}
			});

			return true;
		});

		if (!submitted) {
			return fail(409, { error: 'Este convite já foi usado.' });
		}

		throw redirect(303, '/forms/success');
	}
};
