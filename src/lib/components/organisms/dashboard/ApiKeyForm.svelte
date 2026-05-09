<!-- src/lib/components/organisms/dashboard/ApiKeyForm.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let saving: boolean = false;

	const dispatch = createEventDispatcher();

	let apiKey = '';
	let password = '';

	function handleSubmit() {
		if (!apiKey.trim() || !password) return;
		dispatch('save', { key: apiKey, password });
		apiKey = '';
		password = '';
	}
</script>

<section class="config-section">
	<h2>Registrar Chave API Resend (Organização)</h2>
	<p class="config-desc">
		A chave é encriptada com sua senha (AES-256-GCM + PBKDF2). Para usá-la, você precisa
		<strong>ativá-la</strong> na seção abaixo — ela fica em RAM e fica disponível para todos
		os membros da organização até você desativar ou o servidor reiniciar.
	</p>
	<form on:submit|preventDefault={handleSubmit}>
		<FormField label="Chave Resend" id="api-key">
			<input
				id="api-key"
				type="password"
				bind:value={apiKey}
				placeholder="re_..."
				autocomplete="off"
			/>
		</FormField>

		<FormField label="Sua senha (para encriptar)" id="api-key-password">
			<input
				id="api-key-password"
				type="password"
				bind:value={password}
				placeholder="••••••••"
				autocomplete="current-password"
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
