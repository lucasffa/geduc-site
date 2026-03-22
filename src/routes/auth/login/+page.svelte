<script>
	import { enhance } from '$app/forms';

	/** @type {import('./$types').ActionData} */
	export let form;
</script>

<svelte:head>
	<title>Login — GEDUC</title>
</svelte:head>

<div class="auth-container">
	<div class="auth-card">
		<div class="auth-header">
			<h1>GEDUC</h1>
			<p>Painel de Gestão</p>
		</div>

		{#if form?.error}
			<div class="auth-error">{form.error}</div>
		{/if}

		<form method="POST" use:enhance>
			<div class="form-group">
				<label for="email">E-mail</label>
				<input
					type="email"
					id="email"
					name="email"
					value={form?.email ?? ''}
					placeholder="seu@email.com"
					required
					autocomplete="email"
				/>
			</div>

			<div class="form-group">
				<label for="password">Senha</label>
				<input
					type="password"
					id="password"
					name="password"
					placeholder="Sua senha"
					required
					autocomplete="current-password"
				/>
			</div>

			<button type="submit" class="auth-submit">Entrar</button>
		</form>

		<div class="auth-footer">
			<a href="/">Voltar ao site</a>
		</div>
	</div>
</div>

<style>
	.auth-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-700) 100%);
		padding: var(--spacing-lg);
	}

	.auth-card {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-xl);
		padding: var(--spacing-2xl);
		width: 100%;
		max-width: 420px;
		box-shadow: var(--shadow-xl);
	}

	.auth-header {
		text-align: center;
		margin-bottom: var(--spacing-xl);
	}

	.auth-header h1 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
		margin: 0 0 var(--spacing-xs);
	}

	.auth-header p {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-600);
		margin: 0;
	}

	.auth-error {
		background: var(--color-red-100);
		color: var(--color-error);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
		text-align: center;
	}

	.form-group {
		margin-bottom: var(--spacing-md);
	}

	.form-group label {
		display: block;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-700);
		margin-bottom: var(--spacing-xs);
	}

	.form-group input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: var(--border-width-default) solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		transition: border-color var(--transition-fast);
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}

	.auth-submit {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-primary-500);
		color: var(--color-neutral-0);
		border: none;
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		font-family: var(--font-family-sans);
		cursor: pointer;
		transition: background var(--transition-fast);
		margin-top: var(--spacing-md);
	}

	.auth-submit:hover {
		background: var(--color-primary-600);
	}

	.auth-footer {
		text-align: center;
		margin-top: var(--spacing-lg);
	}

	.auth-footer a {
		color: var(--color-primary-500);
		font-size: var(--font-size-sm);
		text-decoration: none;
	}

	.auth-footer a:hover {
		text-decoration: underline;
	}
</style>
