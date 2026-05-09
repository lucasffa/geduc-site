import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { logAudit } from '$lib/server/middleware/audit';
import { getSystemDb } from '$lib/server/db';
import { apiKeys, users } from '$lib/server/db/schema-system';
import { decrypt } from '$lib/server/crypto';
import { cache, CacheKeys } from '$lib/server/cache';
import { verifyPassword } from '$lib/server/auth';
import { eq, and, isNull } from 'drizzle-orm';
import { logger } from '$lib/utils/logger';

const COMPONENT = 'api-keys-activate';

export const POST: RequestHandler = async (event) => {
	requirePermission(event, 'canManageApiKeys');

	const user = event.locals.user!;
	logger.info('POST /api/api-keys/activate', { userId: user.id, role: user.role }, COMPONENT);

	if (!['admin', 'sysadmin'].includes(user.role)) {
		logger.warn('Rejected: not admin', { role: user.role }, COMPONENT);
		return json({ error: 'Apenas admin pode ativar a chave da organização' }, { status: 403 });
	}
	if (!event.locals.organization) {
		logger.warn('Rejected: no org', { userId: user.id }, COMPONENT);
		return json({ error: 'Organização não configurada' }, { status: 400 });
	}

	try {
		const { password } = await event.request.json();
		if (!password) return json({ error: 'Senha obrigatória' }, { status: 400 });

		const db = getSystemDb();
		const dbUser = db.select().from(users).where(eq(users.id, user.id)).get();
		if (!dbUser || !(await verifyPassword(password, dbUser.passwordHash))) {
			logger.warn('Rejected: invalid password', { userId: user.id }, COMPONENT);
			return json({ error: 'Senha inválida' }, { status: 401 });
		}

		const orgId = event.locals.organization.id;
		const key = db
			.select()
			.from(apiKeys)
			.where(and(
				eq(apiKeys.ownerId, orgId),
				eq(apiKeys.ownerType, 'organization'),
				eq(apiKeys.isActive, true),
				isNull(apiKeys.deletedAt)
			))
			.get();

		if (!key) {
			logger.warn('No active org key found', { orgId }, COMPONENT);
			return json({ error: 'Nenhuma chave registrada para a organização' }, { status: 404 });
		}

		try {
			const decrypted = decrypt(key.encryptedKey, key.iv, key.salt, password);
			cache.set(CacheKeys.apiKeyOrg(orgId), decrypted, 0);
			logger.info('Org API key activated in cache', { orgId, keyId: key.id }, COMPONENT);
		} catch (err) {
			logger.warn('Decryption failed — wrong password for this key', { orgId, keyId: key.id, err: String(err) }, COMPONENT);
			return json({
				error: 'Não foi possível decriptar a chave com sua senha. Apenas o admin que registrou a chave pode ativá-la, ou registre uma nova.'
			}, { status: 400 });
		}

		logAudit(event, {
			whatTable: 'api_keys',
			whatRecordId: key.id,
			how: 'UPDATE',
			why: `Chave API da organização ativada em RAM (digest: ${key.hashDigest.substring(0, 12)}...)`
		});

		return json({ active: true });
	} catch (error) {
		logger.error('Erro ao ativar API key', error, COMPONENT);
		return json({ error: 'Erro interno' }, { status: 500 });
	}
};
