import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getSystemDb } from './index';
import { users } from './schema-system';
import { eq } from 'drizzle-orm';

/**
 * Ensures exactly one sysadmin exists in the system.
 * Idempotent — safe to call on every server boot.
 *
 * Reads from env vars (set in Coolify or .env):
 *   SYSADMIN_EMAIL, SYSADMIN_PASSWORD, SYSADMIN_NAME
 *
 * Rules:
 * - If no sysadmin exists → creates one from env vars
 * - If sysadmin already exists → skips (no duplicates)
 * - Only ONE user with role 'sysadmin' is ever allowed
 */
export async function ensureSysadmin(
	email?: string,
	password?: string,
	name?: string
): Promise<void> {
	const sysEmail = email || process.env.SYSADMIN_EMAIL;
	const sysPassword = password || process.env.SYSADMIN_PASSWORD;
	const sysName = name || process.env.SYSADMIN_NAME || 'System Admin';

	if (!sysEmail || !sysPassword) {
		console.log('[seed] SYSADMIN_EMAIL and SYSADMIN_PASSWORD not set — skipping sysadmin creation.');
		return;
	}

	const db = getSystemDb();

	// Enforce single sysadmin: check if ANY sysadmin already exists
	const existingSysadmin = db
		.select({ id: users.id, email: users.email })
		.from(users)
		.where(eq(users.role, 'sysadmin'))
		.get();

	if (existingSysadmin) {
		console.log(`[seed] Sysadmin already exists: ${existingSysadmin.email} — skipping.`);
		return;
	}

	const passwordHash = await bcrypt.hash(sysPassword, 12);

	db.insert(users)
		.values({
			id: randomUUID(),
			email: sysEmail,
			name: sysName,
			passwordHash,
			role: 'sysadmin',
			organizationId: null,
			isActive: true
		})
		.run();

	console.log(`[seed] Sysadmin created: ${sysEmail}`);
}
