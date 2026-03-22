import { randomUUID } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { getSystemDb } from '$lib/server/db';
import { auditLog } from '$lib/server/db/schema-system';
import { hashDigest } from '$lib/server/crypto';

export interface AuditEntry {
	whatTable: string;
	whatRecordId?: string;
	how: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
	why: string;
	howManyAffected?: number;
}

/**
 * Log an audit entry with 5W2H and integrity hash digest.
 */
export function logAudit(event: RequestEvent, entry: AuditEntry): void {
	const user = event.locals.user;
	if (!user) return; // Can't audit without a user

	const who = user.id;
	const when = new Date().toISOString();
	const whereIp =
		event.request.headers.get('x-forwarded-for') ||
		event.getClientAddress();
	const organizationId = event.locals.organization?.id || null;

	// Compute hash digest for integrity verification
	const digest = hashDigest(
		JSON.stringify({
			who,
			whatTable: entry.whatTable,
			whatRecordId: entry.whatRecordId || null,
			how: entry.how,
			why: entry.why,
			when,
			whereIp,
			howManyAffected: entry.howManyAffected ?? 1
		})
	);

	const db = getSystemDb();
	db.insert(auditLog)
		.values({
			id: randomUUID(),
			who,
			whatTable: entry.whatTable,
			whatRecordId: entry.whatRecordId || null,
			how: entry.how,
			why: entry.why,
			when,
			whereIp,
			howManyAffected: entry.howManyAffected ?? 1,
			organizationId,
			hashDigest: digest
		})
		.run();
}
