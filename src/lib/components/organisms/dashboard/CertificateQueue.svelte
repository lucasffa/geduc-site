<!-- src/lib/components/organisms/dashboard/CertificateQueue.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Certificate, Participant } from '$lib/types/dashboard';

	export let certificates: Certificate[] = [];
	export let participants: Participant[] = [];
	export let sending: boolean = false;

	const dispatch = createEventDispatcher();

	function getParticipantName(participantId) {
		const p = participants.find((p) => p.id === participantId);
		return p?.name || `ID ${participantId}`;
	}

	function formatDate(dateStr) {
		if (!dateStr) return '—';
		return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
	}
</script>

{#if certificates.length > 0}
	<div class="data-table-wrapper">
		<div class="table-toolbar">
			<h3 class="section-heading">Certificados Gerados ({certificates.length})</h3>
			<button class="btn btn-success" on:click={() => dispatch('sendBatch')} disabled={sending}>
				{#if sending}<span class="loading-spinner spinner-sm"></span>{/if}
				Enviar Todos por E-mail
			</button>
		</div>
		<div class="table-scroll">
			<table class="data-table">
				<thead>
					<tr>
						<th>ID</th>
						<th>Participante</th>
						<th>Carga Horária</th>
						<th>Período</th>
						<th>Ações</th>
					</tr>
				</thead>
				<tbody>
					{#each certificates as cert}
						<tr>
							<td>#{cert.id}</td>
							<td>{getParticipantName(cert.participantId)}</td>
							<td>{cert.workloadHours}h</td>
							<td>
								{#if cert.periodStart && cert.periodEnd}
									{formatDate(cert.periodStart)} — {formatDate(cert.periodEnd)}
								{:else}
									—
								{/if}
							</td>
							<td>
								<div class="actions-cell">
									<a href={cert.pdfPath} target="_blank" class="btn btn-sm btn-outline">Ver PDF</a>
									<button class="btn btn-sm btn-success" on:click={() => dispatch('sendSingle', { id: cert.id })}>Enviar</button>
									<button class="btn btn-sm btn-outline" on:click={() => dispatch('testEmail', { id: cert.id })}>Teste</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<style>
	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
	}

	.table-scroll {
		overflow-x: auto;
	}

	.spinner-sm {
		width: 14px;
		height: 14px;
	}
</style>
