<!-- src/lib/components/molecules/FilterBar.svelte -->
<script lang="ts">
	import Select from '$lib/components/atoms/Select.svelte';
	import { createEventDispatcher } from 'svelte';

	export let filters: { name: string; label: string; options: { value: string; label: string }[] }[] = [];
	export let values: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	function handleChange() {
		dispatch('filter', { values });
	}
</script>

<div class="filter-bar">
	{#each filters as filter}
		<div class="filter-item">
			<Select
				bind:value={values[filter.name]}
				options={[{ value: '', label: `Todos ${filter.label}` }, ...filter.options]}
				placeholder=""
				on:change={handleChange}
			/>
		</div>
	{/each}
	<slot />
</div>

<style>
	.filter-bar {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
		align-items: center;
	}

	.filter-item {
		min-width: 160px;
	}
</style>
