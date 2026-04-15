<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Formulário Enviado</title>
</svelte:head>

<div class="success-container">
	<div class="success-card">
		<div class="success-icon">✅</div>
		<h1>Formulário Enviado com Sucesso!</h1>
		<p>Sua resposta foi registrada. Obrigado por participar!</p>

		<div class="success-actions">
			<button
				class="home-button"
				on:click={() => goto('/')}
			>
				Voltar ao Início
			</button>
		</div>
	</div>
</div>

<style>
	.success-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem;
		background: var(--bg-secondary);
	}

	.success-card {
		background: var(--bg-primary);
		border-radius: 16px;
		padding: 3rem;
		text-align: center;
		box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
		max-width: 500px;
		width: 100%;
	}

	.success-icon {
		font-size: 4rem;
		margin-bottom: 1.5rem;
	}

	.success-card h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 1rem;
	}

	.success-card p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.success-actions {
		display: flex;
		justify-content: center;
	}

	.home-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.home-button:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}
</style>