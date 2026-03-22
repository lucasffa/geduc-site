<!-- src/lib/components/molecules/BrandHeader.svelte -->
<script lang="ts">
	export let brandName: string = 'GEDUC';
	export let logoUrl: string | null = null;
	export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<div class="brand-header brand-{size}">
	{#if logoUrl}
		<img src={logoUrl} alt={brandName} class="brand-logo" />
	{/if}
	<h2 class="brand-name">{brandName}</h2>
</div>

<style>
	.brand-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.brand-logo {
		object-fit: contain;
	}

	.brand-sm .brand-logo {
		height: 24px;
	}

	.brand-md .brand-logo {
		height: 32px;
	}

	.brand-lg .brand-logo {
		height: 40px;
	}

	.brand-name {
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-0);
		margin: 0;
		line-height: 1;
	}

	.brand-sm .brand-name {
		font-size: var(--font-size-base);
	}

	.brand-md .brand-name {
		font-size: var(--font-size-lg);
	}

	.brand-lg .brand-name {
		font-size: var(--font-size-xl);
	}
</style>
