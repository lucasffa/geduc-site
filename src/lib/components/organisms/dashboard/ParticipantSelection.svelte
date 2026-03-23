<!-- src/lib/components/organisms/dashboard/ParticipantSelection.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';
	import type { Participant } from '$lib/types/dashboard';

	export let participants: Participant[] = [];
	export let selectedIds: Set<number> = new Set();
	export let loading: boolean = false;

	const dispatch = createEventDispatcher();

	$: allSelected = selectedIds.size === participants.length && participants.length > 0;

	function toggleSelect(id) {
		dispatch('toggle', { id });
	}

	function toggleAll() {
		dispatch('toggleAll');
	}

	function openPreview() {
		dispatch('preview');
	}
</script>

<div class="data-table-wrapper participant-selection">
	<div class="table-toolbar">
		<div class="table-toolbar-left">
			<h3 class="section-heading">Selecionar Participantes</h3>
			<span class="selection-info">
				{selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''} de {participants.length} elegível(eis)
			</span>
		</div>
		<button class="btn btn-primary" on:click={openPreview} disabled={selectedIds.size === 0}>
			Revisar e Gerar ({selectedIds.size})
		</button>
	</div>

	{#if loading}
		<div class="loading-overlay"><div class="loading-spinner"></div></div>
	{:else if participants.length === 0}
		<div class="empty-state">
			<h3>Nenhum participante elegível</h3>
			<p>Apenas participantes com status "Ativo", "Aprovado" ou "Certificado em processamento" podem receber certificados.</p>
		</div>
	{:else}
		<div class="table-scroll">
			<table class="data-table">
				<thead>
					<tr>
						<th class="checkbox-cell">
							<input type="checkbox" checked={allSelected} on:change={toggleAll} />
						</th>
						<th>Nome</th>
						<th>Cargo</th>
						<th>Status</th>
						<th>Período</th>
					</tr>
				</thead>
				<tbody>
					{#each participants as p}
						<tr>
							<td class="checkbox-cell">
								<input type="checkbox" checked={selectedIds.has(p.id)} on:change={() => toggleSelect(p.id)} />
							</td>
							<td>
								<div class="participant-name">{p.name}</div>
								<div class="participant-email">{p.email}</div>
							</td>
							<td class="capitalize">{p.role}</td>
							<td>
								<span class="status-badge status-badge--{p.status}">
									{STATUS_LABELS[p.status] || p.status}
								</span>
							</td>
							<td>
								{p.enrollmentDate ? new Date(p.enrollmentDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}
								{p.cycleEndDate ? ` — ${new Date(p.cycleEndDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<style>
	.participant-selection {
		margin-bottom: var(--spacing-xl);
	}

	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
	}

	.selection-info {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}

	.table-scroll {
		overflow-x: auto;
	}

	.capitalize {
		text-transform: capitalize;
	}
</style>
