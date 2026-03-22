<!-- src/lib/components/atoms/Toast.svelte -->
<script lang="ts">
	export let message: string = '';
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let onclose: (() => void) | undefined = undefined;
</script>

<div class="toast toast-{type}" role="alert">
	<span class="toast-message">{message}</span>
	{#if onclose}
		<button class="toast-close" on:click={onclose} aria-label="Fechar">×</button>
	{/if}
</div>

<style>
	.toast {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		box-shadow: var(--shadow-md);
		animation: slideIn 0.3s ease-out;
		min-width: 280px;
		max-width: 420px;
	}

	.toast-success {
		background: var(--color-green-100);
		color: var(--color-green-800);
		border-left: 4px solid var(--color-green-500);
	}

	.toast-error {
		background: var(--color-red-100);
		color: var(--color-red-800);
		border-left: 4px solid var(--color-red-500);
	}

	.toast-warning {
		background: var(--color-yellow-100);
		color: var(--color-yellow-900);
		border-left: 4px solid var(--color-yellow-500);
	}

	.toast-info {
		background: var(--color-blue-100);
		color: var(--color-blue-800);
		border-left: 4px solid var(--color-blue-500);
	}

	.toast-message {
		flex: 1;
	}

	.toast-close {
		background: none;
		border: none;
		font-size: var(--font-size-lg);
		cursor: pointer;
		color: inherit;
		opacity: 0.6;
		padding: 0;
		line-height: 1;
	}

	.toast-close:hover {
		opacity: 1;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}
</style>
