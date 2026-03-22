<!-- src/lib/components/templates/SysadminTemplate.svelte -->
<script lang="ts">
	import SysadminSidebar from '$lib/components/organisms/SysadminSidebar.svelte';
	import ToastContainer from '$lib/components/molecules/ToastContainer.svelte';

	export let userName = '';
	export let userRole = 'Sysadmin';
</script>

<div class="sysadmin-layout">
	<SysadminSidebar {userName} {userRole} />

	<div class="sysadmin-content">
		<main class="sysadmin-main">
			<slot />
		</main>
	</div>

	<ToastContainer />
</div>

<style>
	.sysadmin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sysadmin-content {
		flex: 1;
		margin-left: 260px;
		display: flex;
		flex-direction: column;
	}

	.sysadmin-main {
		flex: 1;
		padding: var(--spacing-xl);
		background: var(--color-neutral-50);
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.sysadmin-content {
			margin-left: 0;
		}

		.sysadmin-main {
			padding: var(--spacing-md);
		}
	}
</style>
