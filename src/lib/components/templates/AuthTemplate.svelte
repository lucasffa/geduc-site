<!-- src/lib/components/templates/AuthTemplate.svelte -->
<script lang="ts">
	export let title = 'GEDUC';
	export let subtitle = '';
</script>

<div class="auth-layout">
	<div class="auth-card">
		<div class="auth-header">
			<h1>{title}</h1>
			{#if subtitle}
				<p>{subtitle}</p>
			{/if}
		</div>

		<slot />

		<div class="auth-footer">
			<a href="/">Voltar ao site</a>
		</div>
	</div>
</div>

<style>
	.auth-layout {
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
