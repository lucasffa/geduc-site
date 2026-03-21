<!-- src/lib/components/atoms/Badge.svelte -->
<script lang="ts">
	export let text: string = '';
	export let variant: 'role' | 'status' | 'info' | 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
	export let size: 'sm' | 'md' = 'sm';
</script>

<span class="badge badge-{variant} badge-{size}">{text}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		font-weight: var(--font-weight-medium);
		border-radius: var(--border-radius-full);
		white-space: nowrap;
		line-height: 1;
	}

	.badge-sm {
		padding: 2px var(--spacing-sm);
		font-size: var(--font-size-xs);
	}

	.badge-md {
		padding: var(--spacing-xs) var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.badge-neutral {
		background: var(--color-neutral-100);
		color: var(--color-neutral-700);
	}

	.badge-info {
		background: var(--color-blue-100);
		color: var(--color-blue-700);
	}

	.badge-success {
		background: var(--color-green-100);
		color: var(--color-green-700);
	}

	.badge-warning {
		background: var(--color-yellow-100);
		color: var(--color-yellow-800);
	}

	.badge-error {
		background: var(--color-red-100);
		color: var(--color-red-700);
	}

	.badge-role {
		background: var(--color-primary-100);
		color: var(--color-primary-700);
	}

	.badge-status {
		background: var(--color-secondary-100);
		color: var(--color-secondary-800);
	}
</style>
