<!-- src/routes/validar/certificado/+page.svelte -->
<script lang="ts">
	export let data;

	let code = data.code ?? '';

	function formatDateBR(dateStr: string | null): string {
		if (!dateStr) return 'N/A';
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
	}
</script>

<svelte:head>
	<title>Validar Certificado - GEDUC</title>
</svelte:head>

<div class="page">
	<div class="container">
		<h1>Validar Certificado</h1>
		<p class="subtitle">Insira o código de validação presente no certificado para verificar sua autenticidade.</p>

		<form method="get" class="search-form">
			<input
				type="text"
				name="code"
				bind:value={code}
				placeholder="Cole o código de validação aqui"
				class="input"
			/>
			<button type="submit" class="btn">Validar</button>
		</form>

		{#if data.result}
			{#if data.result.valid}
				<div class="result valid">
					<div class="badge valid-badge">Certificado Válido</div>
					<dl>
						<dt>Participante</dt>
						<dd>{data.result.participantName}</dd>

						<dt>Função</dt>
						<dd>{data.result.role}</dd>

						<dt>Carga Horária</dt>
						<dd>{data.result.workloadHours} horas</dd>

						<dt>Período</dt>
						<dd>{formatDateBR(data.result.periodStart)} a {formatDateBR(data.result.periodEnd)}</dd>

						<dt>Emitido em</dt>
						<dd>{data.result.issuedAt}</dd>

						<dt>Organização</dt>
						<dd>{data.result.organization}</dd>
					</dl>
				</div>
			{:else}
				<div class="result invalid">
					<div class="badge invalid-badge">Certificado Não Encontrado</div>
					<p>O código informado não corresponde a nenhum certificado emitido. Verifique se o código foi digitado corretamente.</p>
				</div>
			{/if}
		{/if}
	</div>
</div>

<style>
	.page {
		min-height: 100vh;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 4rem 1rem;
		background-color: var(--background-color-page, #f5f5f7);
	}

	.container {
		max-width: 600px;
		width: 100%;
	}

	h1 {
		font-size: 1.75rem;
		font-weight: 700;
		color: var(--text-color-primary, #1a1a2e);
		margin-bottom: 0.5rem;
	}

	.subtitle {
		color: var(--text-color-secondary, #6b6b6b);
		margin-bottom: 2rem;
		font-size: 0.95rem;
	}

	.search-form {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 2rem;
	}

	.input {
		flex: 1;
		padding: 0.65rem 0.85rem;
		border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 6px;
		font-size: 0.9rem;
		font-family: monospace;
		background: white;
	}

	.input:focus {
		outline: none;
		border-color: var(--accent-color, #324acb);
		box-shadow: 0 0 0 2px rgba(50, 74, 203, 0.15);
	}

	.btn {
		padding: 0.65rem 1.25rem;
		background: var(--accent-color, #324acb);
		color: white;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
		white-space: nowrap;
	}

	.btn:hover {
		opacity: 0.9;
	}

	.result {
		padding: 1.5rem;
		border-radius: 8px;
		border: 1px solid;
	}

	.result.valid {
		background: #f0fdf4;
		border-color: #bbf7d0;
	}

	.result.invalid {
		background: #fef2f2;
		border-color: #fecaca;
	}

	.badge {
		display: inline-block;
		padding: 0.25rem 0.75rem;
		border-radius: 20px;
		font-size: 0.8rem;
		font-weight: 600;
		margin-bottom: 1rem;
	}

	.valid-badge {
		background: #16a34a;
		color: white;
	}

	.invalid-badge {
		background: #dc2626;
		color: white;
	}

	dl {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: 0.5rem 1rem;
	}

	dt {
		font-weight: 600;
		color: var(--text-color-secondary, #4a4a4a);
		font-size: 0.85rem;
	}

	dd {
		color: var(--text-color-primary, #1a1a2e);
		font-size: 0.9rem;
	}

	.result.invalid p {
		color: #7f1d1d;
		font-size: 0.9rem;
	}
</style>
