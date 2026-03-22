import { json } from '@sveltejs/kit';
import { randomUUID } from 'node:crypto';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { apiKeys } from '$lib/server/db/schema-system';
import { encrypt, hashDigest } from '$lib/server/crypto';
import { cache, CacheKeys } from '$lib/server/cache';
import { eq, and, isNull } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canManageApiKeys');

	const user = event.locals.user!;
	const db = getSystemDb();

	// Show user's own keys + org keys (if admin)
	const userKeys = db.select({
		id: apiKeys.id,
		ownerType: apiKeys.ownerType,
		service: apiKeys.service,
		label: apiKeys.label,
		hashDigest: apiKeys.hashDigest,
		isActive: apiKeys.isActive,
		createdAt: apiKeys.createdAt
	}).from(apiKeys).where(
		and(
			eq(apiKeys.ownerId, user.id),
			eq(apiKeys.ownerType, 'user'),
			isNull(apiKeys.deletedAt)
		)
	).all();

	let orgKeys: typeof userKeys = [];
	if (event.locals.organization && ['admin', 'sysadmin'].includes(user.role)) {
		orgKeys = db.select({
			id: apiKeys.id,
			ownerType: apiKeys.ownerType,
			service: apiKeys.service,
			label: apiKeys.label,
			hashDigest: apiKeys.hashDigest,
			isActive: apiKeys.isActive,
			createdAt: apiKeys.createdAt
		}).from(apiKeys).where(
			and(
				eq(apiKeys.ownerId, event.locals.organization.id),
				eq(apiKeys.ownerType, 'organization'),
				isNull(apiKeys.deletedAt)
			)
		).all();
	}

	return json([...userKeys, ...orgKeys]);
};

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageApiKeys');

	const user = event.locals.user!;

	try {
		const body = await event.request.json();
		const { key, ownerType = 'user', label = '' } = body;

		if (!key?.trim()) return json({ error: 'Chave obrigatória' }, { status: 400 });
		if (!['user', 'organization'].includes(ownerType)) {
			return json({ error: 'ownerType inválido' }, { status: 400 });
		}

		let ownerId = user.id;
		if (ownerType === 'organization') {
			if (!['admin', 'sysadmin'].includes(user.role)) {
				return json({ error: 'Apenas admin pode registrar chave da organização' }, { status: 403 });
			}
			if (!event.locals.organization) {
				return json({ error: 'Organização não configurada' }, { status: 400 });
			}
			ownerId = event.locals.organization.id;
		}

		// Get password from session cookie — for encryption we use a server-side secret
		// Since we can't access the user's plaintext password here,
		// we use a combination of the user's ID and a server secret
		const encryptionPassword = `${user.id}:${process.env.ENCRYPTION_SECRET || 'geduc-default-secret'}`;

		const digest = hashDigest(key);
		const encrypted = encrypt(key, encryptionPassword);

		const id = randomUUID();
		const db = getSystemDb();
		db.insert(apiKeys).values({
			id,
			ownerType,
			ownerId,
			service: 'resend',
			encryptedKey: encrypted.ciphertext,
			iv: encrypted.iv,
			salt: encrypted.salt,
			hashDigest: digest,
			label: label || null,
			isActive: true
		}).run();

		// Cache the decrypted key immediately (TTL=0, until server restart)
		if (ownerType === 'user') {
			cache.set(CacheKeys.apiKeyUser(user.id), key, 0);
		} else {
			cache.set(CacheKeys.apiKeyOrg(ownerId), key, 0);
		}

		logAudit(event, {
			whatTable: 'api_keys',
			whatRecordId: id,
			how: 'CREATE',
			why: `Chave API ${ownerType} registrada (digest: ${digest.substring(0, 12)}...)`
		});

		return json({ id, hashDigest: digest }, { status: 201 });
	} catch (error) {
		console.error('Erro ao salvar API key:', error);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
