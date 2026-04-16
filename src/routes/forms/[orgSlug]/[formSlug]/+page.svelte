<!-- src/routes/forms/[slug]/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import FormRenderer from '$lib/components/forms/FormRenderer.svelte';

	export let data: PageData;
	// SvelteKit ActionData — note: must NOT be named "form" to avoid collision
	export let form: ActionData;

	let isSubmitting = false;
	let submitted = false;
	let formData: Record<string, any> = {};
	let fieldErrors: Record<string, string> = {};

	// When the server returns a success, show the success state
	$: if (form?.success) {
		submitted = true;
	}
</script>

<svelte:head>
	<title>{data.form.title}</title>
	{#if data.form.description}
		<meta name="description" content={data.form.description} />
	{/if}
</svelte:head>

<div class="page-wrapper">
	<div class="form-container">

		{#if submitted}
			<!-- ── Success state ── -->
			<div class="success-state" role="status" aria-live="polite">
				<div class="success-icon">
					<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
						<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
						<polyline points="22 4 12 14.01 9 11.01"/>
					</svg>
				</div>
				<h2>Resposta enviada!</h2>
				<p>Obrigado por preencher o formulário <strong>{data.form.title}</strong>. Suas respostas foram registradas com sucesso.</p>
				{#if data.form.authorName}
					<p class="sent-by">Formulário criado por {data.form.authorName}</p>
				{/if}
			</div>

		{:else}
			<!-- ── Form header ── -->
			<header class="form-header">
				<div class="form-header-accent" aria-hidden="true"></div>
				<div class="form-header-body">
					<h1>{data.form.title}</h1>
					{#if data.form.description}
						<p class="form-description">{data.form.description}</p>
					{/if}
					{#if data.form.authorName}
						<p class="form-author">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
								<circle cx="12" cy="7" r="4"/>
							</svg>
							{data.form.authorName}
						</p>
					{/if}
				</div>
			</header>

			<!-- ── Form body ── -->
			<main class="form-body">
				<form
					method="POST"
					action="?/submit"
					use:enhance={() => {
						isSubmitting = true;
						fieldErrors = {};

						return async ({ result, update }) => {
							isSubmitting = false;
							if (result.type === 'success') {
								submitted = true;
							} else {
								// Let SvelteKit update `form` prop with server errors
								await update();
							}
						};
					}}
				>
					<FormRenderer
						form={data.form.definition}
						bind:formData
						disabled={isSubmitting}
						errors={fieldErrors}
					/>

					<div class="form-actions">
						<button type="submit" disabled={isSubmitting} class="submit-button">
							{#if isSubmitting}
								<span class="spinner" aria-hidden="true"></span>
								Enviando...
							{:else}
								Enviar resposta
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
									<line x1="22" y1="2" x2="11" y2="13"/>
									<polygon points="22 2 15 22 11 13 2 9 22 2"/>
								</svg>
							{/if}
						</button>
					</div>
				</form>
			</main>

			<footer class="form-footer">
				<span>Os campos marcados com <span class="req-symbol">*</span> são obrigatórios.</span>
			</footer>
		{/if}

	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

	.page-wrapper {
		min-height: 100vh;
		background: var(--bg-secondary, #f8fafc);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 3rem 1rem 5rem;
		font-family: 'DM Sans', system-ui, sans-serif;
	}

	.form-container {
		width: 100%;
		max-width: 680px;
	}

	/* ── Header card ── */
	.form-header {
		background: var(--background-color-card);
		border-radius: var(--border-radius-md) var(--border-radius-md) 0 0;
		overflow: hidden;
		border: 1px solid var(--border-color-default);
		border-bottom: none;
		box-shadow: 0 1px 3px rgba(0,0,0,.06);
	}

	.form-header-accent {
		height: 6px;
		background: var(--color-primary-500);
	}

	.form-header-body {
		padding: 2rem 2.25rem 1.75rem;
	}

	.form-header h1 {
		font-size: 1.625rem;
		font-weight: var(--font-weight-semibold);
		color: var(--text-color-primary);
		margin: 0 0 0.625rem;
		line-height: 1.3;
		letter-spacing: -0.02em;
	}

	.form-description {
		font-size: var(--body-text-font-size);
		color: var(--text-color-secondary);
		margin: 0 0 0.75rem;
		line-height: 1.6;
	}

	.form-author {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--caption-text-font-size);
		color: var(--text-color-tertiary);
		margin: 0;
	}

	/* ── Body card ── */
	.form-body {
		background: var(--background-color-card);
		border: 1px solid var(--border-color-default);
		border-top: none;
		padding: 2.25rem;
		box-shadow: 0 1px 3px rgba(0,0,0,.06);
	}

	/* ── Actions ── */
	.form-actions {
		margin-top: 2.5rem;
		display: flex;
		justify-content: flex-end;
	}

	.submit-button {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--color-primary-500);
		color: var(--text-color-white);
		border: none;
		padding: var(--spacing-md) var(--spacing-xl);
		border-radius: var(--border-radius-sm);
		font-size: var(--body-text-font-size);
		font-weight: var(--button-text-font-weight);
		font-family: var(--font-family-sans);
		cursor: pointer;
		transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
		letter-spacing: -0.01em;
	}

	.submit-button:hover:not(:disabled) {
		background: var(--color-primary-600);
		transform: translateY(-1px);
		box-shadow: 0 4px 14px color-mix(in srgb, var(--color-primary-500) 35%, transparent);
	}

	.submit-button:active:not(:disabled) {
		transform: translateY(0);
	}

	.submit-button:disabled {
		opacity: 0.65;
		cursor: not-allowed;
	}

	.spinner {
		display: inline-block;
		width: 15px;
		height: 15px;
		border: 2px solid rgba(255,255,255,0.4);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin { to { transform: rotate(360deg); } }

	/* ── Footer ── */
	.form-footer {
		background: var(--background-color-card);
		border: 1px solid var(--border-color-default);
		border-top: 1px solid var(--border-color-default);
		border-radius: 0 0 var(--border-radius-lg) var(--border-radius-lg);
		padding: var(--spacing-md) 2.25rem;
		font-size: var(--caption-text-font-size);
		color: var(--text-color-tertiary);
		box-shadow: 0 2px 8px rgba(0,0,0,.06);
	}

	.req-symbol {
		color: var(--color-error);
		font-weight: var(--font-weight-semibold);
	}

	/* ── Success state ── */
	.success-state {
		background: var(--background-color-card);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-lg);
		padding: 3.5rem 2.5rem;
		text-align: center;
		box-shadow: 0 1px 3px rgba(0,0,0,.06);
	}

	.success-icon {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 72px;
		height: 72px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-success) 12%, transparent);
		color: var(--color-success);
		margin: 0 auto 1.5rem;
	}

	.success-state h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary, #111827);
		margin: 0 0 0.75rem;
		letter-spacing: -0.02em;
	}

	.success-state p {
		font-size: 0.9375rem;
		color: var(--text-secondary, #6b7280);
		margin: 0 0 0.5rem;
		line-height: 1.6;
	}

	.sent-by {
		font-size: 0.8125rem !important;
		color: var(--text-secondary, #9ca3af) !important;
		margin-top: 1.25rem !important;
		font-style: italic;
	}

	/* ── Responsive ── */
	@media (max-width: 640px) {
		.page-wrapper {
			padding: 1.5rem 0.75rem 4rem;
			align-items: flex-start;
		}

		.form-header-body {
			padding: 1.5rem 1.25rem 1.25rem;
		}

		.form-body {
			padding: 1.5rem 1.25rem;
		}

		.form-footer {
			padding: 0.75rem 1.25rem;
		}

		.form-actions {
			justify-content: stretch;
		}

		.submit-button {
			width: 100%;
			justify-content: center;
		}
	}
</style>