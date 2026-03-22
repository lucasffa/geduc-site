<!-- src/lib/components/organisms/dashboard/ApiKeyForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let saving: boolean = false;

	const dispatch = createEventDispatcher();

	let apiKey = '';

	function handleSubmit() {
		if (!apiKey.trim()) return;
		dispatch('save', { key: apiKey });
		apiKey = '';
	}
</script>

<section class="config-section">
	<h2>Chave API Resend (Organização)</h2>
	<p class="config-desc">
		Esta chave será usada para envios de email da organização. Criptografada com a senha do admin.
	</p>
	<form on:submit|preventDefault={handleSubmit}>
		<FormField label="Chave Resend" id="api-key">
			<input
				id="api-key"
				type="password"
				bind:value={apiKey}
				placeholder="re_..."
			/>
		</FormField>

		<Button type="submit" variant="primary" size="sm" loading={saving}>Salvar Chave</Button>
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

	.config-desc {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
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
</style>
