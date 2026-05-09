import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { getSystemDb } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema-system';
import { cache, CacheKeys } from '$lib/server/cache';
import { eq, and, isNull } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageApiKeys');

	const org = event.locals.organization;
	if (!org) return json({ registered: false, active: false });

	const db = getSystemDb();
	const key = db
		.select({ id: apiKeys.id, hashDigest: apiKeys.hashDigest })
		.from(apiKeys)
		.where(and(
			eq(apiKeys.ownerId, org.id),
			eq(apiKeys.ownerType, 'organization'),
			eq(apiKeys.isActive, true),
			isNull(apiKeys.deletedAt)
		))
		.get();

	const active = cache.has(CacheKeys.apiKeyOrg(org.id));
	return json({
		registered: !!key,
		active,
		hashDigestPrefix: key?.hashDigest.substring(0, 12) ?? null
	});
};
