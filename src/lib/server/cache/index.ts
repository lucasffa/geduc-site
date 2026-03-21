/**
 * In-memory cache with TTL support.
 * Interface designed to be Redis-compatible for future migration.
 * TTL=0 means no expiration (persists until server restart).
 */

interface CacheEntry<T> {
	value: T;
	expiresAt: number | null; // null = no expiration
}

export interface CacheStore {
	get<T>(key: string): T | undefined;
	set<T>(key: string, value: T, ttlMs?: number): void;
	delete(key: string): boolean;
	has(key: string): boolean;
	clear(): void;
	size(): number;
}

class MemoryCache implements CacheStore {
	private store = new Map<string, CacheEntry<unknown>>();
	private sweepInterval: ReturnType<typeof setInterval> | null = null;

	constructor(sweepIntervalMs = 60_000) {
		if (sweepIntervalMs > 0) {
			this.sweepInterval = setInterval(() => this.sweep(), sweepIntervalMs);
			// Allow process to exit even if interval is running
			if (this.sweepInterval.unref) {
				this.sweepInterval.unref();
			}
		}
	}

	get<T>(key: string): T | undefined {
		const entry = this.store.get(key);
		if (!entry) return undefined;

		// Lazy expiration check
		if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
			this.store.delete(key);
			return undefined;
		}

		return entry.value as T;
	}

	set<T>(key: string, value: T, ttlMs = 0): void {
		const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : null;
		this.store.set(key, { value, expiresAt });
	}

	delete(key: string): boolean {
		return this.store.delete(key);
	}

	has(key: string): boolean {
		return this.get(key) !== undefined;
	}

	clear(): void {
		this.store.clear();
	}

	size(): number {
		return this.store.size;
	}

	/** Remove all expired entries */
	private sweep(): void {
		const now = Date.now();
		for (const [key, entry] of this.store) {
			if (entry.expiresAt !== null && now > entry.expiresAt) {
				this.store.delete(key);
			}
		}
	}

	destroy(): void {
		if (this.sweepInterval) {
			clearInterval(this.sweepInterval);
			this.sweepInterval = null;
		}
		this.store.clear();
	}
}

// Singleton instance
export const cache: CacheStore = new MemoryCache();

// Cache key helpers
export const CacheKeys = {
	session: (token: string) => `session:${token}`,
	orgDb: (slug: string) => `orgDb:${slug}`,
	apiKeyUser: (userId: string) => `apiKey:user:${userId}`,
	apiKeyOrg: (orgId: string) => `apiKey:org:${orgId}`,
	permissions: (role: string) => `permissions:${role}`
} as const;
