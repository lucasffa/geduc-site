<!-- src/routes/forms/[token]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FormRenderer from '$lib/components/organisms/dashboard/FormRenderer.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: actionForm = form as any;

	let formData: Record<string, unknown> = {};
	let isSubmitting = false;

	$: if (actionForm?.success) {
		isSubmitting = false;
	}
</script>

<svelte:head>
	<title>{data.form.title}</title>
	{#if data.form.description}
		<meta name="description" content={data.form.description} />
	{/if}
</svelte:head>

<div class="form-container">
	{#if actionForm?.success}
		<section class="success-card" role="status">
			<div class="success-icon">✓</div>
			<h1>Resposta enviada</h1>
			<p>Obrigado por preencher o formulário <strong>{data.form.title}</strong>.</p>
			<p class="sent-by">Convite vinculado a {data.invitation.email}</p>
		</section>
	{:else}
		<header class="form-header">
			<div class="form-header-accent" aria-hidden="true"></div>
			<div class="form-header-body">
				<h1>{data.form.title}</h1>
				{#if data.form.description}
					<p class="form-description">{data.form.description}</p>
				{/if}
				<p class="form-author">Respondendo como <strong>{data.invitation.email}</strong></p>
			</div>
		</header>

		<main class="form-body">
			<form
				method="POST"
				action="?/submit"
				use:enhance={({ formData: submitFormData }) => {
					isSubmitting = true;
					for (const [key, value] of Object.entries(formData)) {
						if (Array.isArray(value)) {
							for (const item of value) submitFormData.append(key, String(item));
						} else if (value !== undefined && value !== null) {
							submitFormData.set(key, String(value));
						}
					}

					return async ({ update }) => {
						isSubmitting = false;
						await update();
					};
				}}
			>
				{#if actionForm?.error}
					<div class="error-box" role="alert">{actionForm.error}</div>
				{/if}

				<FormRenderer form={data.form.definition} bind:formData disabled={isSubmitting} />

				<div class="form-actions">
					<button type="submit" class="submit-btn" disabled={isSubmitting}>
						{isSubmitting ? 'Enviando...' : 'Enviar resposta'}
					</button>
				</div>
			</form>
		</main>
	{/if}
</div>

<style>
	.form-container {
		min-height: 100vh;
		background: var(--background-color-page, #f8fafc);
		padding: 2rem 1rem 3rem;
	}

	.form-header,
	.form-body,
	.success-card {
		max-width: 760px;
		margin: 0 auto;
	}

	.form-header {
		background: var(--background-color-card, #ffffff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		overflow: hidden;
		margin-bottom: 1rem;
	}

	.form-header-accent {
		height: 8px;
		background: var(--color-primary-500, #324acb);
	}

	.form-header-body {
		padding: 1.5rem;
	}

	h1 {
		margin: 0 0 0.5rem;
		font-size: 1.75rem;
		line-height: 1.2;
		color: var(--text-color-primary, #111827);
	}

	.form-description,
	.form-author,
	.sent-by {
		margin: 0.5rem 0 0;
		color: var(--text-color-secondary, #6b7280);
		line-height: 1.5;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.submit-btn {
		border: 0;
		border-radius: 8px;
		background: var(--color-primary-500, #324acb);
		color: white;
		font-weight: 700;
		padding: 0.875rem 1.25rem;
		cursor: pointer;
	}

	.submit-btn:disabled {
		opacity: 0.6;
		cursor: wait;
	}

	.error-box {
		margin-bottom: 1rem;
		padding: 0.875rem 1rem;
		border: 1px solid #fecaca;
		border-radius: 8px;
		background: #fef2f2;
		color: #991b1b;
	}

	.success-card {
		background: white;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		padding: 2rem;
		text-align: center;
	}

	.success-icon {
		width: 56px;
		height: 56px;
		margin: 0 auto 1rem;
		border-radius: 999px;
		background: #16a34a;
		color: white;
		display: grid;
		place-items: center;
		font-size: 1.75rem;
		font-weight: 800;
	}
</style>
