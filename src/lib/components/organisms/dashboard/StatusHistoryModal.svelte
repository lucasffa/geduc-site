<!-- src/lib/components/organisms/dashboard/StatusHistoryModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	/** @type {Array<{ changedAt: string, fromStatus: string, toStatus: string }>} */
	export let entries = [];

	const dispatch = createEventDispatcher();

	function handleClose() {
		dispatch('close');
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Historico de Status">
	{#if entries.length === 0}
		<p class="empty-text">Nenhum historico encontrado.</p>
	{:else}
		<div class="history-list">
			{#each entries as entry}
				<div class="history-item">
					<span class="history-date">{new Date(entry.changedAt).toLocaleString('pt-BR')}</span>
					<span>{entry.fromStatus || '\u2014'} &rarr; <strong>{entry.toStatus}</strong></span>
				</div>
			{/each}
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="ghost" onclick={handleClose}>Fechar</Button>
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
