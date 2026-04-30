<!-- src/lib/components/molecules/FormSectionNav.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let canGoBack: boolean = false;
	export let canGoNext: boolean = false;

	const dispatch = createEventDispatcher<{ back: void; next: void }>();
</script>

<div class="section-nav">
	<button
		type="button"
		class="nav-btn nav-secondary"
		on:click={() => dispatch('back')}
		disabled={!canGoBack}
	>
		<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
			<polyline points="15 18 9 12 15 6" />
		</svg>
		Voltar
	</button>

	{#if canGoNext}
		<button
			type="button"
			class="nav-btn nav-primary"
			on:click={() => dispatch('next')}
		>
			Próxima página
			<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="9 18 15 12 9 6" />
			</svg>
		</button>
	{/if}
</div>

<style>
	.section-nav {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 0.5rem;
		margin-top: var(--spacing-lg, 1rem);
		padding-top: var(--spacing-md, 0.75rem);
		border-top: 1px solid var(--border-color-default, #e5e7eb);
	}

	.nav-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		border-radius: 8px;
		padding: 0.55rem 1rem;
		font-weight: 600;
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
		transition: background 0.12s, transform 0.1s;
		border: 1px solid transparent;
		line-height: 1;
	}

	.nav-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
		transform: none !important;
	}

	.nav-primary {
		background: var(--theme-primary, var(--color-primary-500, #324acb));
		color: #fff;
	}

	.nav-primary:hover:not(:disabled) {
		background: color-mix(
			in srgb,
			var(--theme-primary, var(--color-primary-500, #324acb)) 88%,
			black
		);
		transform: translateX(2px);
	}

	.nav-secondary {
		background: transparent;
		color: var(--text-color-secondary, #6b7280);
		border-color: var(--border-color-default, #e5e7eb);
	}

	.nav-secondary:hover:not(:disabled) {
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--text-color-primary, #111827);
		transform: translateX(-2px);
	}
</style>