// src/routes/auth/invite/[token]/+page.server.ts
import { fail, redirect, error } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { Actions, PageServerLoad } from './$types';
import { registerSchema } from '$lib/validations/auth';
import { getSystemDb } from '$lib/server/db';
import { invitations, users } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';
import { hashPassword, createSession, setSessionCookie } from '$lib/server/auth';
import { logAudit } from '$lib/server/middleware/audit';

export const load: PageServerLoad = ({ params }) => {
	const db = getSystemDb();
	const invitation = db
		.select()
		.from(invitations)
		.where(eq(invitations.token, params.token))
		.get();

	if (!invitation) throw error(404, 'Convite não encontrado');
	if (invitation.acceptedAt) throw error(400, 'Convite já utilizado');
	if (new Date(invitation.expiresAt) < new Date()) throw error(400, 'Convite expirado');

	return {
		email: invitation.email || null,
		role: invitation.role,
		token: params.token
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = {
			name: formData.get('name') as string,
			password: formData.get('password') as string,
			confirmPassword: formData.get('confirmPassword') as string
		};

		const parsed = registerSchema.safeParse(data);
		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0].message,
				name: data.name
			});
		}

		const db = getSystemDb();
		const invitation = db
			.select()
			.from(invitations)
			.where(eq(invitations.token, event.params.token))
			.get();

		if (!invitation || invitation.acceptedAt || new Date(invitation.expiresAt) < new Date()) {
			return fail(400, { error: 'Convite inválido ou expirado' });
		}

		const invitedEmail = invitation.email?.trim() || (formData.get('email') as string)?.trim();
		if (!invitedEmail) {
			return fail(400, { error: 'E-mail é obrigatório' });
		}

		// Check if user already exists
		const existing = db
			.select()
			.from(users)
			.where(and(eq(users.email, invitedEmail), isNull(users.deletedAt)))
			.get();

		if (existing) {
			return fail(400, { error: 'E-mail já cadastrado' });
		}

		const passwordHash = await hashPassword(parsed.data.password);
		const userId = randomUUID();

		// Create user
		db.insert(users)
			.values({
				id: userId,
				email: invitedEmail,
				name: parsed.data.name,
				passwordHash,
				role: invitation.role,
				organizationId: invitation.organizationId,
				isActive: true
			})
			.run();

		// Mark invitation as accepted
		db.update(invitations)
			.set({ acceptedAt: new Date().toISOString() })
			.where(eq(invitations.id, invitation.id))
			.run();

		// Auto-login
		const { token, expiresAt } = createSession(userId);
		setSessionCookie(event, token, expiresAt);

		// Audit: user creation via invite
		logAudit(event, {
			who: userId,
			whatTable: 'users',
			whatRecordId: userId,
			how: 'CREATE',
			why: `Usuário "${parsed.data.name}" (${invitation.email}) criado via convite`,
			organizationId: invitation.organizationId
		});

		throw redirect(302, '/dashboard');
	}
};
