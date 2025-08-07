<!-- src/lib/components/molecules/FeatureCard.svelte -->
<script lang="ts">
	import type { FeatureCardProps } from '$lib/types/components';
	import { Components } from '$lib/components';

	const { Heading, Text, Image } = Components.Atoms;

	export let title: FeatureCardProps['title'];
	export let description: FeatureCardProps['description'];
	export let illustration: FeatureCardProps['illustration'] = undefined;
	export let variant: FeatureCardProps['variant'] = 'default';
	export let orientation: FeatureCardProps['orientation'] = 'vertical';
	export let interactive: FeatureCardProps['interactive'] = false;
	export let href: FeatureCardProps['href'] = undefined;
	export let target: FeatureCardProps['target'] = undefined;
	export let rel: FeatureCardProps['rel'] = undefined;
	export let external: FeatureCardProps['external'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Determina qual elemento usar
	$: element = href ? 'a' : 'div';

	// Classes CSS baseadas nas props
	$: classes = [
		'feature-card',
		`feature-card-variant-${variant}`,
		`feature-card-orientation-${orientation}`,
		interactive && 'feature-card-interactive',
		href && 'feature-card-clickable',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Props específicas do link
	$: linkProps = href
		? {
				href,
				target: external ? '_blank' : target,
				rel: external ? 'noopener noreferrer' : rel
			}
		: {};
</script>

<svelte:element this={element} class={classes} {...linkProps} {...$$restProps}>
	{#if illustration}
		<div class="feature-card-illustration">
			<Image
				src={illustration.src}
				alt={illustration.alt}
				width={illustration.width}
				height={illustration.height}
				aspectRatio={illustration.aspectRatio || 'square'}
				objectFit={illustration.objectFit || 'contain'}
				loading={illustration.loading || 'lazy'}
				class="feature-card-image image-halftone"
			/>
		</div>
	{/if}

	<div class="feature-card-content">
		<Heading level={3} size="lg" weight="semibold" class="feature-card-title">
			{title}
		</Heading>

		<Text as="p" size="md" color="secondary" class="feature-card-description">
			{description}
		</Text>

		<slot name="actions">
			<!-- Slot para ações adicionais como botões -->
		</slot>
	</div>

	{#if href}
		<div class="feature-card-link-indicator">
			<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="m9 18 6-6-6-6" />
			</svg>
		</div>
	{/if}
</svelte:element>

<style>
	.feature-card {
		display: flex;
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: all var(--transition-normal) var(--transition-timing-default);
		position: relative;
		text-decoration: none;
		color: inherit;
	}

	/* Orientações */
	.feature-card-orientation-vertical {
		flex-direction: column;
	}

	.feature-card-orientation-horizontal {
		flex-direction: row;
		align-items: center;
	}

	/* Variantes */
	.feature-card-variant-default {
		border: 1px solid var(--border-color-default);
		box-shadow: var(--shadow-sm);
	}

	.feature-card-variant-highlighted {
		background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 100%);
		border: 1px solid var(--color-primary-200);
		box-shadow: var(--shadow-md);
	}

	.feature-card-variant-minimal {
		background-color: transparent;
		border: none;
		box-shadow: none;
	}

	/* Estados interativos */
	.feature-card-interactive:hover,
	.feature-card-clickable:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
	}

	.feature-card-clickable {
		cursor: pointer;
	}

	.feature-card-clickable:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.feature-card-clickable:active {
		transform: translateY(-2px);
	}

	/* Ilustração */
	.feature-card-illustration {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
		background: linear-gradient(
			135deg,
			var(--color-primary-100) 0%,
			var(--color-secondary-100) 100%
		);
	}

	.feature-card-orientation-vertical .feature-card-illustration {
		width: 100%;
		height: 200px;
		padding: var(--spacing-xl);
	}

	.feature-card-orientation-horizontal .feature-card-illustration {
		width: 200px;
		height: 100%;
		min-height: 150px;
	}

	.feature-card-image {
		max-width: 120px;
		max-height: 120px;
		width: 100%;
		height: auto;
	}

	/* Conteúdo */
	.feature-card-content {
		flex: 1;
		padding: var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.feature-card-orientation-horizontal .feature-card-content {
		padding: var(--spacing-xl);
	}

	.feature-card-title {
		margin: 0;
		color: var(--text-color-primary);
	}

	.feature-card-description {
		margin: 0;
		line-height: var(--line-height-relaxed);
		flex: 1;
	}

	/* Indicador de link */
	.feature-card-link-indicator {
		position: absolute;
		top: var(--spacing-md);
		right: var(--spacing-md);
		width: 24px;
		height: 24px;
		color: var(--color-primary-500);
		opacity: 0;
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

	.feature-card-clickable:hover .feature-card-link-indicator {
		opacity: 1;
		transform: translateX(4px);
	}

	.feature-card-link-indicator svg {
		width: 100%;
		height: 100%;
	}

	/* Efeitos específicos por variante */
	.feature-card-variant-highlighted:hover {
		background: linear-gradient(
			135deg,
			var(--color-primary-100) 0%,
			var(--color-secondary-100) 100%
		);
	}

	.feature-card-variant-minimal:hover {
		background-color: var(--color-neutral-50);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.feature-card-orientation-horizontal {
			flex-direction: column;
		}

		.feature-card-orientation-horizontal .feature-card-illustration {
			width: 100%;
			height: 160px;
		}

		.feature-card-content {
			padding: var(--spacing-md);
		}

		.feature-card-image {
			max-width: 80px;
			max-height: 80px;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .feature-card-variant-highlighted {
		background: linear-gradient(
			135deg,
			var(--color-primary-900) 0%,
			var(--color-secondary-900) 100%
		);
		border-color: var(--color-primary-700);
	}

	[data-theme='dark'] .feature-card-variant-highlighted:hover {
		background: linear-gradient(
			135deg,
			var(--color-primary-800) 0%,
			var(--color-secondary-800) 100%
		);
	}

	[data-theme='dark'] .feature-card-variant-minimal:hover {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .feature-card-illustration {
		background: linear-gradient(
			135deg,
			var(--color-primary-900) 0%,
			var(--color-secondary-900) 100%
		);
	}

	/* Animações de entrada */
	.feature-card {
		animation: slideInUp 0.6s ease-out;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Hover effects nos elementos internos */
	.feature-card:hover .feature-card-title {
		color: var(--color-primary-600);
		transition: color var(--transition-fast) var(--transition-timing-default);
	}

	.feature-card:hover .feature-card-image {
		transform: scale(1.05);
		transition: transform var(--transition-normal) var(--transition-timing-default);
	}

	/* Estado de loading */
	.feature-card-loading {
		opacity: 0.7;
		pointer-events: none;
	}

	.feature-card-loading::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 25%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 75%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}
</style>
