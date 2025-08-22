<!-- src/routes/test-decorative/+page.svelte -->
<script lang="ts">
	import Heading from '$lib/components/atoms/Heading.svelte';
	import SectionHeader from '$lib/components/molecules/SectionHeader.svelte';
</script>

<svelte:head>
	<title>Teste Letras Decorativas - GEduc</title>
</svelte:head>

<div class="test-page">
	<div class="container">
		<h1>Teste de Letras Decorativas</h1>
		
		<section class="test-section">
			<h2>Teste Direto do Heading</h2>
			<Heading level={2} decorativeLetter={true}>
				Nosso Impacto
			</Heading>
			
			<!-- Teste com string direta -->
			<Heading level={3} decorativeLetter={true}>
				Amor
			</Heading>
		</section>

		<section class="test-section">
			<h2>Teste via SectionHeader</h2>
			<SectionHeader
				title="Nosso Impacto"
				subtitle="Testando funcionalidade"
				description="Esta é uma descrição de teste"
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationColor="var(--color-yellow-600)"
				decorationPosition="bottom"
			/>
		</section>

		<section class="test-section">
			<h2>Teste com Diferentes Títulos</h2>
			<div class="test-grid">
				<Heading level={3} decorativeLetter={true}>
					Amor
				</Heading>
				<Heading level={3} decorativeLetter={true}>
					Brasil
				</Heading>
				<Heading level={3} decorativeLetter={true}>
					Casa
				</Heading>
				<Heading level={3} decorativeLetter={true}>
					Educação
				</Heading>
			</div>
		</section>

		<section class="test-section">
			<h2>Teste de Debug</h2>
			<div class="debug-info">
				<p><strong>Verifique o console do navegador para logs de debug</strong></p>
				<p><strong>Caminho esperado para letra "N":</strong> /images/decorative-letters/letter-n.png</p>
				<p><strong>Arquivo existe:</strong> Sim (você confirmou)</p>
				<p><strong>Problema possível:</strong> Renderização condicional ou props não sendo passadas</p>
			</div>
		</section>
	</div>
</div>

<style>
	.test-page {
		padding: var(--spacing-2xl);
		background-color: var(--background-color-page);
		min-height: 100vh;
	}

	.container {
		max-width: var(--container-max-width-lg);
		margin: 0 auto;
	}

	h1 {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-bold);
		text-align: center;
		margin-bottom: var(--spacing-3xl);
		color: var(--text-color-primary);
	}

	.test-section {
		margin-bottom: var(--spacing-3xl);
		padding: var(--spacing-xl);
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
	}

	.test-section h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-lg);
		color: var(--text-color-primary);
		border-bottom: 2px solid var(--color-primary-200);
		padding-bottom: var(--spacing-sm);
	}

	.test-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-lg);
	}

	.debug-info {
		background-color: var(--background-color-subtle);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-md);
		border-left: 4px solid var(--color-primary-500);
	}

	.debug-info p {
		margin-bottom: var(--spacing-sm);
		color: var(--text-color-secondary);
	}

	.debug-info strong {
		color: var(--text-color-primary);
	}
</style>
