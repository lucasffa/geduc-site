<!-- src/lib/components/atoms/Spinner.svelte -->
<script lang="ts">
	export let size: 'sm' | 'md' | 'lg' = 'md';
</script>

<span class="spinner spinner-{size}" role="status" aria-label="Carregando..."></span>

<style>
	.spinner {
		display: inline-block;
		border: 2px solid var(--color-neutral-200);
		border-top-color: var(--color-primary-500);
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.spinner-sm {
		width: 16px;
		height: 16px;
	}

	.spinner-md {
		width: 24px;
		height: 24px;
		border-width: 3px;
	}

	.spinner-lg {
		width: 40px;
		height: 40px;
		border-width: 4px;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
