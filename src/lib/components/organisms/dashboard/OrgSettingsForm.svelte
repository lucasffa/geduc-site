<!-- src/lib/components/organisms/dashboard/OrgSettingsForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let brandName: string = '';
	export let logoUrl: string = '';
	export let primaryColor: string = '#324acb';
	export let saving: boolean = false;

	const dispatch = createEventDispatcher();

	let brandNameLocal = brandName;
	let logoUrlLocal = logoUrl;
	let primaryColorLocal = primaryColor;

	$: brandNameLocal = brandName;
	$: logoUrlLocal = logoUrl;
	$: primaryColorLocal = primaryColor;

	function handleSubmit() {
		dispatch('save', {
			brandName: brandNameLocal,
			logoUrl: logoUrlLocal,
			primaryColor: primaryColorLocal
		});
	}
</script>

<section class="config-section">
	<h2>White-Label / Marca</h2>
	<form on:submit|preventDefault={handleSubmit}>
		<FormField label="Nome da Marca" id="brand-name">
			<input
				id="brand-name"
				bind:value={brandNameLocal}
				placeholder="Nome exibido no sistema"
			/>
		</FormField>

		<FormField label="URL do Logo" id="logo-url">
			<input
				id="logo-url"
				bind:value={logoUrlLocal}
				placeholder="https://..."
			/>
		</FormField>

		<FormField label="Cor Principal" id="primary-color">
			<div class="color-row">
				<input
					id="primary-color"
					type="color"
					bind:value={primaryColorLocal}
				/>
				<span>{primaryColorLocal}</span>
			</div>
		</FormField>

		<Button type="submit" variant="primary" loading={saving}>Salvar</Button>
	</form>
</section>

<style>
	.config-section {
		background: var(--color-neutral-0);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}

	.config-section h2 {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		margin: 0 0 var(--spacing-md);
	}

	.config-section input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-family: var(--font-family-sans);
		box-sizing: border-box;
	}

	.config-section input[type='color'] {
		width: 48px;
		height: 36px;
		padding: 2px;
		cursor: pointer;
	}

	.color-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.color-row span {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-600);
	}
</style>
