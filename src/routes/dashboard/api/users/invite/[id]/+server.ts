import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getSystemDb } from '$lib/server/db';
import { invitations } from '$lib/server/db/schema-system';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canInviteUsers');

	const orgId = event.locals.organization?.id;
	if (!orgId) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;
	if (!id) return json({ error: 'ID de convite obrigatório' }, { status: 400 });

	const db = getSystemDb();
	const invite = db.select().from(invitations).where(eq(invitations.id, id)).get();
	if (!invite) return json({ error: 'Convite não encontrado' }, { status: 404 });
	if (invite.organizationId !== orgId) return json({ error: 'Não autorizado' }, { status: 403 });

	db.delete(invitations).where(eq(invitations.id, id)).run();
	logAudit(event, {
		whatTable: 'invitations',
		whatRecordId: id,
		how: 'DELETE',
		why: `Convite revogado`,
		organizationId: orgId
	});

	return json({ success: true });
};
