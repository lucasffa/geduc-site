// src/routes/auth/login/+page.server.ts
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { loginSchema } from '$lib/validations/auth';
import { getSystemDb } from '$lib/server/db';
import { users } from '$lib/server/db/schema-system';
import { eq, and, isNull } from 'drizzle-orm';
import {
	verifyPassword,
	createSession,
	setSessionCookie,
	updateLastLogin,
	cacheUserApiKey,
	cacheOrgApiKey
} from '$lib/server/auth';
import { logAudit } from '$lib/server/middleware/audit';

export const load: PageServerLoad = ({ locals }) => {
	// Redirect if already logged in
	if (locals.user) {
		if (locals.user.role === 'sysadmin') throw redirect(302, '/sysadmin');
		throw redirect(302, '/dashboard');
	}
	return {};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const data = {
			email: formData.get('email') as string,
			password: formData.get('password') as string
		};

		// Validate
		const parsed = loginSchema.safeParse(data);
		if (!parsed.success) {
			return fail(400, {
				error: parsed.error.issues[0].message,
				email: data.email
			});
		}

		const db = getSystemDb();
		const user = db
			.select()
			.from(users)
			.where(and(eq(users.email, parsed.data.email), isNull(users.deletedAt)))
			.get();

		if (!user) {
			return fail(400, { error: 'Credenciais inválidas', email: data.email });
		}

		if (!user.isActive) {
			return fail(400, { error: 'Conta desativada', email: data.email });
		}

		if (user.role === 'dumb') {
			return fail(403, { error: 'Acesso negado', email: data.email });
		}

		const valid = await verifyPassword(parsed.data.password, user.passwordHash);
		if (!valid) {
			return fail(400, { error: 'Credenciais inválidas', email: data.email });
		}

		// Create session
		const { token, expiresAt } = createSession(user.id);
		setSessionCookie(event, token, expiresAt);
		updateLastLogin(user.id);

		// Cache API keys on login
		cacheUserApiKey(user.id, parsed.data.password);
		if (user.organizationId && user.role === 'admin') {
			cacheOrgApiKey(user.organizationId, parsed.data.password);
		}

		// Audit: login
		logAudit(event, {
			who: user.id,
			whatTable: 'sessions',
			whatRecordId: token,
			how: 'CREATE',
			why: `Login de "${user.name}" (${user.email})`,
			organizationId: user.organizationId || null
		});

		// Redirect based on role
		if (user.role === 'sysadmin') {
			throw redirect(302, '/sysadmin');
		}
		throw redirect(302, '/dashboard');
	}
};
