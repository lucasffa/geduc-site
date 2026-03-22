import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { workgroups } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const id = event.params.id;

	orgDb.update(workgroups)
		.set({
			deletedAt: new Date().toISOString(),
			deletedBy: event.locals.user?.id || null,
			isActive: false
		})
		.where(eq(workgroups.id, id))
		.run();

	logAudit(event, {
		whatTable: 'workgroups',
		whatRecordId: id,
		how: 'DELETE',
		why: 'Grupo de trabalho removido (soft delete)'
	});

	return json({ success: true });
};
