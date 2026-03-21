<!-- src/lib/components/atoms/Checkbox.svelte -->
<script lang="ts">
	export let checked: boolean = false;
	export let label: string = '';
	export let disabled: boolean = false;
	export let name: string = '';
	export let id: string = '';
</script>

<label class="checkbox-wrapper" class:disabled>
	<input
		type="checkbox"
		{name}
		{id}
		{disabled}
		bind:checked
		class="checkbox-input"
		on:change
	/>
	<span class="checkbox-mark"></span>
	{#if label}
		<span class="checkbox-label">{label}</span>
	{/if}
</label>

<style>
	.checkbox-wrapper {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		cursor: pointer;
		user-select: none;
	}

	.checkbox-wrapper.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}

	.checkbox-input {
		position: absolute;
		opacity: 0;
		width: 0;
		height: 0;
	}

	.checkbox-mark {
		width: 18px;
		height: 18px;
		border: 2px solid var(--color-neutral-400);
		border-radius: var(--border-radius-sm);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
		flex-shrink: 0;
	}

	.checkbox-input:checked + .checkbox-mark {
		background: var(--color-primary-500);
		border-color: var(--color-primary-500);
	}

	.checkbox-input:checked + .checkbox-mark::after {
		content: '';
		width: 5px;
		height: 9px;
		border: solid white;
		border-width: 0 2px 2px 0;
		transform: rotate(45deg);
		margin-top: -2px;
	}

	.checkbox-input:focus-visible + .checkbox-mark {
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.2);
	}

	.checkbox-label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-700);
	}
</style>
