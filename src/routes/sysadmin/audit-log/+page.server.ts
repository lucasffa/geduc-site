import type { PageServerLoad } from './$types';
import { getSystemDb } from '$lib/server/db';
import { auditLog, users } from '$lib/server/db/schema-system';
import { eq, desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = ({ url }) => {
	const db = getSystemDb();
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = 50;
	const offset = (page - 1) * limit;

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
			organizationId: auditLog.organizationId,
			hashDigest: auditLog.hashDigest
		})
		.from(auditLog)
		.leftJoin(users, eq(auditLog.who, users.id))
		.orderBy(desc(auditLog.when))
		.limit(limit)
		.offset(offset)
		.all();

	const totalResult = db
		.select({ count: sql<number>`count(*)` })
		.from(auditLog)
		.get();

	return {
		entries: rows,
		total: totalResult?.count ?? 0,
		page,
		totalPages: Math.ceil((totalResult?.count ?? 0) / limit)
	};
};
