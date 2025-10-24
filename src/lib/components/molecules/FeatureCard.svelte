<!-- src/lib/components/molecules/FeatureCard.svelte -->
<script lang="ts">
	import type { FeatureCardProps } from '$lib/types/components';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Image from '$lib/components/atoms/Image.svelte';

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
	export let size: FeatureCardProps['size'] = undefined;
	export let borderRadius: FeatureCardProps['borderRadius'] = undefined;

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
		size && `feature-card-size-${size}`,
		interactive && 'feature-card-interactive',
		href && 'feature-card-clickable',
		borderRadius && `feature-card-radius-${borderRadius}`,
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
				aspectRatio={illustration.aspectRatio || 'auto'}
				objectFit={illustration.objectFit || 'contain'}
				loading={illustration.loading || 'lazy'}
			/>
		</div>
	{/if}

	<div class="feature-card-content">
		<Heading
			level={3}
			size="xl"
			weight="semibold"
			class="feature-card-title"
			color="white"
			lineHeight="tighter"
			letterSpacing="wide"
		>
			{title}
		</Heading>

		<Text
			as="p"
			size="md"
			color="inverse"
			weight="light"
			class="feature-card-description"
			lineHeight="tighter"
			letterSpacing="wide"
		>
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
		overflow: hidden;
		transition: all var(--transition-normal) var(--transition-timing-default);
		position: relative;
		text-decoration: none;
		color: inherit;
	}

	/* Sistema de bordas */
	.feature-card-radius-sm {
		border-radius: var(--border-radius-sm);
	}
	.feature-card-radius-md {
		border-radius: var(--border-radius-md);
	}
	.feature-card-radius-lg {
		border-radius: var(--border-radius-lg);
	}
	.feature-card-radius-xl {
		border-radius: var(--border-radius-xl);
	}
	.feature-card-radius-2xl {
		border-radius: var(--border-radius-2xl);
	}
	.feature-card-radius-3xl {
		border-radius: var(--border-radius-3xl);
	}
	.feature-card-radius-4xl {
		border-radius: var(--border-radius-4xl);
	}
	.feature-card-radius-none {
		border-radius: var(--border-radius-none);
	}

	/* Sistema de tamanhos - Extra Small */
	.feature-card-size-xs {
		width: var(--card-width-portrait-xs);
		height: var(--card-height-portrait-xs);
		min-width: var(--card-width-portrait-xs);
		max-width: var(--card-width-portrait-xs);
		min-height: var(--card-height-portrait-xs);
		max-height: var(--card-height-portrait-xs);
		overflow: hidden;
		padding: var(--spacing-xs);
		gap: var(--spacing-xxs);
	}

	.feature-card-size-xs .feature-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		padding: var(--spacing-xs);
	}

	/* Sistema de tamanhos - Small */
	.feature-card-size-sm {
		width: var(--card-width-portrait-sm);
		height: var(--card-height-portrait-sm);
		min-width: var(--card-width-portrait-sm);
		max-width: var(--card-width-portrait-sm);
		min-height: var(--card-height-portrait-sm);
		max-height: var(--card-height-portrait-sm);
		overflow: hidden;
		padding: var(--spacing-sm);
		gap: var(--spacing-xs);
	}

	.feature-card-size-sm .feature-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		padding: var(--spacing-sm);
	}

	/* Sistema de tamanhos - Medium */
	.feature-card-size-md {
		width: var(--card-width-portrait-md);
		height: var(--card-height-portrait-md);
		min-width: var(--card-width-portrait-md);
		max-width: var(--card-width-portrait-md);
		min-height: var(--card-height-portrait-md);
		max-height: var(--card-height-portrait-md);
		overflow: hidden;
		padding: var(--spacing-md);
		gap: var(--spacing-sm);
	}

	.feature-card-size-md .feature-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		padding: var(--spacing-md);
	}

	/* Sistema de tamanhos - Large */
	.feature-card-size-lg {
		width: var(--card-width-portrait-lg);
		height: var(--card-height-portrait-lg);
		min-width: var(--card-width-portrait-lg);
		max-width: var(--card-width-portrait-lg);
		min-height: var(--card-height-portrait-lg);
		max-height: var(--card-height-portrait-lg);
		overflow: hidden;
		padding: var(--spacing-lg);
		gap: var(--spacing-md);
	}

	.feature-card-size-lg .feature-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 5;
		line-clamp: 5;
		-webkit-box-orient: vertical;
		padding: var(--spacing-lg);
	}

	.feature-card-size-xl {
		width: var(--card-width-portrait-xl);
		height: var(--card-height-portrait-xl);
		min-width: var(--card-width-portrait-xl);
		max-width: var(--card-width-portrait-xl);
		min-height: var(--card-height-portrait-xl);
		max-height: var(--card-height-portrait-xl);
		overflow: hidden;
		padding: var(--spacing-md);
		gap: var(--spacing-lg);
	}

	.feature-card-size-xl .feature-card-content {
		overflow: hidden;
		display: flex;
		padding: var(--spacing-xl) var(--spacing-sm);
		gap: var(--spacing-sm);
	}

	.feature-card-size-2xl {
		width: var(--card-width-portrait-2xl);
		height: var(--card-height-portrait-2xl);
		min-width: var(--card-width-portrait-2xl);
		max-width: var(--card-width-portrait-2xl);
		min-height: var(--card-height-portrait-2xl);
		max-height: var(--card-height-portrait-2xl);
		overflow: hidden;
		padding: var(--spacing-2xl);
		gap: var(--spacing-xl);
	}

	.feature-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 7;
		line-clamp: 7;
		-webkit-box-orient: vertical;
		padding: var(--spacing-2xl);
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

	.feature-card-variant-gradient {
		background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-800) 100%);
		border: none;
		box-shadow: var(--shadow-md);
		color: var(--text-color-on-gradient);
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
	}

	.feature-card-orientation-vertical .feature-card-illustration {
		padding: var(--spacing-sm);
	}

	.feature-card-orientation-horizontal .feature-card-illustration {
		width: 200px;
		height: 100%;
		min-height: 150px;
	}

	.feature-card-image {
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
