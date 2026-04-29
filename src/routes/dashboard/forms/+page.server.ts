import { error } from '@sveltejs/kit';
import { listFormsWithResponseCount, deleteForm, duplicateForm, getFormById } from '$lib/server/form-service';
import { logAudit } from '$lib/server/middleware/audit';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	console.log('[dashboard/forms] load: iniciando carregamento de página de formulários');
	
	if (!locals.user) {
		console.error('[dashboard/forms] load: ERRO - usuário não autenticado');
		throw error(401, 'Não autorizado');
	}
	console.log(`[dashboard/forms] load: usuário autenticado - ${locals.user.email}`);

	// If user doesn't belong to an organization, return empty forms list
	if (!locals.organization || !locals.orgDb) {
		console.warn('[dashboard/forms] load: AVISO - usuário sem organização, retornando lista vazia');
		return {
			forms: []
		};
	}
	console.log(`[dashboard/forms] load: organização encontrada - ${locals.organization.slug}`);

	const forms = listFormsWithResponseCount(locals.orgDb);

	const { participants } = await import('$lib/server/db/schema-org');
	const { eq, isNull, and } = await import('drizzle-orm');
	
	const activeParticipants = locals.orgDb
		.select({ id: participants.id, name: participants.name, email: participants.email })
		.from(participants)
		.where(and(eq(participants.isActive, true), isNull(participants.deletedAt)))
		.all();

	console.log(`[dashboard/forms] load: sucesso - ${forms.length} formulários, ${activeParticipants.length} participantes ativos carregados`);
	return {
		forms,
		participants: activeParticipants
	};
};

export const actions: Actions = {
	duplicateOne: async (event) => {
		const { request, locals } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		console.log(`[dashboard/forms] duplicateOne: duplicando formulário id=${id}`);
		const original = getFormById(locals.orgDb, id);
		const duplicated = duplicateForm(locals.orgDb, id, locals.user.id, locals.user.name);

		if (!duplicated) {
			console.error(`[dashboard/forms] duplicateOne: ERRO - formulário não encontrado id=${id}`);
			throw error(404, 'Formulário não encontrado');
		}

		logAudit(event, {
			whatTable: 'forms',
			whatRecordId: duplicated.id,
			how: 'CREATE',
			why: `Formulário duplicado a partir de: ${original?.title || id}`
		});

		console.log(`[dashboard/forms] duplicateOne: sucesso - novo id=${duplicated.id}`);
		return { success: true, id: duplicated.id };
	},

	deleteOne: async (event) => {
		const { request, locals } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		const existing = getFormById(locals.orgDb, id);
		console.log(`[dashboard/forms] deleteOne: deletando formulário id=${id}`);
		const deleted = deleteForm(locals.orgDb, id);

		if (!deleted) {
			console.error(`[dashboard/forms] deleteOne: ERRO - formulário não encontrado id=${id}`);
			throw error(404, 'Formulário não encontrado');
		}

		logAudit(event, {
			whatTable: 'forms',
			whatRecordId: id,
			how: 'DELETE',
			why: `Formulário excluído: ${existing?.title || id}`
		});

		console.log(`[dashboard/forms] deleteOne: sucesso - formulário deletado`);
		return { success: true };
	},

	bulkDuplicate: async (event) => {
		const { request, locals } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const ids = formData.getAll('ids') as string[];

		console.log(`[dashboard/forms] bulkDuplicate: duplicando ${ids.length} formulários`);
		const results = [];

		for (const id of ids) {
			const duplicated = duplicateForm(locals.orgDb, id, locals.user.id, locals.user.name);
			if (duplicated) results.push(duplicated);
		}

		logAudit(event, {
			whatTable: 'forms',
			how: 'CREATE',
			why: `Duplicação em massa de formulários`,
			howManyAffected: results.length
		});

		console.log(`[dashboard/forms] bulkDuplicate: sucesso - ${results.length} formulários duplicados`);
		return { success: true, count: results.length };
	},

	bulkDelete: async (event) => {
		const { request, locals } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const ids = formData.getAll('ids') as string[];

		console.log(`[dashboard/forms] bulkDelete: deletando ${ids.length} formulários`);
		let count = 0;

		for (const id of ids) {
			if (deleteForm(locals.orgDb, id)) count++;
		}

		logAudit(event, {
			whatTable: 'forms',
			how: 'DELETE',
			why: `Exclusão em massa de formulários`,
			howManyAffected: count
		});

		console.log(`[dashboard/forms] bulkDelete: sucesso - ${count} formulários deletados`);
		return { success: true, count };
	},

	sendByEmail: async (event) => {
		const { request, locals } = event;
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const formId = formData.get('formId') as string;
		const type = formData.get('type') as string; // 'external' or 'participants'
		const recipientEmail = formData.get('email') as string;
		const participantIds = formData.getAll('participantIds') as string[];

		if (type === 'external' && (!recipientEmail || !recipientEmail.includes('@'))) {
			return { error: 'Email inválido' };
		}

		if (type === 'participants' && participantIds.length === 0) {
			return { error: 'Nenhum participante selecionado' };
		}

		const form = getFormById(locals.orgDb, formId);
		if (!form) {
			throw error(404, 'Formulário não encontrado');
		}

		try {
			console.log(`[dashboard/forms] sendByEmail: enviando formulário ${form.id}`);

			if (!form.publicToken) {
				return { error: 'Este formulário não possui código seguro de acesso. Edite e salve o formulário novamente.' };
			}
			const formUrl = `${new URL(request.url).origin}/forms/${locals.organization?.slug || 'org'}/${form.publicToken}`;

			// Get org email config for proper sender/branding
			const { getOrgEmailConfig, sendFormInviteEmail } = await import('$lib/server/resend');
			const orgEmailConfig = getOrgEmailConfig(
				locals.orgDb,
				locals.organization?.name || 'GEDUC',
				locals.organization?.primaryColor
			);

			let recipients: string[] = [];

			if (type === 'participants') {
				const { participants } = await import('$lib/server/db/schema-org');
				const { inArray } = await import('drizzle-orm');
				
				const selectedParticipants = locals.orgDb
					.select({ email: participants.email })
					.from(participants)
					.where(inArray(participants.id, participantIds))
					.all();
				
				recipients = selectedParticipants.map(p => p.email).filter(Boolean) as string[];
				
				if (recipients.length === 0) {
					return { error: 'Nenhum participante válido encontrado para enviar.' };
				}
			} else {
				recipients = [recipientEmail];
			}

			let sentCount = 0;
			const failed: string[] = [];
			for (const email of recipients) {
				const result = await sendFormInviteEmail(
					email,
					form.title,
					form.description,
					formUrl,
					locals.user.id,
					locals.organization?.id,
					orgEmailConfig
				);
				if (result.success) sentCount++;
				else {
					console.error(`Erro ao enviar para ${email}:`, result.error);
					failed.push(email);
				}
			}

			console.log(`[dashboard/forms] sendByEmail: sucesso, enviados ${sentCount} de ${recipients.length}`);
			logAudit(event, {
				whatTable: 'forms',
				whatRecordId: form.id,
				how: 'UPDATE',
				why: `Convites de formulário enviados (${sentCount}/${recipients.length})`,
				howManyAffected: sentCount
			});
			return { success: true, count: sentCount, total: recipients.length, failed };
		} catch (err) {
			console.error(`[dashboard/forms] sendByEmail: erro global`, err);
			return { error: 'Erro ao enviar email. Tente novamente.' };
		}
	}
};