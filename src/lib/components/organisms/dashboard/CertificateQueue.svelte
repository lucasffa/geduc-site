<!-- src/lib/components/organisms/dashboard/CertificateQueue.svelte -->
<script lang="ts">
	import { onMount, createEventDispatcher } from 'svelte';
	import { addToast } from '$lib/stores/dashboard';

	const dispatch = createEventDispatcher();

	// ── Filtros ──
	let statusFilter: 'gerado' | 'enviado' | 'all' = 'gerado';
	let dateFrom = '';
	let dateTo = '';

	// ── Estado ──
	let certificates: any[] = [];
	let loading = false;
	let sending = false;
	let sendingId: string | null = null;

	// ── Seleção / delete ──
	let selectedIds: Set<string> = new Set();
	let deleting = false;

	$: allSelected = certificates.length > 0 && certificates.every(c => selectedIds.has(c.id));
	$: someSelected = selectedIds.size > 0;

	function toggleSelectAll() {
		if (allSelected) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(certificates.map(c => c.id));
		}
	}

	function toggleSelect(id: string) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id); else next.add(id);
		selectedIds = next;
	}

	async function deleteSelected() {
		if (!someSelected) return;
		const count = selectedIds.size;
		if (!confirm(`Apagar ${count} certificado${count !== 1 ? 's' : ''}? Esta ação não pode ser desfeita.`)) return;
		deleting = true;
		try {
			const res = await fetch('/dashboard/api/certificates', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ ids: Array.from(selectedIds) })
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`${result.deleted} certificado${result.deleted !== 1 ? 's' : ''} apagado${result.deleted !== 1 ? 's' : ''}!`, 'success');
				selectedIds = new Set();
				await load();
			} else {
				addToast(result.error || 'Erro ao apagar', 'error');
			}
		} catch {
			addToast('Erro ao apagar certificados', 'error');
		} finally {
			deleting = false;
		}
	}

	onMount(load);

	export async function reload() {
		await load();
	}

	async function load() {
		loading = true;
		try {
			const params = new URLSearchParams();
			if (statusFilter !== 'all') params.set('status', statusFilter);
			if (dateFrom) params.set('dateFrom', dateFrom);
			if (dateTo)   params.set('dateTo',   dateTo);

			const res = await fetch(`/dashboard/api/certificates?${params}`);
			if (res.ok) {
				certificates = (await res.json()).certificates;
				// Remove IDs que não existem mais da seleção
				selectedIds = new Set([...selectedIds].filter(id => certificates.some(c => c.id === id)));
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function sendSingle(certId: string) {
		sendingId = certId;
		try {
			const res = await fetch('/dashboard/api/certificates/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateId: certId })
			});
			if (res.ok) {
				addToast('Certificado enviado!', 'success');
				await load();
				dispatch('sent');
			} else {
				const r = await res.json();
				addToast(r.error || 'Erro no envio', 'error');
			}
		} catch {
			addToast('Erro ao enviar', 'error');
		} finally {
			sendingId = null;
		}
	}

	async function sendBatchAll() {
		const ids = certificates.filter(c => c.status === 'gerado').map(c => c.id);
		if (!ids.length) { addToast('Nenhum certificado para enviar', 'error'); return; }
		sending = true;
		try {
			const res = await fetch('/dashboard/api/certificates/send-batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateIds: ids })
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`${result.success} enviados!${result.failed > 0 ? ` ${result.failed} falharam.` : ''}`, 'success');
				await load();
				dispatch('sent');
			} else {
				addToast(result.error || 'Erro no envio', 'error');
			}
		} catch {
			addToast('Erro no envio em lote', 'error');
		} finally {
			sending = false;
		}
	}

	function openTestEmail(certId: string) {
		dispatch('testEmail', { id: certId });
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '—';
		// SQLite pode retornar "2024-01-15 10:30:00" (espaço); normaliza para ISO
		const iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
		return new Date(iso).toLocaleDateString('pt-BR');
	}

	$: pendingCount = certificates.filter(c => c.status === 'gerado').length;
</script>

<div class="data-table-wrapper cert-queue">
	<!-- ── Barra de filtros ── -->
	<div class="table-toolbar">
		<h3 class="section-heading">
			Certificados
			{#if loading}
				<span class="loading-spinner spinner-sm"></span>
			{:else if pendingCount > 0}
				<span class="badge-pending">{pendingCount} pendente{pendingCount !== 1 ? 's' : ''}</span>
			{/if}
		</h3>

		<div class="toolbar-actions">
			{#if someSelected}
				<button class="btn btn-danger btn-sm" disabled={deleting} on:click={deleteSelected}>
					{#if deleting}<span class="loading-spinner spinner-sm"></span>{/if}
					Apagar ({selectedIds.size})
				</button>
			{/if}
			{#if pendingCount > 0}
				<button class="btn btn-success btn-sm" disabled={sending} on:click={sendBatchAll}>
					{#if sending}<span class="loading-spinner spinner-sm"></span>{/if}
					Enviar Todos ({pendingCount})
				</button>
			{/if}
		</div>
	</div>

	<div class="filter-bar">
		<div class="filter-group">
			<label for="cert-status-filter">Status</label>
			<select
				id="cert-status-filter"
				class="form-control sm"
				bind:value={statusFilter}
				on:change={load}
			>
				<option value="gerado">Gerados (não enviados)</option>
				<option value="enviado">Enviados</option>
				<option value="all">Todos</option>
			</select>
		</div>

		<div class="filter-group">
			<label for="cert-date-from">De</label>
			<input
				id="cert-date-from"
				type="date"
				class="form-control sm"
				bind:value={dateFrom}
				on:change={load}
			/>
		</div>

		<div class="filter-group">
			<label for="cert-date-to">Até</label>
			<input
				id="cert-date-to"
				type="date"
				class="form-control sm"
				bind:value={dateTo}
				on:change={load}
			/>
		</div>

		<button class="btn btn-ghost btn-sm filter-reset" on:click={() => { dateFrom = ''; dateTo = ''; load(); }} title="Limpar datas">
			✕ Limpar
		</button>
	</div>

	{#if certificates.length === 0 && !loading}
		<p class="empty-state">
			{statusFilter === 'gerado'
				? 'Nenhum certificado pendente de envio.'
				: 'Nenhum certificado encontrado para os filtros selecionados.'}
		</p>
	{:else}
		<div class="table-scroll">
			<table class="data-table">
				<thead>
					<tr>
						<th class="col-check">
							<input
								type="checkbox"
								checked={allSelected}
								indeterminate={someSelected && !allSelected}
								on:change={toggleSelectAll}
								title="Selecionar todos"
							/>
						</th>
						<th>Participante</th>
						<th>Carga Horária</th>
						<th>Período</th>
						<th>Gerado em</th>
						<th>Status</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each certificates as cert}
						<tr class:row-selected={selectedIds.has(cert.id)}>
							<td class="col-check">
								<input
									type="checkbox"
									checked={selectedIds.has(cert.id)}
									on:change={() => toggleSelect(cert.id)}
								/>
							</td>
							<td>
								<div class="participant-cell">
									<span class="participant-name">{cert.participantName ?? `ID ${cert.participantId}`}</span>
									{#if cert.participantEmail}
										<span class="participant-email">{cert.participantEmail}</span>
									{/if}
								</div>
							</td>
							<td>{cert.workloadHours ?? '—'}h</td>
							<td>
								{#if cert.periodStart && cert.periodEnd}
									{formatDate(cert.periodStart)} — {formatDate(cert.periodEnd)}
								{:else}
									—
								{/if}
							</td>
							<td>{formatDate(cert.createdAt)}</td>
							<td>
								<span class="status-badge status-{cert.status}">
									{cert.status === 'gerado' ? 'Pendente' : 'Enviado'}
								</span>
							</td>
							<td>
								<div class="actions-cell">
									<a
										href="/dashboard/api/certificates/{cert.id}/download"
										target="_blank"
										class="btn btn-sm btn-outline"
									>Ver PDF</a>

									{#if cert.status === 'gerado'}
										<button
											class="btn btn-sm btn-success"
											disabled={sendingId === cert.id}
											on:click={() => sendSingle(cert.id)}
										>
											{#if sendingId === cert.id}
												<span class="loading-spinner spinner-sm"></span>
											{/if}
											Enviar
										</button>
										<button
											class="btn btn-sm btn-outline"
											on:click={() => openTestEmail(cert.id)}
										>Teste</button>
									{:else if cert.sentAt}
										<span class="sent-info">Enviado {formatDate(cert.sentAt)}</span>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.cert-queue {
		margin-bottom: var(--spacing-xl);
	}

	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.badge-pending {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		background: var(--color-warning-100, #fef3c7);
		color: var(--color-warning-700, #b45309);
		padding: 2px 8px;
		border-radius: var(--border-radius-full);
	}

	.toolbar-actions {
		display: flex;
		gap: var(--spacing-sm);
	}

	/* ── Filtros ── */
	.filter-bar {
		display: flex;
		align-items: flex-end;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-neutral-50);
		border-bottom: 1px solid var(--color-neutral-100);
		flex-wrap: wrap;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.filter-group label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-500);
	}

	.form-control.sm {
		height: 32px;
		padding: 0 var(--spacing-sm);
		font-size: var(--font-size-sm);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-sm);
		background: #fff;
	}

	.filter-reset {
		align-self: flex-end;
		color: var(--text-color-subtle);
	}

	/* ── Tabela ── */
	.table-scroll {
		overflow-x: auto;
	}

	.participant-cell {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.participant-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
	}

	.participant-email {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}

	.status-badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	.status-gerado {
		background: var(--color-warning-100, #fef3c7);
		color: var(--color-warning-700, #b45309);
	}

	.status-enviado {
		background: var(--color-success-100, #d1fae5);
		color: var(--color-success-700, #065f46);
	}

	.sent-info {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}

	.empty-state {
		padding: var(--spacing-lg);
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
		text-align: center;
	}

	.spinner-sm {
		width: 14px;
		height: 14px;
	}

	.col-check {
		width: 36px;
		text-align: center;
		padding-left: var(--spacing-sm);
		padding-right: 0;
	}

	.row-selected {
		background: var(--color-primary-50, #eff6ff);
	}

	.btn-danger {
		background: var(--color-error-600, #dc2626);
		color: #fff;
		border-color: var(--color-error-600, #dc2626);
	}

	.btn-danger:hover:not(:disabled) {
		background: var(--color-error-700, #b91c1c);
		border-color: var(--color-error-700, #b91c1c);
	}
</style>
