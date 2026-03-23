<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import PermissionGate from '$lib/components/molecules/PermissionGate.svelte';
	import FilterBar from '$lib/components/molecules/FilterBar.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import ViewTabs from '$lib/components/molecules/ViewTabs.svelte';
	import BulkActionBar from '$lib/components/molecules/BulkActionBar.svelte';
	import ParticipantFormModal from '$lib/components/organisms/dashboard/ParticipantFormModal.svelte';
	import StatusHistoryModal from '$lib/components/organisms/dashboard/StatusHistoryModal.svelte';
	import ImportSpreadsheetModal from '$lib/components/organisms/dashboard/ImportSpreadsheetModal.svelte';
	import ViewFormModal from '$lib/components/organisms/dashboard/ViewFormModal.svelte';
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
	$: views = data.views || [];

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
	let activeViewId = $pageStore.url.searchParams.get('view') || '';

	// Selection
	let selectedIds = new Set();

	// Modals
	let showCreateModal = false;
	let showEditModal = false;
	let showHistoryModal = false;
	let showImportModal = false;
	let showViewModal = false;
	let viewModalMode = 'create';
	let editingView = null;
	let editParticipant = null;
	let statusHistoryEntries = [];

	// Bulk action modals
	let showBulkStatusSelect = false;
	let showBulkRoleSelect = false;

	// Form
	let saving = false;
	let viewSaving = false;

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

	function reload() {
		goto($pageStore.url.toString(), { invalidateAll: true });
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

	function handleViewSelect(e) {
		activeViewId = e.detail.viewId;
		selectedIds = new Set();
		updateUrl({ view: activeViewId, page: '1' });
	}

	// ---- View CRUD ----
	function openCreateView() {
		viewModalMode = 'create';
		editingView = null;
		showViewModal = true;
	}

	function openEditView(e) {
		const view = views.find((v) => v.id === e.detail.viewId);
		if (!view) return;
		viewModalMode = 'edit';
		editingView = view;
		showViewModal = true;
	}

	async function handleViewSave(e) {
		const { name, filters } = e.detail;
		viewSaving = true;
		try {
			if (viewModalMode === 'create') {
				const res = await fetch('/dashboard/api/participants/views', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, filters, position: views.length })
				});
				if (!res.ok) throw new Error((await res.json()).error || 'Erro');
				addToast('View criada', 'success');
			} else {
				const res = await fetch(`/dashboard/api/participants/views/${editingView.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ name, filters })
				});
				if (!res.ok) throw new Error((await res.json()).error || 'Erro');
				addToast('View atualizada', 'success');
			}
			showViewModal = false;
			reload();
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			viewSaving = false;
		}
	}

	async function handleViewDelete(e) {
		const view = views.find((v) => v.id === e.detail.viewId);
		if (!view || !confirm(`Excluir view "${view.name}"?`)) return;
		try {
			const res = await fetch(`/dashboard/api/participants/views/${view.id}`, { method: 'DELETE' });
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('View removida', 'success');
			if (activeViewId === view.id) {
				activeViewId = '';
				updateUrl({ view: '', page: '1' });
			} else {
				reload();
			}
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	// ---- Bulk Actions ----
	function handleSelectionChange(e) {
		selectedIds = e.detail.ids;
	}

	async function bulkDeactivate() {
		if (!confirm(`Desativar ${selectedIds.size} participante(s)?`)) return;
		try {
			const res = await fetch('/dashboard/api/participants/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [...selectedIds], action: 'deactivate' })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			const result = await res.json();
			addToast(`${result.affected} participante(s) desativado(s)`, 'success');
			selectedIds = new Set();
			reload();
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function bulkChangeStatus(newStatus) {
		showBulkStatusSelect = false;
		try {
			const res = await fetch('/dashboard/api/participants/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [...selectedIds], action: 'change_status', newStatus })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			const result = await res.json();
			addToast(`${result.affected} participante(s) atualizados`, 'success');
			selectedIds = new Set();
			reload();
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function bulkChangeRole(newRole) {
		showBulkRoleSelect = false;
		try {
			const res = await fetch('/dashboard/api/participants/bulk', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [...selectedIds], action: 'change_role', newRole })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			const result = await res.json();
			addToast(`${result.affected} participante(s) atualizados`, 'success');
			selectedIds = new Set();
			reload();
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function bulkExport(e) {
		const format = e.detail.format;
		try {
			const res = await fetch('/dashboard/api/participants/export', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: [...selectedIds], format })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');

			const blob = await res.blob();
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `participantes.${format}`;
			a.click();
			URL.revokeObjectURL(url);
			addToast(`Exportados ${selectedIds.size} participante(s)`, 'success');
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	// ---- Participant CRUD (existing) ----
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
			reload();
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
			reload();
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
			reload();
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
			reload();
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

	<PermissionGate allowed={permissions.canManageParticipants}>
		<ViewTabs
			{views}
			{activeViewId}
			on:select={handleViewSelect}
			on:create={openCreateView}
			on:edit={openEditView}
			on:delete={handleViewDelete}
		/>
	</PermissionGate>

	<DataTable
		{columns}
		data={participants}
		{search}
		page={pagination.page}
		totalPages={pagination.totalPages}
		total={pagination.total}
		selectable={permissions.canManageParticipants}
		bind:selectedIds
		on:search={handleSearch}
		on:page={handlePage}
		on:selectionChange={handleSelectionChange}
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

	<PermissionGate allowed={permissions.canManageParticipants}>
		<BulkActionBar
			count={selectedIds.size}
			on:deactivate={bulkDeactivate}
			on:changeStatus={() => showBulkStatusSelect = true}
			on:changeRole={() => showBulkRoleSelect = true}
			on:export={bulkExport}
			on:clear={() => selectedIds = new Set()}
		/>
	</PermissionGate>
</div>

<!-- Bulk Status Select Modal -->
{#if showBulkStatusSelect}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="bulk-overlay" on:click={() => showBulkStatusSelect = false} on:keydown={(e) => e.key === 'Escape' && (showBulkStatusSelect = false)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bulk-select-panel" on:click|stopPropagation on:keydown|stopPropagation>
			<h3>Mudar status para:</h3>
			<div class="bulk-select-options">
				{#each PARTICIPANT_STATUSES as s}
					<button class="bulk-select-option" on:click={() => bulkChangeStatus(s)}>
						{STATUS_LABELS[s] || s}
					</button>
				{/each}
			</div>
			<button class="bulk-select-cancel" on:click={() => showBulkStatusSelect = false}>Cancelar</button>
		</div>
	</div>
{/if}

<!-- Bulk Role Select Modal -->
{#if showBulkRoleSelect}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="bulk-overlay" on:click={() => showBulkRoleSelect = false} on:keydown={(e) => e.key === 'Escape' && (showBulkRoleSelect = false)}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="bulk-select-panel" on:click|stopPropagation on:keydown|stopPropagation>
			<h3>Mudar cargo para:</h3>
			<div class="bulk-select-options">
				{#each allRoles as r}
					<button class="bulk-select-option" on:click={() => bulkChangeRole(r)}>
						{r}
					</button>
				{/each}
			</div>
			<button class="bulk-select-cancel" on:click={() => showBulkRoleSelect = false}>Cancelar</button>
		</div>
	</div>
{/if}

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
	on:imported={reload}
/>

<!-- View Form Modal -->
<ViewFormModal
	isOpen={showViewModal}
	mode={viewModalMode}
	view={editingView}
	saving={viewSaving}
	{customRoles}
	on:close={() => showViewModal = false}
	on:save={handleViewSave}
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

	/* Bulk select overlay */
	.bulk-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.4);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 100;
	}

	.bulk-select-panel {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		max-width: 400px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
	}

	.bulk-select-panel h3 {
		margin: 0 0 var(--spacing-md) 0;
		font-size: var(--font-size-md);
		color: var(--color-neutral-800);
	}

	.bulk-select-options {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxs);
	}

	.bulk-select-option {
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-md);
		background: var(--color-neutral-0);
		text-align: left;
		font-size: var(--font-size-sm);
		cursor: pointer;
		color: var(--color-neutral-700);
	}

	.bulk-select-option:hover {
		background: var(--color-primary-50);
		border-color: var(--color-primary-300);
	}

	.bulk-select-cancel {
		margin-top: var(--spacing-md);
		width: 100%;
		padding: var(--spacing-sm);
		border: none;
		background: none;
		color: var(--color-neutral-500);
		font-size: var(--font-size-sm);
		cursor: pointer;
		text-decoration: underline;
	}
</style>
