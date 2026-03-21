<!-- src/lib/components/atoms/Select.svelte -->
<script lang="ts">
	export let value: string = '';
	export let options: { value: string; label: string }[] = [];
	export let placeholder: string = 'Selecione...';
	export let error: string = '';
	export let disabled: boolean = false;
	export let name: string = '';
	export let id: string = '';

	let className = '';
	export { className as class };
</script>

<select
	{name}
	{id}
	{disabled}
	bind:value
	class="select {error ? 'select-error' : ''} {className}"
	{...$$restProps}
	on:change
>
	{#if placeholder}
		<option value="" disabled>{placeholder}</option>
	{/if}
	{#each options as opt}
		<option value={opt.value}>{opt.label}</option>
	{/each}
</select>

<style>
	.select {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		color: var(--color-neutral-900);
		background: var(--color-neutral-0);
		cursor: pointer;
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: var(--spacing-2xl);
	}

	.select:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}

	.select:disabled {
		background: var(--color-neutral-100);
		color: var(--color-neutral-500);
		cursor: not-allowed;
	}

	.select-error {
		border-color: var(--color-error);
	}
</style>
