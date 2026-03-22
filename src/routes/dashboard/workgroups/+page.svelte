<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import WorkgroupFormModal from '$lib/components/organisms/dashboard/WorkgroupFormModal.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';

	export let data;

	$: groups = data.workgroups;

	let showCreateModal = false;
	let saving = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'description', label: 'Descricao' },
		{ key: 'isActive', label: 'Ativo', width: '80px' },
		{ key: 'createdAt', label: 'Criado em', width: '120px' }
	];

	async function handleCreateWorkgroup(event) {
		const { name, description } = event.detail;
		saving = true;
		try {
			const res = await fetch('/dashboard/api/workgroups', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, description })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Grupo criado com sucesso', 'success');
			showCreateModal = false;
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
	<PageHeader title="Grupos de Trabalho">
		<Button variant="primary" size="sm" onclick={() => showCreateModal = true}>
			+ Novo Grupo
		</Button>
	</PageHeader>

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
			<button class="action-btn action-btn-danger" on:click={() => deleteWorkgroup(row.id)}>
				Excluir
			</button>
		</svelte:fragment>
	</DataTable>
</div>

<WorkgroupFormModal
	isOpen={showCreateModal}
	{saving}
	on:close={() => showCreateModal = false}
	on:save={handleCreateWorkgroup}
/>

<style>
	.workgroups-page {
		max-width: 1200px;
	}

	.action-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 4px;
		font-size: var(--font-size-sm);
	}

	.action-btn-danger {
		color: var(--color-error);
	}

	.action-btn-danger:hover {
		text-decoration: underline;
	}
</style>
