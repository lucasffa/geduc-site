import { json, error } from '@sveltejs/kit';
import { randomBytes, randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { invitations } from '$lib/server/db/schema-system';
import { logAudit } from '$lib/server/middleware/audit';

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

	logAudit(event, {
		whatTable: 'invitations',
		whatRecordId: token,
		how: 'CREATE',
		why: `Convite enviado para ${email} como ${role} via sysadmin`,
		organizationId
	});

	return json({ success: true, inviteLink }, { status: 201 });
};
