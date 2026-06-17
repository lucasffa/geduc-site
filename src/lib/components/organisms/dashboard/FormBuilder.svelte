<!-- src/lib/components/organisms/dashboard/FormBuilder.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type {
		FormDefinition,
		FormFieldDefinition,
		FormFieldType,
		FormSection,
		FormTheme
	} from '$lib/types/forms';
	import FormBuilderCanvas from './FormBuilderCanvas.svelte';
	import FormBuilderSidebar from './FormBuilderSidebar.svelte';

	// ── Public API ───────────────────────────────────────────────────────────────
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
	/** Primary color from org settings — used as default for new forms */
	export let orgPrimaryColor: string = '#0000ff';
	/** Background color from org settings */
	export let orgBackgroundColor: string = '#ffffff';

	const dispatch = createEventDispatcher<{ cancel: void }>();

	// ── Helpers ──────────────────────────────────────────────────────────────────
	function uid(prefix = 'field') {
		return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
	}

	const DEFAULT_FIELDS: FormFieldDefinition[] = [
		{ id: 'field_name', name: 'name', type: 'text', label: 'Nome', required: true, placeholder: 'Ex: João Silva' },
		{ id: 'field_email', name: 'email', type: 'email', label: 'E-mail', required: true, placeholder: 'seu@email.com' }
	];

	// ── State ────────────────────────────────────────────────────────────────────
	let title = initialData.title ?? '';
	let description = initialData.description ?? '';
	let accessType: 'public' | 'private' | 'invitation' = (!initialData.isPublic && !initialData.requiresAuth && initialData.title) ? 'invitation' : (initialData.isPublic ? 'public' : 'private');
	let isActive = initialData.isActive ?? true;

	let fields: FormFieldDefinition[] = initialData.definition?.fields?.length
		? structuredClone(initialData.definition.fields)
		: structuredClone(DEFAULT_FIELDS);

	// Sections are the authoritative order: sections[i].fields = ordered id refs
	let sections: FormSection[] = initialData.definition?.sections?.length
		? structuredClone(initialData.definition.sections)
		: [{ id: uid('section'), title: 'Página 1', order: 0, fields: [] }];

	let theme: FormTheme = {
		primaryColor: initialData.definition?.theme?.primaryColor ?? orgPrimaryColor,
		backgroundColor: initialData.definition?.theme?.backgroundColor ?? orgBackgroundColor,
		fontFamily: initialData.definition?.theme?.fontFamily ?? 'DM Sans',
		headerImage: initialData.definition?.theme?.headerImage ?? ''
	};

	let activeFieldId: string | null = null;
	let draggedFieldId: string | null = null;
	let draggedFromSectionIdx: number | null = null;
	let dragOverSectionIdx: number | null = null;
	let dragOverFieldIdx: number | null = null;
	let newFieldType: FormFieldType = 'text';
	let actionNotice = '';
	let actionNoticeTone: 'info' | 'success' = 'info';

	// ── Derived ──────────────────────────────────────────────────────────────────
	$: isPublic = accessType === 'public';
	$: requiresAuth = accessType === 'private';

	$: fieldById = new Map(fields.map((f) => [f.id, f]));

	/**
	 * sectionFieldMap: sections with full field objects (not just ids).
	 * All fields not referenced by any section are placed in section 0 (safety net).
	 */
	$: sectionFieldMap = (() => {
		const used = new Set<string>();
		const result: FormSection[] = sections.map((section, idx) => {
			const sFields = (section.fields ?? [])
				.map((ref) => fieldById.get(ref.id))
				.filter((f): f is FormFieldDefinition => {
					if (!f || used.has(f.id)) return false;
					used.add(f.id);
					return true;
				});
			return { ...section, order: idx, fields: sFields };
		});
		// Safety net: any field not in any section goes to first section
		const orphans = fields.filter((f) => !used.has(f.id));
		if (result.length === 0) {
			result.push({ id: uid('section'), title: 'Página 1', order: 0, fields: orphans });
		} else if (orphans.length > 0) {
			result[0] = { ...result[0], fields: [...orphans, ...result[0].fields] };
		}
		return result;
	})();

	$: definitionJson = JSON.stringify({
		fields,
		sections: sectionFieldMap.map((s) => ({
			...s,
			rules: (s.rules ?? []).filter((r) => r.fieldId && r.targetSectionId)
		})),
		theme
	});

	// ── Feedback ─────────────────────────────────────────────────────────────────
	function announce(msg: string, tone: 'info' | 'success' = 'info') {
		actionNotice = msg;
		actionNoticeTone = tone;
	}

	// ── Section mutations ────────────────────────────────────────────────────────
	function addSection() {
		const newSection: FormSection = {
			id: uid('section'),
			title: `Página ${sections.length + 1}`,
			order: sections.length,
			fields: []
		};
		sections = [...sections, newSection];
		announce(`Página ${sections.length} criada.`, 'success');
	}

	function removeSection(sectionId: string) {
		if (sections.length <= 1) return;
		const section = sections.find((s) => s.id === sectionId);
		if (!section) return;

		// Move orphaned fields to previous/first section
		const orphanIds = (section.fields ?? []).map((f) => f.id);
		const targetIdx = sections.findIndex((s) => s.id !== sectionId);

		sections = sections
			.filter((s) => s.id !== sectionId)
			.map((s, i) =>
				i === Math.min(targetIdx, sections.length - 2)
					? { ...s, fields: [...s.fields, ...orphanIds.map((id) => ({ id }) as FormFieldDefinition)] }
					: s
			);
		announce('Página removida.', 'info');
	}

	// ── Field mutations ───────────────────────────────────────────────────────────
	/**
	 * Add a new field to a specific section, optionally after a given field.
	 */
	function addFieldToSection(sectionIdx: number, type: FormFieldType, afterFieldId?: string) {
		const id = uid();
		const newField: FormFieldDefinition = {
			id, name: id, type, label: 'Pergunta sem título', required: false
		};

		// Add full data to global fields list
		fields = [...fields, newField];

		// Insert into section's ordered ref list
		sections = sections.map((s, i) => {
			if (i !== sectionIdx) return s;
			const refs = [...s.fields];
			const ref = { id } as FormFieldDefinition;
			if (afterFieldId) {
				const afterIdx = refs.findIndex((r) => r.id === afterFieldId);
				if (afterIdx >= 0) {
					refs.splice(afterIdx + 1, 0, ref);
					return { ...s, fields: refs };
				}
			}
			return { ...s, fields: [...refs, ref] };
		});

		activeFieldId = id;
		announce('Campo adicionado.', 'success');
	}

	function duplicateField(fieldId: string) {
		const source = fields.find((f) => f.id === fieldId);
		if (!source) return;
		const id = uid();
		const copy: FormFieldDefinition = { ...source, id, name: id, label: `${source.label} (cópia)` };

		fields = [...fields, copy];

		// Insert in same section, right after original
		sections = sections.map((s) => {
			const afterIdx = s.fields.findIndex((r) => r.id === fieldId);
			if (afterIdx < 0) return s;
			const refs = [...s.fields];
			refs.splice(afterIdx + 1, 0, { id } as FormFieldDefinition);
			return { ...s, fields: refs };
		});

		activeFieldId = id;
		announce('Campo duplicado.', 'success');
	}

	function removeField(fieldId: string) {
		if (fields.length <= 1) return;
		fields = fields.filter((f) => f.id !== fieldId);
		sections = sections.map((s) => ({
			...s,
			fields: s.fields.filter((r) => r.id !== fieldId),
			rules: (s.rules ?? []).filter((rule) => rule.fieldId !== fieldId)
		}));
		if (activeFieldId === fieldId) activeFieldId = null;
		announce('Campo removido.', 'info');
	}

	/**
	 * Move a field within its section (up or down in section order).
	 */
	function moveFieldInSection(sectionIdx: number, fieldIdx: number, dir: -1 | 1) {
		const section = sections[sectionIdx];
		if (!section) return;
		const toIdx = fieldIdx + dir;
		if (toIdx < 0 || toIdx >= section.fields.length) return;
		const refs = [...section.fields];
		[refs[fieldIdx], refs[toIdx]] = [refs[toIdx], refs[fieldIdx]];
		sections = sections.map((s, i) => (i === sectionIdx ? { ...s, fields: refs } : s));
		activeFieldId = section.fields[fieldIdx].id;
		announce(`Campo movido para posição ${toIdx + 1}.`, 'info');
	}

	function applyFieldChange(fieldId: string, changes: Partial<FormFieldDefinition>) {
		fields = fields.map((f) => (f.id !== fieldId ? f : { ...f, ...changes }));
	}

	function addOption(fieldId: string) {
		fields = fields.map((f) => {
			if (f.id !== fieldId) return f;
			const n = (f.options?.length ?? 0) + 1;
			return { ...f, options: [...(f.options ?? []), { label: `Opção ${n}`, value: `opcao_${n}` }] };
		});
	}

	function removeOption(fieldId: string, idx: number) {
		fields = fields.map((f) =>
			f.id !== fieldId ? f : { ...f, options: (f.options ?? []).filter((_, i) => i !== idx) }
		);
	}

	function updateOption(fieldId: string, idx: number, key: 'label' | 'value', val: string) {
		fields = fields.map((f) => {
			if (f.id !== fieldId) return f;
			const opts = [...(f.options ?? [])];
			opts[idx] = { ...opts[idx], [key]: val };
			return { ...f, options: opts };
		});
	}

	// ── Drag & drop (within and across sections) ─────────────────────────────────
	function handleDrop(targetSectionIdx: number, targetFieldIdx: number) {
		if (!draggedFieldId) return;

		const fromSecIdx = sections.findIndex((s) => s.fields.some((r) => r.id === draggedFieldId));
		if (fromSecIdx < 0) { draggedFieldId = null; return; }

		const fromFieldIdx = sections[fromSecIdx].fields.findIndex((r) => r.id === draggedFieldId);

		// Same spot → no-op
		if (fromSecIdx === targetSectionIdx && (fromFieldIdx === targetFieldIdx || fromFieldIdx + 1 === targetFieldIdx)) {
			draggedFieldId = null;
			dragOverSectionIdx = null;
			dragOverFieldIdx = null;
			return;
		}

		const draggedRef = sections[fromSecIdx].fields[fromFieldIdx];

		// Remove from source section
		let newSections = sections.map((s, i) => {
			if (i !== fromSecIdx) return s;
			return { ...s, fields: s.fields.filter((_, fi) => fi !== fromFieldIdx) };
		});

		// Insert into target section
		newSections = newSections.map((s, i) => {
			if (i !== targetSectionIdx) return s;
			const adjustedIdx =
				fromSecIdx === targetSectionIdx && targetFieldIdx > fromFieldIdx
					? targetFieldIdx - 1
					: targetFieldIdx;
			const refs = [...s.fields];
			refs.splice(Math.max(0, adjustedIdx), 0, draggedRef);
			return { ...s, fields: refs };
		});

		sections = newSections;
		activeFieldId = draggedRef.id;
		announce('Campo reposicionado.', 'info');

		draggedFieldId = null;
		draggedFromSectionIdx = null;
		dragOverSectionIdx = null;
		dragOverFieldIdx = null;
	}
</script>

<svelte:head><title>{pageTitle}</title></svelte:head>

<!-- Both primary and background colors as CSS variables for full reactivity -->
<div
	class="builder"
	style="
		--builder-primary: {theme.primaryColor || orgPrimaryColor};
		--builder-bg: {theme.backgroundColor || orgBackgroundColor};
	"
>
	<!-- ── Header ── -->
	<header class="builder-header">
		<button class="back-btn" type="button" on:click={() => dispatch('cancel')}>
			<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<polyline points="15 18 9 12 15 6" />
			</svg>
			Formulários
		</button>

		<strong class="builder-title">{pageTitle}</strong>

		<div class="header-actions">
			{#if serverError}
				<span class="header-error" role="alert">
					<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
						<line x1="12" y1="16" x2="12.01" y2="16"/>
					</svg>
					{serverError}
				</span>
			{/if}
			<button class="save-btn" type="submit" form="builder-form">{submitLabel}</button>
		</div>
	</header>

	<!-- ── Two-column layout ── -->
	<div class="builder-layout">
		<FormBuilderCanvas
			{fields}
			{sectionFieldMap}
			{title}
			{description}
			{activeFieldId}
			{draggedFieldId}
			{dragOverSectionIdx}
			{dragOverFieldIdx}
			{newFieldType}
			{actionNotice}
			{actionNoticeTone}
			formAction={action}
			{mode}
			{definitionJson}
			{isPublic}
			{requiresAuth}
			{isActive}
			on:titleChange={(e) => (title = e.detail.value)}
			on:descriptionChange={(e) => (description = e.detail.value)}
			on:activateField={(e) => (activeFieldId = e.detail.fieldId)}
			on:moveFieldInSection={(e) => moveFieldInSection(e.detail.sectionIdx, e.detail.fieldIdx, e.detail.dir)}
			on:duplicateField={(e) => duplicateField(e.detail.fieldId)}
			on:removeField={(e) => removeField(e.detail.fieldId)}
			on:addFieldToSection={(e) => addFieldToSection(e.detail.sectionIdx, e.detail.type, e.detail.afterFieldId)}
			on:fieldChange={(e) => applyFieldChange(e.detail.fieldId, e.detail.changes)}
			on:optionAdd={(e) => addOption(e.detail.fieldId)}
			on:optionRemove={(e) => removeOption(e.detail.fieldId, e.detail.idx)}
			on:optionChange={(e) => updateOption(e.detail.fieldId, e.detail.idx, e.detail.key, e.detail.val)}
			on:dragstart={(e) => {
				draggedFieldId = e.detail.fieldId;
				draggedFromSectionIdx = e.detail.sectionIdx;
			}}
			on:dragover={(e) => {
				dragOverSectionIdx = e.detail.sectionIdx;
				dragOverFieldIdx = e.detail.fieldIdx;
			}}
			on:drop={(e) => handleDrop(e.detail.targetSectionIdx, e.detail.targetFieldIdx)}
			on:dragend={() => {
				draggedFieldId = null;
				draggedFromSectionIdx = null;
				dragOverSectionIdx = null;
				dragOverFieldIdx = null;
			}}
			on:newFieldTypeChange={(e) => (newFieldType = e.detail.type)}
		/>

		<FormBuilderSidebar
			{accessType}
			{isActive}
			{mode}
			{theme}
			sections={sectionFieldMap}
			on:accessTypeChange={(e) => (accessType = e.detail.value)}
			on:isActiveChange={(e) => (isActive = e.detail.value)}
			on:themeChange={(e) => (theme = e.detail.theme)}
			on:addSection={addSection}
			on:removeSection={(e) => removeSection(e.detail.sectionId)}
			on:sectionTitleChange={(e) => {
				sections = sections.map((s) =>
					s.id === e.detail.sectionId ? { ...s, title: e.detail.title } : s
				);
			}}
		/>
	</div>
</div>

<style>
	.builder {
		min-height: 100vh;
		/* Responsive bg: uses --builder-bg driven by theme selection */
		background: color-mix(in srgb, var(--builder-bg, #ffffff) 60%, var(--background-color-subtle, #f8fafc));
		font-family: var(--font-family-sans, 'DM Sans', system-ui, sans-serif);
		color: var(--text-color-primary, #111827);
	}

	/* ── Header ── */
	.builder-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		padding: 0.75rem 1.5rem;
		background: var(--background-color-card, #ffffff);
		border-bottom: 1px solid var(--border-color-default, #e5e7eb);
		/* Top accent bar driven by primary color */
		border-top: 3px solid var(--builder-primary, #324acb);
		position: sticky;
		top: 0;
		z-index: 20;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
	}

	.builder-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
		letter-spacing: -0.01em;
	}

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.header-error {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-size: 0.8rem;
		color: var(--color-error, #b91c1c);
		background: color-mix(in srgb, var(--color-error, #ef4444) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--color-error, #ef4444) 20%, transparent);
		padding: 0.3rem 0.6rem;
		border-radius: 6px;
		max-width: 260px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		background: transparent;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 7px;
		padding: 0.38rem 0.7rem;
		font-size: 0.84rem;
		font-family: inherit;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		transition: background 0.12s, color 0.12s;
	}

	.back-btn:hover {
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--text-color-primary, #111827);
	}

	.save-btn {
		background: var(--builder-primary, #324acb);
		color: #fff;
		border: none;
		border-radius: 8px;
		padding: 0.48rem 1.1rem;
		font-size: 0.875rem;
		font-weight: 600;
		font-family: inherit;
		cursor: pointer;
		transition: background 0.12s, transform 0.1s;
		white-space: nowrap;
	}

	.save-btn:hover {
		background: color-mix(in srgb, var(--builder-primary, #324acb) 88%, black);
		transform: translateY(-1px);
	}

	/* ── Layout ── */
	.builder-layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 288px;
		gap: 1.25rem;
		padding: 1.25rem 1.5rem 3rem;
		align-items: start;
		max-width: 1280px;
		margin: 0 auto;
	}

	@media (max-width: 1024px) {
		.builder-layout {
			grid-template-columns: 1fr;
			padding: 1rem;
		}
	}

	@media (max-width: 600px) {
		.builder-header {
			padding: 0.6rem 1rem;
		}
		.builder-title {
			display: none;
		}
	}
</style>