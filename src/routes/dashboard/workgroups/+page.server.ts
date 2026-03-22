import type { PageServerLoad } from './$types';
import { requirePermission } from '$lib/server/middleware/auth';
import { isNull, sql } from 'drizzle-orm';
import { workgroups } from '$lib/server/db/schema-org';

export const load: PageServerLoad = (event) => {
	requirePermission(event, 'canManageWorkgroups');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return { workgroups: [] };

	const rows = orgDb
		.select()
		.from(workgroups)
		.where(isNull(workgroups.deletedAt))
		.orderBy(
			sql`${workgroups.isActive} DESC`,
			sql`${workgroups.createdAt} DESC`
		)
		.all();

	return { workgroups: rows, permissions: event.locals.permissions };
};
