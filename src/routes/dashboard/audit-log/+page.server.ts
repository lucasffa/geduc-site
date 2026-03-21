import type { PageServerLoad } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { getSystemDb } from '$lib/server/db';
import { auditLog, users } from '$lib/server/db/schema-system';
import { eq, sql, desc } from 'drizzle-orm';

export const load: PageServerLoad = (event) => {
	requirePermission(event, 'canViewAuditLog');

	const orgId = event.locals.organization?.id;
	const page = Math.max(1, parseInt(event.url.searchParams.get('page') || '1'));
	const limit = 50;

	const db = getSystemDb();

	const condition = orgId
		? eq(auditLog.organizationId, orgId)
		: sql`1=1`;

	const rows = db
		.select({
			id: auditLog.id,
			who: auditLog.who,
			whoName: users.name,
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
		.where(condition)
		.orderBy(desc(auditLog.when))
		.limit(limit)
		.offset((page - 1) * limit)
		.all();

	return {
		entries: rows,
		page,
		permissions: event.locals.permissions
	};
};
