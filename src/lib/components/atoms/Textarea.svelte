<!-- src/lib/components/atoms/Textarea.svelte -->
<script lang="ts">
	export let value: string = '';
	export let placeholder: string = '';
	export let rows: number = 3;
	export let error: string = '';
	export let disabled: boolean = false;
	export let name: string = '';
	export let id: string = '';
</script>

<textarea
	{name}
	{id}
	{placeholder}
	{rows}
	{disabled}
	bind:value
	class="textarea {error ? 'textarea-error' : ''}"
	{...$$restProps}
	on:input
	on:change
></textarea>

<style>
	.textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		color: var(--color-neutral-900);
		background: var(--color-neutral-0);
		resize: vertical;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.textarea:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}

	.textarea:disabled {
		background: var(--color-neutral-100);
		cursor: not-allowed;
	}

	.textarea-error {
		border-color: var(--color-error);
	}
</style>
