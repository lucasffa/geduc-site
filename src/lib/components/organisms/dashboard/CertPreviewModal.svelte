<!-- src/lib/components/organisms/dashboard/CertPreviewModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import type { Participant } from '$lib/types/dashboard';

	export let isOpen: boolean = false;
	export let participants: Participant[] = [];
	export let workloadHours: string = '';
	export let periodStart: string = '';
	export let periodEnd: string = '';
	export let templateId: string | null = null;
	export let templates: { id: string; name: string }[] = [];
	export let generating: boolean = false;

	const dispatch = createEventDispatcher();

	function handleClose() {
		dispatch('close');
	}

	function formatDate(dateStr) {
		if (!dateStr) return '';
		return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR');
	}
</script>

<Modal {isOpen} onClose={handleClose} size="lg" title="Revisão antes da geração">
	<div class="preview-summary">
		<p><strong>Carga horária:</strong> {workloadHours}h</p>
		<p><strong>Período:</strong> {formatDate(periodStart)} a {formatDate(periodEnd)}</p>
		<p><strong>Template:</strong> {templateId ? (templates.find(t => t.id === templateId)?.name || templateId) : 'Modelo padrão'}</p>
	</div>

	<p class="preview-count">
		{participants.length} certificado{participants.length !== 1 ? 's' : ''} será(ão) gerado(s):
	</p>

	<div class="preview-list">
		{#each participants as p}
			<div class="cert-preview">
				<div class="cert-title">CERTIFICADO GEDUC</div>
				<div class="cert-name">{p.name}</div>
				<div class="cert-detail">{p.role} · {p.email}</div>
				<div class="cert-detail">{workloadHours} horas · {periodStart} a {periodEnd}</div>
			</div>
		{/each}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" loading={generating} on:click={() => dispatch('generate')}>
			Confirmar e Gerar
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.preview-summary {
		background: var(--color-neutral-50);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.preview-summary p {
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-xs);
	}

	.preview-summary p:last-child {
		margin-bottom: 0;
	}

	.preview-count {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
	}

	.preview-list {
		max-height: 300px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}
</style>
