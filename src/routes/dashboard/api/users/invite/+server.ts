// src/routes/dashboard/api/users/invite/+server.ts
import { json } from '@sveltejs/kit';
import { randomBytes, randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { invitations } from '$lib/server/db/schema-system';
import { sendInviteEmail } from '$lib/server/resend';
import { z } from 'zod';

export const POST: RequestHandler = async (event) => {
	const user = requirePermission(event, 'canInviteUsers');

	const orgId = event.locals.organization?.id;
	if (!orgId) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
			const body = await event.request.json();
		const inviteInputSchema = z.object({
			mode: z.enum(['email', 'link']).optional().default('email'),
			email: z.string().email('E-mail inválido').optional().or(z.literal('')).transform((v) => (typeof v === 'string' ? v.trim().toLowerCase() : '')),
			role: z.enum(['admin', 'volunteer', 'mentee', 'dumb'])
		});

		const parsed = inviteInputSchema.safeParse(body);
		if (!parsed.success) {
			return json({ error: parsed.error.issues[0].message }, { status: 400 });
		}

		const { mode, email, role } = parsed.data;
		if (mode === 'email' && !email) {
			return json({ error: 'E-mail obrigatório para modo de convite por e-mail' }, { status: 400 });
		}

		const token = randomBytes(32).toString('hex'); // Generate a secure random token
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

		const db = getSystemDb();
		db.insert(invitations).values({
			id: randomUUID(),
			token,
			email: email,
			role,
			organizationId: orgId,
			invitedBy: user.id,
			expiresAt
		}).run();

		logAudit(event, {
			whatTable: 'invitations',
			whatRecordId: token,
			how: 'CREATE',
			why: mode === 'link'
				? `Convite por link criado como ${role}`
				: `Convite enviado para ${email} como ${role}`
		});

		const inviteLink = `${event.url.origin}/auth/invite/${token}`;

		if (mode === 'email' && email) {
			const emailResult = await sendInviteEmail(email, inviteLink, role, user.id, orgId);
			if (!emailResult.success) {
				console.error('Erro no envio de e-mail de convite:', emailResult.error);
				return json({ error: emailResult.error || 'Erro ao enviar e-mail de convite' }, { status: 500 });
			}
		}

		return json({ success: true, inviteLink }, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar convite:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
