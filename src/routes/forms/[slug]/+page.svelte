<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form: any;

	let isSubmitting = false;
	let submitError: string | null = null;

	$: formData = {};

	function handleSubmit() {
		isSubmitting = true;
		submitError = null;
	}

	function handleSuccess() {
		isSubmitting = false;
		goto('/forms/success');
	}

	function handleError(error: any) {
		isSubmitting = false;
		submitError = error.message || 'Erro ao enviar formulário';
	}
</script>

<svelte:head>
	<title>{data.form.title}</title>
	{#if data.form.description}
		<meta name="description" content={data.form.description} />
	{/if}
</svelte:head>

<div class="form-container">
	<header class="form-header">
		<h1>{data.form.title}</h1>
		{#if data.form.description}
			<p class="form-description">{data.form.description}</p>
		{/if}
		{#if data.form.authorName}
			<p class="form-author">Criado por {data.form.authorName}</p>
		{/if}
	</header>

	<main class="form-main">
		<form
			method="POST"
			action="?/submit"
			use:enhance={handleSubmit}
			on:submit={handleSuccess}
			on:error={handleError}
		>
			<FormRenderer
				{form}
				bind:formData
				disabled={isSubmitting}
			/>

			<div class="form-actions">
				<button
					type="submit"
					disabled={isSubmitting}
					class="submit-button"
				>
					{#if isSubmitting}
						<span class="loading">Enviando...</span>
					{:else}
						Enviar Resposta
					{/if}
				</button>
			</div>

			{#if submitError}
				<div class="error-message">
					{submitError}
				</div>
			{/if}
		</form>
	</main>
</div>

<style>
	.form-container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
		min-height: 100vh;
	}

	.form-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.form-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.form-description {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 0.5rem;
	}

	.form-author {
		font-size: 0.9rem;
		color: var(--text-muted);
		font-style: italic;
	}

	.form-main {
		background: var(--bg-primary);
		border-radius: 12px;
		padding: 2rem;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.form-actions {
		margin-top: 2rem;
		text-align: center;
	}

	.submit-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 200px;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.submit-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.loading {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
	}

	.loading::after {
		content: '';
		width: 16px;
		height: 16px;
		border: 2px solid #ffffff;
		border-top: 2px solid transparent;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	.error-message {
		margin-top: 1rem;
		padding: 1rem;
		background: var(--error-bg);
		color: var(--error-text);
		border-radius: 8px;
		border: 1px solid var(--error-border);
		text-align: center;
	}
</style>