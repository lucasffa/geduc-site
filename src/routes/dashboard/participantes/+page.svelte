<script lang="ts">
	import { onMount } from 'svelte';
	import { STATUS_LABELS, VALID_TRANSITIONS, PARTICIPANT_ROLES, ROLE_LABELS, PARTICIPANT_STATUSES } from '$lib/constants/participant-status';
	import type { ParticipantStatus } from '$lib/constants/participant-status';
	import type { Participant, ImportResult, PaginationData, ToastData, StatusHistoryEntry } from '$lib/types/dashboard';

	// State
	let participants: Participant[] = $state([]);
	let loading = $state(true);
	let searchQuery = $state('');
	let filterStatus = $state('');
	let filterRole = $state('');
	let page = $state(1);
	let pagination: PaginationData = $state({ page: 1, limit: 25, total: 0, totalPages: 0 });

	// Modals
	let showImportModal = $state(false);
	let showEditModal = $state(false);
	let showHistoryModal = $state(false);
	let showCreateModal = $state(false);

	// Import
	let importFile: File | null = $state(null);
	let importResult: ImportResult | null = $state(null);
	let importing = $state(false);
	let dragging = $state(false);

	// Edit
	let editParticipant: Participant | null = $state(null);
	let saving = $state(false);

	// History
	let historyData: StatusHistoryEntry[] = $state([]);
	let historyParticipant: Participant | null = $state(null);

	// Toast
	let toast: ToastData | null = $state(null);
	let toastTimeout: ReturnType<typeof setTimeout> | null = $state(null);

	// Create
	let newParticipant = $state({
		name: '', email: '', role: 'mentorado', status: 'inscrito' as const,
		enrollmentDate: '', cycleEndDate: '', workloadHours: '' as string | number, notes: ''
	});

	function showToast(message: string, type = 'success') {
		if (toastTimeout) clearTimeout(toastTimeout);
		toast = { message, type };
		toastTimeout = setTimeout(() => { toast = null; }, 4000);
	}

	async function loadParticipants() {
		loading = true;
		try {
			const params = new URLSearchParams();
			params.set('page', String(page));
			params.set('limit', '25');
			if (searchQuery) params.set('search', searchQuery);
			if (filterStatus) params.set('status', filterStatus);
			if (filterRole) params.set('role', filterRole);

			const res = await fetch(`/dashboard/api/participants?${params}`);
			if (res.ok) {
				const data = await res.json();
				participants = data.data;
				pagination = data.pagination;
			}
		} catch (e) {
			console.error('Erro:', e);
			showToast('Erro ao carregar participantes', 'error');
		} finally {
			loading = false;
		}
	}

	onMount(() => { loadParticipants(); });

	let searchDebounce: ReturnType<typeof setTimeout> | undefined;
	function onSearch(e: Event) {
		searchQuery = (e.target as HTMLInputElement).value;
		clearTimeout(searchDebounce);
		searchDebounce = setTimeout(() => { page = 1; loadParticipants(); }, 300);
	}

	function onFilterChange() {
		page = 1;
		loadParticipants();
	}

	// Import
	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		const file = e.dataTransfer?.files?.[0];
		if (file) importFile = file;
	}

	function handleFileSelect(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (file) importFile = file;
	}

	async function doImport() {
		if (!importFile) return;
		importing = true;
		importResult = null;
		try {
			const fd = new FormData();
			fd.append('file', importFile);
			const res = await fetch('/dashboard/api/participants/import', { method: 'POST', body: fd });
			const data = await res.json();
			if (res.ok) {
				importResult = data;
				showToast(`${data.imported} participantes importados com sucesso!`);
				loadParticipants();
			} else {
				importResult = data;
				showToast(data.error || 'Erro na importação', 'error');
			}
		} catch (_e) {
			showToast('Erro na importação', 'error');
		} finally {
			importing = false;
		}
	}

	// Edit
	function openEdit(p: Participant) {
		editParticipant = { ...p };
		showEditModal = true;
	}

	async function saveEdit() {
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
					workloadHours: editParticipant.workloadHours ? Number(editParticipant.workloadHours) : null,
					enrollmentDate: editParticipant.enrollmentDate || null,
					cycleEndDate: editParticipant.cycleEndDate || null
				})
			});
			if (res.ok) {
				showToast('Participante atualizado');
				showEditModal = false;
				loadParticipants();
			} else {
				const err = await res.json();
				showToast(err.error || 'Erro ao salvar', 'error');
			}
		} catch (_e) {
			showToast('Erro ao salvar', 'error');
		} finally {
			saving = false;
		}
	}

	// Status change
	async function changeStatus(participantId: number, newStatus: ParticipantStatus) {
		try {
			const res = await fetch(`/dashboard/api/participants/${participantId}/status`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ newStatus })
			});
			if (res.ok) {
				showToast(`Status alterado para ${STATUS_LABELS[newStatus]}`);
				loadParticipants();
			} else {
				const err = await res.json();
				showToast(err.error || 'Erro na transição', 'error');
			}
		} catch (_e) {
			showToast('Erro na transição de status', 'error');
		}
	}

	// Delete
	async function deleteParticipant(id: number) {
		if (!confirm('Tem certeza que deseja remover este participante?')) return;
		try {
			const res = await fetch(`/dashboard/api/participants/${id}`, { method: 'DELETE' });
			if (res.ok) {
				showToast('Participante removido');
				loadParticipants();
			}
		} catch (_e) {
			showToast('Erro ao remover', 'error');
		}
	}

	// History
	async function openHistory(p: Participant) {
		historyParticipant = p;
		showHistoryModal = true;
		try {
			const res = await fetch(`/dashboard/api/participants/${p.id}/history`);
			if (res.ok) {
				const data = await res.json();
				historyData = data.history;
			}
		} catch (e) {
			console.error(e);
		}
	}

	// Create
	async function createParticipant() {
		saving = true;
		try {
			const res = await fetch('/dashboard/api/participants', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...newParticipant,
					workloadHours: newParticipant.workloadHours ? Number(newParticipant.workloadHours) : null,
					enrollmentDate: newParticipant.enrollmentDate || null,
					cycleEndDate: newParticipant.cycleEndDate || null
				})
			});
			if (res.ok) {
				showToast('Participante criado');
				showCreateModal = false;
				newParticipant = { name: '', email: '', role: 'mentorado', status: 'inscrito', enrollmentDate: '', cycleEndDate: '', workloadHours: '', notes: '' };
				loadParticipants();
			} else {
				const err = await res.json();
				showToast(err.error || 'Erro ao criar', 'error');
			}
		} catch (_e) {
			showToast('Erro ao criar', 'error');
		} finally {
			saving = false;
		}
	}

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '—';
		return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
	}

	function formatDateTime(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('pt-BR', {
			day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Participantes | Dashboard GEDUC</title>
</svelte:head>

<div class="dashboard-header">
	<h1>Participantes</h1>
	<div style="display: flex; gap: var(--spacing-sm);">
		<button class="btn btn-secondary" onclick={() => { showImportModal = true; importFile = null; importResult = null; }}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
			Importar Planilha
		</button>
		<button class="btn btn-primary" onclick={() => { showCreateModal = true; }}>
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
			Novo Participante
		</button>
	</div>
</div>

<!-- Filters -->
<div class="data-table-wrapper">
	<div class="table-toolbar">
		<div class="table-toolbar-left">
			<input type="text" class="search-input" placeholder="Buscar por nome ou e-mail..." value={searchQuery} oninput={onSearch} />
			<select class="filter-select" bind:value={filterStatus} onchange={onFilterChange}>
				<option value="">Todos os status</option>
				{#each PARTICIPANT_STATUSES as s}
					<option value={s}>{STATUS_LABELS[s]}</option>
				{/each}
			</select>
			<select class="filter-select" bind:value={filterRole} onchange={onFilterChange}>
				<option value="">Todos os cargos</option>
				{#each PARTICIPANT_ROLES as r}
					<option value={r}>{ROLE_LABELS[r]}</option>
				{/each}
			</select>
		</div>
		<span style="font-size: var(--font-size-xs); color: var(--text-color-subtle);">{pagination.total} participante{pagination.total !== 1 ? 's' : ''}</span>
	</div>

	{#if loading}
		<div class="loading-overlay"><div class="loading-spinner"></div></div>
	{:else if participants.length === 0}
		<div class="empty-state">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
			<h3>Nenhum participante encontrado</h3>
			<p>Importe uma planilha ou adicione manualmente.</p>
		</div>
	{:else}
		<div style="overflow-x: auto;">
			<table class="data-table">
				<thead><tr><th>Nome</th><th>Cargo</th><th>Status</th><th>Inscrição</th><th>Fim de Ciclo</th><th>Ações</th></tr></thead>
				<tbody>
					{#each participants as p}
						<tr>
							<td><div class="participant-name">{p.name}</div><div class="participant-email">{p.email}</div></td>
							<td style="text-transform: capitalize;">{p.role}</td>
							<td><span class="status-badge status-badge--{p.status}">{STATUS_LABELS[p.status] || p.status}</span></td>
							<td>{formatDate(p.enrollmentDate)}</td>
							<td>{formatDate(p.cycleEndDate)}</td>
							<td>
								<div class="actions-cell">
									<button class="btn btn-sm btn-outline" onclick={() => openEdit(p)}>Editar</button>
									{#if VALID_TRANSITIONS[p.status]?.length > 0}
										<select class="filter-select" style="font-size: 11px; padding: 2px 6px;"
											onchange={(e) => { const t = e.target as HTMLSelectElement; if (t.value) { changeStatus(p.id, t.value as ParticipantStatus); t.value = ''; } }}>
											<option value="">Status →</option>
											{#each VALID_TRANSITIONS[p.status] as nextStatus}
												<option value={nextStatus}>{STATUS_LABELS[nextStatus]}</option>
											{/each}
										</select>
									{/if}
									<button class="btn btn-sm btn-outline" onclick={() => openHistory(p)}>Histórico</button>
									<button class="btn btn-sm btn-danger" onclick={() => deleteParticipant(p.id)}>×</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if pagination.totalPages > 1}
			<div class="pagination">
				<button disabled={page <= 1} onclick={() => { page--; loadParticipants(); }}>← Anterior</button>
				<span class="page-info">Página {page} de {pagination.totalPages}</span>
				<button disabled={page >= pagination.totalPages} onclick={() => { page++; loadParticipants(); }}>Próxima →</button>
			</div>
		{/if}
	{/if}
</div>

<!-- Import Modal -->
{#if showImportModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showImportModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showImportModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header">
				<h3>Importar Planilha</h3>
				<button class="modal-close" onclick={() => { showImportModal = false; }}>✕</button>
			</div>
			<div class="modal-body">
				{#if !importResult}
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div class="dropzone" class:dragging ondragover={(e) => { e.preventDefault(); dragging = true; }} ondragleave={() => { dragging = false; }} ondrop={handleDrop} onclick={() => document.getElementById('file-input')?.click()} onkeydown={() => {}}>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="48" height="48"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
						{#if importFile}
							<p><strong>{importFile.name}</strong></p>
							<p style="font-size: var(--font-size-xs); margin-top: var(--spacing-xs);">Clique em "Importar" para processar</p>
						{:else}
							<p><span class="dropzone-cta">Clique para selecionar</span> ou arraste o arquivo aqui</p>
							<p style="font-size: var(--font-size-xs); margin-top: var(--spacing-xs);">Formatos aceitos: .xlsx, .xls, .csv</p>
						{/if}
					</div>
					<input id="file-input" type="file" accept=".xlsx,.xls,.csv" style="display: none;" onchange={handleFileSelect} />
					<div style="margin-top: var(--spacing-lg); padding: var(--spacing-md); background: var(--color-neutral-50); border-radius: var(--border-radius-lg); font-size: var(--font-size-xs); color: var(--text-color-subtle);">
						<strong>Colunas esperadas:</strong> nome, e-mail, cargo/função, data de inscrição/admissão, data de fim de ciclo
					</div>
				{:else}
					<div style="text-align: center; padding: var(--spacing-lg);">
						{#if importResult.imported > 0}
							<div style="font-size: var(--font-size-3xl); color: var(--color-green-600); margin-bottom: var(--spacing-sm);">✓</div>
							<h3 style="color: var(--color-green-700);">{importResult.imported} participantes importados</h3>
						{/if}
						{#if importResult.errors?.length > 0}
							<div style="margin-top: var(--spacing-md); text-align: left; max-height: 200px; overflow-y: auto;">
								<p style="font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-sm); color: var(--color-red-600);">Erros ({importResult.errors.length}):</p>
								{#each importResult.errors as err}
									<p style="font-size: var(--font-size-xs); color: var(--color-red-600);">Linha {err.row}: {err.message}</p>
								{/each}
							</div>
						{/if}
					</div>
				{/if}
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showImportModal = false; }}>{importResult ? 'Fechar' : 'Cancelar'}</button>
				{#if !importResult}
					<button class="btn btn-primary" disabled={!importFile || importing} onclick={doImport}>
						{#if importing}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Importar
					</button>
				{/if}
			</div>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && editParticipant}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showEditModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Editar Participante</h3><button class="modal-close" onclick={() => { showEditModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group"><label for="edit-name">Nome</label><input id="edit-name" class="form-control" bind:value={editParticipant.name} /></div>
					<div class="form-group"><label for="edit-email">E-mail</label><input id="edit-email" class="form-control" type="email" bind:value={editParticipant.email} /></div>
				</div>
				<div class="form-row">
					<div class="form-group"><label for="edit-role">Cargo</label><select id="edit-role" class="form-control" bind:value={editParticipant.role}>{#each PARTICIPANT_ROLES as r}<option value={r}>{ROLE_LABELS[r]}</option>{/each}</select></div>
					<div class="form-group"><label for="edit-hours">Carga Horária (horas)</label><input id="edit-hours" class="form-control" type="number" bind:value={editParticipant.workloadHours} /></div>
				</div>
				<div class="form-row">
					<div class="form-group"><label for="edit-enrollment">Data de Inscrição</label><input id="edit-enrollment" class="form-control" type="date" bind:value={editParticipant.enrollmentDate} /></div>
					<div class="form-group"><label for="edit-cycle-end">Fim de Ciclo</label><input id="edit-cycle-end" class="form-control" type="date" bind:value={editParticipant.cycleEndDate} /></div>
				</div>
				<div class="form-group"><label for="edit-notes">Observações</label><textarea id="edit-notes" class="form-control" rows="3" bind:value={editParticipant.notes}></textarea></div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showEditModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={saving} onclick={saveEdit}>{#if saving}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Salvar</button>
			</div>
		</div>
	</div>
{/if}

<!-- Create Modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showCreateModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showCreateModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Novo Participante</h3><button class="modal-close" onclick={() => { showCreateModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-row">
					<div class="form-group"><label for="new-name">Nome *</label><input id="new-name" class="form-control" bind:value={newParticipant.name} required /></div>
					<div class="form-group"><label for="new-email">E-mail *</label><input id="new-email" class="form-control" type="email" bind:value={newParticipant.email} required /></div>
				</div>
				<div class="form-row">
					<div class="form-group"><label for="new-role">Cargo</label><select id="new-role" class="form-control" bind:value={newParticipant.role}>{#each PARTICIPANT_ROLES as r}<option value={r}>{ROLE_LABELS[r]}</option>{/each}</select></div>
					<div class="form-group"><label for="new-hours">Carga Horária (horas)</label><input id="new-hours" class="form-control" type="number" bind:value={newParticipant.workloadHours} /></div>
				</div>
				<div class="form-row">
					<div class="form-group"><label for="new-enrollment">Data de Inscrição</label><input id="new-enrollment" class="form-control" type="date" bind:value={newParticipant.enrollmentDate} /></div>
					<div class="form-group"><label for="new-cycle-end">Fim de Ciclo</label><input id="new-cycle-end" class="form-control" type="date" bind:value={newParticipant.cycleEndDate} /></div>
				</div>
				<div class="form-group"><label for="new-notes">Observações</label><textarea id="new-notes" class="form-control" rows="3" bind:value={newParticipant.notes}></textarea></div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showCreateModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={saving || !newParticipant.name || !newParticipant.email} onclick={createParticipant}>
					{#if saving}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Criar
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- History Modal -->
{#if showHistoryModal && historyParticipant}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showHistoryModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showHistoryModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Histórico — {historyParticipant.name}</h3><button class="modal-close" onclick={() => { showHistoryModal = false; }}>✕</button></div>
			<div class="modal-body">
				{#if historyData.length > 0}
					<div class="timeline">
						{#each historyData as h}
							<div class="timeline-item">
								<div class="timeline-date">{formatDateTime(h.changedAt)}</div>
								<div class="timeline-content">
									{#if h.fromStatus}
										<span class="status-badge status-badge--{h.fromStatus}">{STATUS_LABELS[h.fromStatus as ParticipantStatus] || h.fromStatus}</span> →
									{/if}
									<span class="status-badge status-badge--{h.toStatus}">{STATUS_LABELS[h.toStatus as ParticipantStatus] || h.toStatus}</span>
									{#if h.changedBy}<span style="font-size: var(--font-size-xs); color: var(--text-color-subtle);"> por {h.changedBy}</span>{/if}
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state" style="padding: var(--spacing-xl);"><p>Nenhum histórico de status registrado.</p></div>
				{/if}
			</div>
			<div class="modal-footer"><button class="btn btn-secondary" onclick={() => { showHistoryModal = false; }}>Fechar</button></div>
		</div>
	</div>
{/if}

<!-- Toast -->
{#if toast}
	<div class="toast toast--{toast.type}">{toast.message}</div>
{/if}
