<!-- src/lib/components/forms/FormRenderer.svelte -->
<script lang="ts">
	import type { FormDefinition, FormFieldDefinition, FormSection } from '$lib/types/forms';

	export let form: FormDefinition;
	export let formData: Record<string, unknown> = {};
	export let disabled = false;
	export let errors: Record<string, string> = {};

	$: theme = {
		primaryColor: form.theme?.primaryColor ?? '#324acb',
		backgroundColor: form.theme?.backgroundColor ?? '#ffffff',
		fontFamily: form.theme?.fontFamily ?? 'DM Sans',
		headerImage: form.theme?.headerImage ?? ''
	};

	$: normalizedSections = (() => {
		if (form.sections?.length) return form.sections;
		return [{ id: 'default', title: 'Página 1', order: 0, fields: form.fields }] as FormSection[];
	})();
	let currentSectionIndex = 0;
	$: currentSection = normalizedSections[currentSectionIndex];
	$: canGoBack = currentSectionIndex > 0;
	$: canGoNext = currentSectionIndex < normalizedSections.length - 1;

	function getFieldValue(field: FormFieldDefinition) {
		if (formData[field.id] !== undefined) return formData[field.id];
		if (field.defaultValue !== undefined && field.defaultValue !== null) return field.defaultValue;
		return field.type === 'checkbox' && field.options?.length ? [] : '';
	}

	function setFieldValue(field: FormFieldDefinition, value: unknown) {
		formData = { ...formData, [field.id]: value };
	}

	function handleInput(event: Event, field: FormFieldDefinition) {
		const target = event.target as HTMLInputElement;
		if (target.type === 'checkbox') {
			if (field.options && field.options.length > 0) {
				const current = Array.isArray(formData[field.id]) ? [...(formData[field.id] as string[])] : [];
				setFieldValue(field, target.checked ? [...current, target.value] : current.filter((v) => v !== target.value));
			} else {
				setFieldValue(field, target.checked);
			}
		} else if (target.type === 'file') {
			setFieldValue(field, target.files?.[0]?.name ?? '');
		} else {
			setFieldValue(field, target.value);
		}
	}

	function nextSection() {
		if (!canGoNext) return;
		const currentRules = currentSection.rules ?? [];
		const matched = currentRules.find((rule) => {
			const value = formData[rule.fieldId];
			if (rule.operator === 'equals') return String(value ?? '') === String(rule.value ?? '');
			if (rule.operator === 'not_equals') return String(value ?? '') !== String(rule.value ?? '');
			if (rule.operator === 'filled') return value !== undefined && value !== null && String(value) !== '';
			return false;
		});
		if (matched) {
			const targetIdx = normalizedSections.findIndex((section) => section.id === matched.targetSectionId);
			if (targetIdx >= 0) {
				currentSectionIndex = targetIdx;
				return;
			}
		}
		currentSectionIndex += 1;
	}
</script>

<div class="renderer" style="--theme-primary:{theme.primaryColor};--theme-bg:{theme.backgroundColor};--theme-font:{theme.fontFamily};">
	{#if theme.headerImage}
		<img class="header-image" src={theme.headerImage} alt="Capa do formulário" />
	{/if}
	{#if normalizedSections.length > 1}
		<div class="section-head">
			<h3 class="section-title">{currentSection.title}</h3>
			<span class="section-step">Etapa {currentSectionIndex + 1} de {normalizedSections.length}</span>
		</div>
	{/if}
	<div class="fields">
		{#each currentSection.fields as field (field.id)}
			{#if field.type !== 'hidden'}
				<div class="field" class:has-error={!!errors[field.id]}>
					<label for="field_{field.id}">{field.label}{#if field.required}*{/if}</label>
					{#if field.description}<p>{field.description}</p>{/if}

					{#if field.type === 'textarea'}
						<textarea id="field_{field.id}" name="field_{field.id}" rows="4" aria-invalid={errors[field.id] ? 'true' : 'false'} aria-describedby={errors[field.id] ? `error_${field.id}` : undefined} on:input={(e) => handleInput(e, field)}>{getFieldValue(field)}</textarea>
					{:else if field.type === 'select'}
						<select id="field_{field.id}" name="field_{field.id}" aria-invalid={errors[field.id] ? 'true' : 'false'} aria-describedby={errors[field.id] ? `error_${field.id}` : undefined} on:change={(e) => handleInput(e, field)}>
							<option value="">Selecione</option>
							{#each field.options ?? [] as option}<option value={option.value}>{option.label}</option>{/each}
						</select>
					{:else if field.type === 'radio'}
						<fieldset class="choice-group" aria-describedby={errors[field.id] ? `error_${field.id}` : undefined}>
							<legend class="sr-only">{field.label}</legend>
							{#each field.options ?? [] as option}
								<label><input type="radio" name="field_{field.id}" value={option.value} checked={getFieldValue(field) === option.value} on:change={(e) => handleInput(e, field)} /> {option.label}</label>
							{/each}
						</fieldset>
					{:else if field.type === 'checkbox' && field.options?.length}
						<fieldset class="choice-group" aria-describedby={errors[field.id] ? `error_${field.id}` : undefined}>
							<legend class="sr-only">{field.label}</legend>
							{#each field.options as option}
								<label><input type="checkbox" value={option.value} checked={Array.isArray(getFieldValue(field)) && (getFieldValue(field) as string[]).includes(option.value)} on:change={(e) => handleInput(e, field)} /> {option.label}</label>
							{/each}
						</fieldset>
					{:else if field.type === 'rating'}
						<div class="rating">
							{#each [1, 2, 3, 4, 5] as value}
								<button type="button" class:selected={Number(getFieldValue(field)) >= value} aria-label={`Definir nota ${value}`} on:click={() => setFieldValue(field, value)} disabled={disabled}>★</button>
							{/each}
						</div>
						<input type="hidden" name="field_{field.id}" value={String(getFieldValue(field) ?? '')} />
					{:else if field.type === 'map'}
						<input type="text" id="field_{field.id}" name="field_{field.id}" placeholder={field.placeholder ?? 'Latitude,Longitude ou endereço'} value={String(getFieldValue(field) ?? '')} on:input={(e) => handleInput(e, field)} />
						<small>Campo de mapa: informe coordenada ou endereço.</small>
					{:else if field.type !== 'button'}
						<input type={field.type === 'file' ? 'text' : field.type} id="field_{field.id}" name="field_{field.id}" aria-invalid={errors[field.id] ? 'true' : 'false'} aria-describedby={errors[field.id] ? `error_${field.id}` : undefined} placeholder={field.placeholder ?? ''} value={String(getFieldValue(field) ?? '')} on:input={(e) => handleInput(e, field)} />
					{/if}

					{#if errors[field.id]}<span class="error" id="error_{field.id}">{errors[field.id]}</span>{/if}
				</div>
			{/if}
		{/each}
	</div>

	{#if normalizedSections.length > 1}
		<div class="section-actions">
			<button type="button" on:click={() => (currentSectionIndex -= 1)} disabled={!canGoBack}>Voltar</button>
			{#if canGoNext}
				<button type="button" on:click={nextSection}>Próxima página</button>
			{/if}
		</div>
	{/if}
</div>

<style>
	.renderer {
		background: var(--background-color-card, var(--theme-bg));
		border-radius: var(--border-radius-lg, 12px);
		padding: var(--spacing-lg, 1rem);
		font-family: var(--theme-font);
		border: 1px solid var(--border-color-default, #e5e7eb);
	}

	.header-image {
		width: 100%;
		max-height: 180px;
		object-fit: cover;
		border-radius: 10px;
		margin-bottom: 0.75rem;
	}

	.section-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		margin: 0 0 0.75rem;
	}

	.section-title {
		margin: 0;
		font-size: 1rem;
		font-weight: 600;
	}

	.section-step {
		font-size: 0.8rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.fields {
		display: grid;
		gap: 1rem;
	}

	.field {
		display: grid;
		gap: 0.35rem;
	}

	.field label {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--text-color-primary, #111827);
	}

	.field p {
		margin: 0;
		font-size: 0.82rem;
		color: var(--text-color-secondary, #6b7280);
	}

	input,
	textarea,
	select {
		width: 100%;
		border: 1px solid #d1d5db;
		border-radius: 8px;
		padding: 0.6rem;
		font-family: inherit;
		font-size: 0.9rem;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		box-sizing: border-box;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--theme-primary);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--theme-primary) 20%, transparent);
	}

	.field.has-error input,
	.field.has-error textarea,
	.field.has-error select {
		border-color: var(--color-red-500, #ef4444);
	}

	.rating {
		display: flex;
		gap: 0.35rem;
	}

	.rating button {
		border: none;
		background: transparent;
		color: #9ca3af;
		font-size: 1.25rem;
		padding: 0;
		cursor: pointer;
		border-radius: 6px;
	}

	.rating button.selected {
		color: var(--theme-primary);
	}

	.error {
		color: #dc2626;
		font-size: 0.8rem;
	}

	.section-actions {
		display: flex;
		gap: 0.5rem;
		margin-top: 1rem;
	}

	.section-actions button {
		border: none;
		border-radius: 8px;
		padding: 0.55rem 0.8rem;
		background: var(--theme-primary);
		color: white;
		font-weight: 600;
	}

	.section-actions button:hover:not(:disabled) {
		background: color-mix(in srgb, var(--theme-primary) 88%, black);
	}

	.section-actions button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.choice-group {
		border: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.35rem;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}
</style>
