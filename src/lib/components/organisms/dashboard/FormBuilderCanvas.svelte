<!-- src/lib/components/organisms/FormBuilderCanvas.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormFieldDefinition, FormFieldType, FormSection } from '$lib/types/forms';
	import FormFieldCard from '$lib/components/molecules/form/FormFieldCard.svelte';

	// Flat fields (data + global index), sections for grouping display
	export let fields: FormFieldDefinition[];
	export let sectionFieldMap: FormSection[];
	export let title: string;
	export let description: string;
	export let activeFieldId: string | null;
	export let draggedFieldId: string | null;
	export let dragOverSectionIdx: number | null;
	export let dragOverFieldIdx: number | null;
	export let newFieldType: FormFieldType;
	export let actionNotice: string = '';
	export let actionNoticeTone: 'info' | 'success' = 'info';

	// Form submission hidden props
	export let formAction: string;
	export let mode: 'create' | 'edit';
	export let definitionJson: string;
	export let isPublic: boolean;
	export let requiresAuth: boolean;
	export let isActive: boolean;

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

	const dispatch = createEventDispatcher<{
		titleChange: { value: string };
		descriptionChange: { value: string };
		activateField: { fieldId: string };
		// Section-aware move: moves field within its section
		moveFieldInSection: { sectionIdx: number; fieldIdx: number; dir: -1 | 1 };
		duplicateField: { fieldId: string };
		removeField: { fieldId: string };
		// Section-aware add
		addFieldToSection: { sectionIdx: number; type: FormFieldType; afterFieldId?: string };
		fieldChange: { fieldId: string; changes: Partial<FormFieldDefinition> };
		optionAdd: { fieldId: string };
		optionRemove: { fieldId: string; idx: number };
		optionChange: { fieldId: string; idx: number; key: 'label' | 'value'; val: string };
		dragstart: { fieldId: string; sectionIdx: number };
		dragover: { sectionIdx: number; fieldIdx: number };
		drop: { targetSectionIdx: number; targetFieldIdx: number };
		dragend: void;
		newFieldTypeChange: { type: FormFieldType };
	}>();

	// Global field index (for isFirst/isLast checks across all sections)
	function globalIdx(fieldId: string): number {
		return fields.findIndex((f) => f.id === fieldId);
	}

	// Whether drop zone is active
	function isDropActive(sIdx: number, fIdx: number) {
		return dragOverSectionIdx === sIdx && dragOverFieldIdx === fIdx;
	}
</script>

<main class="canvas">
	<form id="builder-form" method="POST" action={formAction}>
		<!-- Hidden state -->
		<input type="hidden" name="definition" value={definitionJson} />
		<input type="hidden" name="isPublic" value={String(isPublic)} />
		<input type="hidden" name="requiresAuth" value={String(requiresAuth)} />
		{#if mode === 'edit'}
			<input type="hidden" name="isActive" value={String(isActive)} />
		{/if}

		<!-- Form metadata -->
		<div class="meta-block">
			<input
				class="meta-title"
				type="text"
				name="title"
				value={title}
				placeholder="Título do formulário"
				required
				on:input={(e) => dispatch('titleChange', { value: (e.target as HTMLInputElement).value })}
			/>
			<textarea
				class="meta-desc"
				name="description"
				rows={2}
				placeholder="Descrição opcional…"
				on:input={(e) => dispatch('descriptionChange', { value: (e.target as HTMLTextAreaElement).value })}
			>{description}</textarea>
		</div>

		<!-- Feedback banner -->
		{#if actionNotice}
			<div class="notice" class:notice-success={actionNoticeTone === 'success'}
				role="status" aria-live="polite">
				{#if actionNoticeTone === 'success'}
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
						<polyline points="20 6 9 17 4 12"/>
					</svg>
				{/if}
				{actionNotice}
			</div>
		{/if}

		<!-- Sections + fields -->
		{#each sectionFieldMap as section, sIdx (section.id)}
			<div class="section-group">
				<!-- Section header -->
				<div class="section-header">
					<div class="section-header-left">
						<span class="section-pill">
							<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
								<polyline points="14 2 14 8 20 8"/>
							</svg>
							Página {sIdx + 1}
						</span>
						<span class="section-title-display">{section.title}</span>
					</div>
					<span class="section-field-count">
						{section.fields.length} campo{section.fields.length !== 1 ? 's' : ''}
					</span>
				</div>

				<!-- Drop zone before first field in section -->
				<div
					class="drop-slot"
					class:is-active={isDropActive(sIdx, 0)}
					on:dragover|preventDefault={() => dispatch('dragover', { sectionIdx: sIdx, fieldIdx: 0 })}
					on:drop|preventDefault={() => dispatch('drop', { targetSectionIdx: sIdx, targetFieldIdx: 0 })}
				/>

				<!-- Fields in this section -->
				{#if section.fields.length === 0}
					<div class="section-empty">
						<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity=".4">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
							<line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
						</svg>
						<span>Nenhum campo nesta página</span>
					</div>
				{:else}
					{#each section.fields as field, fIdx (field.id)}
						{@const gIdx = globalIdx(field.id)}
						<FormFieldCard
							{field}
							index={gIdx}
							totalFields={fields.length}
							isActive={activeFieldId === field.id}

							on:activate={() => dispatch('activateField', { fieldId: field.id })}

							on:move={(e: CustomEvent<{ dir: -1 | 1 }>) =>
								dispatch('moveFieldInSection', {
									sectionIdx: sIdx,
									fieldIdx: fIdx,
									dir: e.detail.dir
								})
							}

							on:duplicate={() => dispatch('duplicateField', { fieldId: field.id })}
							on:remove={() => dispatch('removeField', { fieldId: field.id })}

							on:addBelow={() =>
								dispatch('addFieldToSection', {
									sectionIdx: sIdx,
									type: newFieldType,
									afterFieldId: field.id
								})
							}

							on:dragstart={(e: CustomEvent<{ fieldId: string }>) =>
								dispatch('dragstart', {
									fieldId: e.detail.fieldId,
									sectionIdx: sIdx
								})
							}

							on:dragend={() => dispatch('dragend')}

							on:fieldChange={(e: CustomEvent<Partial<FormFieldDefinition>>) =>
								dispatch('fieldChange', {
									fieldId: field.id,
									changes: e.detail
								})
							}

							on:optionAdd={() => dispatch('optionAdd', { fieldId: field.id })}

							on:optionRemove={(e: CustomEvent<{ idx: number }>) =>
								dispatch('optionRemove', {
									fieldId: field.id,
									idx: e.detail.idx
								})
							}

							on:optionChange={(e: CustomEvent<{ idx: number; key: 'label' | 'value'; val: string }>) =>
								dispatch('optionChange', {
									fieldId: field.id,
									idx: e.detail.idx,
									key: e.detail.key,
									val: e.detail.val
								})
							}
						/>

						<!-- Drop zone after each field -->
						<div
							class="drop-slot"
							class:is-active={isDropActive(sIdx, fIdx + 1)}
							on:dragover|preventDefault={() => dispatch('dragover', { sectionIdx: sIdx, fieldIdx: fIdx + 1 })}
							on:drop|preventDefault={() => dispatch('drop', { targetSectionIdx: sIdx, targetFieldIdx: fIdx + 1 })}
						/>
					{/each}
				{/if}

				<!-- Add to this section -->
				<div class="section-add-row">
					<select
						class="section-add-select"
						value={newFieldType}
						aria-label="Tipo de campo a adicionar"
						on:change={(e) => dispatch('newFieldTypeChange', {
							type: (e.target as HTMLSelectElement).value as FormFieldType
						})}
					>
						{#each FIELD_TYPES as ft}
							<option value={ft.type}>{ft.label}</option>
						{/each}
					</select>
					<button
						type="button"
						class="section-add-btn"
						on:click={() => dispatch('addFieldToSection', { sectionIdx: sIdx, type: newFieldType })}
					>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<path d="M12 5v14M5 12h14" />
						</svg>
						Adicionar à página {sIdx + 1}
					</button>
				</div>
			</div>
		{/each}
	</form>
</main>

<style>
	.canvas form {
		display: grid;
		gap: 0.75rem;
	}

	/* Meta block */
	.meta-block {
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		padding: 1.125rem;
		display: grid;
		gap: 0.6rem;
	}

	.meta-title,
	.meta-desc {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 8px;
		font-family: inherit;
		background: var(--background-color-subtle, #f9fafb);
		color: var(--text-color-primary, #111827);
		outline: none;
		transition: border-color 0.12s, box-shadow 0.12s, background 0.12s;
		box-sizing: border-box;
	}

	.meta-title:focus,
	.meta-desc:focus {
		border-color: var(--builder-primary, #324acb);
		background: var(--background-color-card, #fff);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--builder-primary, #324acb) 12%, transparent);
	}

	.meta-title {
		padding: 0.6rem 0.75rem;
		font-size: 1.125rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.meta-desc {
		padding: 0.55rem 0.75rem;
		font-size: 0.9rem;
		resize: vertical;
		min-height: 60px;
	}

	/* Notice */
	.notice {
		display: flex;
		align-items: center;
		gap: 0.4rem;
		font-size: 0.82rem;
		padding: 0.5rem 0.7rem;
		border-radius: 8px;
		background: var(--background-color-subtle, #f8fafc);
		border: 1px solid var(--border-color-default, #e5e7eb);
		color: var(--text-color-secondary, #4b5563);
	}

	.notice.notice-success {
		background: color-mix(in srgb, var(--color-success, #16a34a) 8%, transparent);
		border-color: color-mix(in srgb, var(--color-success, #16a34a) 25%, transparent);
		color: color-mix(in srgb, var(--color-success, #16a34a) 80%, black);
	}

	/* Section group */
	.section-group {
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		overflow: hidden;
	}

	.section-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.65rem 1rem;
		background: color-mix(in srgb, var(--builder-primary, #324acb) 4%, var(--background-color-subtle, #f9fafb));
		border-bottom: 1px solid color-mix(in srgb, var(--builder-primary, #324acb) 12%, var(--border-color-default, #e5e7eb));
	}

	.section-header-left {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-pill {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		background: var(--builder-primary, #324acb);
		color: white;
		font-size: 0.7rem;
		font-weight: 700;
		padding: 0.15rem 0.5rem;
		border-radius: 999px;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	.section-title-display {
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
	}

	.section-field-count {
		font-size: 0.75rem;
		color: var(--text-color-secondary, #9ca3af);
		white-space: nowrap;
	}

	/* Fields area */
	.section-empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.4rem;
		padding: 1.75rem 1rem;
		color: var(--text-color-secondary, #9ca3af);
		font-size: 0.84rem;
		text-align: center;
	}

	/* Drop zones */
	.drop-slot {
		height: 6px;
		margin: 0 0.75rem;
		border-radius: 999px;
		transition: height 0.12s, background 0.12s;
	}

	.drop-slot.is-active {
		height: 14px;
		background: color-mix(in srgb, var(--builder-primary, #324acb) 28%, transparent);
	}

	/* Section add row */
	.section-add-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.65rem 0.875rem;
		border-top: 1px dashed var(--border-color-default, #e5e7eb);
		background: var(--background-color-subtle, #f9fafb);
	}

	.section-add-select {
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 7px;
		padding: 0.38rem 0.55rem;
		font-size: 0.82rem;
		font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none;
		min-width: 140px;
		transition: border-color 0.12s;
	}

	.section-add-select:focus {
		border-color: var(--builder-primary, #324acb);
	}

	.section-add-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		border: 1px solid color-mix(in srgb, var(--builder-primary, #324acb) 30%, transparent);
		border-radius: 7px;
		padding: 0.38rem 0.7rem;
		font-size: 0.82rem;
		font-family: inherit;
		font-weight: 600;
		cursor: pointer;
		white-space: nowrap;
		background: color-mix(in srgb, var(--builder-primary, #324acb) 8%, #fff);
		color: color-mix(in srgb, var(--builder-primary, #324acb) 88%, black);
		transition: background 0.12s;
	}

	.section-add-btn:hover {
		background: color-mix(in srgb, var(--builder-primary, #324acb) 14%, #fff);
	}
</style>