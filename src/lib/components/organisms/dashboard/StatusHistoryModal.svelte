<!-- src/lib/components/organisms/dashboard/StatusHistoryModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';

	export let isOpen = false;
	/** @type {Array<{ changedAt: string, fromStatus: string | null, toStatus: string }>} */
	export let entries = [];

	const dispatch = createEventDispatcher();

	function handleClose() {
		dispatch('close');
	}

	function statusLabel(status) {
		return STATUS_LABELS[status] || status || '—';
	}

	function formatDateTime(isoString) {
		if (!isoString) return '—';
		const date = new Date(isoString);
		return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Histórico de Status">
	{#if entries.length === 0}
		<p class="empty-text">Nenhum histórico encontrado.</p>
	{:else}
		<div class="history-list">
			{#each entries as entry}
				<div class="history-item">
					<span class="history-date">{formatDateTime(entry.changedAt)}</span>
					<span class="history-transition">
						{#if entry.fromStatus}
							<span class="status-from">{statusLabel(entry.fromStatus)}</span>
							<span class="arrow">&rarr;</span>
						{:else}
							<span class="status-initial">Início</span>
							<span class="arrow">&rarr;</span>
						{/if}
						<strong class="status-to">{statusLabel(entry.toStatus)}</strong>
					</span>
				</div>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Fechar</Button>
	</svelte:fragment>
</Modal>

<style>
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
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		display: flex;
		flex-direction: column;
		gap: 4px;
		border-left: 3px solid var(--color-primary-300);
	}

	.history-date {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
	}

	.history-transition {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.status-from {
		color: var(--color-neutral-600);
	}

	.status-initial {
		color: var(--color-neutral-400);
		font-style: italic;
	}

	.arrow {
		color: var(--color-neutral-400);
	}

	.status-to {
		color: var(--color-primary-700);
	}
</style>
