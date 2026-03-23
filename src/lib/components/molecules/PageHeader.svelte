<!-- src/lib/components/molecules/PageHeader.svelte -->
<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
</script>

<div class="page-header">
	<div class="page-header-text">
		<h1 class="page-header-title">{title}</h1>
		{#if subtitle}
			<p class="page-header-subtitle">{subtitle}</p>
		{/if}
	</div>
	<div class="page-header-actions">
		<slot />
	</div>
</div>

<style>
	.page-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: var(--spacing-xl);
		gap: var(--spacing-md);
	}

	.page-header-title {
		font-size: var(--font-size-2xl);
		color: var(--color-primary-900);
		margin: 0;
		font-weight: var(--font-weight-bold);
	}

	.page-header-subtitle {
		color: var(--text-color-subtle);
		font-size: var(--font-size-sm);
		margin-top: var(--spacing-xxs);
	}

	.page-header-actions {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex-shrink: 0;
	}
</style>
