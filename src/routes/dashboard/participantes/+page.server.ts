import type { PageServerLoad } from './$types';
import { isNull, like, sql, count, eq } from 'drizzle-orm';
import { participants, statusHistory, orgSettings } from '$lib/server/db/schema-org';
import { DEFAULT_CUSTOM_ROLES } from '$lib/constants/participant-status';

export const load: PageServerLoad = ({ locals, url }) => {
	const orgDb = locals.orgDb;
	if (!orgDb) {
		return { participants: [], pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }, permissions: locals.permissions };
	}

	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';
	const role = url.searchParams.get('role') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = 25;

	// Build conditions
	const conditions = [isNull(participants.deletedAt)];
	if (search) {
		conditions.push(
			sql`(LOWER(${participants.name}) LIKE ${`%${search.toLowerCase()}%`} OR LOWER(${participants.email}) LIKE ${`%${search.toLowerCase()}%`})`
		);
	}
	if (status) {
		conditions.push(eq(participants.status, status));
	}
	if (role) {
		conditions.push(eq(participants.role, role));
	}

	const where = sql.join(conditions, sql` AND `);

	// Count total
	const totalResult = orgDb
		.select({ count: count() })
		.from(participants)
		.where(where)
		.get();
	const total = totalResult?.count ?? 0;
	const totalPages = Math.ceil(total / limit);

	// Fetch page
	const rows = orgDb
		.select()
		.from(participants)
		.where(where)
		.orderBy(sql`${participants.createdAt} DESC`)
		.limit(limit)
		.offset((page - 1) * limit)
		.all();

	// Load org settings
	const enforceTransitionsSetting = orgDb
		.select()
		.from(orgSettings)
		.where(eq(orgSettings.key, 'enforce_status_transitions'))
		.get();
	const enforceStatusTransitions = enforceTransitionsSetting?.value !== 'false';

	const rolesSetting = orgDb
		.select()
		.from(orgSettings)
		.where(eq(orgSettings.key, 'custom_roles'))
		.get();
	let customRoles = DEFAULT_CUSTOM_ROLES;
	if (rolesSetting?.value) {
		try { customRoles = JSON.parse(rolesSetting.value); } catch {}
	}

	return {
		participants: rows,
		pagination: { page, limit, total, totalPages },
		permissions: locals.permissions,
		enforceStatusTransitions,
		customRoles
	};
};
