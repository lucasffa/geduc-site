<!-- src/lib/components/molecules/Pagination.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let page: number = 1;
	export let totalPages: number = 1;
	export let total: number = 0;

	const dispatch = createEventDispatcher();

	function goTo(p) {
		if (p >= 1 && p <= totalPages) {
			dispatch('page', { page: p });
		}
	}
</script>

{#if totalPages > 1}
	<div class="pagination">
		<span class="pagination-info">{total} resultados</span>
		<div class="pagination-controls">
			<button
				class="pagination-btn"
				on:click={() => goTo(page - 1)}
				disabled={page <= 1}
			>
				‹
			</button>
			{#each Array.from({ length: totalPages }, (_, i) => i + 1) as p}
				{#if p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)}
					<button
						class="pagination-btn"
						class:active={p === page}
						on:click={() => goTo(p)}
					>
						{p}
					</button>
				{:else if p === page - 2 || p === page + 2}
					<span class="pagination-dots">…</span>
				{/if}
			{/each}
			<button
				class="pagination-btn"
				on:click={() => goTo(page + 1)}
				disabled={page >= totalPages}
			>
				›
			</button>
		</div>
	</div>
{/if}

<style>
	.pagination {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--spacing-md);
		padding: var(--spacing-md) 0;
	}

	.pagination-info {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
	}

	.pagination-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-xxs);
	}

	.pagination-btn {
		min-width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		background: var(--color-neutral-0);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: var(--font-family-sans);
		padding: 0 var(--spacing-xs);
	}

	.pagination-btn:hover:not(:disabled) {
		border-color: var(--color-primary-500);
		color: var(--color-primary-500);
	}

	.pagination-btn.active {
		background: var(--color-primary-500);
		color: var(--color-neutral-0);
		border-color: var(--color-primary-500);
	}

	.pagination-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.pagination-dots {
		padding: 0 var(--spacing-xs);
		color: var(--color-neutral-400);
	}
</style>
