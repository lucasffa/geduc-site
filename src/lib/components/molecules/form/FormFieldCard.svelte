<!-- src/lib/components/molecules/FormFieldCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormFieldDefinition, FormFieldType } from '$lib/types/forms';
	import FormFieldOptionsEditor from './FormFieldOptionsEditor.svelte';

	export let field: FormFieldDefinition;
	export let index: number;
	export let totalFields: number;
	export let isActive: boolean = false;

	const FIELD_TYPES: { type: FormFieldType; label: string }[] = [
		{ type: 'text', label: 'Texto curto' },
		{ type: 'textarea', label: 'Texto longo' },
		{ type: 'email', label: 'E-mail' },
		{ type: 'number', label: 'Número' },
		{ type: 'tel', label: 'Telefone' },
		{ type: 'url', label: 'URL' },
		{ type: 'date', label: 'Data' },
		{ type: 'select', label: 'Lista suspensa' },
		{ type: 'radio', label: 'Múltipla escolha' },
		{ type: 'checkbox', label: 'Caixas de seleção' },
		{ type: 'file', label: 'Arquivo' },
		{ type: 'rating', label: 'Classificação' },
		{ type: 'map', label: 'Mapa' }
	];

	$: hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

	const dispatch = createEventDispatcher<{
		activate: void;
		move: { dir: -1 | 1 };
		duplicate: void;
		remove: void;
		addBelow: void;
		dragstart: { fieldId: string };
		dragend: void;
		fieldChange: Partial<FormFieldDefinition>;
		optionAdd: void;
		optionRemove: { idx: number };
		optionChange: { idx: number; key: 'label' | 'value'; val: string };
	}>();

	function handleTypeChange(e: Event) {
		const type = (e.target as HTMLSelectElement).value as FormFieldType;
		const needsOptions = ['select', 'radio', 'checkbox'].includes(type);
		dispatch('fieldChange', {
			type,
			options: needsOptions
				? (field.options?.length ? field.options : [{ label: 'Opção 1', value: 'opcao_1' }])
				: undefined
		});
	}
</script>

<div
	class="field-card"
	class:is-active={isActive}
	on:click={() => dispatch('activate')}
	on:keydown={(e) => {
		if (e.altKey && e.key === 'ArrowUp') { e.preventDefault(); dispatch('move', { dir: -1 }); }
		if (e.altKey && e.key === 'ArrowDown') { e.preventDefault(); dispatch('move', { dir: 1 }); }
	}}
	role="group"
	tabindex="0"
	aria-label={`Pergunta ${index + 1}`}
>
	<!-- Drag handle -->
	<button
		class="drag-handle"
		draggable="true"
		type="button"
		title="Arrastar para reordenar"
		on:dragstart={(e) => {
			e.dataTransfer?.setData('text/plain', field.id);
			dispatch('dragstart', { fieldId: field.id });
		}}
		on:dragend={() => dispatch('dragend')}
	>
		<svg width="10" height="16" viewBox="0 0 10 16" fill="currentColor">
			<circle cx="2" cy="2" r="1.5"/>
			<circle cx="8" cy="2" r="1.5"/>
			<circle cx="2" cy="8" r="1.5"/>
			<circle cx="8" cy="8" r="1.5"/>
			<circle cx="2" cy="14" r="1.5"/>
			<circle cx="8" cy="14" r="1.5"/>
		</svg>
	</button>

	<div class="field-main">
		<!-- Heading row -->
		<div class="field-heading">
			<span class="field-index">Campo {index + 1}</span>
			<label class="required-toggle">
				<input
					type="checkbox"
					checked={field.required}
					on:change={(e) =>
						dispatch('fieldChange', { required: (e.target as HTMLInputElement).checked })}
				/>
				Obrigatório
			</label>
		</div>

		<!-- Label input -->
		<input
			class="label-input"
			value={field.label}
			placeholder="Título da pergunta"
			on:input={(e) => dispatch('fieldChange', { label: (e.target as HTMLInputElement).value })}
		/>

		<!-- Type selector -->
		<select value={field.type} on:change={handleTypeChange}>
			{#each FIELD_TYPES as ft}
				<option value={ft.type}>{ft.label}</option>
			{/each}
		</select>

		<!-- Expandable settings -->
		<details class="field-details" open={isActive}>
			<summary>Configurações</summary>

			{#if !hasOptions}
				<input
					value={field.placeholder ?? ''}
					placeholder="Texto de ajuda (placeholder)"
					on:input={(e) =>
						dispatch('fieldChange', { placeholder: (e.target as HTMLInputElement).value })}
				/>
			{/if}

			{#if hasOptions}
				<FormFieldOptionsEditor
					options={field.options ?? []}
					on:addOption={() => dispatch('optionAdd')}
					on:removeOption={(e) => dispatch('optionRemove', e.detail)}
					on:optionChange={(e) => dispatch('optionChange', e.detail)}
				/>
			{/if}
		</details>

		<!-- Actions row -->
		<div class="field-actions">
			<div class="field-actions-left">
				<button
					type="button"
					on:click|stopPropagation={() => dispatch('move', { dir: -1 })}
					disabled={index === 0}
					title="Mover para cima (Alt+↑)"
				>↑</button>
				<button
					type="button"
					on:click|stopPropagation={() => dispatch('move', { dir: 1 })}
					disabled={index === totalFields - 1}
					title="Mover para baixo (Alt+↓)"
				>↓</button>
				<button type="button" on:click|stopPropagation={() => dispatch('duplicate')}>Duplicar</button>
				<button
					type="button"
					class="btn-remove"
					on:click|stopPropagation={() => dispatch('remove')}
					disabled={totalFields <= 1}
				>Excluir</button>
			</div>
			<button
				type="button"
				class="btn-add-below"
				on:click|stopPropagation={() => dispatch('addBelow')}
			>+ abaixo</button>
		</div>
	</div>
</div>

<style>
	.field-card {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.75rem;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-left: 3px solid transparent;
		border-radius: 10px;
		padding: 0.75rem 0.75rem 0.75rem 0.5rem;
		background: var(--background-color-card, #ffffff);
		cursor: pointer;
		transition: border-color 0.12s, box-shadow 0.12s;
		outline: none;
	}

	.field-card:focus-visible {
		box-shadow: 0 0 0 2px var(--builder-primary, var(--color-primary-500, #324acb));
	}

	.field-card.is-active {
		border-left-color: var(--builder-primary, var(--color-primary-500, #324acb));
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.drag-handle {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding-top: 0.3rem;
		border: none;
		background: transparent;
		color: var(--text-color-secondary, #9ca3af);
		cursor: grab;
		border-radius: 6px;
		width: 2rem;
		transition: color 0.1s, background 0.1s;
	}

	.drag-handle:hover {
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--text-color-primary, #6b7280);
	}

	.drag-handle:active { cursor: grabbing; }

	.field-main {
		display: grid;
		gap: 0.5rem;
	}

	.field-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
	}

	.field-index {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-color-secondary, #9ca3af);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.required-toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: 0.82rem;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		user-select: none;
	}

	.label-input,
	.field-main select {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 8px;
		padding: 0.5rem 0.65rem;
		font-size: 0.9rem;
		font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none;
		transition: border-color 0.12s, box-shadow 0.12s;
		box-sizing: border-box;
	}

	.label-input:focus,
	.field-main select:focus {
		border-color: var(--builder-primary, var(--color-primary-500, #324acb));
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--builder-primary, var(--color-primary-500, #324acb)) 15%, transparent);
	}

	.label-input {
		font-size: 0.95rem;
		font-weight: 500;
	}

	.field-details {
		background: var(--background-color-subtle, #f8fafc);
		border: 1px solid var(--border-color-subtle, #e5e7eb);
		border-radius: 8px;
		padding: 0.5rem 0.65rem;
		display: grid;
		gap: 0.45rem;
	}

	.field-details summary {
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 600;
		color: var(--text-color-secondary, #6b7280);
		user-select: none;
		letter-spacing: 0.02em;
	}

	.field-details input {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 6px;
		padding: 0.4rem 0.55rem;
		font-size: 0.85rem;
		font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none;
		box-sizing: border-box;
		transition: border-color 0.12s;
	}

	.field-details input:focus {
		border-color: var(--builder-primary, var(--color-primary-500, #324acb));
	}

	.field-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.field-actions-left {
		display: flex;
		gap: 0.3rem;
		flex-wrap: wrap;
	}

	button {
		border: 1px solid transparent;
		border-radius: 6px;
		font-size: 0.8rem;
		font-family: inherit;
		padding: 0.3rem 0.55rem;
		cursor: pointer;
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--text-color-primary, #374151);
		transition: background 0.1s;
		line-height: 1.4;
	}

	button:hover:not(:disabled) {
		background: var(--border-color-default, #e5e7eb);
	}

	button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.btn-remove {
		background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
		color: var(--color-error, #dc2626);
		border-color: color-mix(in srgb, var(--color-error, #ef4444) 18%, transparent);
	}

	.btn-remove:hover:not(:disabled) {
		background: color-mix(in srgb, var(--color-error, #ef4444) 15%, transparent);
	}

	.btn-add-below {
		background: color-mix(in srgb, var(--builder-primary, var(--color-primary-500, #324acb)) 8%, #fff);
		border-color: color-mix(
			in srgb,
			var(--builder-primary, var(--color-primary-500, #324acb)) 22%,
			transparent
		);
		color: color-mix(in srgb, var(--builder-primary, var(--color-primary-500, #324acb)) 85%, black);
		font-weight: 600;
	}

	.btn-add-below:hover {
		background: color-mix(
			in srgb,
			var(--builder-primary, var(--color-primary-500, #324acb)) 14%,
			#fff
		);
	}
</style>