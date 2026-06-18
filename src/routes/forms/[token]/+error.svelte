<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$: status = $page.status;
	$: errorMessage = $page.error?.message || 'Ocorreu um erro inesperado.';

	$: isAlreadyResponded = status === 410;
	$: title = isAlreadyResponded ? 'Formulário já respondido' : 'Erro no Formulário';
</script>

<svelte:head>
	<title>{title}</title>
</svelte:head>

<div class="error-container">
	<div class="error-card">
		<div class="card-accent" class:accent-error={!isAlreadyResponded}></div>
		<div class="card-body">
			<div class="icon-container" class:icon-success={isAlreadyResponded} class:icon-error={!isAlreadyResponded}>
				{#if isAlreadyResponded}
					<!-- Checkmark -->
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
				{:else}
					<!-- Alert -->
					<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
				{/if}
			</div>

			<h1>{title}</h1>
			<p class="message">{errorMessage}</p>
			
			{#if isAlreadyResponded}
				<div class="thank-you-box">
					<p>Sua resposta já está registrada com segurança na nossa base de dados. Obrigado pelo seu tempo!</p>
				</div>
			{/if}

			<div class="actions">
				<button class="btn-home" on:click={() => goto('/')}>
					Voltar para o Início
				</button>
			</div>
		</div>
	</div>
</div>

<style>
	.error-container {
		min-height: 100vh;
		background: var(--background-color-page, #f8fafc);
		padding: 2rem 1rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.error-card {
		background: var(--background-color-card, #ffffff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		overflow: hidden;
		max-width: 500px;
		width: 100%;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
	}

	.card-accent {
		height: 8px;
		background: var(--color-primary-500, #324acb);
	}
	
	.card-accent.accent-error {
		background: #ef4444;
	}

	.card-body {
		padding: 3rem 2rem;
		text-align: center;
	}

	.icon-container {
		width: 64px;
		height: 64px;
		margin: 0 auto 1.5rem;
		border-radius: 50%;
		display: grid;
		place-items: center;
	}

	.icon-success {
		background: #dcfce7;
		color: #16a34a;
	}

	.icon-error {
		background: #fee2e2;
		color: #dc2626;
	}

	h1 {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		color: var(--text-color-primary, #111827);
		font-weight: 700;
	}

	.message {
		margin: 0 0 2rem;
		color: var(--text-color-secondary, #6b7280);
		line-height: 1.5;
		font-size: 1.1rem;
	}

	.thank-you-box {
		background: #f8fafc;
		border: 1px solid var(--border-color-default, #e2e8f0);
		border-radius: 8px;
		padding: 1.25rem;
		margin-bottom: 2rem;
		text-align: left;
	}

	.thank-you-box p {
		margin: 0;
		font-size: 0.95rem;
		color: #475569;
		line-height: 1.5;
	}

	.actions {
		display: flex;
		justify-content: center;
	}

	.btn-home {
		border: 0;
		border-radius: 8px;
		background: var(--color-primary-500, #324acb);
		color: white;
		font-weight: 600;
		padding: 0.875rem 1.5rem;
		cursor: pointer;
		transition: opacity 0.2s;
	}

	.btn-home:hover {
		opacity: 0.9;
	}
</style>
