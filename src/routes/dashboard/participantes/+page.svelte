<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import PermissionGate from '$lib/components/molecules/PermissionGate.svelte';
	import FilterBar from '$lib/components/molecules/FilterBar.svelte';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';
	import { STATUS_LABELS, VALID_TRANSITIONS, PARTICIPANT_STATUSES, PARTICIPANT_ROLES, ROLE_LABELS } from '$lib/constants/participant-status';
	import { addToast } from '$lib/stores/dashboard';

	export let data;

	$: participants = data.participants;
	$: pagination = data.pagination;
	$: permissions = data.permissions;

	let search = $pageStore.url.searchParams.get('search') || '';
	let filterValues = {
		status: $pageStore.url.searchParams.get('status') || '',
		role: $pageStore.url.searchParams.get('role') || ''
	};

	// Modals
	let showCreateModal = false;
	let showEditModal = false;
	let showHistoryModal = false;
	let editParticipant = null;
	let statusHistoryEntries = [];

	// Form
	let newParticipant = { name: '', email: '', role: 'mentorado', notes: '' };
	let saving = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'email', label: 'E-mail' },
		{ key: 'role', label: 'Cargo', width: '120px' },
		{ key: 'status', label: 'Status', width: '150px' },
		{ key: 'createdAt', label: 'Criado em', width: '120px' }
	];

	const statusFilters = PARTICIPANT_STATUSES.map(s => ({ value: s, label: STATUS_LABELS[s] || s }));
	const roleFilters = PARTICIPANT_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] || r }));

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
	async function createParticipant() {
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
			newParticipant = { name: '', email: '', role: 'mentorado', notes: '' };
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function updateParticipant() {
		if (!editParticipant) return;
		saving = true;
		try {
			const res = await fetch(`/dashboard/api/participants/${editParticipant.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editParticipant.name,
					email: editParticipant.email,
					role: editParticipant.role,
					notes: editParticipant.notes,
					workloadHours: editParticipant.workloadHours
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
			addToast('Erro ao carregar histórico', 'error');
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
	<div class="page-header">
		<h1 class="page-title">Participantes</h1>
		<PermissionGate allowed={permissions.canManageParticipants}>
			<Button variant="primary" size="sm" onclick={() => showCreateModal = true}>
				+ Novo Participante
			</Button>
		</PermissionGate>
	</div>

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
				<Badge text={ROLE_LABELS[value] || value} variant="role" />
			{:else if column === 'createdAt'}
				{value ? new Date(value).toLocaleDateString('pt-BR') : '—'}
			{:else}
				{value ?? '—'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<PermissionGate allowed={permissions.canManageParticipants}>
				<div class="action-buttons">
					<button class="action-btn" on:click={() => openEdit(row)} title="Editar">
						✏️
					</button>
					<button class="action-btn" on:click={() => loadHistory(row.id)} title="Histórico">
						📋
					</button>
					{#if VALID_TRANSITIONS[row.status]?.length > 0}
						<select
							class="status-select"
							on:change={(e) => { changeStatus(row.id, e.target.value); e.target.value = ''; }}
						>
							<option value="">Status →</option>
							{#each VALID_TRANSITIONS[row.status] || [] as t}
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
{#if showCreateModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => showCreateModal = false} on:keydown={() => showCreateModal = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Novo Participante</h2>
			<form on:submit|preventDefault={createParticipant}>
				<div class="form-group">
					<label for="new-name">Nome</label>
					<input id="new-name" bind:value={newParticipant.name} required />
				</div>
				<div class="form-group">
					<label for="new-email">E-mail</label>
					<input id="new-email" type="email" bind:value={newParticipant.email} required />
				</div>
				<div class="form-group">
					<label for="new-role">Cargo</label>
					<select id="new-role" bind:value={newParticipant.role}>
						{#each PARTICIPANT_ROLES as r}
							<option value={r}>{ROLE_LABELS[r] || r}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="new-notes">Observações</label>
					<textarea id="new-notes" bind:value={newParticipant.notes} rows="3"></textarea>
				</div>
				<div class="modal-actions">
					<Button variant="ghost" onclick={() => showCreateModal = false}>Cancelar</Button>
					<Button type="submit" variant="primary" loading={saving}>Criar</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && editParticipant}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => showEditModal = false} on:keydown={() => showEditModal = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Editar Participante</h2>
			<form on:submit|preventDefault={updateParticipant}>
				<div class="form-group">
					<label for="edit-name">Nome</label>
					<input id="edit-name" bind:value={editParticipant.name} required />
				</div>
				<div class="form-group">
					<label for="edit-email">E-mail</label>
					<input id="edit-email" type="email" bind:value={editParticipant.email} required />
				</div>
				<div class="form-group">
					<label for="edit-role">Cargo</label>
					<select id="edit-role" bind:value={editParticipant.role}>
						{#each PARTICIPANT_ROLES as r}
							<option value={r}>{ROLE_LABELS[r] || r}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="edit-hours">Carga Horária</label>
					<input id="edit-hours" type="number" bind:value={editParticipant.workloadHours} />
				</div>
				<div class="form-group">
					<label for="edit-notes">Observações</label>
					<textarea id="edit-notes" bind:value={editParticipant.notes} rows="3"></textarea>
				</div>
				<div class="modal-actions">
					<Button variant="ghost" onclick={() => showEditModal = false}>Cancelar</Button>
					<Button type="submit" variant="primary" loading={saving}>Salvar</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<!-- History Modal -->
{#if showHistoryModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => showHistoryModal = false} on:keydown={() => showHistoryModal = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Histórico de Status</h2>
			{#if statusHistoryEntries.length === 0}
				<p class="empty-text">Nenhum histórico encontrado.</p>
			{:else}
				<div class="history-list">
					{#each statusHistoryEntries as entry}
						<div class="history-item">
							<span class="history-date">{new Date(entry.changedAt).toLocaleString('pt-BR')}</span>
							<span>{entry.fromStatus || '—'} → <strong>{entry.toStatus}</strong></span>
						</div>
					{/each}
				</div>
			{/if}
			<div class="modal-actions">
				<Button variant="ghost" onclick={() => showHistoryModal = false}>Fechar</Button>
			</div>
		</div>
	</div>
{/if}

<style>
	.participants-page {
		max-width: 1200px;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: var(--spacing-lg);
	}

	.page-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-900);
		margin: 0;
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

	/* Modal styles */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(2px);
	}

	.modal-content {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-xl);
		max-width: 500px;
		width: 90%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: var(--shadow-xl);
	}

	.modal-content h2 {
		margin: 0 0 var(--spacing-lg);
		font-size: var(--font-size-lg);
		color: var(--color-neutral-900);
	}

	.modal-actions {
		display: flex;
		justify-content: flex-end;
		gap: var(--spacing-sm);
		margin-top: var(--spacing-lg);
	}

	.form-group {
		margin-bottom: var(--spacing-md);
	}

	.form-group label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-700);
		margin-bottom: var(--spacing-xs);
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		box-sizing: border-box;
	}

	.form-group input:focus,
	.form-group select:focus,
	.form-group textarea:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}

	.empty-text {
		text-align: center;
		color: var(--color-neutral-400);
		font-size: var(--font-size-sm);
	}

	.history-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.history-item {
		padding: var(--spacing-sm);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.history-date {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
	}
</style>
