<!-- src/lib/components/organisms/sysadmin/UserFilters.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';

	export let search = '';
	export let roles = [];
	export let roleLabels = {};
	export let organizations = [];
	export let filterRole = '';
	export let filterOrg = '';

	const dispatch = createEventDispatcher();

	function handleSearch(e) {
		dispatch('search', e.target.value);
	}

	function handleFilterRole(e) {
		dispatch('filterRole', e.target.value);
	}

	function handleFilterOrg(e) {
		dispatch('filterOrg', e.target.value);
	}
</script>

<div class="filters">
	<input
		class="form-control filter-search"
		placeholder="Buscar por nome ou e-mail..."
		value={search}
		on:input={handleSearch}
	/>
	<select class="form-control filter-select" value={filterRole} on:change={handleFilterRole}>
		<option value="">Todos os cargos</option>
		{#each roles as role}
			<option value={role}>{roleLabels[role]}</option>
		{/each}
	</select>
	<select class="form-control filter-select" value={filterOrg} on:change={handleFilterOrg}>
		<option value="">Todas as orgs</option>
		{#each organizations as org}
			<option value={org.id}>{org.name}</option>
		{/each}
	</select>
</div>

<style>
	.filters {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-lg);
		flex-wrap: wrap;
	}

	.filter-search {
		flex: 1;
		min-width: 200px;
	}

	.filter-select {
		min-width: 160px;
	}

	.form-control {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
	}
</style>
