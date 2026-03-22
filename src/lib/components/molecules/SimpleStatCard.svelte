<!-- src/lib/components/molecules/SimpleStatCard.svelte -->
<script lang="ts">
	export let value: string | number;
	export let label: string;
	export let variant: 'default' | 'info' | 'success' | 'warning' | 'error' = 'default';
</script>

<div class="simple-stat-card simple-stat-card--{variant}">
	<span class="simple-stat-value">{value}</span>
	<span class="simple-stat-label">{label}</span>
</div>

<style>
	.simple-stat-card {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-neutral-200);
		border-top: 3px solid var(--color-primary-500);
	}

	.simple-stat-card--info { border-top-color: var(--color-blue-500); }
	.simple-stat-card--success { border-top-color: var(--color-green-500); }
	.simple-stat-card--warning { border-top-color: var(--color-yellow-500); }
	.simple-stat-card--error { border-top-color: var(--color-error); }

	.simple-stat-value {
		display: block;
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
	}

	.simple-stat-label {
		display: block;
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
		margin-top: var(--spacing-xxs);
	}
</style>
