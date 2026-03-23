<!-- src/lib/components/molecules/QuickLinkCard.svelte -->
<script lang="ts">
	export let href: string;
	export let title: string;
	export let description: string = '';
</script>

<a {href} class="quick-link-card">
	<strong class="quick-link-title">{title}</strong>
	{#if description}
		<span class="quick-link-desc">{description}</span>
	{/if}
</a>

<style>
	.quick-link-card {
		display: block;
		background: var(--color-neutral-0);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		color: inherit;
		transition: box-shadow var(--transition-fast);
		border-left: 3px solid var(--color-primary-500);
	}

	.quick-link-card:hover {
		box-shadow: var(--shadow-md);
	}

	.quick-link-title {
		display: block;
		color: var(--color-primary-800);
		margin-bottom: var(--spacing-xxs);
	}

	.quick-link-desc {
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
	}
</style>
