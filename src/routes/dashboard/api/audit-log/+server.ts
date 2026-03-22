import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { getSystemDb } from '$lib/server/db';
import { auditLog, users } from '$lib/server/db/schema-system';
import { eq, desc, like, and, sql } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewAuditLog');

	const url = event.url;
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);
	const offset = (page - 1) * limit;

	const who = url.searchParams.get('who') || '';
	const how = url.searchParams.get('how') || '';
	const table = url.searchParams.get('table') || '';

	const db = getSystemDb();
	const orgId = event.locals.organization?.id;

	// Build conditions
	const conditions = [];
	if (orgId) {
		conditions.push(eq(auditLog.organizationId, orgId));
	}
	if (who) {
		conditions.push(eq(auditLog.who, who));
	}
	if (how) {
		conditions.push(eq(auditLog.how, how as 'CREATE' | 'READ' | 'UPDATE' | 'DELETE'));
	}
	if (table) {
		conditions.push(eq(auditLog.whatTable, table));
	}

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	const rows = db
		.select({
			id: auditLog.id,
			who: auditLog.who,
			userName: users.name,
			whatTable: auditLog.whatTable,
			whatRecordId: auditLog.whatRecordId,
			how: auditLog.how,
			why: auditLog.why,
			when: auditLog.when,
			whereIp: auditLog.whereIp,
			howManyAffected: auditLog.howManyAffected,
			hashDigest: auditLog.hashDigest
		})
		.from(auditLog)
		.leftJoin(users, eq(auditLog.who, users.id))
		.where(whereClause)
		.orderBy(desc(auditLog.when))
		.limit(limit)
		.offset(offset)
		.all();

	const totalResult = db
		.select({ count: sql<number>`count(*)` })
		.from(auditLog)
		.where(whereClause)
		.get();

	return json({
		data: rows,
		total: totalResult?.count ?? 0,
		page,
		limit,
		totalPages: Math.ceil((totalResult?.count ?? 0) / limit)
	});
};
