import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { destroySession, clearSessionCookie } from '$lib/server/auth';

export const POST: RequestHandler = (event) => {
	const token = event.cookies.get('session_id');
	if (token) {
		destroySession(token);
	}
	clearSessionCookie(event);
	throw redirect(302, '/');
};
