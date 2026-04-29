<!-- src/lib/components/forms/FormBuilder.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { onMount } from 'svelte';
	import type {
		FormDefinition,
		FormFieldDefinition,
		FormFieldType,
		FormSection,
		FormTheme
	} from '$lib/types/forms';

	type Mode = 'create' | 'edit';
	interface BuilderInitialData {
		title?: string;
		description?: string;
		isPublic?: boolean;
		requiresAuth?: boolean;
		isActive?: boolean;
		definition?: FormDefinition;
	}

	export let mode: Mode = 'create';
	export let action = '?/create';
	export let submitLabel = 'Salvar formulário';
	export let pageTitle = 'Novo formulário';
	export let initialData: BuilderInitialData = {};
	export let serverError: string | undefined;

	const dispatch = createEventDispatcher<{ cancel: void }>();

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

	const DEFAULT_FIELDS: FormFieldDefinition[] = [
		{ id: 'field_name', name: 'name', type: 'text', label: 'Nome', required: true },
		{ id: 'field_email', name: 'email', type: 'email', label: 'E-mail', required: true }
	];

	function uid(prefix = 'field') {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
	}

	let title = initialData.title ?? '';
	let description = initialData.description ?? '';
	let accessType: 'public' | 'private' = initialData.isPublic ? 'public' : 'private';
	let isActive = initialData.isActive ?? true;
	let fields: FormFieldDefinition[] = initialData.definition?.fields?.length
		? structuredClone(initialData.definition.fields)
		: structuredClone(DEFAULT_FIELDS);
	let sections: FormSection[] = initialData.definition?.sections?.length
		? structuredClone(initialData.definition.sections)
		: [{ id: uid('section'), title: 'Página 1', order: 0, fields: [] }];
	let theme: FormTheme = {
		primaryColor: initialData.definition?.theme?.primaryColor ?? '#673ab7',
		backgroundColor: initialData.definition?.theme?.backgroundColor ?? '#ffffff',
		fontFamily: initialData.definition?.theme?.fontFamily ?? 'DM Sans',
		headerImage: initialData.definition?.theme?.headerImage ?? ''
	};
	let routeRules: Record<string, string> = {};
	let activeFieldId: string | null = null;
	let draggedFieldId: string | null = null;
	let dragOverIdx: number | null = null;
	let newFieldType: FormFieldType = 'text';
	let actionNotice = '';
	let actionNoticeTone: 'info' | 'success' = 'info';

	$: isPublic = accessType === 'public';
	$: requiresAuth = accessType === 'private';

	$: fieldById = new Map(fields.map((f) => [f.id, f]));

	$: sectionFieldMap = (() => {
		const used = new Set<string>();
		const result: FormSection[] = sections.map((section, idx) => {
			const sectionFields = (section.fields ?? [])
				.map((f) => fieldById.get(f.id) ?? f)
				.filter((f) => {
					if (used.has(f.id)) return false;
					used.add(f.id);
					return true;
				});
			return { ...section, order: idx, fields: sectionFields };
		});
		const leftovers = fields.filter((f) => !used.has(f.id));
		if (result.length === 0) {
			result.push({ id: uid('section'), title: 'Página 1', order: 0, fields: leftovers });
		} else if (leftovers.length) {
			result[0].fields = [...leftovers, ...result[0].fields];
		}
		return result;
	})();

	$: definitionJson = JSON.stringify({
		fields,
		sections: sectionFieldMap.map((section) => ({
			...section,
			rules: (section.rules ?? []).filter((rule) => rule.fieldId && rule.targetSectionId)
		})),
		theme
	});

	const hasOptions = (type: FormFieldType) => ['select', 'radio', 'checkbox'].includes(type);

	function setFieldType(fieldId: string, type: FormFieldType) {
		fields = fields.map((f) => {
			if (f.id !== fieldId) return f;
			if (!hasOptions(type)) return { ...f, type, options: undefined };
			return {
				...f,
				type,
				options: f.options?.length ? f.options : [{ label: 'Opção 1', value: 'opcao_1' }]
			};
		});
	}

	function addField(type: FormFieldType = newFieldType) {
		addFieldAt(fields.length, type);
	}

	function addFieldAt(insertIdx: number, type: FormFieldType = newFieldType) {
		const id = uid();
		const newField = { id, name: id, type, label: 'Pergunta sem título', required: false } as FormFieldDefinition;
		const normalizedInsertIdx = Math.max(0, Math.min(insertIdx, fields.length));
		fields = [...fields.slice(0, normalizedInsertIdx), newField, ...fields.slice(normalizedInsertIdx)];
		if (sections.length > 0) {
			sections = sections.map((s, idx) =>
				idx === sections.length - 1
					? { ...s, fields: [...s.fields.slice(0, normalizedInsertIdx), { id } as FormFieldDefinition, ...s.fields.slice(normalizedInsertIdx)] }
					: s
			);
		}
		activeFieldId = id;
		announceAction('Pergunta adicionada.', 'success');
	}

	function duplicateField(fieldId: string) {
		const idx = fields.findIndex((f) => f.id === fieldId);
		if (idx < 0) return;
		const source = fields[idx];
		const id = uid();
		const copy = { ...source, id, name: id, label: `${source.label} (cópia)` };
		fields = [...fields.slice(0, idx + 1), copy, ...fields.slice(idx + 1)];
		sections = sections.map((s) => {
			const found = s.fields.findIndex((f) => f.id === fieldId);
			if (found < 0) return s;
			const next = [...s.fields];
			next.splice(found + 1, 0, copy);
			return { ...s, fields: next };
		});
		activeFieldId = id;
		announceAction('Pergunta duplicada.', 'success');
	}

	function removeField(fieldId: string) {
		if (fields.length <= 1) return;
		fields = fields.filter((f) => f.id !== fieldId);
		sections = sections.map((s) => ({ ...s, fields: s.fields.filter((f) => f.id !== fieldId), rules: (s.rules ?? []).filter((r) => r.fieldId !== fieldId) }));
		if (activeFieldId === fieldId) activeFieldId = null;
		announceAction('Pergunta removida.', 'info');
	}

	function moveField(fromIdx: number, dir: -1 | 1) {
		const toIdx = fromIdx + dir;
		if (toIdx < 0 || toIdx >= fields.length) return;
		const next = [...fields];
		[next[fromIdx], next[toIdx]] = [next[toIdx], next[fromIdx]];
		fields = next;
		activeFieldId = next[toIdx].id;
		announceAction(`Pergunta movida para posição ${toIdx + 1}.`, 'info');
	}

	function handleDragStart(event: DragEvent, fieldId: string) {
		draggedFieldId = fieldId;
		event.dataTransfer?.setData('text/plain', fieldId);
	}
	function handleDragOver(event: DragEvent, idx: number) {
		event.preventDefault();
		dragOverIdx = idx;
	}
	function handleDrop(event: DragEvent, insertIdx: number) {
		event.preventDefault();
		if (!draggedFieldId) return;
		const from = fields.findIndex((f) => f.id === draggedFieldId);
		if (from < 0) return;
		if (from === insertIdx || from + 1 === insertIdx) {
			draggedFieldId = null;
			dragOverIdx = null;
			return;
		}
		const next = [...fields];
		const [dragged] = next.splice(from, 1);
		const normalizedInsertIdx = insertIdx > from ? insertIdx - 1 : insertIdx;
		next.splice(normalizedInsertIdx, 0, dragged);
		fields = next;
		activeFieldId = dragged.id;
		announceAction(`Pergunta movida para posição ${normalizedInsertIdx + 1}.`, 'info');
		draggedFieldId = null;
		dragOverIdx = null;
	}
	function handleDragEnd() {
		draggedFieldId = null;
		dragOverIdx = null;
	}

	function addOption(fieldId: string) {
		fields = fields.map((f) =>
			f.id !== fieldId
				? f
				: {
						...f,
						options: [...(f.options ?? []), { label: `Opção ${(f.options?.length ?? 0) + 1}`, value: `opcao_${(f.options?.length ?? 0) + 1}` }]
					}
		);
	}
	function removeOption(fieldId: string, idx: number) {
		fields = fields.map((f) => (f.id !== fieldId ? f : { ...f, options: (f.options ?? []).filter((_, i) => i !== idx) }));
	}
	function addSection() {
		sections = [...sections, { id: uid('section'), title: `Página ${sections.length + 1}`, order: sections.length, fields: [] }];
	}

	function announceAction(message: string, tone: 'info' | 'success' = 'info') {
		actionNotice = message;
		actionNoticeTone = tone;
	}

	function debugLog(hypothesisId: string, message: string, data: Record<string, unknown>) {
		fetch('http://127.0.0.1:7477/ingest/af9bfc40-c6c8-46e5-92bf-a9fc7d0fbb7b', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '76c4e3' },
			body: JSON.stringify({
				sessionId: '76c4e3',
				runId: 'pre-fix',
				hypothesisId,
				location: 'src/lib/components/forms/FormBuilder.svelte:onMount',
				message,
				data,
				timestamp: Date.now()
			})
		}).catch(() => {});
	}

	onMount(() => {
		const layout = document.querySelector('.builder-layout') as HTMLElement | null;
		const settings = document.querySelector('.settings-panel') as HTMLElement | null;
		const firstCard = document.querySelector('.field-card') as HTMLElement | null;
		const hasComponentStyle = Array.from(document.querySelectorAll('style')).some((node) =>
			(node.textContent ?? '').includes('.builder-layout')
		);
		const layoutStyle = layout ? getComputedStyle(layout) : null;
		const settingsStyle = settings ? getComputedStyle(settings) : null;
		const cardStyle = firstCard ? getComputedStyle(firstCard) : null;

		// #region agent log
		debugLog('H1', 'Component style tag availability', {
			hasComponentStyle,
			styleTagCount: document.querySelectorAll('style').length,
			styleSheetCount: document.styleSheets.length
		});
		// #endregion

		// #region agent log
		debugLog('H2', 'Builder layout computed styles', {
			layoutFound: Boolean(layout),
			display: layoutStyle?.display,
			gridTemplateColumns: layoutStyle?.gridTemplateColumns,
			gap: layoutStyle?.gap
		});
		// #endregion

		// #region agent log
		debugLog('H3', 'Settings panel computed styles', {
			settingsFound: Boolean(settings),
			display: settingsStyle?.display,
			position: settingsStyle?.position,
			backgroundColor: settingsStyle?.backgroundColor
		});
		// #endregion

		// #region agent log
		debugLog('H4', 'Field card computed styles and viewport', {
			fieldCardFound: Boolean(firstCard),
			fieldCardDisplay: cardStyle?.display,
			fieldCardGridTemplateColumns: cardStyle?.gridTemplateColumns,
			fieldCardBackgroundColor: cardStyle?.backgroundColor,
			windowWidth: window.innerWidth
		});
		// #endregion
	});
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<div class="builder" style="--builder-primary:{theme.primaryColor || 'var(--color-primary-700, #324acb)'};">
	<header class="builder-header">
		<button class="back-btn" type="button" on:click={() => dispatch('cancel')}>Formulários</button>
		<strong>{pageTitle}</strong>
		<div>
			{#if serverError}<span class="header-error">{serverError}</span>{/if}
			<button class="save-btn" type="submit" form="builder-form">{submitLabel}</button>
		</div>
	</header>
	<div class="builder-layout">
		<main class="canvas-col">
			<form id="builder-form" method="POST" {action}>
				<input type="hidden" name="definition" value={definitionJson} />
				<input type="hidden" name="isPublic" value={String(isPublic)} />
				<input type="hidden" name="requiresAuth" value={String(requiresAuth)} />
				{#if mode === 'edit'}
					<input type="hidden" name="isActive" value={String(isActive)} />
				{/if}
				<input class="meta-title" type="text" name="title" bind:value={title} placeholder="Título do formulário" required />
				<textarea name="description" bind:value={description} rows="2" placeholder="Descrição"></textarea>
				{#if actionNotice}
					<div class="action-notice" class:is-success={actionNoticeTone === 'success'}>{actionNotice}</div>
				{/if}

				<div class="drop-slot" class:is-active={dragOverIdx === 0} on:dragover={(e) => handleDragOver(e, 0)} on:drop={(e) => handleDrop(e, 0)}></div>
				{#each fields as field, idx (field.id)}
					<div
						class="field-card"
						class:is-active={activeFieldId === field.id}
						on:click={() => (activeFieldId = field.id)}
						on:keydown={(e) => {
							if (e.altKey && e.key === 'ArrowUp') {
								e.preventDefault();
								moveField(idx, -1);
							}
							if (e.altKey && e.key === 'ArrowDown') {
								e.preventDefault();
								moveField(idx, 1);
							}
						}}
						role="group"
						tabindex="0"
						aria-label={`Pergunta ${idx + 1}`}
					>
						<button class="drag-handle" draggable="true" type="button" title="Arrastar pergunta" on:dragstart={(e) => handleDragStart(e, field.id)} on:dragend={handleDragEnd}>
							<span>⋮⋮</span>
						</button>
						<div class="field-main">
							<div class="field-heading">
								<span>Pergunta {idx + 1}</span>
								<label><input type="checkbox" bind:checked={field.required} />Obrigatório</label>
							</div>
							<input bind:value={field.label} placeholder="Pergunta sem título" />
							<select value={field.type} on:change={(e) => setFieldType(field.id, (e.target as HTMLSelectElement).value as FormFieldType)}>
								{#each FIELD_TYPES as type}<option value={type.type}>{type.label}</option>{/each}
							</select>
							<details class="field-details" open={activeFieldId === field.id}>
								<summary>Configurações da pergunta</summary>
								{#if !hasOptions(field.type)}
									<input bind:value={field.placeholder} placeholder="Texto de ajuda" />
								{/if}
								{#if hasOptions(field.type)}
									{#each field.options ?? [] as option, optIdx}
										<div class="option-row">
											<input aria-label="Rótulo da opção" value={option.label} on:input={(e) => (field.options![optIdx].label = (e.target as HTMLInputElement).value)} />
											<input aria-label="Valor da opção" value={option.value} on:input={(e) => (field.options![optIdx].value = (e.target as HTMLInputElement).value)} />
											<button type="button" on:click={() => removeOption(field.id, optIdx)} disabled={(field.options?.length ?? 0) <= 1}>x</button>
										</div>
									{/each}
									<button type="button" on:click={() => addOption(field.id)}>Adicionar opção</button>
								{/if}
							</details>
							<div class="field-actions">
								<div>
									<button type="button" on:click={() => moveField(idx, -1)} disabled={idx === 0}>↑</button>
									<button type="button" on:click={() => moveField(idx, 1)} disabled={idx === fields.length - 1}>↓</button>
									<button type="button" on:click={() => duplicateField(field.id)}>Duplicar</button>
									<button type="button" on:click={() => removeField(field.id)} disabled={fields.length <= 1}>Excluir</button>
								</div>
								<button type="button" on:click={() => addFieldAt(idx + 1)}>+ abaixo</button>
							</div>
						</div>
					</div>
					<div class="drop-slot" class:is-active={dragOverIdx === idx + 1} on:dragover={(e) => handleDragOver(e, idx + 1)} on:drop={(e) => handleDrop(e, idx + 1)}></div>
				{/each}
				<div class="add-question-row">
					<select bind:value={newFieldType} aria-label="Tipo da nova pergunta">
						{#each FIELD_TYPES as type}<option value={type.type}>{type.label}</option>{/each}
					</select>
					<button type="button" class="add-field-btn" on:click={() => addField(newFieldType)}>Adicionar pergunta</button>
				</div>
			</form>
		</main>
		<aside class="settings-panel">
			<h3>Configurações</h3>
			<label><input type="radio" name="accessTypeGroup" value="public" bind:group={accessType} /> Público</label>
			<label><input type="radio" name="accessTypeGroup" value="private" bind:group={accessType} /> Privado</label>
			{#if mode === 'edit'}
				<label><input type="radio" name="isActiveGroup" value={true} bind:group={isActive} /> Ativo</label>
				<label><input type="radio" name="isActiveGroup" value={false} bind:group={isActive} /> Inativo</label>
			{/if}
			<hr />
			<h4>Tema</h4>
			<label>Cor primária <input type="color" bind:value={theme.primaryColor} /></label>
			<label>Cor de fundo <input type="color" bind:value={theme.backgroundColor} /></label>
			<label>Fonte <input type="text" bind:value={theme.fontFamily} /></label>
			<label>Imagem de capa (URL) <input type="url" bind:value={theme.headerImage} /></label>
			<hr />
			<h4>Sessões</h4>
			{#each sectionFieldMap as section, sectionIdx (section.id)}
				<div class="section-card">
					<input bind:value={section.title} />
					{#if sectionIdx < sectionFieldMap.length - 1}
						<label>Se resposta = então ir para:
							<select bind:value={routeRules[section.id]}>
								<option value="">Próxima página</option>
								{#each sectionFieldMap as target}
									{#if target.id !== section.id}<option value={target.id}>{target.title}</option>{/if}
								{/each}
							</select>
						</label>
					{/if}
				</div>
			{/each}
			<button type="button" on:click={addSection}>Adicionar sessão</button>
		</aside>
	</div>
</div>

<style>
	.builder {
		min-height: 100vh;
		background: var(--background-color-card, #ffffff);
		padding: 2rem 2rem 3rem;
		font-family: var(--font-family-sans, 'DM Sans', system-ui, sans-serif);
		color: var(--text-color-primary, #111827);
	}

	.builder-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
		background: var(--background-color-card, #ffffff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-top: 8px solid var(--builder-primary);
		border-radius: 12px;
		padding: 1rem 1.1rem;
	}

	.builder-header strong {
		font-size: 1rem;
		font-weight: 600;
	}

	.builder-header > div {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.builder-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 320px;
		gap: 1rem;
		align-items: start;
	}

	.canvas-col form {
		display: grid;
		gap: 0.75rem;
		background: var(--background-color-card, #ffffff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		padding: 1.1rem;
	}

	.meta-title,
	textarea,
	.field-main input,
	.field-main select,
	.option-row input,
	.settings-panel input,
	.settings-panel select {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 8px;
		padding: 0.55rem 0.7rem;
		font-size: 0.92rem;
		font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none;
		transition: border-color 0.12s, box-shadow 0.12s;
		box-sizing: border-box;
	}

	.meta-title:focus,
	textarea:focus,
	.field-main input:focus,
	.field-main select:focus,
	.option-row input:focus,
	.settings-panel input:focus,
	.settings-panel select:focus {
		border-color: var(--builder-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--builder-primary) 18%, transparent);
	}

	.meta-title {
		font-size: 1.05rem;
		font-weight: 600;
		background: var(--background-color-card, #fff);
	}

	textarea {
		resize: vertical;
		min-height: 72px;
	}

	.field-card {
		display: grid;
		grid-template-columns: 2rem 1fr;
		gap: 0.75rem;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 10px;
		padding: 0.75rem;
		background: var(--background-color-card, #ffffff);
	}

	.field-card.is-active {
		border-left: 4px solid var(--builder-primary);
		padding-left: calc(0.75rem - 3px);
		box-shadow: 0 1px 2px rgba(60, 64, 67, 0.15);
	}

	.drag-handle {
		border: none;
		background: transparent;
		color: #6b7280;
		cursor: grab;
		border-radius: 6px;
	}

	.drag-handle:hover {
		background: #f3f4f6;
	}

	.drag-handle:active {
		cursor: grabbing;
	}

	.field-main {
		display: grid;
		gap: 0.5rem;
	}

	.field-heading {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.5rem;
		font-size: 0.82rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.field-heading label {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
	}

	.field-details {
		display: grid;
		gap: 0.45rem;
		background: var(--background-color-subtle, #f8fafc);
		border: 1px solid var(--border-color-subtle, #e5e7eb);
		border-radius: 8px;
		padding: 0.45rem 0.55rem;
	}

	.field-details summary {
		cursor: pointer;
		font-size: 0.82rem;
		font-weight: 600;
		color: var(--text-color-secondary, #4b5563);
	}

	.field-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}

	.field-actions > div {
		display: flex;
		gap: 0.35rem;
		flex-wrap: wrap;
	}

	.option-row {
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 0.25rem;
	}

	.drop-slot {
		height: 10px;
		border-radius: 999px;
		transition: background-color 0.12s ease;
	}

	.drop-slot.is-active {
		background: color-mix(in srgb, var(--builder-primary) 32%, transparent);
	}

	.action-notice {
		font-size: 0.82rem;
		padding: 0.45rem 0.55rem;
		border-radius: 8px;
		background: var(--background-color-subtle, #f8fafc);
		border: 1px solid var(--border-color-subtle, #e5e7eb);
		color: var(--text-color-secondary, #4b5563);
	}

	.action-notice.is-success {
		background: color-mix(in srgb, var(--color-success, #16a34a) 12%, transparent);
		border-color: color-mix(in srgb, var(--color-success, #16a34a) 32%, transparent);
	}

	.settings-panel {
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 10px;
		padding: 0.85rem;
		background: var(--background-color-card, #ffffff);
		display: grid;
		gap: 0.55rem;
		align-content: start;
		position: sticky;
		top: 1rem;
	}

	.settings-panel h3,
	.settings-panel h4 {
		margin: 0.2rem 0;
	}

	.settings-panel label {
		display: grid;
		gap: 0.35rem;
		font-size: 0.88rem;
	}

	.settings-panel label:has(input[type='radio']) {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.section-card {
		border: 1px dashed #d1d5db;
		border-radius: 8px;
		padding: 0.5rem;
		display: grid;
		gap: 0.4rem;
	}

	button {
		border: 1px solid transparent;
		border-radius: 8px;
		font-size: 0.84rem;
		font-family: inherit;
		padding: 0.45rem 0.7rem;
		cursor: pointer;
		background: #f3f4f6;
		color: #111827;
	}

	button:hover {
		background: #e5e7eb;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.save-btn {
		background: var(--builder-primary);
		color: #fff;
	}

	.save-btn:hover {
		background: color-mix(in srgb, var(--builder-primary) 88%, black);
	}

	.back-btn {
		background: transparent;
		border-color: var(--border-color-default, #d1d5db);
	}

	.add-field-btn {
		background: color-mix(in srgb, var(--builder-primary) 10%, #fff);
		border-color: color-mix(in srgb, var(--builder-primary) 30%, #fff);
		color: color-mix(in srgb, var(--builder-primary) 85%, black);
		font-weight: 600;
	}

	.add-question-row {
		display: grid;
		grid-template-columns: minmax(180px, 260px) auto;
		gap: 0.6rem;
		align-items: center;
		margin-top: 0.3rem;
	}

	.header-error {
		font-size: 0.82rem;
		color: #b91c1c;
	}

	@media (max-width: 1000px) {
		.builder {
			padding: 1rem;
		}

		.builder-layout {
			grid-template-columns: 1fr;
		}

		.settings-panel {
			position: static;
		}
	}
</style>
