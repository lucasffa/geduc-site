<script>
	import { createEventDispatcher } from 'svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let count = 0;

	const dispatch = createEventDispatcher();
</script>

{#if count > 0}
	<div class="bulk-bar">
		<span class="bulk-count">{count} selecionado{count > 1 ? 's' : ''}</span>

		<div class="bulk-actions">
			<Button variant="ghost" size="sm" on:click={() => dispatch('deactivate')}>
				Desativar
			</Button>
			<Button variant="ghost" size="sm" on:click={() => dispatch('changeStatus')}>
				Mudar Status
			</Button>
			<Button variant="ghost" size="sm" on:click={() => dispatch('changeRole')}>
				Mudar Cargo
			</Button>
			<Button variant="ghost" size="sm" on:click={() => dispatch('export', { format: 'csv' })}>
				CSV
			</Button>
			<Button variant="ghost" size="sm" on:click={() => dispatch('export', { format: 'xlsx' })}>
				XLSX
			</Button>
		</div>

		<button class="bulk-clear" on:click={() => dispatch('clear')}>
			Limpar
		</button>
	</div>
{/if}

<style>
	.bulk-bar {
		position: sticky;
		bottom: var(--spacing-md);
		margin: var(--spacing-md);
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-primary-600);
		color: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
		z-index: 50;
	}

	.bulk-count {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		white-space: nowrap;
	}

	.bulk-actions {
		display: flex;
		gap: var(--spacing-xxs);
		flex-wrap: wrap;
	}

	.bulk-actions :global(.btn) {
		color: var(--color-neutral-0);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.bulk-actions :global(.btn:hover) {
		background: rgba(255, 255, 255, 0.15);
	}

	.bulk-clear {
		margin-left: auto;
		background: none;
		border: none;
		color: rgba(255, 255, 255, 0.7);
		font-size: var(--font-size-xs);
		cursor: pointer;
		text-decoration: underline;
	}

	.bulk-clear:hover {
		color: var(--color-neutral-0);
	}
</style>
