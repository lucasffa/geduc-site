<!-- src/lib/components/organisms/AboutUs.svelte -->
<script lang="ts">
	import type { AboutUsProps } from '$lib/types/components';
	import { createEventDispatcher } from 'svelte';
	
	// Componentes atômicos e moleculares
	import Text from '../atoms/Text.svelte';
	import Image from '../atoms/Image.svelte';
	import Button from '../atoms/Button.svelte';
	import SectionHeader from '../molecules/SectionHeader.svelte';

	// Props principais
	export let title: AboutUsProps['title'];
	export let description: AboutUsProps['description'];
	export let media: AboutUsProps['media'] = undefined;
	export let actions: AboutUsProps['actions'] = [];
	export let layout: AboutUsProps['layout'] = 'default';
	export let orientation: AboutUsProps['orientation'] = 'horizontal';
	export let background: AboutUsProps['background'] = 'none';

	// Props de BaseComponentProps
	export let id: string | undefined = undefined;
	export let visible: boolean = true;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Atributos HTML padrão
	let style = '';
	export { style };

	// Event dispatcher para eventos customizados
	const dispatch = createEventDispatcher<{
		actionClick: { href: string; label: string; variant?: string };
		sectionLoad: { id: string };
	}>();

	// Classes CSS baseadas nas props
	$: classes = [
		'about-us',
		`about-us-layout-${layout}`,
		`about-us-orientation-${orientation}`,
		`about-us-background-${background}`,
		visible ? '' : 'about-us-hidden',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Função para lidar com clique nas ações
	function handleActionClick(action: NonNullable<AboutUsProps['actions']>[number]) {
		dispatch('actionClick', {
			href: action.href,
			label: action.label,
			variant: action.variant
		});
	}

	// Dispara evento quando o componente carrega
	$: if (visible && id) {
		dispatch('sectionLoad', { id });
	}

	// Valida props obrigatórias em desenvolvimento
	$: if (import.meta.env.DEV) {
		if (!title || !description) {
			console.warn('AboutUs: título e descrição são obrigatórios');
		}
	}
</script>

<section
	class={classes}
	{id}
	{style}
	aria-labelledby={id ? `${id}-heading` : undefined}
	data-testid="about-us-section"
>
	<div class="about-us-container">
		<!-- Cabeçalho da seção -->
		<div class="about-us-header">
			<SectionHeader
				{title}
				{description}
				align={layout === 'centered' ? 'center' : 'left'}
				decorative={true}
			/>
		</div>

		<!-- Conteúdo principal -->
		<div class="about-us-content">
			<!-- Texto principal -->
			<div class="about-us-text">
				<Text
					as="p"
					size="lg"
					color="secondary"
					class="about-us-paragraph"
					aria-describedby={id ? `${id}-heading` : undefined}
				>
					{description}
				</Text>

				<!-- Botões de ação -->
				{#if actions && actions.length > 0}
					<div class="about-us-actions">
						{#each actions as action (action.href)}
							<Button
								href={action.href}
								variant={action.variant || 'primary'}
								size={action.size || 'lg'}
								class="about-us-action"
								external={action.external}
								on:click={() => handleActionClick(action)}
							>
								{action.label}
							</Button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Mídia opcional -->
			{#if media}
				<div class="about-us-media">
					<Image
						src={media.src}
						alt={media.alt}
						aspectRatio={media.aspectRatio || 'square'}
						objectFit={media.objectFit || 'contain'}
						loading={media.loading || 'lazy'}
						class="about-us-image image-halftone"
					/>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	/* Base do componente */
	.about-us {
		width: 100%;
		position: relative;
	}

	/* Container responsivo */
	.about-us-container {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-md);
	}

	/* Header da seção */
	.about-us-header {
		margin-bottom: var(--spacing-xl);
	}

	/* Layout base do conteúdo */
	.about-us-content {
		display: flex;
		align-items: center;
		gap: var(--spacing-2xl);
	}

	/* Área de texto */
	.about-us-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	/* Parágrafo principal */
	:global(.about-us-paragraph) {
		line-height: var(--line-height-relaxed);
	}

	/* Container dos botões */
	.about-us-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	/* Botão individual */
	:global(.about-us-action) {
		transition: transform var(--transition-normal) var(--transition-timing-default);
	}

	:global(.about-us-action):hover {
		transform: translateY(-2px);
	}

	/* Área de mídia */
	.about-us-media {
		flex: 0 0 auto;
		width: 100%;
		max-width: 400px;
	}

	/* Imagem */
	:global(.about-us-image) {
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-lg);
		transition: box-shadow var(--transition-normal) var(--transition-timing-default);
	}

	:global(.about-us-image):hover {
		box-shadow: var(--shadow-xl);
	}

	/* Estados de visibilidade */
	.about-us-hidden {
		display: none;
	}

	/* ========== VARIAÇÕES DE LAYOUT ========== */

	/* Layout centrado */
	.about-us-layout-centered .about-us-container {
		text-align: center;
	}

	.about-us-layout-centered .about-us-content {
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.about-us-layout-centered .about-us-actions {
		justify-content: center;
	}

	/* Layout dividido (split) */
	.about-us-layout-split .about-us-content {
		align-items: stretch;
	}

	.about-us-layout-split .about-us-text,
	.about-us-layout-split .about-us-media {
		flex: 1;
	}

	/* ========== ORIENTAÇÕES ========== */

	/* Orientação vertical */
	.about-us-orientation-vertical .about-us-content {
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.about-us-orientation-vertical .about-us-actions {
		justify-content: center;
	}

	/* ========== VARIAÇÕES DE BACKGROUND ========== */

	/* Background sutil */
	.about-us-background-subtle {
		background-color: var(--background-color-subtle);
	}

	/* Background com acento */
	.about-us-background-accent {
		background: linear-gradient(
			135deg,
			var(--color-primary-50) 0%,
			var(--color-accent-100) 100%
		);
	}

	/* ========== RESPONSIVIDADE ========== */

	/* Tablet */
	@media (max-width: 768px) {
		.about-us-container {
			padding: var(--spacing-lg) var(--spacing-md);
		}

		.about-us-content {
			flex-direction: column;
			gap: var(--spacing-xl);
			text-align: center;
		}

		.about-us-media {
			max-width: 300px;
		}

		.about-us-actions {
			justify-content: center;
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.about-us-container {
			padding: var(--spacing-md) var(--spacing-sm);
		}

		.about-us-header {
			margin-bottom: var(--spacing-lg);
		}

		.about-us-content {
			gap: var(--spacing-lg);
		}

		.about-us-text {
			gap: var(--spacing-lg);
		}

		.about-us-actions {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		:global(.about-us-action) {
			width: 100%;
		}

		.about-us-media {
			max-width: 250px;
		}
	}

	/* ========== MELHORIAS DE ACESSIBILIDADE ========== */

	/* Reduz movimento para usuários com preferência de movimento reduzido */
	@media (prefers-reduced-motion: reduce) {
		:global(.about-us-action),
		:global(.about-us-image) {
			transition: none;
		}

		:global(.about-us-action):hover {
			transform: none;
		}
	}

	/* High contrast mode support */
	@media (prefers-contrast: high) {
		.about-us-background-subtle {
			border: var(--border-width-default) solid var(--border-color-default);
		}

		.about-us-background-accent {
			background: var(--background-color-subtle);
			border: var(--border-width-thick) solid var(--color-primary-500);
		}
	}

	/* Dark theme específicos */
	:global([data-theme="dark"]) .about-us-background-accent {
		background: linear-gradient(
			135deg,
			var(--color-primary-900) 0%,
			var(--color-accent-dark) 100%
		);
	}
</style>
