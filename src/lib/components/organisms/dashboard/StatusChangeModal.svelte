<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';

	export let isOpen = false;
	export let participant = null;
	export let availableStatuses = [];

	const dispatch = createEventDispatcher();

	$: title = participant ? `Alterar Status de ${participant.name}` : 'Alterar Status';

	function handleSelect(status) {
		dispatch('select', status);
		dispatch('close');
	}
</script>

<Modal {isOpen} {title} size="sm" on:close={() => dispatch('close')}>
	{#if participant}
		<div class="current-status">
			<span class="label">Status atual:</span>
			<Badge text={STATUS_LABELS[participant.status] || participant.status} variant="status" />
		</div>
	{/if}

	<div class="status-list">
		{#each availableStatuses as status}
			<button class="status-option" on:click={() => handleSelect(status)}>
				<Badge text={STATUS_LABELS[status] || status} variant="status" />
				<span class="arrow">→</span>
			</button>
		{/each}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={() => dispatch('close')}>Cancelar</Button>
	</svelte:fragment>
</Modal>

<style>
	.current-status {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding-bottom: var(--spacing-md);
		border-bottom: 1px solid var(--color-neutral-200);
		margin-bottom: var(--spacing-md);
	}

	.label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
	}

	.status-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xxs);
	}

	.status-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-md);
		background: var(--color-neutral-0);
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.status-option:hover {
		background: var(--color-primary-50);
		border-color: var(--color-primary-300);
	}

	.arrow {
		color: var(--color-neutral-400);
		font-size: var(--font-size-sm);
	}
</style>
