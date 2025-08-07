import type { Reroute } from '@sveltejs/kit';
import { deLocalizeUrl } from '$lib/paraglide/runtime';

export const reroute: Reroute = ({ url }) => {
	const deLocalizedUrl = deLocalizeUrl(url.href);
	return deLocalizedUrl.pathname;
};
