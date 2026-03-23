import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { orgSettings } from '$lib/server/db/schema-org';
import { requirePermission } from '$lib/server/middleware/auth';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = (event) => {
	requirePermission(event, 'canViewDashboard');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({});

	const rows = orgDb.select().from(orgSettings).all();
	const settings: Record<string, string> = {};
	for (const row of rows) {
		settings[row.key] = row.value;
	}

	return json(settings);
};

export const PATCH: RequestHandler = async (event) => {
	requirePermission(event, 'canManageOrganization');

	const orgDb = event.locals.orgDb;
	if (!orgDb) return json({ error: 'Organização não configurada' }, { status: 400 });

	const body = await event.request.json();
	const { key, value } = body;

	if (!key || typeof value !== 'string') {
		return json({ error: 'key e value são obrigatórios' }, { status: 400 });
	}

	const existing = orgDb.select().from(orgSettings).where(eq(orgSettings.key, key)).get();
	if (existing) {
		orgDb.update(orgSettings)
			.set({ value, updatedAt: new Date().toISOString() })
			.where(eq(orgSettings.key, key))
			.run();
	} else {
		orgDb.insert(orgSettings).values({ key, value }).run();
	}

	return json({ success: true });
};
