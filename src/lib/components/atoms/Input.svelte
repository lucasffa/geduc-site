<!-- src/lib/components/atoms/Input.svelte -->
<script lang="ts">
	export let value: string = '';
	export let type: 'text' | 'email' | 'password' | 'number' | 'search' | 'tel' | 'url' = 'text';
	export let placeholder: string = '';
	export let error: string = '';
	export let disabled: boolean = false;
	export let name: string = '';
	export let id: string = '';
	export let autocomplete: string = '';

	let className = '';
	export { className as class };
</script>

<input
	{type}
	{name}
	{id}
	{placeholder}
	{disabled}
	{autocomplete}
	bind:value
	class="input {error ? 'input-error' : ''} {className}"
	{...$$restProps}
	on:input
	on:change
	on:focus
	on:blur
/>

<style>
	.input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		color: var(--color-neutral-900);
		background: var(--color-neutral-0);
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}

	.input:disabled {
		background: var(--color-neutral-100);
		color: var(--color-neutral-500);
		cursor: not-allowed;
	}

	.input-error {
		border-color: var(--color-error);
	}

	.input-error:focus {
		box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
	}
</style>
