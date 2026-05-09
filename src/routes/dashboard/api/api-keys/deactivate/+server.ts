import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { cache, CacheKeys } from '$lib/server/cache';
import { logger } from '$lib/utils/logger';

const COMPONENT = 'api-keys-deactivate';

export const POST: RequestHandler = (event) => {
	requirePermission(event, 'canManageApiKeys');

	const user = event.locals.user!;
	logger.info('POST /api/api-keys/deactivate', { userId: user.id, role: user.role }, COMPONENT);

	if (!['admin', 'sysadmin'].includes(user.role)) {
		return json({ error: 'Apenas admin pode desativar a chave da organização' }, { status: 403 });
	}
	if (!event.locals.organization) {
		return json({ error: 'Organização não configurada' }, { status: 400 });
	}

	const orgId = event.locals.organization.id;
	const removed = cache.delete(CacheKeys.apiKeyOrg(orgId));
	logger.info('Org API key removed from cache', { orgId, wasCached: removed }, COMPONENT);

	logAudit(event, {
		whatTable: 'api_keys',
		whatRecordId: orgId,
		how: 'UPDATE',
		why: 'Chave API da organização desativada (removida da RAM)'
	});

	return json({ active: false });
};
