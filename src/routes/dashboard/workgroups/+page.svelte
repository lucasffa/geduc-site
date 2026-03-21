<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';

	export let data;

	$: groups = data.workgroups;

	let showCreateModal = false;
	let newGroup = { name: '', description: '' };
	let saving = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'description', label: 'Descrição' },
		{ key: 'isActive', label: 'Ativo', width: '80px' },
		{ key: 'createdAt', label: 'Criado em', width: '120px' }
	];

	async function createWorkgroup() {
		saving = true;
		try {
			const res = await fetch('/dashboard/api/workgroups', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newGroup)
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Grupo criado com sucesso', 'success');
			showCreateModal = false;
			newGroup = { name: '', description: '' };
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function deleteWorkgroup(id) {
		if (!confirm('Excluir grupo de trabalho?')) return;
		try {
			const res = await fetch(`/dashboard/api/workgroups/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Erro');
			addToast('Grupo removido', 'success');
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Grupos de Trabalho — {data.brandName}</title>
</svelte:head>

<div class="workgroups-page">
	<div class="page-header">
		<h1 class="page-title">Grupos de Trabalho</h1>
		<Button variant="primary" size="sm" onclick={() => showCreateModal = true}>
			+ Novo Grupo
		</Button>
	</div>

	<DataTable
		{columns}
		data={groups}
		searchable={false}
	>
		<svelte:fragment slot="cell" let:column let:value>
			{#if column === 'isActive'}
				<Badge text={value ? 'Ativo' : 'Inativo'} variant={value ? 'success' : 'error'} />
			{:else if column === 'createdAt'}
				{value ? new Date(value).toLocaleDateString('pt-BR') : '—'}
			{:else}
				{value ?? '—'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<button class="action-btn action-btn-danger" on:click={() => deleteWorkgroup(row.id)}>🗑️</button>
		</svelte:fragment>
	</DataTable>
</div>

{#if showCreateModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => showCreateModal = false} on:keydown={() => showCreateModal = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Novo Grupo de Trabalho</h2>
			<form on:submit|preventDefault={createWorkgroup}>
				<div class="form-group">
					<label for="grp-name">Nome</label>
					<input id="grp-name" bind:value={newGroup.name} required />
				</div>
				<div class="form-group">
					<label for="grp-desc">Descrição</label>
					<textarea id="grp-desc" bind:value={newGroup.description} rows="3"></textarea>
				</div>
				<div class="modal-actions">
					<Button variant="ghost" onclick={() => showCreateModal = false}>Cancelar</Button>
					<Button type="submit" variant="primary" loading={saving}>Criar</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.workgroups-page { max-width: 1200px; }
	.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); }
	.page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-neutral-900); margin: 0; }
	.action-btn { background: none; border: none; cursor: pointer; padding: 2px 4px; font-size: var(--font-size-sm); }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal-content { background: var(--color-neutral-0); border-radius: var(--border-radius-xl); padding: var(--spacing-xl); max-width: 500px; width: 90%; box-shadow: var(--shadow-xl); }
	.modal-content h2 { margin: 0 0 var(--spacing-lg); font-size: var(--font-size-lg); }
	.modal-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-lg); }
	.form-group { margin-bottom: var(--spacing-md); }
	.form-group label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xs); }
	.form-group input, .form-group textarea { width: 100%; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--color-neutral-300); border-radius: var(--border-radius-md); font-family: var(--font-family-sans); box-sizing: border-box; }
</style>
