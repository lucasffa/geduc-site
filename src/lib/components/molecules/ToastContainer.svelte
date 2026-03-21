<!-- src/lib/components/molecules/ToastContainer.svelte -->
<script lang="ts">
	import Toast from '$lib/components/atoms/Toast.svelte';
	import { toasts, removeToast } from '$lib/stores/dashboard';
</script>

{#if $toasts.length > 0}
	<div class="toast-container">
		{#each $toasts as toast (toast.id)}
			<Toast
				message={toast.message}
				type={toast.type}
				onclose={() => removeToast(toast.id)}
			/>
		{/each}
	</div>
{/if}

<style>
	.toast-container {
		position: fixed;
		bottom: var(--spacing-lg);
		right: var(--spacing-lg);
		display: flex;
		flex-direction: column-reverse;
		gap: var(--spacing-sm);
		z-index: 9999;
	}
</style>
