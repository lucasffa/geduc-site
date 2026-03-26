import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter(),
		csrf: {
			checkOrigin: process.env.NODE_ENV === 'production'
		},
		prerender: {
			handleHttpError: ({ path, referrer, message }) => {
				// Ignora erros 404 durante o prerender
				if (message.includes('404')) {
					console.warn(`Aviso: ${message}`);
					return;
				}
				throw new Error(message);
			}
		}
	}
};

export default config;