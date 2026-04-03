import { json, error, type RequestHandler } from '@sveltejs/kit';
import { getSystemDb } from '$lib/server/db';
import { invitations, links } from '$lib/server/db/schema-system';
import { eq } from 'drizzle-orm';
import { logAudit } from '$lib/server/middleware/audit';

export const DELETE: RequestHandler = (event) => {
	if (event.locals.user?.role !== 'sysadmin') throw error(403);

	const id = event.params.id;
	if (!id) throw error(400, 'ID de convite obrigatório');
	const db = getSystemDb();

	const linkInvite = db
		.select()
		.from(links)
		.where(eq(links.id, id))
		.get();

	if (linkInvite) {
		db.delete(links).where(eq(links.id, id)).run();
		logAudit(event, {
			whatTable: 'links',
			whatRecordId: id,
			how: 'DELETE',
			why: `Convite por link revogado`,
			organizationId: linkInvite.organizationId
		});
		return json({ success: true });
	}

	const emailInvite = db
		.select()
		.from(invitations)
		.where(eq(invitations.id, id))
		.get();

	if (emailInvite) {
		db.delete(invitations).where(eq(invitations.id, id)).run();
		logAudit(event, {
			whatTable: 'invitations',
			whatRecordId: id,
			how: 'DELETE',
			why: `Convite por email revogado`,
			organizationId: emailInvite.organizationId
		});
		return json({ success: true });
	}

	throw error(404, 'Convite não encontrado');
};
