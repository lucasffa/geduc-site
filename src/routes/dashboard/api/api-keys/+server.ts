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
import { logger } from '$lib/utils/logger';
import { users } from '$lib/server/db/schema-system';
import { verifyPassword } from '$lib/server/auth';

const COMPONENT = 'api-keys';

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

	logger.info('POST /api/api-keys received', { userId: user.id, role: user.role }, COMPONENT);

	try {
		const body = await event.request.json();
		const { key, ownerType = 'user', label = '', password } = body;

		logger.debug('Payload parsed', { ownerType, hasKey: !!key, keyLength: key?.length, hasPassword: !!password, label }, COMPONENT);

		if (!key?.trim()) {
			logger.warn('Rejected: empty key', { userId: user.id }, COMPONENT);
			return json({ error: 'Chave obrigatória' }, { status: 400 });
		}
		if (!password) {
			logger.warn('Rejected: missing password', { userId: user.id }, COMPONENT);
			return json({ error: 'Senha obrigatória para encriptar a chave' }, { status: 400 });
		}
		if (!['user', 'organization'].includes(ownerType)) {
			logger.warn('Rejected: invalid ownerType', { ownerType }, COMPONENT);
			return json({ error: 'ownerType inválido' }, { status: 400 });
		}

		// Verify password matches user's own
		const db = getSystemDb();
		const dbUser = db.select().from(users).where(eq(users.id, user.id)).get();
		if (!dbUser || !(await verifyPassword(password, dbUser.passwordHash))) {
			logger.warn('Rejected: invalid password', { userId: user.id }, COMPONENT);
			return json({ error: 'Senha inválida' }, { status: 401 });
		}

		let ownerId = user.id;
		if (ownerType === 'organization') {
			if (!['admin', 'sysadmin'].includes(user.role)) {
				logger.warn('Rejected: non-admin trying to set org key', { userId: user.id, role: user.role }, COMPONENT);
				return json({ error: 'Apenas admin pode registrar chave da organização' }, { status: 403 });
			}
			if (!event.locals.organization) {
				logger.warn('Rejected: no org in locals', { userId: user.id }, COMPONENT);
				return json({ error: 'Organização não configurada' }, { status: 400 });
			}
			ownerId = event.locals.organization.id;
		}

		// Soft-delete any existing active key for this owner — only one active key allowed.
		// This avoids password mismatches between old and new keys for the same owner.
		db.update(apiKeys)
			.set({ deletedAt: new Date().toISOString(), deletedBy: user.id, isActive: false })
			.where(and(
				eq(apiKeys.ownerId, ownerId),
				eq(apiKeys.ownerType, ownerType),
				eq(apiKeys.isActive, true),
				isNull(apiKeys.deletedAt)
			))
			.run();

		const digest = hashDigest(key);
		const encrypted = encrypt(key, password);
		logger.debug('Key encrypted with user password', { digestPrefix: digest.substring(0, 12), ownerType, ownerId }, COMPONENT);

		const id = randomUUID();
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
		logger.info('API key persisted', { id, ownerType, ownerId, service: 'resend' }, COMPONENT);

		// User keys auto-cache (admin just provided their password — same one used by login).
		// Org keys require explicit activation via /activate; we cache here too as a convenience
		// so the admin doesn't need a second activation right after registering.
		if (ownerType === 'user') {
			cache.set(CacheKeys.apiKeyUser(user.id), key, 0);
		} else {
			cache.set(CacheKeys.apiKeyOrg(ownerId), key, 0);
		}
		logger.debug('Plaintext key cached in memory', { ownerType, ownerId }, COMPONENT);

		logAudit(event, {
			whatTable: 'api_keys',
			whatRecordId: id,
			how: 'CREATE',
			why: `Chave API ${ownerType} registrada (digest: ${digest.substring(0, 12)}...)`
		});

		return json({ id, hashDigest: digest }, { status: 201 });
	} catch (error) {
		logger.error('Erro ao salvar API key', error, COMPONENT);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
