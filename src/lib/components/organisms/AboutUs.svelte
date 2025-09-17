<!-- src/lib/components/organisms/AboutUs.svelte -->
<script lang="ts">
	import type { AboutUsProps } from '$lib/types/components';
	import { createEventDispatcher } from 'svelte';

	// Componentes atômicos
	import Text from '../atoms/Text.svelte';
	import Image from '../atoms/Image.svelte';
	import Button from '../atoms/Button.svelte';
	import Heading from '../atoms/Heading.svelte';
	import SectionHeader from '../molecules/SectionHeader.svelte';

	// Props principais
	export let title: AboutUsProps['title'];
	export let description: AboutUsProps['description'];
	export let media: AboutUsProps['media'] = undefined;
	export let actions: AboutUsProps['actions'] = [];
	export let layout: AboutUsProps['layout'] = 'default';
	export let orientation: AboutUsProps['orientation'] = 'horizontal';
	export let background: AboutUsProps['background'] = 'none';
	export let titleColor: AboutUsProps['titleColor'] = 'primary';

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
			{#if title}
				<SectionHeader
					{title}
					align="right"
					class="about-us-header"
					decorativeLetter={true}
					decoration={true}
					decorationColor="var(--color-blue-500)"
					decorationPosition="bottom"
					{titleColor}
				/>
			{/if}
		</div>

		<!-- Conteúdo principal Add mais texto -->
		<div class="about-us-content">
			<!-- Texto principal -->
			<div class="about-us-text">
				<Text
					as="p"
					size="md"
					color="white"
					align="right"
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
								align="right"
								variant={action.variant || 'primary'}
								size={action.size || 'md'}
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
			{:else}
				<!-- Elemento decorativo quando não há mídia -->
				<div class="about-us-decorative">
					<div class="decorative-shape"></div>
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
		padding: var(--spacing-4xl) 0;
	}

	/* Container responsivo */
	.about-us-container {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-md);
	}

	/* Header da seção */
	.about-us-header {
		margin-bottom: var(--spacing-xl);
	}

	/* Título principal */
	:global(.about-us-title) {
		font-size: var(--heading-2-font-size);
		font-weight: var(--heading-2-font-weight);
		line-height: var(--heading-2-line-height);
		color: var(--text-color-primary);
		position: relative;
		display: inline-block;
	}

	/* Decoração do título */
	:global(.about-us-title)::after {
		content: '';
		position: absolute;
		bottom: -8px;
		left: 0;
		width: 100%;
		height: 4px;
		background: var(--color-primary-300);
		border-radius: var(--border-radius-sm);
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
		color: var(--text-color-secondary);
		font-size: var(--font-size-lg);
	}

	/* Container dos botões */
	.about-us-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
		justify-content: flex-end;
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

	/* Elemento decorativo */
	.about-us-decorative {
		flex: 0 0 auto;
		width: 100%;
		max-width: 400px;
		height: 300px;
		position: relative;
	}

	.decorative-shape {
		position: absolute;
		top: 0;
		right: 0;
		width: 100%;
		height: 100%;
		background: var(--color-primary-900);
		border-radius: 50% 30% 70% 40%;
		opacity: 0.8;
		transform: rotate(15deg);
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

	.about-us-layout-centered .about-us-title::after {
		left: 50%;
		transform: translateX(-50%);
	}

	/* Layout dividido (split) */
	.about-us-layout-split .about-us-content {
		align-items: stretch;
	}

	.about-us-layout-split .about-us-text,
	.about-us-layout-split .about-us-media,
	.about-us-layout-split .about-us-decorative {
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

	.about-us-orientation-vertical .about-us-title::after {
		left: 50%;
		transform: translateX(-50%);
	}

	/* ========== VARIAÇÕES DE BACKGROUND ========== */

	/* Background sutil */
	.about-us-background-subtle {
		background-color: var(--background-color-subtle);
	}

	/* Background com acento */
	.about-us-background-accent {
		background: linear-gradient(135deg, var(--color-primary-700) 0%, var(--color-primary-800) 100%);
	}

	/* ========== RESPONSIVIDADE ========== */

	/* Tablet */
	@media (max-width: 768px) {
		.about-us {
			padding: var(--spacing-3xl) 0;
		}

		.about-us-container {
			padding: 0 var(--spacing-md);
		}

		.about-us-content {
			flex-direction: column;
			gap: var(--spacing-xl);
			text-align: center;

		}

		.about-us-media,
		.about-us-decorative {
			max-width: 300px;
		}

		.about-us-actions {
			justify-content: center;
		}

		.about-us-title::after {
			left: 50%;
			transform: translateX(-50%);
		}
	}

	/* Mobile */
	@media (max-width: 480px) {
		.about-us {
			padding: var(--spacing-2xl) 0;
		}

		.about-us-container {
			padding: 0 var(--spacing-sm);
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

		.about-us-media,
		.about-us-decorative {
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
	:global([data-theme='dark']) .about-us-background-accent {
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-accent-dark) 100%);
	}
</style>
