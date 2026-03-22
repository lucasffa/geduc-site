<!-- src/lib/components/organisms/DataTable.svelte -->
<script lang="ts">
	import SearchBar from '$lib/components/molecules/SearchBar.svelte';
	import Pagination from '$lib/components/molecules/Pagination.svelte';
	import Spinner from '$lib/components/atoms/Spinner.svelte';
	import { createEventDispatcher } from 'svelte';

	/**
	 * @typedef {{ key: string; label: string; width?: string }} Column
	 */

	/** @type {Column[]} */
	export let columns = [];
	/** @type {any[]} */
	export let data = [];
	export let loading = false;
	export let searchable = true;
	export let search = '';
	export let page = 1;
	export let totalPages = 1;
	export let total = 0;
	export let emptyMessage = 'Nenhum registro encontrado.';
	export let selectable = false;
	/** @type {Set<string>} */
	export let selectedIds = new Set();

	const dispatch = createEventDispatcher();

	$: allPageIds = data.map((r) => r.id).filter(Boolean);
	$: allSelected = selectable && allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
	$: someSelected = selectable && allPageIds.some((id) => selectedIds.has(id)) && !allSelected;

	function toggleAll() {
		if (allSelected) {
			const next = new Set(selectedIds);
			for (const id of allPageIds) next.delete(id);
			selectedIds = next;
		} else {
			const next = new Set(selectedIds);
			for (const id of allPageIds) next.add(id);
			selectedIds = next;
		}
		dispatch('selectionChange', { ids: selectedIds });
	}

	function toggleRow(id) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
		dispatch('selectionChange', { ids: selectedIds });
	}
</script>

<div class="data-table-wrapper">
	{#if searchable || $$slots.toolbar}
		<div class="data-table-toolbar">
			{#if searchable}
				<SearchBar
					bind:value={search}
					on:search={(e) => dispatch('search', e.detail)}
				/>
			{/if}
			<slot name="toolbar" />
		</div>
	{/if}

	{#if loading}
		<div class="data-table-loading">
			<Spinner size="lg" />
		</div>
	{:else if data.length === 0}
		<div class="data-table-empty">
			<p>{emptyMessage}</p>
		</div>
	{:else}
		<div class="data-table-scroll">
			<table class="data-table">
				<thead>
					<tr>
						{#if selectable}
							<th style="width: 40px">
								<input
									type="checkbox"
									checked={allSelected}
									indeterminate={someSelected}
									on:change={toggleAll}
									class="select-checkbox"
								/>
							</th>
						{/if}
						{#each columns as col}
							<th style={col.width ? `width: ${col.width}` : ''}>{col.label}</th>
						{/each}
						{#if $$slots.actions}
							<th style="width: 120px">Ações</th>
						{/if}
					</tr>
				</thead>
				<tbody>
					{#each data as row, i}
						<tr class:selected-row={selectable && selectedIds.has(row.id)}>
							{#if selectable}
								<td>
									<input
										type="checkbox"
										checked={selectedIds.has(row.id)}
										on:change={() => toggleRow(row.id)}
										class="select-checkbox"
									/>
								</td>
							{/if}
							{#each columns as col}
								<td>
									<slot name="cell" {row} column={col.key} value={row[col.key]}>
										{row[col.key] ?? '—'}
									</slot>
								</td>
							{/each}
							{#if $$slots.actions}
								<td class="data-table-actions">
									<slot name="actions" {row} index={i} />
								</td>
							{/if}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<Pagination
		{page}
		{totalPages}
		{total}
		on:page={(e) => dispatch('page', e.detail)}
	/>
</div>

<style>
	.data-table-wrapper {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--color-neutral-200);
		overflow: hidden;
	}

	.data-table-toolbar {
		display: flex;
		gap: var(--spacing-sm);
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-neutral-200);
		flex-wrap: wrap;
		align-items: center;
	}

	.data-table-scroll {
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		text-align: left;
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-500);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		background: var(--color-neutral-50);
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.data-table td {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-700);
		border-bottom: 1px solid var(--color-neutral-100);
	}

	.data-table tbody tr:hover {
		background: var(--color-neutral-50);
	}

	.data-table-actions {
		white-space: nowrap;
	}

	.data-table-loading,
	.data-table-empty {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-2xl);
		color: var(--color-neutral-400);
	}

	.data-table-empty p {
		margin: 0;
		font-size: var(--font-size-sm);
	}

	.select-checkbox {
		cursor: pointer;
		width: 16px;
		height: 16px;
	}

	.selected-row {
		background: var(--color-primary-50, #f0f4ff);
	}

	:global(.data-table-wrapper .pagination) {
		padding: var(--spacing-sm) var(--spacing-md);
		border-top: 1px solid var(--color-neutral-200);
	}
</style>
