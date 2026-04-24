<!-- src/lib/components/forms/FormRenderer.svelte -->
<script lang="ts">
	import type { FormDefinition, FormFieldDefinition } from '$lib/types/forms';

	export let form: FormDefinition;
	export let formData: Record<string, any> = {};
	export let disabled = false;
	// Optional: validation errors keyed by field id
	export let errors: Record<string, string> = {};

	function getFieldValue(field: FormFieldDefinition) {
		const v = formData[field.id];
		if (v !== undefined) return v;
		if (field.defaultValue !== undefined && field.defaultValue !== null) return field.defaultValue;
		return field.type === 'checkbox' && field.options?.length ? [] : '';
	}

	function setFieldValue(field: FormFieldDefinition, value: any) {
		formData = { ...formData, [field.id]: value };
	}

	function handleInput(event: Event, field: FormFieldDefinition) {
		const target = event.target as HTMLInputElement;
		console.log(`[FormRenderer] handleInput: field=${field.id}, type=${target.type}, value=${target.value}`);

		if (target.type === 'checkbox') {
			if (field.options && field.options.length > 0) {
				// Multi-checkbox: maintain array
				const current: string[] = Array.isArray(formData[field.id]) ? [...formData[field.id]] : [];
				if (target.checked) {
					setFieldValue(field, [...current, target.value]);
					console.log(`[FormRenderer] handleInput: checkbox adicionado - field=${field.id}, value=${target.value}`);
				} else {
					setFieldValue(field, current.filter((v) => v !== target.value));
				}
			} else {
				// Single boolean checkbox
				setFieldValue(field, target.checked);
			}
		} else if (target.type === 'radio') {
			setFieldValue(field, target.value);
		} else if (target.type === 'file') {
			setFieldValue(field, target.files?.[0] ?? null);
		} else {
			setFieldValue(field, target.value);
		}
	}

	const RATING_VALUES = [1, 2, 3, 4, 5];
</script>

<div class="form-renderer">
	{#each form.fields as field (field.id)}
		{#if field.type !== 'hidden'}
			<div class="form-field" class:has-error={!!errors[field.id]}>
				{#if field.type !== 'checkbox' || !field.options?.length}
					<label for="field_{field.id}" class="field-label">
						{field.label}
						{#if field.required}
							<span class="required-indicator" aria-hidden="true">*</span>
						{/if}
					</label>
				{/if}

				{#if field.description}
					<p class="field-description">{field.description}</p>
				{/if}

				<div class="field-input">
					{#if field.type === 'text' || field.type === 'email' || field.type === 'tel' || field.type === 'url'}
						<input
							type={field.type}
							id="field_{field.id}"
							name="field_{field.id}"
							value={getFieldValue(field)}
							placeholder={field.placeholder ?? ''}
							required={field.required}
							{disabled}
							aria-invalid={!!errors[field.id]}
							aria-describedby={errors[field.id] ? `error_${field.id}` : undefined}
							on:input={(e) => handleInput(e, field)}
						/>

					{:else if field.type === 'textarea'}
						<textarea
							id="field_{field.id}"
							name="field_{field.id}"
							placeholder={field.placeholder ?? ''}
							required={field.required}
							{disabled}
							rows="4"
							aria-invalid={!!errors[field.id]}
							aria-describedby={errors[field.id] ? `error_${field.id}` : undefined}
							on:input={(e) => handleInput(e, field)}
						>{getFieldValue(field)}</textarea>

					{:else if field.type === 'number'}
						<input
							type="number"
							id="field_{field.id}"
							name="field_{field.id}"
							value={getFieldValue(field)}
							placeholder={field.placeholder ?? ''}
							required={field.required}
							{disabled}
							aria-invalid={!!errors[field.id]}
							on:input={(e) => handleInput(e, field)}
						/>

					{:else if field.type === 'date'}
						<input
							type="date"
							id="field_{field.id}"
							name="field_{field.id}"
							value={getFieldValue(field)}
							required={field.required}
							{disabled}
							aria-invalid={!!errors[field.id]}
							on:input={(e) => handleInput(e, field)}
						/>

					{:else if field.type === 'select'}
						<select
							id="field_{field.id}"
							name="field_{field.id}"
							required={field.required}
							{disabled}
							aria-invalid={!!errors[field.id]}
							on:change={(e) => handleInput(e, field)}
						>
							<option value="">Selecione uma opção...</option>
							{#each field.options ?? [] as option}
								<option
									value={option.value}
									selected={getFieldValue(field) === option.value}
								>{option.label}</option>
							{/each}
						</select>

					{:else if field.type === 'radio'}
						<fieldset class="radio-group">
							<legend class="sr-only">{field.label}</legend>
							{#each field.options ?? [] as option}
								<label class="radio-option">
									<input
										type="radio"
										name="field_{field.id}"
										value={option.value}
										checked={getFieldValue(field) === option.value}
										required={field.required}
										{disabled}
										on:change={(e) => handleInput(e, field)}
									/>
									<span class="option-label">{option.label}</span>
								</label>
							{/each}
						</fieldset>

					{:else if field.type === 'checkbox'}
						{#if field.options && field.options.length > 0}
							<fieldset class="checkbox-group">
								<legend class="field-label">
									{field.label}
									{#if field.required}
										<span class="required-indicator" aria-hidden="true">*</span>
									{/if}
								</legend>
								{#if field.description}
									<p class="field-description">{field.description}</p>
								{/if}
								{#each field.options as option}
									<label class="checkbox-option">
										<input
											type="checkbox"
											name="field_{field.id}"
											value={option.value}
											checked={(getFieldValue(field) as string[]).includes(option.value)}
											{disabled}
											on:change={(e) => handleInput(e, field)}
										/>
										<span class="option-label">{option.label}</span>
									</label>
								{/each}
							</fieldset>
						{:else}
							<!-- Single boolean checkbox -->
							<label class="checkbox-single">
								<input
									type="checkbox"
									id="field_{field.id}"
									name="field_{field.id}"
									checked={Boolean(getFieldValue(field))}
									{disabled}
									on:change={(e) => handleInput(e, field)}
								/>
								<span class="option-label">{field.label}</span>
								{#if field.required}
									<span class="required-indicator" aria-hidden="true">*</span>
								{/if}
							</label>
						{/if}

					{:else if field.type === 'file'}
						<input
							type="file"
							id="field_{field.id}"
							name="field_{field.id}"
							required={field.required}
							{disabled}
							aria-invalid={!!errors[field.id]}
							aria-describedby={errors[field.id] ? `error_${field.id}` : undefined}
							on:change={(e) => handleInput(e, field)}
						/>

					{:else if field.type === 'rating'}
					<div class="rating-input" role="radiogroup" aria-label={field.label}>
						{#each RATING_VALUES as value}
							<button
								type="button"
								class="rating-star"
								class:selected={Number(getFieldValue(field)) >= value}
								aria-pressed={Number(getFieldValue(field)) === value}
								aria-label={`Avaliação ${value} de 5`}
								disabled={disabled}
								on:click={() => setFieldValue(field, value)}
							>
								★
							</button>
						{/each}
						<span class="rating-value">
							{#if getFieldValue(field)}{`${Number(getFieldValue(field))} de 5`}{:else}Sem avaliação{/if}
						</span>
					</div>
					<input type="hidden" name="field_{field.id}" value={getFieldValue(field)} />
					{:else if field.type === 'button'}
						<button
							type="button"
							id="field_{field.id}"
							{disabled}
							on:click={() => {
								console.log('Button action:', field.id, field.metadata);
							}}
						>
							{field.label}
						</button>
					{/if}
				</div>

				{#if errors[field.id]}
					<span class="field-error" id="error_{field.id}" role="alert">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
							<circle cx="12" cy="12" r="10"/>
							<line x1="12" y1="8" x2="12" y2="12"/>
							<line x1="12" y1="16" x2="12.01" y2="16"/>
						</svg>
						{errors[field.id]}
					</span>
				{/if}
			</div>
		{:else}
			<!-- Hidden field — always rendered, never shown -->
			<input
				type="hidden"
				id="field_{field.id}"
				name="field_{field.id}"
				value={getFieldValue(field)}
			/>
		{/if}
	{/each}
</div>

<style>
	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}

	.form-renderer {
		display: flex;
		flex-direction: column;
		gap: 1.75rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.field-label {
		display: block;
		font-weight: var(--font-weight-medium);
		font-size: var(--label-text-font-size);
		color: var(--text-color-primary);
		line-height: var(--label-text-line-height);
	}

	.required-indicator {
		color: var(--color-error);
		margin-left: var(--spacing-xxs);
	}

	.field-description {
		font-size: var(--caption-text-font-size);
		color: var(--text-color-secondary);
		margin: 0 0 var(--spacing-xs);
		line-height: var(--caption-text-line-height);
	}

	/* ── Inputs ── */
	.field-input input[type='text'],
	.field-input input[type='email'],
	.field-input input[type='tel'],
	.field-input input[type='url'],
	.field-input input[type='number'],
	.field-input input[type='date'],
	.field-input textarea,
	.field-input select {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1.5px solid var(--border-color-default);
		border-radius: var(--spacing-sm);
		font-size: var(--body-text-font-size);
		font-family: var(--font-family-sans);
		background: var(--background-color-card);
		color: var(--text-color-primary);
		transition: border-color 0.15s ease, box-shadow 0.15s ease;
		outline: none;
		appearance: none;
	}

	.field-input input:focus,
	.field-input textarea:focus,
	.field-input select:focus {
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-primary-500) 15%, transparent);
	}

	.field-input input:disabled,
	.field-input textarea:disabled,
	.field-input select:disabled {
		background: var(--background-color-disabled);
		color: var(--text-color-disabled);
		cursor: not-allowed;
		opacity: 0.7;
	}

	.has-error .field-input input,
	.has-error .field-input textarea,
	.has-error .field-input select {
		border-color: var(--color-error);
	}

	.has-error .field-input input:focus,
	.has-error .field-input textarea:focus,
	.has-error .field-input select:focus {
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--color-error) 15%, transparent);
	}

	.field-input textarea {
		resize: vertical;
		min-height: 110px;
		line-height: 1.6;
	}

	.field-input select {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.75rem center;
		padding-right: 2.5rem;
		cursor: pointer;
	}

	/* ── Radio & Checkbox groups ── */
	.radio-group,
	.checkbox-group {
		border: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.radio-group legend,
	.checkbox-group legend {
		margin-bottom: 0.5rem;
	}

	.radio-option,
	.checkbox-option {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-sm);
		border-radius: var(--spacing-xs);
		cursor: pointer;
		transition: background-color 0.12s ease;
		user-select: none;
	}

	.radio-option:hover,
	.checkbox-option:hover {
		background: var(--background-color-subtle);
	}

	.radio-option input,
	.checkbox-option input {
		margin: 0;
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-primary-500);
		flex-shrink: 0;
		cursor: pointer;
	}

	.option-label {
		font-size: var(--body-text-font-size);
		color: var(--text-color-primary);
		line-height: var(--body-text-line-height);
	}

	/* ── Single boolean checkbox ── */
	.checkbox-single {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-sm);
		border-radius: var(--spacing-xs);
		cursor: pointer;
		transition: background-color 0.12s ease;
		user-select: none;
	}

	.checkbox-single:hover {
		background: var(--background-color-subtle);
	}

	.checkbox-single input {
		margin: 0;
		width: 1rem;
		height: 1rem;
		accent-color: var(--color-primary-500);
		flex-shrink: 0;
		cursor: pointer;
	}

	/* ── Button field ── */
	.field-input button {
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-primary-500);
		color: var(--text-color-white);
		border: none;
		border-radius: var(--spacing-sm);
		font-size: var(--body-text-font-size);
		font-weight: var(--button-text-font-weight);
		font-family: var(--font-family-sans);
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.1s ease;
	}

	.field-input button:hover:not(:disabled) {
		background: var(--color-primary-600);
		transform: translateY(-1px);
	}

	.field-input button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	/* ── Error message ── */
	.field-error {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--caption-text-font-size);
		color: var(--color-error);
		font-weight: var(--font-weight-medium);
		margin-top: var(--spacing-xxs);
	}
</style>