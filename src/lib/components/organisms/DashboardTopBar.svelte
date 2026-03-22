<!-- src/lib/components/organisms/DashboardTopBar.svelte -->
<script lang="ts">
	import { toggleSidebar } from '$lib/stores/dashboard';

	export let userName = '';
	export let brandName = 'GEDUC';
</script>

<header class="topbar">
	<button class="topbar-menu" on:click={toggleSidebar} aria-label="Menu">
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
			<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
		</svg>
	</button>

	<span class="topbar-brand">{brandName}</span>

	<div class="topbar-right">
		<span class="topbar-user">{userName}</span>
		<form method="POST" action="/auth/logout">
			<button type="submit" class="topbar-logout">Sair</button>
		</form>
	</div>
</header>

<style>
	.topbar {
		display: none;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-neutral-0);
		border-bottom: 1px solid var(--color-neutral-200);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.topbar-menu {
		background: none;
		border: none;
		cursor: pointer;
		padding: var(--spacing-xs);
		color: var(--color-neutral-700);
	}

	.topbar-brand {
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
		font-size: var(--font-size-base);
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.topbar-user {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-600);
	}

	.topbar-logout {
		background: none;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		padding: var(--spacing-xxs) var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-neutral-600);
		cursor: pointer;
		font-family: var(--font-family-sans);
	}

	.topbar-logout:hover {
		border-color: var(--color-error);
		color: var(--color-error);
	}

	@media (max-width: 768px) {
		.topbar {
			display: flex;
		}
	}
</style>
