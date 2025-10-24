<!-- src/lib/components/molecules/StatCard.svelte -->
<script lang="ts">
	import type { StatCardProps } from '$lib/types/components';
	import { onMount } from 'svelte';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Image from '../atoms/Image.svelte';

	export let value: StatCardProps['value'];
	export let label: StatCardProps['label'];
	export let description: StatCardProps['description'] = undefined;
	export let icon: StatCardProps['icon'] = undefined;
	export let iconImage: string | undefined = undefined;
	export let trend: StatCardProps['trend'] = undefined;
	export let color: StatCardProps['color'] = 'primary';
	export let size: StatCardProps['size'] = 'md';
	export let variant: StatCardProps['variant'] = 'default';
	export let showIconBackground: StatCardProps['showIconBackground'] = true;
	export let animateValue: StatCardProps['animateValue'] = true;
	export let animationDuration: StatCardProps['animationDuration'] = 2000;
	export let href: StatCardProps['href'] = undefined;
	export let target: StatCardProps['target'] = '_self';
	export let suffix: StatCardProps['suffix'] = '';
	export let prefix: StatCardProps['prefix'] = '';

	// Classes adicionais
	let className = '';
	export { className as class };

	// Atributos HTML padrão
	let style = '';
	export { style };

	// Estado para animação de contagem
	let displayValue = animateValue ? 0 : value;
	let mounted = false;

	// Debug: log do iconImage
	$: if (iconImage) {
		console.log('StatCard iconImage:', iconImage);
	}

	// Classes CSS baseadas nas props
	$: classes = [
		'stat-card',
		`stat-card-variant-${variant}`,
		`stat-card-size-${size}`,
		`stat-card-color-${color}`,
		href && 'stat-card-clickable',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Formata o valor para exibição
	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1).replace('.0', '') + 'k';
		}
		return num.toLocaleString('pt-BR');
	}

	// Anima o contador
	function animateCounter(target: number, duration: number) {
		const start = 0;
		const startTime = performance.now();

		function update(currentTime: number) {
			const elapsed = currentTime - startTime;
			const progress = Math.min(elapsed / duration, 1);

			// Easing function (easeOutQuart)
			const eased = 1 - Math.pow(1 - progress, 4);
			displayValue = Math.floor(start + (target - start) * eased);

			if (progress < 1) {
				requestAnimationFrame(update);
			} else {
				displayValue = target;
			}
		}

		requestAnimationFrame(update);
	}

	// Inicia animação quando o componente é montado
	onMount(() => {
		mounted = true;
		if (animateValue && typeof value === 'number') {
			animateCounter(value, animationDuration ?? 2000);
		} else {
			displayValue = value;
		}
	});

	// Valor formatado para exibição
	$: formattedValue = typeof displayValue === 'number' ? formatNumber(displayValue) : displayValue;
	$: fullValue = `${prefix}${formattedValue}${suffix}`;

	// Ícone da tendência
	$: trendIcon =
		trend?.direction === 'up' ? 'arrow-up' : trend?.direction === 'down' ? 'arrow-down' : 'minus';
</script>

{#if href}
	<a
		class={classes}
		{style}
		{href}
		{target}
		rel={target === '_blank' ? 'noopener noreferrer' : undefined}
	>
		{@render content()}
	</a>
{:else}
	<div class={classes} {style}>
		{@render content()}
	</div>
{/if}

{#snippet content()}
	<div class="stat-card-inner">
		<!-- Imagem do ícone no topo -->
		{#if iconImage}
			<Image
				src = {iconImage}
				alt = {label}
			/>
		{/if}

		<!-- Valor grande -->
		<div class="stat-card-value">
			<Text as="span" size="4xl" color="primary" class="stat-card-full-value" weight ="bold">
				{fullValue}
			</Text>
		</div>

		<!-- Label/Descrição -->
		<div class="stat-card-label">
			<Text as="span" size="lg" color="primary" class="stat-card-label">
				{label}
			</Text>
		</div>

		{#if description}
			<Text as="p" size="sm" color="subtle" class="stat-card-description">
				{description}
			</Text>
		{/if}

		{#if trend}
			<div class="stat-card-trend-badge stat-card-trend-{trend.direction}">
				<Icon name={trendIcon} size="xs" class="stat-card-trend-icon" />
				<Text as="span" size="xs" weight="semibold" class="stat-card-trend-value">
					{Math.abs(trend.value)}%
				</Text>
			</div>
		{/if}

		{#if trend?.label}
			<Text as="span" size="xs" color="subtle" class="stat-card-trend-label">
				{trend.label}
			</Text>
		{/if}
	</div>

	<!-- Slot para footer customizado -->
	{@render footer()}
{/snippet}

{#snippet footer()}{/snippet}

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: var(--spacing-2xl, 2rem);
		background-color: transparent;
		transition: all var(--transition-normal, 0.3s) var(--transition-timing-default, ease);
		position: relative;
		min-width: 200px;
	}

	.stat-card:hover {
		transform: translateY(-8px);
	}

	.stat-card-inner {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md, 1rem);
		width: 100%;
	}

	/* Ícone circular com fundo amarelo/dourado */
	.stat-card-icon-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #FDB913 0%, #F39C12 100%);
		box-shadow: 
			0 8px 24px rgba(253, 185, 19, 0.35),
			0 4px 12px rgba(243, 156, 18, 0.25);
		transition: all var(--transition-normal, 0.3s) ease;
		position: relative;
		z-index: 1;
	}

	.stat-card:hover .stat-card-icon-wrapper {
		transform: scale(1.1) rotate(-5deg);
		box-shadow: 
			0 12px 32px rgba(253, 185, 19, 0.45),
			0 6px 16px rgba(243, 156, 18, 0.35);
	}

	/* Valor grande em azul escuro */
	

	.stat-card-description {
		margin: 0;
		line-height: var(--line-height-relaxed, 1.625);
		opacity: 0.8;
	}

	/* Trend Badge */
	.stat-card-trend-badge {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		border-radius: var(--border-radius-full, 9999px);
		font-size: var(--font-size-xs, 0.75rem);
		font-weight: 600;
		line-height: 1;
		margin-top: var(--spacing-xs);
	}

	.stat-card-trend-up {
		background-color: rgba(34, 197, 94, 0.1);
		color: #16a34a;
	}

	.stat-card-trend-down {
		background-color: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.stat-card-trend-neutral {
		background-color: rgba(107, 114, 128, 0.1);
		color: #6b7280;
	}

	.stat-card-trend-label {
		display: block;
		margin-top: var(--spacing-xs);
		opacity: 0.7;
	}

	/* Clickable cards */
	.stat-card-clickable {
		cursor: pointer;
		text-decoration: none;
	}

	.stat-card-clickable:hover {
		transform: translateY(-8px) scale(1.02);
	}

	.stat-card-clickable:active {
		transform: translateY(-4px) scale(1.01);
	}

	/* Animações */
	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Efeito sombra no ícone */
	.stat-card-icon-wrapper::before {
		content: '';
		position: absolute;
		inset: -8px;
		border-radius: 50%;
		background: radial-gradient(circle, rgba(253, 185, 19, 0.3) 0%, transparent 70%);
		opacity: 0;
		transition: opacity var(--transition-normal, 0.3s) ease;
		z-index: -1;
	}

	.stat-card-icon-image {
		width: 40px;
		height: 40px;
		object-fit: contain;
	
	}

	.stat-card:hover .stat-card-icon-wrapper::before {
		opacity: 1;
		animation: pulse 2s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			opacity: 0.3;
		}
		50% {
			transform: scale(1.2);
			opacity: 0.6;
		}
	}

	.stat-card-icon-image {
		width: 40px;
		height: 40px;
		object-fit: contain;
		
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.stat-card {
			padding: var(--spacing-xl, 1.5rem);
			min-width: 160px;
		}

		.stat-card-icon-wrapper {
			width: 64px;
			height: 64px;
		}

		.stat-card-value {
			font-size: 2.5rem;
		}

		.stat-card-label {
			font-size: 0.875rem;
		}
	}

	@media (max-width: 480px) {
		.stat-card {
			padding: var(--spacing-lg, 1rem);
		}

		.stat-card-icon-wrapper {
			width: 56px;
			height: 56px;
		}

		.stat-card-value {
			font-size: 2rem;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .stat-card-value {
		color: #60A5FA;
	}

	[data-theme='dark'] .stat-card-label {
		color: #93C5FD;
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.stat-card,
		.stat-card-icon-wrapper,
		.stat-card-value {
			animation: none !important;
			transition: none !important;
		}
	}
</style>