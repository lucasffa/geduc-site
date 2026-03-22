<!-- src/lib/components/organisms/dashboard/StatusBreakdown.svelte -->
<script lang="ts">
	export let title: string;
	export let items: Record<string, number>;
	export let labels: Record<string, string> = {};
</script>

<section class="breakdown-card">
	<h2 class="breakdown-title">{title}</h2>
	<div class="breakdown-grid">
		{#each Object.entries(items) as [key, count]}
			<div class="breakdown-item">
				<span class="breakdown-count">{count}</span>
				<span class="breakdown-name">{labels[key] || key}</span>
			</div>
		{/each}
	</div>
</section>

<style>
	.breakdown-card {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-neutral-200);
	}

	.breakdown-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
		margin: 0 0 var(--spacing-md);
	}

	.breakdown-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--spacing-sm);
	}

	.breakdown-item {
		padding: var(--spacing-sm);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
		text-align: center;
	}

	.breakdown-count {
		display: block;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
	}

	.breakdown-name {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-600);
	}
</style>
