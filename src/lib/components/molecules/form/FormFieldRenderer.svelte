<!-- src/lib/components/molecules/FormFieldRenderer.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormFieldDefinition } from '$lib/types/forms';

	export let field: FormFieldDefinition;
	export let value: unknown = '';
	export let error: string = '';
	export let disabled: boolean = false;

	const dispatch = createEventDispatcher<{
		change: { fieldId: string; value: unknown };
	}>();

	function emit(val: unknown) {
		dispatch('change', { fieldId: field.id, value: val });
	}

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement;

		if (target.type === 'checkbox') {
			if (field.options && field.options.length > 0) {
				const current = Array.isArray(value) ? [...(value as string[])] : [];
				emit(
					target.checked
						? [...current, target.value]
						: current.filter((v) => v !== target.value)
				);
			} else {
				emit(target.checked);
			}
		} else if (target.type === 'file') {
			emit(target.files?.[0]?.name ?? '');
		} else {
			emit(target.value);
		}
	}

	$: strValue = String(value ?? '');
	$: arrValue = Array.isArray(value) ? (value as string[]) : [];
</script>

{#if field.type !== 'hidden' && field.type !== 'button'}
	<div class="form-field" class:has-error={!!error}>
		<label for="field_{field.id}" class="field-label">
			{field.label}
			{#if field.required}<span class="required-mark" aria-hidden="true">*</span>{/if}
		</label>

		{#if field.description}
			<p class="field-description">{field.description}</p>
		{/if}

		{#if field.type === 'textarea'}
			<textarea
				id="field_{field.id}"
				name="{field.id}"
				rows={4}
				{disabled}
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? `error_${field.id}` : undefined}
				on:input={handleInput}
			>{strValue}</textarea>

		{:else if field.type === 'radio'}
			<fieldset
				class="choice-group"
				aria-describedby={error ? `error_${field.id}` : undefined}
			>
				<legend class="sr-only">{field.label}</legend>
				{#each field.options ?? [] as option}
					<label class="choice-item">
						<input
							type="radio"
							name="{field.id}"
							value={option.value}
							checked={strValue === option.value}
							{disabled}
							on:change={handleInput}
						/>
						{option.label}
					</label>
				{/each}
			</fieldset>

		{:else if field.type === 'checkbox' && field.options?.length}
			<fieldset
				class="choice-group"
				aria-describedby={error ? `error_${field.id}` : undefined}
			>
				<legend class="sr-only">{field.label}</legend>
				{#each field.options as option}
					<label class="choice-item">
						<input
							type="checkbox"
							value={option.value}
							checked={arrValue.includes(option.value)}
							{disabled}
							on:change={handleInput}
						/>
						{option.label}
					</label>
				{/each}
			</fieldset>

		{:else if field.type === 'file'}
			<input
				type="file"
				id="field_{field.id}"
				name="{field.id}"
				{disabled}
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? `error_${field.id}` : undefined}
				on:change={handleInput}
			/>
			{#if value}
				<div class="file-preview">📎 {value}</div>
			{/if}

		{:else}
			<input
				type={field.type}
				id="field_{field.id}"
				name="{field.id}"
				placeholder={field.placeholder ?? ''}
				value={strValue}
				{disabled}
				aria-invalid={error ? 'true' : 'false'}
				aria-describedby={error ? `error_${field.id}` : undefined}
				on:input={handleInput}
			/>
		{/if}

		{#if error}
			<span class="field-error" id="error_{field.id}" role="alert">{error}</span>
		{/if}
	</div>
{/if}

<style>
	.form-field {
		display: grid;
		gap: 0.35rem;
	}

	.field-label {
		font-weight: 600;
		font-size: 0.9rem;
		color: var(--text-color-primary, #111827);
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
	}

	.required-mark {
		color: var(--color-error, #dc2626);
		font-size: 0.75rem;
	}

	.field-description {
		margin: 0;
		font-size: 0.82rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.field-hint {
		font-size: 0.78rem;
		color: var(--text-color-secondary, #9ca3af);
	}

	input,
	textarea,
	select {
		width: 100%;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 8px;
		padding: 0.55rem 0.75rem;
		font-family: inherit;
		font-size: 0.9rem;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		box-sizing: border-box;
		outline: none;
		transition: border-color 0.12s, box-shadow 0.12s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		border-color: var(--theme-primary, var(--color-primary-500, #324acb));
		box-shadow: 0 0 0 3px
			color-mix(in srgb, var(--theme-primary, var(--color-primary-500, #324acb)) 15%, transparent);
	}

	input:disabled,
	textarea:disabled,
	select:disabled {
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--text-color-secondary, #9ca3af);
		cursor: not-allowed;
	}

	.has-error input,
	.has-error textarea,
	.has-error select {
		border-color: var(--color-error, #ef4444);
	}

	.choice-group {
		border: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: 0.4rem;
	}

	.choice-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.9rem;
		cursor: pointer;
		color: var(--text-color-primary, #111827);
	}

	.choice-item input {
		width: auto;
		padding: 0;
		border: none;
		box-shadow: none;
		accent-color: var(--theme-primary, var(--color-primary-500, #324acb));
	}

	.file-preview {
		font-size: 0.9rem;
		color: var(--text-color-secondary, #6b7280);
		padding: 0.35rem 0;
		display: flex;
		align-items: center;
		gap: 0.3rem;
	}

	.field-error {
		color: var(--color-error, #dc2626);
		font-size: 0.8rem;
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.field-error::before {
		content: '⚠';
		font-size: 0.7rem;
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