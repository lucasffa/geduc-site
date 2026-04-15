<script lang="ts">
	import type { FormDefinition, FormFieldDefinition } from '$lib/types/forms';

	export let form: FormDefinition;
	export let formData: Record<string, any> = {};
	export let disabled = false;

	function getFieldValue(field: FormFieldDefinition) {
		return formData[field.id] || field.defaultValue || '';
	}

	function setFieldValue(field: FormFieldDefinition, value: any) {
		formData[field.id] = value;
		formData = { ...formData };
	}

	function handleInput(event: Event, field: FormFieldDefinition) {
		const target = event.target as HTMLInputElement;
		let value: any = target.value;

		// Handle different input types
		if (target.type === 'checkbox') {
			if (field.type === 'checkbox') {
				// Multiple checkboxes
				const currentValues = Array.isArray(formData[field.id]) ? formData[field.id] : [];
				if (target.checked) {
					setFieldValue(field, [...currentValues, value]);
				} else {
					setFieldValue(field, currentValues.filter((v: any) => v !== value));
				}
			} else {
				// Single checkbox
				setFieldValue(field, target.checked);
			}
		} else if (target.type === 'radio') {
			setFieldValue(field, value);
		} else {
			setFieldValue(field, value);
		}
	}
</script>

<div class="form-renderer">
	{#each form.fields as field}
		<div class="form-field" class:required={field.required}>
			<label for="field_{field.id}" class="field-label">
				{field.label}
				{#if field.required}
					<span class="required-indicator">*</span>
				{/if}
			</label>

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
						placeholder={field.placeholder}
						required={field.required}
						{disabled}
						on:input={(e) => handleInput(e, field)}
					/>
				{:else if field.type === 'textarea'}
					<textarea
						id="field_{field.id}"
						name="field_{field.id}"
						value={getFieldValue(field)}
						placeholder={field.placeholder}
						required={field.required}
						{disabled}
						rows="4"
						on:input={(e) => handleInput(e, field)}
					></textarea>
				{:else if field.type === 'number'}
					<input
						type="number"
						id="field_{field.id}"
						name="field_{field.id}"
						value={getFieldValue(field)}
						placeholder={field.placeholder}
						required={field.required}
						{disabled}
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
						on:input={(e) => handleInput(e, field)}
					/>
				{:else if field.type === 'select'}
					<select
						id="field_{field.id}"
						name="field_{field.id}"
						value={getFieldValue(field)}
						required={field.required}
						{disabled}
						on:change={(e) => handleInput(e, field)}
					>
						<option value="">Selecione...</option>
						{#each field.options || [] as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				{:else if field.type === 'radio'}
					<div class="radio-group">
						{#each field.options || [] as option}
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
								<span class="radio-label">{option.label}</span>
							</label>
						{/each}
					</div>
				{:else if field.type === 'checkbox'}
					{#if field.options && field.options.length > 0}
						<!-- Multiple checkboxes -->
						<div class="checkbox-group">
							{#each field.options as option}
								<label class="checkbox-option">
									<input
										type="checkbox"
										name="field_{field.id}"
										value={option.value}
										checked={(getFieldValue(field) || []).includes(option.value)}
										{disabled}
										on:change={(e) => handleInput(e, field)}
									/>
									<span class="checkbox-label">{option.label}</span>
								</label>
							{/each}
						</div>
					{:else}
						<!-- Single checkbox -->
						<label class="checkbox-single">
							<input
								type="checkbox"
								id="field_{field.id}"
								name="field_{field.id}"
								checked={getFieldValue(field)}
								disabled
								on:change={(e) => handleInput(e, field)}
							/>
							<span class="checkbox-label">{field.label}</span>
						</label>
					{/if}
				{:else if field.type === 'button'}
					<button
						type="button"
						id="field_{field.id}"
						name="field_{field.id}"
						{disabled}
						on:click={() => {
							// Handle button actions (CEP lookup, etc.)
							console.log('Button clicked:', field.id);
						}}
					>
						{field.label}
					</button>
				{:else if field.type === 'hidden'}
					<input
						type="hidden"
						id="field_{field.id}"
						name="field_{field.id}"
						value={getFieldValue(field)}
					/>
				{/if}
			</div>
		</div>
	{/each}
</div>

<style>
	.form-renderer {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-field.required .field-label {
		font-weight: 600;
	}

	.field-label {
		font-weight: 500;
		color: var(--text-primary);
		font-size: 1rem;
	}

	.required-indicator {
		color: var(--error);
		margin-left: 0.25rem;
	}

	.field-description {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin: 0;
		line-height: 1.4;
	}

	.field-input input,
	.field-input textarea,
	.field-input select {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.field-input input:focus,
	.field-input textarea:focus,
	.field-input select:focus {
		outline: none;
		border-color: var(--primary);
		box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
	}

	.field-input input:disabled,
	.field-input textarea:disabled,
	.field-input select:disabled {
		background: var(--bg-disabled);
		color: var(--text-disabled);
		cursor: not-allowed;
	}

	.field-input textarea {
		resize: vertical;
		min-height: 100px;
	}

	.radio-group,
	.checkbox-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.radio-option,
	.checkbox-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.radio-option:hover,
	.checkbox-option:hover {
		background: var(--bg-hover);
	}

	.radio-option input[type="radio"],
	.checkbox-option input[type="checkbox"] {
		margin: 0;
		width: auto;
	}

	.radio-label,
	.checkbox-label {
		font-weight: normal;
		color: var(--text-primary);
	}

	.checkbox-single {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem;
		border-radius: 4px;
		transition: background-color 0.2s ease;
	}

	.checkbox-single:hover {
		background: var(--bg-hover);
	}

	.checkbox-single input[type="checkbox"] {
		margin: 0;
		width: auto;
	}

	.field-input button {
		padding: 0.75rem 1.5rem;
		background: var(--primary);
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.field-input button:hover:not(:disabled) {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.field-input button:disabled {
		background: var(--bg-disabled);
		color: var(--text-disabled);
		cursor: not-allowed;
		transform: none;
	}
</style>