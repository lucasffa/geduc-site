<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import PermissionGate from '$lib/components/molecules/PermissionGate.svelte';
	import FilterBar from '$lib/components/molecules/FilterBar.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import ParticipantFormModal from '$lib/components/organisms/dashboard/ParticipantFormModal.svelte';
	import StatusHistoryModal from '$lib/components/organisms/dashboard/StatusHistoryModal.svelte';
	import ImportSpreadsheetModal from '$lib/components/organisms/dashboard/ImportSpreadsheetModal.svelte';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { STATUS_LABELS, VALID_TRANSITIONS, PARTICIPANT_STATUSES, ROLE_CATEGORY_LABELS } from '$lib/constants/participant-status';
	import { addToast } from '$lib/stores/dashboard';

	export let data;

	$: participants = data.participants;
	$: pagination = data.pagination;
	$: permissions = data.permissions;
	$: enforceTransitions = data.enforceStatusTransitions ?? true;
	$: customRoles = data.customRoles || { voluntario: [], mentorado: [] };
	$: allRoles = [...customRoles.voluntario, ...customRoles.mentorado];

	function getAvailableStatuses(status) {
		if (enforceTransitions) {
			return VALID_TRANSITIONS[status] || [];
		}
		return PARTICIPANT_STATUSES.filter(s => s !== status);
	}

	let search = $pageStore.url.searchParams.get('search') || '';
	let filterValues = {
		status: $pageStore.url.searchParams.get('status') || '',
		role: $pageStore.url.searchParams.get('role') || ''
	};

	// Modals
	let showCreateModal = false;
	let showEditModal = false;
	let showHistoryModal = false;
	let showImportModal = false;
	let editParticipant = null;
	let statusHistoryEntries = [];

	// Form
	let saving = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'email', label: 'E-mail' },
		{ key: 'role', label: 'Cargo', width: '120px' },
		{ key: 'status', label: 'Status', width: '150px' },
		{ key: 'createdAt', label: 'Criado em', width: '120px' }
	];

	const statusFilters = PARTICIPANT_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] || s }));
	$: roleFilters = allRoles.map(r => ({ value: r, label: r }));

	function updateUrl(params) {
		const url = new URL($pageStore.url);
		for (const [k, v] of Object.entries(params)) {
			if (v) url.searchParams.set(k, v);
			else url.searchParams.delete(k);
		}
		goto(url.toString(), { replaceState: true, invalidateAll: true });
	}

	function handleSearch(e) {
		search = e.detail.value;
		updateUrl({ search, page: '1' });
	}

	function handleFilter(e) {
		filterValues = e.detail.values;
		updateUrl({ ...filterValues, page: '1' });
	}

	function handlePage(e) {
		updateUrl({ page: String(e.detail.page) });
	}

	// CRUD operations via fetch
	async function handleCreateSave(e) {
		const newParticipant = e.detail;
		saving = true;
		try {
			const res = await fetch('/dashboard/api/participants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newParticipant)
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Participante criado com sucesso', 'success');
			showCreateModal = false;
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function handleEditSave(e) {
		const updatedData = e.detail;
		saving = true;
		try {
			const res = await fetch(`/dashboard/api/participants/${updatedData.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: updatedData.name,
					email: updatedData.email,
					role: updatedData.role,
					notes: updatedData.notes,
					workloadHours: updatedData.workloadHours
				})
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Participante atualizado', 'success');
			showEditModal = false;
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function changeStatus(participantId, newStatus) {
		try {
			const res = await fetch(`/dashboard/api/participants/${participantId}/status`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newStatus })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Status atualizado', 'success');
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function deleteParticipant(id) {
		if (!confirm('Deseja realmente excluir este participante?')) return;
		try {
			const res = await fetch(`/dashboard/api/participants/${id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Participante removido', 'success');
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function loadHistory(participantId) {
		try {
			const res = await fetch(`/dashboard/api/participants/${participantId}/history`);
			statusHistoryEntries = await res.json();
			showHistoryModal = true;
		} catch {
			addToast('Erro ao carregar historico', 'error');
		}
	}

	function openEdit(row) {
		editParticipant = { ...row };
		showEditModal = true;
	}
</script>

<svelte:head>
	<title>Participantes — {data.brandName}</title>
</svelte:head>

<div class="participants-page">
	<PageHeader title="Participantes">
		<PermissionGate allowed={permissions.canManageParticipants}>
			<div class="header-actions">
				<Button variant="ghost" size="sm" on:click={() => showImportModal = true}>
					Importar Planilha
				</Button>
				<Button variant="primary" size="sm" on:click={() => showCreateModal = true}>
					+ Novo Participante
				</Button>
			</div>
		</PermissionGate>
	</PageHeader>

	<DataTable
		{columns}
		data={participants}
		{search}
		page={pagination.page}
		totalPages={pagination.totalPages}
		total={pagination.total}
		on:search={handleSearch}
		on:page={handlePage}
	>
		<svelte:fragment slot="toolbar">
			<FilterBar
				filters={[
					{ name: 'status', label: 'status', options: statusFilters },
					{ name: 'role', label: 'cargo', options: roleFilters }
				]}
				values={filterValues}
				on:filter={handleFilter}
			/>
		</svelte:fragment>

		<svelte:fragment slot="cell" let:row let:column let:value>
			{#if column === 'status'}
				<Badge text={STATUS_LABELS[value] || value} variant="status" />
			{:else if column === 'role'}
				<Badge text={value || '—'} variant="role" />
			{:else if column === 'createdAt'}
				{value ? new Date(value).toLocaleDateString('pt-BR') : '\u2014'}
			{:else}
				{value ?? '\u2014'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<PermissionGate allowed={permissions.canManageParticipants}>
				<div class="action-buttons">
					<button class="action-btn" on:click={() => openEdit(row)} title="Editar">
						✏️
					</button>
					<button class="action-btn" on:click={() => loadHistory(row.id)} title="Historico">
						📋
					</button>
					{#if getAvailableStatuses(row.status).length > 0}
						<select
							class="status-select"
							on:change={(e) => { changeStatus(row.id, e.target.value); e.target.value = ''; }}
						>
							<option value="">Status →</option>
							{#each getAvailableStatuses(row.status) as t}
								<option value={t}>{STATUS_LABELS[t] || t}</option>
							{/each}
						</select>
					{/if}
					<PermissionGate allowed={permissions.canDeleteParticipants}>
						<button class="action-btn action-btn-danger" on:click={() => deleteParticipant(row.id)} title="Excluir">
							🗑️
						</button>
					</PermissionGate>
				</div>
			</PermissionGate>
		</svelte:fragment>
	</DataTable>
</div>

<!-- Create Modal -->
<ParticipantFormModal
	isOpen={showCreateModal}
	mode="create"
	{saving}
	{customRoles}
	on:close={() => showCreateModal = false}
	on:save={handleCreateSave}
/>

<!-- Edit Modal -->
<ParticipantFormModal
	isOpen={showEditModal}
	mode="edit"
	participant={editParticipant}
	{saving}
	{customRoles}
	on:close={() => showEditModal = false}
	on:save={handleEditSave}
/>

<!-- History Modal -->
<StatusHistoryModal
	isOpen={showHistoryModal}
	entries={statusHistoryEntries}
	on:close={() => showHistoryModal = false}
/>

<!-- Import Modal -->
<ImportSpreadsheetModal
	isOpen={showImportModal}
	on:close={() => showImportModal = false}
	on:imported={() => goto($pageStore.url.toString(), { invalidateAll: true })}
/>

<style>
	.participants-page {
		max-width: 1200px;
	}

	.header-actions {
		display: flex;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.action-buttons {
		display: flex;
		gap: var(--spacing-xxs);
		align-items: center;
	}

	.action-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 2px 4px;
		font-size: var(--font-size-sm);
		border-radius: var(--border-radius-sm);
	}

	.action-btn:hover {
		background: var(--color-neutral-100);
	}

	.action-btn-danger:hover {
		background: var(--color-red-100);
	}

	.status-select {
		font-size: var(--font-size-xs);
		padding: 2px 4px;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-sm);
		background: var(--color-neutral-0);
		cursor: pointer;
	}
</style>
