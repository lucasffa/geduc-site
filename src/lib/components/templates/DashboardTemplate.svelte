<!-- src/lib/components/templates/DashboardTemplate.svelte -->
<script lang="ts">
	import DashboardSidebar from '$lib/components/organisms/DashboardSidebar.svelte';
	import DashboardTopBar from '$lib/components/organisms/DashboardTopBar.svelte';
	import ToastContainer from '$lib/components/molecules/ToastContainer.svelte';

	export let brandName = 'GEDUC';
	export let logoUrl: string | null = null;
	export let userName = '';
	export let userRole = '';
	export let permissions = {};
	export let isSysadmin = false;
	export let primaryColor = '#324acb';

	// Deriva uma paleta a partir da cor primária da org usando color-mix.
	// Sobrescreve as variáveis globais do app dentro do escopo do dashboard.
	$: paletteStyle = `
		--brand-color: ${primaryColor};
		--color-primary-50: color-mix(in srgb, ${primaryColor} 8%, white);
		--color-primary-100: color-mix(in srgb, ${primaryColor} 15%, white);
		--color-primary-200: color-mix(in srgb, ${primaryColor} 30%, white);
		--color-primary-300: color-mix(in srgb, ${primaryColor} 45%, white);
		--color-primary-400: color-mix(in srgb, ${primaryColor} 65%, white);
		--color-primary-500: ${primaryColor};
		--color-primary-600: color-mix(in srgb, ${primaryColor} 85%, black);
		--color-primary-700: color-mix(in srgb, ${primaryColor} 70%, black);
		--color-primary-800: color-mix(in srgb, ${primaryColor} 55%, black);
		--color-primary-900: color-mix(in srgb, ${primaryColor} 40%, black);
		--color-primary-light: color-mix(in srgb, ${primaryColor} 45%, white);
		--color-primary-dark: color-mix(in srgb, ${primaryColor} 55%, black);
	`.replace(/\s+/g, ' ').trim();
</script>

<div class="dashboard-layout" style={paletteStyle}>
	<DashboardSidebar
		{brandName}
		{logoUrl}
		{userName}
		{userRole}
		{permissions}
		{isSysadmin}
	/>

	<div class="dashboard-content">
		<DashboardTopBar {userName} {brandName} />

		<main class="dashboard-main">
			<slot />
		</main>
	</div>

	<ToastContainer />
</div>

<style>
	.dashboard-layout {
		display: flex;
		min-height: 100vh;
		/* Re-resolve text color using the overridden primary palette.
		   Without this, `color` is computed at <body> with the :root palette
		   and inherited unchanged by descendants. */
		color: var(--color-primary-900);
	}

	.dashboard-content {
		flex: 1;
		margin-left: 260px;
		display: flex;
		flex-direction: column;
	}

	.dashboard-main {
		flex: 1;
		padding: var(--spacing-xl);
		background: var(--color-neutral-50);
	}

	@media (max-width: 768px) {
		.dashboard-content {
			margin-left: 0;
		}

		.dashboard-main {
			padding: var(--spacing-md);
		}
	}
</style>
