import { json, error } from '@sveltejs/kit';
import { randomBytes, randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { invitations } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';
import { sendInviteEmail } from '$lib/server/resend';

export const POST: RequestHandler = async (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const body = await event.request.json();
	const { email, role, organizationId } = body;

	if (!email || !organizationId) {
		return json({ error: 'E-mail e organização são obrigatórios' }, { status: 400 });
	}

	const validRoles = ['admin', 'volunteer', 'mentee', 'dumb'];
	if (!role || !validRoles.includes(role)) {
		return json({ error: 'Cargo inválido' }, { status: 400 });
	}

	const token = randomBytes(32).toString('hex'); // Generate a secure random token
	const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

	const db = getSystemDb();
	db.insert(invitations).values({
		id: randomUUID(),
		token,
		email: email.trim().toLowerCase(),
		role,
		organizationId,
		invitedBy: event.locals.user!.id,
		expiresAt
	}).run();

	const inviteLink = `${event.url.origin}/auth/invite/${token}`;

	const emailResult = await sendInviteEmail(email, inviteLink, role, user.id, organizationId);
	if (!emailResult.success) {
		console.error('Erro no envio de e-mail de convite sysadmin:', emailResult.error);
		return json({ error: emailResult.error || 'Erro ao enviar e-mail de convite' }, { status: 500 });
	}

	logAudit(event, {
		whatTable: 'invitations',
		whatRecordId: token,
		how: 'CREATE',
		why: `Convite enviado para ${email} como ${role} via sysadmin`,
		organizationId
	});

	return json({ success: true, inviteLink }, { status: 201 });
};
