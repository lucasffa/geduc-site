<script>
	import { createEventDispatcher } from 'svelte';

	export let views = [];
	export let activeViewId = '';

	const dispatch = createEventDispatcher();

	function selectView(id) {
		dispatch('select', { viewId: id });
	}

	let contextMenuViewId = null;
	let contextMenuPos = { x: 0, y: 0 };

	function handleContextMenu(e, viewId) {
		e.preventDefault();
		contextMenuViewId = viewId;
		contextMenuPos = { x: e.clientX, y: e.clientY };
	}

	function closeContextMenu() {
		contextMenuViewId = null;
	}

	function handleEdit() {
		dispatch('edit', { viewId: contextMenuViewId });
		closeContextMenu();
	}

	function handleDelete() {
		dispatch('delete', { viewId: contextMenuViewId });
		closeContextMenu();
	}
</script>

<svelte:window on:click={closeContextMenu} />

<div class="view-tabs">
	<button
		class="view-tab"
		class:active={!activeViewId}
		on:click={() => selectView('')}
	>
		Geral
	</button>

	{#each views as view}
		<button
			class="view-tab"
			class:active={activeViewId === view.id}
			on:click={() => selectView(view.id)}
			on:contextmenu={(e) => handleContextMenu(e, view.id)}
		>
			{view.name}
		</button>
	{/each}

	<button class="view-tab view-tab-add" on:click={() => dispatch('create')}>
		+
	</button>
</div>

{#if contextMenuViewId}
	<div class="context-menu" style="left: {contextMenuPos.x}px; top: {contextMenuPos.y}px">
		<button class="context-menu-item" on:click={handleEdit}>Editar</button>
		<button class="context-menu-item context-menu-item-danger" on:click={handleDelete}>Excluir</button>
	</div>
{/if}

<style>
	.view-tabs {
		display: flex;
		gap: var(--spacing-xxs);
		padding: 0 var(--spacing-md);
		padding-top: var(--spacing-md);
		overflow-x: auto;
	}

	.view-tab {
		padding: var(--spacing-xs) var(--spacing-md);
		border: 1px solid var(--color-neutral-200);
		border-bottom: none;
		border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
		background: var(--color-neutral-50);
		color: var(--color-neutral-600);
		font-size: var(--font-size-sm);
		cursor: pointer;
		white-space: nowrap;
		transition: background 0.15s, color 0.15s;
	}

	.view-tab:hover {
		background: var(--color-neutral-100);
	}

	.view-tab.active {
		background: var(--color-neutral-0);
		color: var(--color-primary-600);
		font-weight: var(--font-weight-medium);
		border-color: var(--color-neutral-200);
	}

	.view-tab-add {
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-500);
		min-width: 32px;
	}

	.context-menu {
		position: fixed;
		z-index: 1000;
		background: var(--color-neutral-0);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-md);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.context-menu-item {
		display: block;
		width: 100%;
		padding: var(--spacing-xs) var(--spacing-md);
		border: none;
		background: none;
		text-align: left;
		font-size: var(--font-size-sm);
		cursor: pointer;
		color: var(--color-neutral-700);
	}

	.context-menu-item:hover {
		background: var(--color-neutral-50);
	}

	.context-menu-item-danger {
		color: var(--color-red-600);
	}

	.context-menu-item-danger:hover {
		background: var(--color-red-50);
	}
</style>
