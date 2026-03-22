<!-- src/lib/components/molecules/FormField.svelte -->
<script lang="ts">
	export let label: string = '';
	export let error: string = '';
	export let id: string = '';
	export let required: boolean = false;
</script>

<div class="form-field">
	{#if label}
		<label for={id} class="form-field-label">
			{label}
			{#if required}<span class="form-field-required">*</span>{/if}
		</label>
	{/if}
	<slot />
	{#if error}
		<span class="form-field-error">{error}</span>
	{/if}
</div>

<style>
	.form-field {
		margin-bottom: var(--spacing-md);
	}

	.form-field-label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-700);
		margin-bottom: var(--spacing-xs);
	}

	.form-field-required {
		color: var(--color-error);
	}

	.form-field-error {
		display: block;
		font-size: var(--font-size-xs);
		color: var(--color-error);
		margin-top: var(--spacing-xxs);
	}
</style>
