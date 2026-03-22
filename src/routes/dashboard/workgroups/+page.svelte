<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import WorkgroupFormModal from '$lib/components/organisms/dashboard/WorkgroupFormModal.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { invalidateAll } from '$app/navigation';

	export let data;

	$: groups = data.workgroups;

	let showCreateModal = false;
	let showEditModal = false;
	let editWorkgroup = null;
	let saving = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'description', label: 'Descrição' },
		{ key: 'isActive', label: 'Status', width: '100px' },
		{ key: 'createdAt', label: 'Criado em', width: '120px' }
	];

	async function handleCreate(event) {
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
			invalidateAll();
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	function openEdit(row) {
		editWorkgroup = row;
		showEditModal = true;
	}

	async function handleEdit(event) {
		if (!editWorkgroup) return;
		const { name, description } = event.detail;
		saving = true;
		try {
			const res = await fetch(`/dashboard/api/workgroups/${editWorkgroup.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ name, description })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Grupo atualizado', 'success');
			showEditModal = false;
			invalidateAll();
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function toggleActive(row) {
		try {
			const res = await fetch(`/dashboard/api/workgroups/${row.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !row.isActive })
			});
			if (!res.ok) throw new Error('Erro');
			addToast(`Grupo ${row.isActive ? 'desativado' : 'ativado'}`, 'success');
			invalidateAll();
		} catch {
			addToast('Erro ao alterar status', 'error');
		}
	}

	async function deleteWorkgroup(row) {
		if (!confirm(`Excluir "${row.name}"? Esta ação é um soft delete.`)) return;
		try {
			const res = await fetch(`/dashboard/api/workgroups/${row.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error('Erro');
			addToast('Grupo removido', 'success');
			invalidateAll();
		} catch {
			addToast('Erro ao excluir', 'error');
		}
	}
</script>

<svelte:head>
	<title>Grupos de Trabalho — {data.brandName}</title>
</svelte:head>

<div class="workgroups-page">
	<PageHeader title="Grupos de Trabalho">
		<Button variant="primary" size="sm" on:click={() => showCreateModal = true}>
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
			<div class="actions-group">
				<button class="action-btn" on:click={() => openEdit(row)}>
					Editar
				</button>
				<button class="action-btn" on:click={() => toggleActive(row)}>
					{row.isActive ? 'Desativar' : 'Ativar'}
				</button>
				<button class="action-btn action-btn-danger" on:click={() => deleteWorkgroup(row)}>
					Excluir
				</button>
			</div>
		</svelte:fragment>
	</DataTable>
</div>

<WorkgroupFormModal
	isOpen={showCreateModal}
	mode="create"
	{saving}
	on:close={() => showCreateModal = false}
	on:save={handleCreate}
/>

<WorkgroupFormModal
	isOpen={showEditModal}
	mode="edit"
	workgroup={editWorkgroup}
	{saving}
	on:close={() => { showEditModal = false; editWorkgroup = null; }}
	on:save={handleEdit}
/>

<style>
	.workgroups-page {
		max-width: 1200px;
	}

	.actions-group {
		display: flex;
		gap: var(--spacing-sm);
	}

	.action-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 4px;
		font-size: var(--font-size-sm);
		color: var(--color-primary-500);
	}

	.action-btn:hover {
		text-decoration: underline;
	}

	.action-btn-danger {
		color: var(--color-error);
	}
</style>
