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
</script>

<div class="dashboard-layout" style="--brand-color: {primaryColor};">
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
