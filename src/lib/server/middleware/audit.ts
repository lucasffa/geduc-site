import { randomUUID } from 'node:crypto';
import type { RequestEvent } from '@sveltejs/kit';
import { getSystemDb } from '$lib/server/db';
import { auditLog, organizations } from '$lib/server/db/schema-system';
import { hashDigest } from '$lib/server/crypto';
import { eq } from 'drizzle-orm';

export interface AuditEntry {
	whatTable: string;
	whatRecordId?: string;
	how: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE';
	why: string;
	howManyAffected?: number;
	/** Override organizationId (useful when event.locals.organization is not set) */
	organizationId?: string | null;
	/** Override who (useful for login where event.locals.user is not yet set) */
	who?: string;
}

/**
 * Log an audit entry with 6W2H and integrity hash digest.
 * 6W2H = Who, What, How, Why, When, Where (IP), Where (Org), How Many
 */
export function logAudit(event: RequestEvent, entry: AuditEntry): void {
	const who = entry.who || event.locals.user?.id;
	if (!who) return; // Can't audit without a user

	const when = new Date().toISOString();
	const whereIp =
		event.request.headers.get('x-forwarded-for') ||
		event.getClientAddress();

	// Resolve organizationId: explicit override > event.locals.organization > null
	const organizationId =
		entry.organizationId !== undefined
			? entry.organizationId
			: (event.locals.organization?.id || null);

	// Resolve organization name for the whereOrganization field
	let whereOrganization: string | null = null;
	if (organizationId) {
		const db = getSystemDb();
		const org = db
			.select({ name: organizations.name })
			.from(organizations)
			.where(eq(organizations.id, organizationId))
			.get();
		whereOrganization = org?.name || null;
	}

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
			whereOrganization,
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
			whereOrganization,
			hashDigest: digest
		})
		.run();
}
