<!-- src/lib/components/molecules/FormFieldOptionsEditor.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let options: { label: string; value: string }[] = [];

	const dispatch = createEventDispatcher<{
		addOption: void;
		removeOption: { idx: number };
		optionChange: { idx: number; key: 'label' | 'value'; val: string };
	}>();
</script>

<div class="options-editor">
	{#each options as option, idx}
		<div class="option-row">
			<input
				aria-label="Rótulo da opção"
				value={option.label}
				placeholder="Rótulo"
				on:input={(e) =>
					dispatch('optionChange', { idx, key: 'label', val: (e.target as HTMLInputElement).value })}
			/>
			<input
				aria-label="Valor da opção"
				value={option.value}
				placeholder="Valor"
				on:input={(e) =>
					dispatch('optionChange', { idx, key: 'value', val: (e.target as HTMLInputElement).value })}
			/>
			<button
				type="button"
				class="remove-btn"
				aria-label="Remover opção"
				on:click={() => dispatch('removeOption', { idx })}
				disabled={options.length <= 1}
			>×</button>
		</div>
	{/each}
	<button type="button" class="add-option-btn" on:click={() => dispatch('addOption')}>
		+ Adicionar opção
	</button>
</div>

<style>
	.options-editor {
		display: grid;
		gap: 0.25rem;
	}

	.option-row {
		display: grid;
		grid-template-columns: 1fr 1fr 1.75rem;
		gap: 0.25rem;
		align-items: center;
	}

	.option-row input {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 6px;
		padding: 0.35rem 0.5rem;
		font-size: 0.82rem;
		font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.12s;
	}

	.option-row input:focus {
		border-color: var(--builder-primary, var(--color-primary-500, #324acb));
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--builder-primary, #324acb) 15%, transparent);
	}

	.remove-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		border-radius: 4px;
		padding: 0;
		width: 1.75rem;
		height: 1.75rem;
		font-size: 1rem;
		line-height: 1;
		transition: background 0.12s, color 0.12s;
	}

	.remove-btn:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent);
		color: var(--color-error, #dc2626);
	}

	.remove-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.add-option-btn {
		background: transparent;
		border: 1px dashed var(--border-color-default, #d1d5db);
		border-radius: 6px;
		padding: 0.3rem 0.5rem;
		font-size: 0.82rem;
		font-family: inherit;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		text-align: left;
		transition: border-color 0.12s, color 0.12s;
	}

	.add-option-btn:hover {
		border-color: var(--builder-primary, var(--color-primary-500, #324acb));
		color: var(--builder-primary, var(--color-primary-500, #324acb));
	}
</style>