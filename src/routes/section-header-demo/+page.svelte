<!-- src/routes/section-header-demo/+page.svelte -->
<script lang="ts">
	import SectionHeader from '$lib/components/molecules/SectionHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
</script>

<svelte:head>
	<title>SectionHeader Demo - GEduc</title>
	<meta name="description" content="Demonstração das funcionalidades do componente SectionHeader" />
</svelte:head>

<div class="demo-page">
	<div class="container">
		<h1 class="demo-title">SectionHeader - Demonstração</h1>
		
		<!-- Exemplo Básico -->
		<section class="demo-section">
			<h2 class="demo-section-title">Exemplo Básico</h2>
			<SectionHeader
				title="Nosso Impacto"
				subtitle="Transformando vidas através da educação"
				description="Descubra como estamos fazendo a diferença na comunidade através de nossos programas educacionais e iniciativas sociais."
				align="center"
			/>
		</section>

		<!-- Com Letra Decorativa -->
		<section class="demo-section">
			<h2 class="demo-section-title">Com Letra Decorativa</h2>
			<SectionHeader
				title="Nosso Impacto"
				subtitle="Transformando vidas através da educação"
				description="Descubra como estamos fazendo a diferença na comunidade através de nossos programas educacionais e iniciativas sociais."
				align="center"
				decorativeLetter={true}
			/>
		</section>

		<!-- Com Decoração -->
		<section class="demo-section">
			<h2 class="demo-section-title">Com Decoração</h2>
			<SectionHeader
				title="Nosso Impacto"
				subtitle="Transformando vidas através da educação"
				description="Descubra como estamos fazendo a diferença na comunidade através de nossos programas educacionais e iniciativas sociais."
				align="center"
				decoration={true}
				decorationColor="var(--color-yellow-600)"
				decorationPosition="bottom"
			/>
		</section>

		<!-- Com Letra Decorativa e Decoração -->
		<section class="demo-section">
			<h2 class="demo-section-title">Com Letra Decorativa e Decoração</h2>
			<SectionHeader
				title="Nosso Impacto"
				subtitle="Transformando vidas através da educação"
				description="Descubra como estamos fazendo a diferença na comunidade através de nossos programas educacionais e iniciativas sociais."
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationColor="var(--color-yellow-600)"
				decorationPosition="bottom"
			/>
		</section>

		<!-- Alinhamento à Esquerda -->
		<section class="demo-section">
			<h2 class="demo-section-title">Alinhamento à Esquerda</h2>
			<SectionHeader
				title="Iniciativas"
				subtitle="Nossos projetos em andamento"
				description="Conheça as iniciativas que estão transformando a realidade de milhares de pessoas em nossa comunidade."
				align="left"
				decorativeLetter={true}
				decoration={true}
				decorationPosition="left"
			/>
		</section>

		<!-- Alinhamento à Direita -->
		<section class="demo-section">
			<h2 class="demo-section-title">Alinhamento à Direita</h2>
			<SectionHeader
				title="Depoimentos"
				subtitle="O que dizem sobre nós"
				description="Histórias reais de pessoas impactadas pelos nossos programas e iniciativas educacionais."
				align="right"
				decorativeLetter={true}
				decoration={true}
				decorationPosition="right"
			/>
		</section>

		<!-- Com Ações -->
		<section class="demo-section">
			<h2 class="demo-section-title">Com Ações</h2>
			<SectionHeader
				title="Entre em Contato"
				subtitle="Vamos conversar"
				description="Estamos aqui para ajudar e responder suas dúvidas sobre nossos programas e como você pode participar."
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationColor="var(--color-primary-500)"
				decorationPosition="bottom"
			/>
			<div class="demo-actions">
				<Button variant="primary">Enviar Mensagem</Button>
				<Button variant="outline">Agendar Reunião</Button>
			</div>
		</section>

		<!-- Diferentes Espaçamentos -->
		<section class="demo-section">
			<h2 class="demo-section-title">Diferentes Espaçamentos</h2>
			
			<div class="spacing-examples">
				<div class="spacing-example">
					<h3>Espaçamento Tight</h3>
					<SectionHeader
						title="Tight"
						subtitle="Espaçamento compacto"
						description="Para layouts mais densos"
						align="center"
						spacing="tight"
						decorativeLetter={true}
						decoration={true}
					/>
				</div>

				<div class="spacing-example">
					<h3>Espaçamento Normal</h3>
					<SectionHeader
						title="Normal"
						subtitle="Espaçamento padrão"
						description="Para a maioria dos casos"
						align="center"
						spacing="normal"
						decorativeLetter={true}
						decoration={true}
					/>
				</div>

				<div class="spacing-example">
					<h3>Espaçamento Loose</h3>
					<SectionHeader
						title="Loose"
						subtitle="Espaçamento amplo"
						description="Para layouts mais espaçosos"
						align="center"
						spacing="loose"
						decorativeLetter={true}
						decoration={true}
					/>
				</div>
			</div>
		</section>

		<!-- Diferentes Cores de Decoração -->
		<section class="demo-section">
			<h2 class="demo-section-title">Diferentes Cores de Decoração</h2>
			
			<div class="color-examples">
				<div class="color-example">
					<SectionHeader
						title="Amarelo"
						subtitle="Cor padrão"
						description="var(--color-yellow-600)"
						align="center"
						decoration={true}
						decorationColor="var(--color-yellow-600)"
					/>
				</div>

				<div class="color-example">
					<SectionHeader
						title="Primário"
						subtitle="Cor primária"
						description="var(--color-primary-500)"
						align="center"
						decoration={true}
						decorationColor="var(--color-primary-500)"
					/>
				</div>

				<div class="color-example">
					<SectionHeader
						title="Secundário"
						subtitle="Cor secundária"
						description="var(--color-secondary-500)"
						align="center"
						decoration={true}
						decorationColor="var(--color-secondary-500)"
					/>
				</div>

				<div class="color-example">
					<SectionHeader
						title="Acento"
						subtitle="Cor de acento"
						description="var(--color-accent-500)"
						align="center"
						decoration={true}
						decorationColor="var(--color-accent-500)"
					/>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.demo-page {
		padding: var(--spacing-2xl) 0;
		background-color: var(--background-color-page);
		min-height: 100vh;
	}

	.container {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-md);
	}

	.demo-title {
		font-size: var(--font-size-4xl);
		font-weight: var(--font-weight-bold);
		text-align: center;
		margin-bottom: var(--spacing-3xl);
		color: var(--text-color-primary);
	}

	.demo-section {
		margin-bottom: var(--spacing-4xl);
		padding: var(--spacing-2xl);
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-md);
	}

	.demo-section-title {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-xl);
		color: var(--text-color-primary);
		border-bottom: 2px solid var(--color-primary-200);
		padding-bottom: var(--spacing-md);
	}

	.demo-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.spacing-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--spacing-xl);
	}

	.spacing-example {
		padding: var(--spacing-lg);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-md);
		background-color: var(--background-color-subtle);
	}

	.spacing-example h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		margin-bottom: var(--spacing-md);
		color: var(--text-color-primary);
		text-align: center;
	}

	.color-examples {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.color-example {
		padding: var(--spacing-md);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-md);
		background-color: var(--background-color-subtle);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.demo-page {
			padding: var(--spacing-xl) 0;
		}

		.demo-section {
			padding: var(--spacing-lg);
			margin-bottom: var(--spacing-2xl);
		}

		.demo-title {
			font-size: var(--font-size-3xl);
			margin-bottom: var(--spacing-2xl);
		}

		.spacing-examples {
			grid-template-columns: 1fr;
		}

		.color-examples {
			grid-template-columns: 1fr;
		}

		.demo-actions {
			flex-direction: column;
			align-items: center;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .demo-section {
		background-color: var(--background-color-card);
		border-color: var(--border-color-default);
	}

	[data-theme='dark'] .spacing-example,
	[data-theme='dark'] .color-example {
		background-color: var(--background-color-subtle);
		border-color: var(--border-color-default);
	}
</style>
