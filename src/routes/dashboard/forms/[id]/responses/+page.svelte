<!-- src/routes/dashboard/forms/[id]/responses/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	function goBack() {
		goto('/dashboard/forms');
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

	function downloadAsCSV() {
		const headers = ['ID', 'Data Submissão', 'Nome', 'Email', ...Object.keys(data.form.definition.fields || {})];
		const rows = data.responses.map((res: any) => [
			res.id,
			formatDate(res.submittedAt),
			res.submitterName || '-',
			res.submitterEmail || '-',
			...Object.values(res.answers || {})
		]);

		const csv = [
			headers.join(','),
			...rows.map((row: any) => row.map((v: any) => `"${v}"`).join(','))
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.form.slug}-respostas.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Respostas - {data.form.title}</title>
</svelte:head>

<div class="page">
	<!-- Header -->
	<header class="page-header">
		<div class="header-nav">
			<button class="back-btn" on:click={goBack} title="Voltar">
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M19 12H5M12 19l-7-7 7-7"/>
				</svg>
			</button>
			<div class="header-info">
				<h1>{data.form.title}</h1>
				<p class="subtitle">Respostas recebidas</p>
			</div>
		</div>

		{#if data.responses.length > 0}
			<button class="btn-secondary" on:click={downloadAsCSV}>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
					<polyline points="7 10 12 15 17 10"/>
					<line x1="12" y1="15" x2="12" y2="3"/>
				</svg>
				Baixar CSV
			</button>
		{/if}
	</header>

	<!-- Content -->
	<main class="content">
		{#if data.responses.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📊</div>
				<h2>Nenhuma resposta ainda</h2>
				<p>Compartilhe o formulário para coletar respostas.</p>
			</div>
		{:else}
			<div class="responses-container">
				<p class="responses-count">
					<strong>{data.responses.length}</strong> resposta{data.responses.length !== 1 ? 's' : ''} recebida{data.responses.length !== 1 ? 's' : ''}
				</p>

				<div class="responses-list">
					{#each data.responses as response (response.id)}
						<div class="response-card">
							<div class="response-header">
								<div>
									<h3>{response.submitterName || 'Anônimo'}</h3>
									{#if response.submitterEmail}
										<p class="response-email">{response.submitterEmail}</p>
									{/if}
								</div>
								<span class="response-date">{formatDate(response.submittedAt)}</span>
							</div>

							<div class="response-answers">
								{#each Object.entries(response.answers || {}) as [fieldId, answer]}
									<div class="answer-item">
										<span class="answer-label">{fieldId}</span>
										<span class="answer-value">{answer || '-'}</span>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
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
		gap: 2rem;
	}

	.header-nav {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
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
		border-color: var(--border-color-subtle, #d1d5db);
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

	.btn-secondary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--color-primary-500, #6366f1);
		color: white;
		border: none;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: background-color 0.15s;
		white-space: nowrap;
	}

	.btn-secondary:hover {
		background: var(--color-primary-600, #4f46e5);
	}

	.content {
		padding: 2rem 2.5rem;
	}

	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
		background: var(--background-color-card, #fff);
		border: 1.5px dashed var(--border-color-default, #e5e7eb);
		border-radius: 12px;
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0 0 0.5rem;
		color: var(--text-color-primary, #111827);
	}

	.empty-state p {
		color: var(--text-color-secondary, #6b7280);
		margin: 0;
	}

	.responses-container {
		background: var(--background-color-card, #fff);
		border-radius: 12px;
		padding: 1.5rem;
	}

	.responses-count {
		margin: 0 0 1.5rem;
		font-size: 0.875rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.responses-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.response-card {
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 10px;
		padding: 1.25rem;
		transition: border-color 0.15s;
	}

	.response-card:hover {
		border-color: var(--color-primary-500, #6366f1);
	}

	.response-header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 1rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border-color-subtle, #f3f4f6);
	}

	.response-header h3 {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
	}

	.response-email {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.response-date {
		font-size: 0.8125rem;
		color: var(--text-color-tertiary, #9ca3af);
		white-space: nowrap;
		margin-left: 1rem;
	}

	.response-answers {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.answer-item {
		display: grid;
		grid-template-columns: 150px 1fr;
		gap: 1rem;
		align-items: baseline;
		padding: 0.5rem 0;
	}

	.answer-label {
		font-weight: 500;
		color: var(--text-color-primary, #111827);
		font-size: 0.875rem;
	}

	.answer-value {
		color: var(--text-color-secondary, #6b7280);
		word-break: break-word;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
		}

		.header-nav {
			width: 100%;
		}

		.answer-item {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.answer-label {
			font-weight: 500;
			font-size: 0.75rem;
			color: var(--text-color-tertiary, #9ca3af);
			text-transform: uppercase;
		}
	}
</style>
