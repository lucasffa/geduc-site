import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { invitations } from '$lib/server/db/schema-system';
import { inviteSchema } from '$lib/validations/auth';

export const POST: RequestHandler = async (event) => {
	const user = requirePermission(event, 'canInviteUsers');

	const orgId = event.locals.organization?.id;
	if (!orgId) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const parsed = inviteSchema.safeParse(body);

		if (!parsed.success) {
			return json({ error: parsed.error.issues[0].message }, { status: 400 });
		}

		const token = randomUUID();
		const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

		const db = getSystemDb();
		db.insert(invitations).values({
			id: randomUUID(),
			token,
			email: parsed.data.email,
			role: parsed.data.role,
			organizationId: orgId,
			invitedBy: user.id,
			expiresAt
		}).run();

		logAudit(event, {
			whatTable: 'invitations',
			whatRecordId: token,
			how: 'CREATE',
			why: `Convite enviado para ${parsed.data.email} como ${parsed.data.role}`
		});

		// TODO: Send email via system Resend key with invite link
		const inviteLink = `${event.url.origin}/auth/invite/${token}`;

		return json({ success: true, inviteLink }, { status: 201 });
	} catch (error) {
		console.error('Erro ao criar convite:', error);
		return json({ error: 'Erro interno do servidor' }, { status: 500 });
	}
};
