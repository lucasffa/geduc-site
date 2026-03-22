import type { PageServerLoad } from './$types';
import { isNull, sql, count, eq, inArray } from 'drizzle-orm';
import { participants, orgSettings, participantViews } from '$lib/server/db/schema-org';
import { DEFAULT_CUSTOM_ROLES } from '$lib/constants/participant-status';

export const load: PageServerLoad = ({ locals, url }) => {
	const orgDb = locals.orgDb;
	if (!orgDb) {
		return { participants: [], pagination: { page: 1, limit: 25, total: 0, totalPages: 0 }, permissions: locals.permissions, views: [] };
	}

	const search = url.searchParams.get('search') || '';
	const status = url.searchParams.get('status') || '';
	const role = url.searchParams.get('role') || '';
	const viewId = url.searchParams.get('view') || '';
	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = 25;

	// Load views
	const views = orgDb
		.select()
		.from(participantViews)
		.orderBy(sql`${participantViews.position} ASC`)
		.all();

	// Build conditions
	const conditions = [isNull(participants.deletedAt)];

	// Apply view filters if a view is selected
	let activeView = null;
	if (viewId) {
		activeView = views.find((v) => v.id === viewId);
		if (activeView) {
			try {
				const filters = JSON.parse(activeView.filters);
				if (filters.statuses?.length) {
					conditions.push(inArray(participants.status, filters.statuses));
				}
				if (filters.roles?.length) {
					conditions.push(inArray(participants.role, filters.roles));
				}
				if (filters.createdAfter) {
					conditions.push(sql`${participants.createdAt} >= ${filters.createdAfter}`);
				}
				if (filters.createdBefore) {
					conditions.push(sql`${participants.createdAt} <= ${filters.createdBefore}`);
				}
			} catch {}
		}
	}

	// Apply manual filters (on top of view filters)
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
		customRoles,
		views
	};
};
