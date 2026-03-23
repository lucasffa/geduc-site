<!-- src/lib/components/organisms/Modal.svelte -->
<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';

	export let isOpen: boolean;
	export let onClose: () => void;
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let title: string = '';

	const closeModal = () => {
		onClose();
	};

	function handleKeydown(e) {
		if (e.key === 'Escape') closeModal();
	}
</script>

{#if isOpen}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={closeModal} on:keydown={handleKeydown} tabindex="-1" aria-hidden={!isOpen}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="modal-content {`modal-${size}`}"
			role="dialog"
			aria-modal="true"
			on:click|stopPropagation
			on:keydown|stopPropagation
		>
			<div class="modal-header">
				{#if title}
					<h3 class="modal-title">{title}</h3>
				{:else}
					<slot name="header"></slot>
				{/if}
				<Button variant="ghost" size="sm" on:click={closeModal} aria-label="Fechar modal">
					<Icon name="x" size="sm" />
				</Button>
			</div>

			<div class="modal-body">
				<slot />
			</div>

			{#if $$slots.footer}
				<div class="modal-footer">
					<slot name="footer" />
				</div>
			{/if}
		</div>
	</div>
{/if}

<style>
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.6);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1001;
		animation: fadeIn 0.3s ease-in;
	}

	.modal-content {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		display: flex;
		flex-direction: column;
		max-height: 90vh;
		overflow: hidden;
		animation: slideIn 0.3s ease-in;
	}

	.modal-sm {
		width: 300px;
	}

	.modal-md {
		width: 500px;
	}

	.modal-lg {
		width: 800px;
	}

	.modal-title {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-900);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md) var(--spacing-lg);
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		border-top: 1px solid var(--color-neutral-200);
	}

	.modal-body {
		padding: var(--spacing-lg);
		overflow-y: auto;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			transform: translateY(-10px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>
