import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema-system';
import { cache, CacheKeys } from '$lib/server/cache';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = (event) => {
	requirePermission(event, 'canManageApiKeys');

	const id = event.params.id;
	const db = getSystemDb();

	try {
		const key = db.select().from(apiKeys).where(eq(apiKeys.id, id)).get();
		if (!key) return json({ error: 'Chave não encontrada' }, { status: 404 });

		// Soft delete + anonymize: zero out encrypted data, keep hashDigest
		db.update(apiKeys)
			.set({
				deletedAt: new Date().toISOString(),
				deletedBy: event.locals.user?.id || null,
				anonymizedAt: new Date().toISOString(),
				encryptedKey: '',
				iv: '',
				salt: '',
				isActive: false
			})
			.where(eq(apiKeys.id, id))
			.run();

		// Remove from cache
		if (key.ownerType === 'user') {
			cache.delete(CacheKeys.apiKeyUser(key.ownerId));
		} else {
			cache.delete(CacheKeys.apiKeyOrg(key.ownerId));
		}

		logAudit(event, {
			whatTable: 'api_keys',
			whatRecordId: id,
			how: 'DELETE',
			why: `Chave API revogada e anonimizada (digest preservado: ${key.hashDigest.substring(0, 12)}...)`
		});

		return json({ success: true });
	} catch (error) {
		console.error('Erro ao revogar API key:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
