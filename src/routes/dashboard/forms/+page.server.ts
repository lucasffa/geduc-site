import { error } from '@sveltejs/kit';
import { listFormsWithResponseCount, deleteForm, duplicateForm, getFormById } from '$lib/server/form-service';
import { getSystemResendClient } from '$lib/server/resend';
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

	console.log(`[dashboard/forms] load: sucesso - ${forms.length} formulários carregados`);
	return {
		forms
	};
};

export const actions: Actions = {
	duplicateOne: async ({ request, locals }) => {
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		console.log(`[dashboard/forms] duplicateOne: duplicando formulário id=${id}`);
		const duplicated = duplicateForm(locals.orgDb, id, locals.user.id, locals.user.name);

		if (!duplicated) {
			console.error(`[dashboard/forms] duplicateOne: ERRO - formulário não encontrado id=${id}`);
			throw error(404, 'Formulário não encontrado');
		}

		console.log(`[dashboard/forms] duplicateOne: sucesso - novo id=${duplicated.id}`);
		return { success: true, id: duplicated.id };
	},

	deleteOne: async ({ request, locals }) => {
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const id = formData.get('id') as string;

		console.log(`[dashboard/forms] deleteOne: deletando formulário id=${id}`);
		const deleted = deleteForm(locals.orgDb, id);

		if (!deleted) {
			console.error(`[dashboard/forms] deleteOne: ERRO - formulário não encontrado id=${id}`);
			throw error(404, 'Formulário não encontrado');
		}

		console.log(`[dashboard/forms] deleteOne: sucesso - formulário deletado`);
		return { success: true };
	},

	bulkDuplicate: async ({ request, locals }) => {
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

		console.log(`[dashboard/forms] bulkDuplicate: sucesso - ${results.length} formulários duplicados`);
		return { success: true, count: results.length };
	},

	bulkDelete: async ({ request, locals }) => {
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

		console.log(`[dashboard/forms] bulkDelete: sucesso - ${count} formulários deletados`);
		return { success: true, count };
	},

	sendByEmail: async ({ request, locals }) => {
		if (!locals.user || !locals.orgDb) {
			throw error(401, 'Não autorizado');
		}

		const formData = await request.formData();
		const formId = formData.get('formId') as string;
		const recipientEmail = formData.get('email') as string;
		const sendToAll = formData.get('sendToAll') === 'true';

		if (!sendToAll && (!recipientEmail || !recipientEmail.includes('@'))) {
			return { error: 'Email inválido ou nenhum destinatário selecionado' };
		}

		const form = getFormById(locals.orgDb, formId);
		if (!form) {
			throw error(404, 'Formulário não encontrado');
		}

		if (!form.isPublic) {
			return { error: 'Apenas formulários públicos podem ser compartilhados por email' };
		}

		try {
			console.log(`[dashboard/forms] sendByEmail: enviando formulário ${form.slug}`);
			
			const resend = getSystemResendClient();
			const formUrl = `${new URL(request.url).origin}/forms/${form.slug}`;
			const emailHtml = `
				<h2>${form.title}</h2>
				${form.description ? `<p>${form.description}</p>` : ''}
				<p><a href="${formUrl}" style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px; display: inline-block;">Responder Formulário</a></p>
			`;

			let recipients: string[] = [];

			if (sendToAll) {
				const { participants } = await import('$lib/server/db/schema-org');
				const { eq, isNull, and } = await import('drizzle-orm');
				const activeParticipants = locals.orgDb
					.select({ email: participants.email })
					.from(participants)
					.where(and(eq(participants.isActive, true), isNull(participants.deletedAt)))
					.all();
				
				recipients = activeParticipants.map(p => p.email).filter(Boolean);
				
				if (recipients.length === 0) {
					return { error: 'Nenhum participante ativo encontrado para enviar.' };
				}
			} else {
				recipients = [recipientEmail];
			}

			// Resend API limit for batch sending or multiple emails in "to" field is up to 50 emails per request.
			// Since this is a simple implementation, we'll send them one by one if there are many, or in small batches.
			// For simplicity and avoiding rate limits during demo/local testing, let's just loop.
			let sentCount = 0;
			for (const email of recipients) {
				try {
					await resend.emails.send({
						from: 'noreply@geduc.com',
						to: email,
						subject: `${locals.organization?.name} compartilhou um formulário: ${form.title}`,
						html: emailHtml
					});
					sentCount++;
				} catch (err) {
					console.error(`Erro ao enviar para ${email}:`, err);
				}
			}

			console.log(`[dashboard/forms] sendByEmail: sucesso, enviados ${sentCount} de ${recipients.length}`);
			return { success: true, count: sentCount };
		} catch (err) {
			console.error(`[dashboard/forms] sendByEmail: erro global`, err);
			return { error: 'Erro ao enviar email. Tente novamente.' };
		}
	}
};