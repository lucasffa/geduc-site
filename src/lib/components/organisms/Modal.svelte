<!-- src/lib/components/organisms/Modal.svelte -->
<script lang="ts">
	import Button from '$lib/components/atoms/Button.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';

	export let isOpen: boolean;
	export let onClose: () => void;
	export let size: 'sm' | 'md' | 'lg' = 'md';

	const closeModal = () => {
		console.log('Modal closeModal called');
		onClose();
	};

	// Debug log when isOpen changes
	$: console.log('Modal isOpen changed to:', isOpen);
</script>

{#if isOpen}
	<div class="modal-overlay" on:click={closeModal} tabindex="-1" aria-hidden={!isOpen}>
		<div
			class="modal-content {`modal-${size}`}"
			role="dialog"
			aria-modal="true"
			on:click|stopPropagation
		>
			<!-- Header com botão de fechar -->
			<div class="modal-header">
				<slot name="header"></slot>
				<Button variant="ghost" size="sm" on:click={closeModal} aria-label="Fechar modal">
					<Icon name="x" size="sm" />
				</Button>
			</div>

			<!-- Conteúdo -->
			<div class="modal-body">
				<slot />
			</div>
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

	.modal-header,
	.modal-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.modal-footer {
		border-top: 1px solid var(--color-neutral-200);
		border-bottom: none;
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
