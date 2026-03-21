import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { organizations } from '$lib/server/db/schema-system';
import { eq } from 'drizzle-orm';

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageOrganization');

	const orgId = event.locals.organization?.id;
	if (!orgId) return json({ error: 'Organização não configurada' }, { status: 400 });

	try {
		const body = await event.request.json();
		const updates: Record<string, unknown> = {};

		if (typeof body.brandName === 'string') updates.brandName = body.brandName;
		if (typeof body.logoUrl === 'string') updates.logoUrl = body.logoUrl;
		if (typeof body.primaryColor === 'string') updates.primaryColor = body.primaryColor;

		updates.updatedAt = new Date().toISOString();

		const db = getSystemDb();
		db.update(organizations)
			.set(updates)
			.where(eq(organizations.id, orgId))
			.run();

		logAudit(event, {
			whatTable: 'organizations',
			whatRecordId: orgId,
			how: 'UPDATE',
			why: 'Configurações da organização atualizadas'
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao atualizar organização:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
