import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { getSystemDb, initSystemDb } from './index';
import { users } from './schema-system';
import { eq } from 'drizzle-orm';

const SYSADMIN_EMAIL = process.env.SYSADMIN_EMAIL || 'admin@geduc.org';
const SYSADMIN_PASSWORD = process.env.SYSADMIN_PASSWORD || 'admin123';
const SYSADMIN_NAME = process.env.SYSADMIN_NAME || 'System Admin';

async function seed() {
	console.log('Initializing system database...');
	initSystemDb();

	const db = getSystemDb();

	// Check if sysadmin already exists
	const existing = db.select().from(users).where(eq(users.email, SYSADMIN_EMAIL)).get();

	if (existing) {
		console.log(`Sysadmin already exists: ${SYSADMIN_EMAIL}`);
		return;
	}

	const passwordHash = await bcrypt.hash(SYSADMIN_PASSWORD, 12);

	db.insert(users)
		.values({
			id: randomUUID(),
			email: SYSADMIN_EMAIL,
			name: SYSADMIN_NAME,
			passwordHash,
			role: 'sysadmin',
			organizationId: null,
			isActive: true
		})
		.run();

	console.log(`Sysadmin created: ${SYSADMIN_EMAIL}`);
	console.log('Seed completed.');
}

seed().catch(console.error);
