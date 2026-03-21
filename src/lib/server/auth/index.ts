import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { eq, and, isNull } from 'drizzle-orm';
import { getSystemDb } from '$lib/server/db';
import { users, sessions, apiKeys } from '$lib/server/db/schema-system';
import { cache, CacheKeys } from '$lib/server/cache';
import { decrypt } from '$lib/server/crypto';
import type { UserSession } from '$lib/types/auth';
import type { RequestEvent } from '@sveltejs/kit';

const SESSION_TTL_DAYS = 7;
const SESSION_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

// ============================================================
// Password hashing
// ============================================================
export async function hashPassword(plain: string): Promise<string> {
	return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
	return bcrypt.compare(plain, hash);
}

// ============================================================
// Session management
// ============================================================
export function createSession(userId: string): { token: string; expiresAt: string } {
	const db = getSystemDb();
	const token = randomUUID();
	const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();

	db.insert(sessions)
		.values({ id: token, userId, expiresAt })
		.run();

	return { token, expiresAt };
}

export function validateSession(token: string): UserSession | null {
	// Check cache first
	const cached = cache.get<UserSession>(CacheKeys.session(token));
	if (cached) return cached;

	const db = getSystemDb();
	const session = db
		.select()
		.from(sessions)
		.where(eq(sessions.id, token))
		.get();

	if (!session) return null;

	// Check expiration
	if (new Date(session.expiresAt) < new Date()) {
		db.delete(sessions).where(eq(sessions.id, token)).run();
		return null;
	}

	// Load user
	const user = db
		.select()
		.from(users)
		.where(and(eq(users.id, session.userId), isNull(users.deletedAt)))
		.get();

	if (!user || !user.isActive) return null;

	const userSession: UserSession = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role as UserSession['role'],
		organizationId: user.organizationId
	};

	// Cache it
	cache.set(CacheKeys.session(token), userSession, SESSION_CACHE_TTL_MS);
	return userSession;
}

export function destroySession(token: string): void {
	cache.delete(CacheKeys.session(token));
	const db = getSystemDb();
	db.delete(sessions).where(eq(sessions.id, token)).run();
}

// ============================================================
// Session cookie helpers
// ============================================================
export function setSessionCookie(event: RequestEvent, token: string, expiresAt: string): void {
	event.cookies.set('session_id', token, {
		path: '/',
		httpOnly: true,
		secure: false, // Set to true in production with HTTPS
		sameSite: 'lax',
		expires: new Date(expiresAt)
	});
}

export function clearSessionCookie(event: RequestEvent): void {
	event.cookies.delete('session_id', { path: '/' });
}

// ============================================================
// Update last login
// ============================================================
export function updateLastLogin(userId: string): void {
	const db = getSystemDb();
	db.update(users)
		.set({ lastLoginAt: new Date().toISOString() })
		.where(eq(users.id, userId))
		.run();
}

// ============================================================
// Decrypt and cache API keys on login
// ============================================================
export function cacheUserApiKey(userId: string, password: string): void {
	const db = getSystemDb();
	const key = db
		.select()
		.from(apiKeys)
		.where(
			and(
				eq(apiKeys.ownerId, userId),
				eq(apiKeys.ownerType, 'user'),
				eq(apiKeys.isActive, true),
				isNull(apiKeys.deletedAt)
			)
		)
		.get();

	if (!key) return;

	try {
		const decrypted = decrypt(key.encryptedKey, key.iv, key.salt, password);
		// TTL=0: stays in cache until server restart
		cache.set(CacheKeys.apiKeyUser(userId), decrypted, 0);
	} catch {
		// Decryption failed — key may have been encrypted with different password
		console.warn(`Failed to decrypt API key for user ${userId}`);
	}
}

export function cacheOrgApiKey(orgId: string, adminPassword: string): void {
	const db = getSystemDb();
	const key = db
		.select()
		.from(apiKeys)
		.where(
			and(
				eq(apiKeys.ownerId, orgId),
				eq(apiKeys.ownerType, 'organization'),
				eq(apiKeys.isActive, true),
				isNull(apiKeys.deletedAt)
			)
		)
		.get();

	if (!key) return;

	try {
		const decrypted = decrypt(key.encryptedKey, key.iv, key.salt, adminPassword);
		cache.set(CacheKeys.apiKeyOrg(orgId), decrypted, 0);
	} catch {
		console.warn(`Failed to decrypt org API key for org ${orgId}`);
	}
}
