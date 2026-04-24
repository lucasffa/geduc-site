<!-- src/routes/dashboard/participantes/[id]/responses/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let expandedResponseId: string | null = null;

	function goBack() {
		goto('/dashboard/participantes');
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatAnswer(value: any): string {
		if (value === null || value === undefined) return '-';
		if (Array.isArray(value)) return value.join(', ');
		return String(value) || '-';
	}

	function viewFormResponses(formId: string) {
		goto(`/dashboard/forms/${formId}/responses`);
	}
</script>

<svelte:head>
	<title>Respostas de {data.participant.name}</title>
</svelte:head>

<div class="page">
	<header class="page-header">
		<div class="header-nav">
			<button class="back-btn" on:click={goBack} title="Voltar">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
			</button>
			<div class="header-info">
				<h1>Respostas de {data.participant.name}</h1>
				<p class="subtitle">{data.participant.email} · {data.participant.role}</p>
			</div>
		</div>
	</header>

	<main class="content">
		{#if data.responses.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📋</div>
				<h2>Nenhuma resposta encontrada</h2>
				<p>Este participante ainda não respondeu nenhum formulário.</p>
			</div>
		{:else}
			<p class="responses-summary">
				<strong>{data.responses.length}</strong> formulário{data.responses.length !== 1 ? 's' : ''} respondido{data.responses.length !== 1 ? 's' : ''}
			</p>

			<div class="responses-list">
				{#each data.responses as response (response.id)}
					<div class="response-card" class:is-expanded={expandedResponseId === response.id}>
						<!-- svelte-ignore a11y-click-events-have-key-events -->
						<!-- svelte-ignore a11y-no-static-element-interactions -->
						<div class="response-header" on:click={() => expandedResponseId = expandedResponseId === response.id ? null : response.id}>
							<div class="response-info">
								<div class="form-icon">
									<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
										<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
										<polyline points="14 2 14 8 20 8"/>
										<line x1="16" y1="13" x2="8" y2="13"/>
										<line x1="16" y1="17" x2="8" y2="17"/>
									</svg>
								</div>
								<div>
									<h3>{response.formTitle}</h3>
									<p class="response-date">Respondido em {formatDate(response.submittedAt)}</p>
								</div>
							</div>
							<div class="response-actions">
								<button 
									class="icon-btn" 
									title="Ver todas as respostas deste formulário"
									on:click|stopPropagation={() => viewFormResponses(response.formId)}
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
										<polyline points="15 3 21 3 21 9"/>
										<line x1="10" y1="14" x2="21" y2="3"/>
									</svg>
								</button>
								<svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M6 9l6 6 6-6"/>
								</svg>
							</div>
						</div>

						{#if expandedResponseId === response.id}
							<div class="response-answers">
								{#each Object.entries(response.answers || {}) as [fieldId, answer]}
									<div class="answer-item">
										<span class="answer-label">{fieldId}</span>
										<span class="answer-value">{formatAnswer(answer)}</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		background: var(--background-color-page, #f8fafc);
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2rem 2.5rem;
		background: var(--background-color-card, #fff);
		border-bottom: 1px solid var(--border-color-default, #e5e7eb);
	}

	.header-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.back-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
		background: transparent;
		color: var(--text-color-primary, #111827);
		cursor: pointer;
		transition: all 0.15s;
	}

	.back-btn:hover {
		background: var(--background-color-subtle, #f3f4f6);
	}

	.header-info h1 {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0 0 0.2rem;
		color: var(--text-color-primary, #111827);
	}

	.subtitle {
		font-size: 0.875rem;
		color: var(--text-color-secondary, #6b7280);
		margin: 0;
	}

	.content {
		padding: 1.5rem 2.5rem;
	}

	.responses-summary {
		font-size: 0.875rem;
		color: var(--text-color-secondary, #6b7280);
		margin: 0 0 1.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		background: var(--background-color-card, #fff);
		border: 1.5px dashed var(--border-color-default, #e5e7eb);
		border-radius: 12px;
	}

	.empty-icon { font-size: 3rem; margin-bottom: 1rem; }
	.empty-state h2 { font-size: 1.25rem; font-weight: 600; margin: 0 0 0.5rem; }
	.empty-state p { color: var(--text-color-secondary, #6b7280); margin: 0; }

	.responses-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.response-card {
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 10px;
		overflow: hidden;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.response-card:hover {
		border-color: color-mix(in srgb, var(--color-primary-500, #6366f1) 40%, transparent);
	}

	.response-card.is-expanded {
		border-color: var(--color-primary-500, #6366f1);
		box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
	}

	.response-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.25rem;
		cursor: pointer;
		user-select: none;
	}

	.response-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.form-icon {
		width: 36px;
		height: 36px;
		border-radius: 8px;
		background: color-mix(in srgb, var(--color-primary-500, #6366f1) 10%, transparent);
		color: var(--color-primary-500, #6366f1);
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}

	.response-header h3 {
		margin: 0 0 0.125rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
	}

	.response-date {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-color-tertiary, #9ca3af);
	}

	.response-actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 6px;
		background: transparent;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		transition: all 0.12s;
	}

	.icon-btn:hover {
		background: var(--background-color-subtle, #f3f4f6);
		color: var(--color-primary-500, #6366f1);
	}

	.chevron {
		color: var(--text-color-tertiary, #9ca3af);
		transition: transform 0.2s;
	}

	.is-expanded .chevron {
		transform: rotate(180deg);
	}

	.response-answers {
		padding: 0 1.25rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		border-top: 1px solid var(--border-color-subtle, #f3f4f6);
		padding-top: 1rem;
	}

	.answer-item {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 1rem;
		align-items: baseline;
		padding: 0.4rem 0;
	}

	.answer-label {
		font-weight: 500;
		color: var(--text-color-primary, #111827);
		font-size: 0.8125rem;
		text-transform: uppercase;
		letter-spacing: 0.03em;
	}

	.answer-value {
		color: var(--text-color-secondary, #6b7280);
		word-break: break-word;
		font-size: 0.875rem;
	}

	@media (max-width: 768px) {
		.page-header { padding: 1.5rem; }
		.content { padding: 1rem; }
		.answer-item { grid-template-columns: 1fr; gap: 0.25rem; }
	}
</style>
