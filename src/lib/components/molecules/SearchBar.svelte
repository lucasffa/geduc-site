<!-- src/lib/components/molecules/SearchBar.svelte -->
<script lang="ts">
	export let value: string = '';
	export let placeholder: string = 'Buscar...';
	export let debounceMs: number = 300;

	/** @type {ReturnType<typeof setTimeout> | null} */
	let timer = null;

	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	function handleInput() {
		if (timer) clearTimeout(timer);
		timer = setTimeout(() => {
			dispatch('search', { value });
		}, debounceMs);
	}
</script>

<div class="search-bar">
	<svg class="search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
		<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
	</svg>
	<input
		type="search"
		bind:value
		{placeholder}
		on:input={handleInput}
		class="search-input"
	/>
</div>

<style>
	.search-bar {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-icon {
		position: absolute;
		left: var(--spacing-sm);
		color: var(--color-neutral-400);
		pointer-events: none;
	}

	.search-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md) var(--spacing-sm) var(--spacing-2xl);
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-family: var(--font-family-sans);
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}
</style>
