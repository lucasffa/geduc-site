/**
 * Standalone script to create the sysadmin user.
 * Usage: SYSADMIN_EMAIL=x SYSADMIN_PASSWORD=y pnpm tsx scripts/seed-sysadmin.ts
 */
import { initSystemDb } from '../src/lib/server/db/index';
import { ensureSysadmin } from '../src/lib/server/db/seed';

initSystemDb();
await ensureSysadmin();
