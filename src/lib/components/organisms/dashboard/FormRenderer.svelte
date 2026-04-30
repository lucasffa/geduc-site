<!-- src/lib/components/organisms/dashboard/FormRenderer.svelte -->
<script lang="ts">
	import type { FormDefinition, FormFieldDefinition, FormSection } from '$lib/types/forms';
	import FormFieldRenderer from '$lib/components/molecules/form/FormFieldRenderer.svelte';
	import FormSectionNav from '$lib/components/molecules/form/FormSectionNav.svelte';

	export let form: FormDefinition;
	export let formData: Record<string, unknown> = {};
	export let disabled = false;
	export let errors: Record<string, string> = {};

	// ── Theme ───────────────────────────────────────────────────────────────────
	$: theme = {
		primaryColor: form.theme?.primaryColor ?? '#324acb',
		backgroundColor: form.theme?.backgroundColor ?? '#ffffff',
		fontFamily: form.theme?.fontFamily ?? 'DM Sans',
		headerImage: form.theme?.headerImage ?? ''
	};

	// ── Sections ────────────────────────────────────────────────────────────────
	$: normalizedSections = (() => {
		if (form.sections?.length) return form.sections;
		return [
			{ id: 'default', title: 'Página 1', order: 0, fields: form.fields }
		] as FormSection[];
	})();

	let currentSectionIndex = 0;
	$: currentSection = normalizedSections[currentSectionIndex];
	$: canGoBack = currentSectionIndex > 0;
	$: canGoNext = currentSectionIndex < normalizedSections.length - 1;
	$: isMultiSection = normalizedSections.length > 1;

	// ── Field values ─────────────────────────────────────────────────────────────
	function getFieldValue(field: FormFieldDefinition): unknown {
		if (formData[field.id] !== undefined) return formData[field.id];
		if (field.defaultValue !== undefined && field.defaultValue !== null) return field.defaultValue;
		return field.type === 'checkbox' && field.options?.length ? [] : '';
	}

	function handleFieldChange(event: CustomEvent<{ fieldId: string; value: unknown }>) {
		formData = { ...formData, [event.detail.fieldId]: event.detail.value };
	}

	// ── Navigation ───────────────────────────────────────────────────────────────
	function goNext() {
		if (!canGoNext) return;
		const rules = currentSection.rules ?? [];
		const matched = rules.find((rule) => {
			const value = formData[rule.fieldId];
			if (rule.operator === 'equals') return String(value ?? '') === String(rule.value ?? '');
			if (rule.operator === 'not_equals') return String(value ?? '') !== String(rule.value ?? '');
			if (rule.operator === 'filled')
				return value !== undefined && value !== null && String(value) !== '';
			return false;
		});
		if (matched) {
			const targetIdx = normalizedSections.findIndex((s) => s.id === matched.targetSectionId);
			if (targetIdx >= 0) { currentSectionIndex = targetIdx; return; }
		}
		currentSectionIndex += 1;
	}
</script>

<div
	class="renderer"
	style="
		--theme-primary: {theme.primaryColor};
		--theme-bg: {theme.backgroundColor};
		--theme-font: {theme.fontFamily};
	"
>
	<!-- Cover image -->
	{#if theme.headerImage}
		<img
			class="header-image"
			src={theme.headerImage}
			alt="Imagem de capa do formulário"
		/>
	{/if}

	<!-- Section header (multi-section only) -->
	{#if isMultiSection}
		<div class="section-head">
			<h3 class="section-title">{currentSection.title}</h3>
			<div class="section-progress">
				<span class="section-step">
					{currentSectionIndex + 1} / {normalizedSections.length}
				</span>
				<div class="progress-bar">
					<div
						class="progress-fill"
						style="width: {((currentSectionIndex + 1) / normalizedSections.length) * 100}%"
					/>
				</div>
			</div>
		</div>
	{/if}

	<!-- Fields -->
	<div class="fields">
		{#each currentSection.fields as field (field.id)}
			<FormFieldRenderer
				{field}
				value={getFieldValue(field)}
				error={errors[field.id] ?? ''}
				{disabled}
				on:change={handleFieldChange}
			/>
		{/each}
	</div>

	<!-- Navigation (multi-section) -->
	{#if isMultiSection}
		<FormSectionNav
			{canGoBack}
			{canGoNext}
			on:back={() => (currentSectionIndex -= 1)}
			on:next={goNext}
		/>
	{/if}
</div>

<style>
	.renderer {
		background: var(--background-color-card, var(--theme-bg, #ffffff));
		border-radius: var(--border-radius-lg, 12px);
		border: 1px solid var(--border-color-default, #e5e7eb);
		font-family: var(--theme-font, 'DM Sans', system-ui, sans-serif);
		overflow: hidden;
	}

	/* inner padding for everything except cover image */
	.section-head,
	.fields,
	:global(.section-nav) {
		padding-left: var(--spacing-lg, 1.25rem);
		padding-right: var(--spacing-lg, 1.25rem);
	}

	.fields {
		display: grid;
		gap: 1.125rem;
		padding-top: 1.25rem;
		padding-bottom: 1.25rem;
	}

	/* Cover image */
	.header-image {
		width: 100%;
		max-height: 180px;
		object-fit: cover;
		display: block;
	}

	/* Section header */
	.section-head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding-top: 1rem;
		padding-bottom: 0.5rem;
		border-bottom: 1px solid var(--border-color-default, #e5e7eb);
	}

	.section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
		letter-spacing: -0.01em;
	}

	.section-progress {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.section-step {
		font-size: 0.78rem;
		font-weight: 600;
		color: var(--text-color-secondary, #6b7280);
		white-space: nowrap;
	}

	.progress-bar {
		width: 80px;
		height: 4px;
		background: var(--border-color-default, #e5e7eb);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		background: var(--theme-primary, var(--color-primary-500, #324acb));
		border-radius: 999px;
		transition: width 0.3s ease;
	}
</style>