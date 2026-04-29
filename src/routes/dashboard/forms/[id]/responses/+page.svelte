<!-- src/routes/dashboard/forms/[id]/responses/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let searchQuery = '';
	let viewMode: 'individual' | 'aggregate' = 'individual';
	let expandedResponseId: string | null = null;

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

	// Resolve field ID to its label from the form definition
	function getFieldLabel(fieldId: string): string {
		const fields = data.form.definition?.fields || [];
		const field = fields.find((f: any) => f.id === fieldId || f.name === fieldId);
		return field?.label || fieldId;
	}

	// Get all unique field IDs across all responses
	function getAllFieldIds(): string[] {
		const fields = data.form.definition?.fields || [];
		if (fields.length > 0) {
			return fields.filter((f: any) => f.type !== 'hidden' && f.type !== 'button').map((f: any) => f.id);
		}
		// Fallback: collect from answers
		const ids = new Set<string>();
		data.responses.forEach((r: any) => {
			Object.keys(r.answers || {}).forEach(k => ids.add(k));
		});
		return Array.from(ids);
	}

	// Aggregate view: get all answers for a specific field
	function getFieldAnswers(fieldId: string): { value: any; submitter: string; date: string }[] {
		return data.responses
			.filter((r: any) => r.answers?.[fieldId] !== undefined && r.answers[fieldId] !== '')
			.map((r: any) => ({
				value: r.answers[fieldId],
				submitter: r.submitterName || r.submitterEmail || 'Anônimo',
				date: formatDate(r.submittedAt)
			}));
	}

	function formatAnswer(value: any): string {
		if (value === null || value === undefined) return '-';
		if (Array.isArray(value)) return value.join(', ');
		return String(value) || '-';
	}

	function downloadAsCSV() {
		const fieldIds = getAllFieldIds();
		const headers = ['Data Submissão', 'Nome', 'Email', ...fieldIds.map(getFieldLabel)];
		const rows = data.responses.map((res: any) => [
			formatDate(res.submittedAt),
			res.submitterName || '-',
			res.submitterEmail || '-',
			...fieldIds.map(id => formatAnswer(res.answers?.[id]))
		]);

		const csv = [
			headers.join(','),
			...rows.map((row: any) => row.map((v: any) => `"${String(v).replace(/"/g, '""')}"`).join(','))
		].join('\n');

		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${data.form.slug}-respostas.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	}

	$: filteredResponses = data.responses.filter((r: any) => {
		if (!searchQuery) return true;
		const q = searchQuery.toLowerCase();
		return (
			(r.submitterName || '').toLowerCase().includes(q) ||
			(r.submitterEmail || '').toLowerCase().includes(q)
		);
	});
	$: aggregateFieldCount = getAllFieldIds().length;
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

		<div class="header-actions">
			{#if data.responses.length > 0}
				<div class="view-toggle">
					<button 
						class="toggle-btn" 
						class:is-active={viewMode === 'individual'}
						on:click={() => viewMode = 'individual'}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
							<circle cx="9" cy="7" r="4"/>
						</svg>
						Individual
					</button>
					<button 
						class="toggle-btn" 
						class:is-active={viewMode === 'aggregate'}
						on:click={() => viewMode = 'aggregate'}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M18 20V10M12 20V4M6 20v-6"/>
						</svg>
						Por Pergunta
					</button>
				</div>
				<button class="btn-secondary" on:click={downloadAsCSV}>
					<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
						<polyline points="7 10 12 15 17 10"/>
						<line x1="12" y1="15" x2="12" y2="3"/>
					</svg>
					Baixar CSV
				</button>
			{/if}
		</div>
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
			<!-- Search bar -->
			<div class="toolbar">
				<div class="search-wrap">
					<svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="11" cy="11" r="8"/>
						<path d="m21 21-4.35-4.35"/>
					</svg>
					<input
						type="search"
						placeholder="Buscar por nome ou email..."
						bind:value={searchQuery}
						aria-label="Buscar respostas"
					/>
				</div>
				<span class="results-count">
					<strong>{filteredResponses.length}</strong> de {data.responses.length} resposta{data.responses.length !== 1 ? 's' : ''}
				</span>
			</div>
			<div class="responses-kpis">
				<span class="kpi-chip"><strong>{data.responses.length}</strong> envios</span>
				<span class="kpi-chip"><strong>{aggregateFieldCount}</strong> perguntas com resposta</span>
			</div>

			{#if viewMode === 'individual'}
				<!-- Individual view -->
				<div class="responses-list">
					{#each filteredResponses as response (response.id)}
						<div class="response-card" class:is-expanded={expandedResponseId === response.id}>
							<button class="response-header" type="button" aria-expanded={expandedResponseId === response.id} on:click={() => expandedResponseId = expandedResponseId === response.id ? null : response.id}>
								<div class="response-info">
									<div class="response-avatar">
										{(response.submitterName || 'A')[0].toUpperCase()}
									</div>
									<div>
										<h3>{response.submitterName || 'Anônimo'}</h3>
										{#if response.submitterEmail}
											<p class="response-email">{response.submitterEmail}</p>
										{/if}
									</div>
								</div>
								<div class="response-meta">
									<span class="response-date">{formatDate(response.submittedAt)}</span>
									<svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M6 9l6 6 6-6"/>
									</svg>
								</div>
							</button>

							{#if expandedResponseId === response.id}
								<div class="response-answers">
									{#each Object.entries(response.answers || {}) as [fieldId, answer]}
										<div class="answer-item">
											<span class="answer-label">{getFieldLabel(fieldId)}</span>
											<span class="answer-value">{formatAnswer(answer)}</span>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<!-- Aggregate view -->
				<div class="aggregate-list">
					{#each getAllFieldIds() as fieldId}
						{@const answers = getFieldAnswers(fieldId)}
						{#if answers.length > 0}
							<div class="aggregate-card">
								<h3 class="aggregate-question">{getFieldLabel(fieldId)}</h3>
								<p class="aggregate-count">{answers.length} resposta{answers.length !== 1 ? 's' : ''}</p>
								<div class="aggregate-answers">
									{#each answers as item}
										<div class="aggregate-row">
											<span class="aggregate-value">{formatAnswer(item.value)}</span>
											<span class="aggregate-submitter">{item.submitter}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
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

	.header-actions {
		display: flex;
		align-items: center;
		gap: 0.75rem;
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

	/* View toggle */
	.view-toggle {
		display: flex;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
	}

	.toggle-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.375rem;
		padding: 0.5rem 0.875rem;
		font-size: 0.8125rem;
		font-family: inherit;
		background: transparent;
		color: var(--text-color-secondary, #6b7280);
		border: none;
		cursor: pointer;
		transition: all 0.15s;
		white-space: nowrap;
	}

	.toggle-btn:first-child {
		border-right: 1px solid var(--border-color-default, #e5e7eb);
	}

	.toggle-btn.is-active {
		background: var(--color-primary-500, #6366f1);
		color: white;
	}

	.toggle-btn:hover:not(.is-active) {
		background: var(--background-color-subtle, #f3f4f6);
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
		padding: 1.5rem 2.5rem;
	}

	/* Toolbar */
	.toolbar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		margin-bottom: 1.5rem;
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 10px;
		padding: 0.75rem 1rem;
	}

	.search-wrap {
		position: relative;
		flex: 1;
		max-width: 350px;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-color-tertiary, #9ca3af);
		pointer-events: none;
	}

	.search-wrap input {
		width: 100%;
		padding: 0.5rem 0.75rem 0.5rem 2.25rem;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 7px;
		font-size: 0.875rem;
		font-family: inherit;
		color: var(--text-color-primary, #111827);
		background: var(--background-color-card, #fff);
		outline: none;
		transition: border-color 0.15s;
	}

	.search-wrap input:focus {
		border-color: var(--color-primary-500, #6366f1);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.results-count {
		font-size: 0.8125rem;
		color: var(--text-color-secondary, #6b7280);
		white-space: nowrap;
	}

	.responses-kpis {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 1rem;
		flex-wrap: wrap;
	}

	.kpi-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.28rem 0.68rem;
		border-radius: 999px;
		font-size: 0.78rem;
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		color: var(--text-color-secondary, #6b7280);
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

	/* Individual view */
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
		width: 100%;
		border: none;
		background: transparent;
		text-align: left;
	}

	.response-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.response-avatar {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: color-mix(in srgb, var(--color-primary-500, #6366f1) 12%, transparent);
		color: var(--color-primary-500, #6366f1);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.875rem;
		flex-shrink: 0;
	}

	.response-header h3 {
		margin: 0 0 0.125rem;
		font-size: 0.9375rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
	}

	.response-email {
		margin: 0;
		font-size: 0.8125rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.response-meta {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.response-date {
		font-size: 0.8125rem;
		color: var(--text-color-tertiary, #9ca3af);
		white-space: nowrap;
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

	/* Aggregate view */
	.aggregate-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.aggregate-card {
		background: var(--background-color-card, #fff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 10px;
		padding: 1.25rem;
	}

	.aggregate-question {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-color-primary, #111827);
	}

	.aggregate-count {
		margin: 0 0 1rem;
		font-size: 0.8125rem;
		color: var(--text-color-tertiary, #9ca3af);
	}

	.aggregate-answers {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.aggregate-row {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.5rem 0.75rem;
		background: var(--background-color-subtle, #f8fafc);
		border-radius: 6px;
		font-size: 0.875rem;
	}

	.aggregate-value {
		color: var(--text-color-primary, #111827);
		word-break: break-word;
	}

	.aggregate-submitter {
		color: var(--text-color-tertiary, #9ca3af);
		font-size: 0.8125rem;
		white-space: nowrap;
		flex-shrink: 0;
	}

	@media (max-width: 768px) {
		.page-header {
			flex-direction: column;
			align-items: flex-start;
			padding: 1.5rem;
		}

		.header-actions {
			width: 100%;
			justify-content: space-between;
		}

		.header-nav {
			width: 100%;
		}

		.content {
			padding: 1rem;
		}

		.answer-item {
			grid-template-columns: 1fr;
			gap: 0.25rem;
		}

		.answer-label {
			font-size: 0.75rem;
			color: var(--text-color-tertiary, #9ca3af);
		}
	}
</style>
