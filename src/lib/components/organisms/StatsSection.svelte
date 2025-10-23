<!-- src/lib/components/organisms/StatsSection.svelte -->
<script lang="ts">
	import type { StatsSectionProps } from '$lib/types/components';
	import { onMount } from 'svelte';
	import Heading from '../atoms/Heading.svelte';
	import Text from '../atoms/Text.svelte';
	import StatCard from '../molecules/StatCard.svelte';

	export let stats: StatsSectionProps['stats'];
	export let layout: StatsSectionProps['layout'] = 'grid';
	export let columns: StatsSectionProps['columns'] = 4;
	export let background: StatsSectionProps['background'] = 'none';
	export let animated: StatsSectionProps['animated'] = true;
	export let title: StatsSectionProps['title'] = undefined;
	export let subtitle: StatsSectionProps['subtitle'] = undefined;
	export let align: StatsSectionProps['align'] = 'center';
	export let gap: StatsSectionProps['gap'] = 'lg';
	export let cardVariant: StatsSectionProps['cardVariant'] = 'elevated';
	export let showIllustrations: StatsSectionProps['showIllustrations'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'stats-section',
		`stats-section-layout-${layout}`,
		`stats-section-columns-${columns}`,
		`stats-section-background-${background}`,
		`stats-section-align-${align}`,
		`stats-section-gap-${gap}`,
		animated && 'stats-section-animated',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Observa quando a seção está visível para animações
	let sectionElement: HTMLElement;
	let isVisible = false;

	function handleIntersection(entries: IntersectionObserverEntry[]) {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				isVisible = true;
			}
		});
	}

	// Configura o intersection observer para animações
	onMount(() => {
		if (typeof window !== 'undefined' && sectionElement && animated) {
			const observer = new IntersectionObserver(handleIntersection, {
				threshold: 0.2,
				rootMargin: '0px 0px -100px 0px'
			});
			observer.observe(sectionElement);

			return () => observer.disconnect();
		}
	});

	// Ícones padrão para as ilustrações (correspondente à imagem)
	const defaultIcons = ['map-pin', 'user', 'instagram', 'star'];
</script>

<section bind:this={sectionElement} class={classes}>
	<div class="stats-section-container">
		<!-- Header da seção (opcional) -->
		{#if title || subtitle || $$slots.header}
			<div class="stats-section-header">
				<slot name="header">
					{#if title}
						<Heading level={2} size="3xl" weight="bold" class="stats-section-title">
							{title}
						</Heading>
					{/if}
					{#if subtitle}
						<Text as="p" size="lg" color="subtle" class="stats-section-subtitle">
							{subtitle}
						</Text>
					{/if}
				</slot>
			</div>
		{/if}

		<!-- Grid de estatísticas -->
		<div class="stats-section-grid" class:stats-grid-visible={isVisible}>
			{#each stats as stat, index}
				<StatCard
					value={stat.value}
					label={stat.label}
					description={stat.description}
					iconImage={stat.iconImage || ''}
					trend={stat.trend}
					color={stat.color || 'primary'}
					variant={cardVariant}
					href={stat.href}
					suffix={stat.suffix}
					prefix={stat.prefix}
					class="stats-section-card"
					style={animated ? `animation-delay: ${index * 0.15}s` : ''}
				/>
			{/each}
		</div>

		<!-- Slot para conteúdo adicional (CTA, texto, etc) -->
		<div class="stats-section-footer">
			<slot name="footer" />
		</div>

		<!-- Slot genérico para qualquer conteúdo extra -->
		<slot />
	</div>

	<!-- Elementos decorativos de fundo -->
	{#if background !== 'none'}
		<div class="stats-section-decoration stats-decoration-left" />
		<div class="stats-section-decoration stats-decoration-right" />
	{/if}
</section>

<style>
	.stats-section {
		position: relative;
		padding: var(--spacing-4xl, 4rem) 0;
		overflow: hidden;
	}

	.stats-section-container {
		max-width: var(--container-max-width-xl, 1280px);
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3xl, 3rem);
	}

	/* Header */
	.stats-section-header {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md, 1rem);
		max-width: 800px;
	}

	.stats-section-align-left .stats-section-header {
		align-items: flex-start;
		margin-right: auto;
		text-align: left;
	}

	.stats-section-align-center .stats-section-header {
		align-items: center;
		margin: 0 auto;
		text-align: center;
	}

	.stats-section-align-right .stats-section-header {
		align-items: flex-end;
		margin-left: auto;
		text-align: right;
	}

	.stats-section-title {
		margin: 0;
	}

	.stats-section-subtitle {
		margin: 0;
		opacity: 0.8;
	}

	/* Backgrounds */
	.stats-section-background-none {
		background: transparent;
	}

	.stats-section-background-muted {
		background-color: var(--color-neutral-50, #f9fafb);
	}

	.stats-section-background-primary {
		background: linear-gradient(
			135deg,
			var(--color-primary-100, #dbeafe) 0%,
			var(--color-primary-50, #eff6ff) 100%
		);
	}

	.stats-section-background-gradient {
		background: linear-gradient(
			135deg,
			var(--color-primary-50, #eff6ff) 0%,
			var(--color-accent-50, #fef3c7) 50%,
			var(--color-secondary-50, #f5f3ff) 100%
		);
	}

	.stats-section-background-pattern {
		background-color: var(--color-neutral-50, #f9fafb);
		background-image:
			radial-gradient(var(--color-primary-200, #bfdbfe) 1px, transparent 1px),
			radial-gradient(var(--color-accent-200, #fde68a) 1px, transparent 1px);
		background-size: 40px 40px;
		background-position:
			0 0,
			20px 20px;
	}

	/* Grid de estatísticas */
	.stats-section-grid {
		display: grid;
		align-items: stretch;
	}

	/* Gap options */
	.stats-section-gap-sm .stats-section-grid {
		gap: var(--spacing-md, 1rem);
	}

	.stats-section-gap-md .stats-section-grid {
		gap: var(--spacing-lg, 2rem);
	}

	.stats-section-gap-lg .stats-section-grid {
		gap: var(--spacing-xl, 2.5rem);
	}

	.stats-section-gap-xl .stats-section-grid {
		gap: var(--spacing-2xl, 3rem);
	}

	/* Layouts */
	.stats-section-layout-grid.stats-section-columns-2 .stats-section-grid {
		grid-template-columns: repeat(2, 1fr);
	}

	.stats-section-layout-grid.stats-section-columns-3 .stats-section-grid {
		grid-template-columns: repeat(3, 1fr);
	}

	.stats-section-layout-grid.stats-section-columns-4 .stats-section-grid {
		grid-template-columns: repeat(4, 1fr);
	}

	.stats-section-layout-grid.stats-section-columns-5 .stats-section-grid {
		grid-template-columns: repeat(5, 1fr);
	}

	.stats-section-layout-grid.stats-section-columns-6 .stats-section-grid {
		grid-template-columns: repeat(6, 1fr);
	}

	.stats-section-layout-horizontal .stats-section-grid {
		display: flex;
		justify-content: space-between;
		align-items: stretch;
		flex-wrap: wrap;
	}

	.stats-section-layout-horizontal .stats-section-card {
		flex: 1 1 220px;
		min-width: 220px;
	}

	.stats-section-layout-carousel .stats-section-grid {
		display: flex;
		gap: var(--spacing-lg, 2rem);
		overflow-x: auto;
		scroll-snap-type: x mandatory;
		padding-bottom: var(--spacing-md, 1rem);
		-webkit-overflow-scrolling: touch;
	}

	.stats-section-layout-carousel .stats-section-card {
		flex: 0 0 300px;
		scroll-snap-align: start;
	}

	.stats-section-layout-masonry .stats-section-grid {
		column-count: var(--masonry-columns, 4);
		column-gap: var(--spacing-lg, 2rem);
	}

	.stats-section-layout-masonry .stats-section-card {
		break-inside: avoid;
		margin-bottom: var(--spacing-lg, 2rem);
	}

	/* Ícones circulares das ilustrações */
	.stat-icon-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
		box-shadow:
			0 4px 14px rgba(245, 158, 11, 0.3),
			0 0 0 4px rgba(251, 191, 36, 0.1);
		transition: all 0.3s ease;
	}

	.stat-icon {
		width: 28px;
		height: 28px;
		
	}

	.stats-section-card:hover .stat-icon-circle {
		transform: scale(1.1) rotate(5deg);
		box-shadow:
			0 6px 20px rgba(245, 158, 11, 0.4),
			0 0 0 6px rgba(251, 191, 36, 0.15);
	}

	/* Footer */
	.stats-section-footer {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.stats-section-footer:empty {
		display: none;
	}

	/* Animações */
	.stats-section-animated .stats-section-card {
		opacity: 0;
		transform: translateY(40px) scale(0.95);
		transition:
			opacity 0.6s ease-out,
			transform 0.6s ease-out;
	}

	.stats-grid-visible .stats-section-card {
		opacity: 1;
		transform: translateY(0) scale(1);
	}

	/* Elementos decorativos */
	.stats-section-decoration {
		position: absolute;
		width: 300px;
		height: 300px;
		border-radius: 50%;
		opacity: 0.4;
		z-index: 0;
		pointer-events: none;
	}

	.stats-decoration-left {
		top: 10%;
		left: -5%;
		background: radial-gradient(circle, var(--color-primary-200, #bfdbfe) 0%, transparent 70%);
		animation: float 8s ease-in-out infinite;
	}

	.stats-decoration-right {
		bottom: 10%;
		right: -5%;
		width: 200px;
		height: 200px;
		background: radial-gradient(circle, var(--color-accent-200, #fde68a) 0%, transparent 70%);
		animation: float 10s ease-in-out infinite reverse;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(10deg);
		}
	}

	/* Hover effects no grid */
	.stats-section-grid:hover .stats-section-card:not(:hover) {
		opacity: 0.7;
		transform: scale(0.98);
	}

	.stats-section-animated .stats-section-grid:hover .stats-section-card:not(:hover) {
		opacity: 0.7;
	}

	/* Responsividade */
	@media (max-width: 1200px) {
		.stats-section-layout-grid.stats-section-columns-5 .stats-section-grid,
		.stats-section-layout-grid.stats-section-columns-6 .stats-section-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.stats-section-layout-masonry .stats-section-grid {
			column-count: 3;
		}
	}

	@media (max-width: 1024px) {
		.stats-section {
			padding: var(--spacing-3xl, 3rem) 0;
		}

		.stats-section-layout-grid.stats-section-columns-4 .stats-section-grid,
		.stats-section-layout-grid.stats-section-columns-5 .stats-section-grid,
		.stats-section-layout-grid.stats-section-columns-6 .stats-section-grid {
			grid-template-columns: repeat(2, 1fr);
		}

		.stats-section-layout-masonry .stats-section-grid {
			column-count: 2;
		}
	}

	@media (max-width: 768px) {
		.stats-section {
			padding: var(--spacing-2xl, 2rem) 0;
		}

		.stats-section-container {
			padding: 0 var(--spacing-md, 1rem);
			gap: var(--spacing-2xl, 2rem);
		}

		.stats-section-grid {
			grid-template-columns: 1fr !important;
		}

		.stats-section-layout-horizontal .stats-section-grid {
			flex-direction: column;
		}

		.stats-section-layout-horizontal .stats-section-card {
			flex: 1 1 auto;
			min-width: 100%;
		}

		.stats-section-layout-masonry .stats-section-grid {
			column-count: 1;
		}

		.stats-section-layout-carousel .stats-section-card {
			flex: 0 0 280px;
		}

		/* Ajuste de alinhamento em mobile */
		.stats-section-align-right .stats-section-header,
		.stats-section-align-center .stats-section-header {
			align-items: flex-start;
			text-align: left;
		}
	}

	@media (max-width: 480px) {
		.stats-section-container {
			padding: 0 var(--spacing-sm, 0.75rem);
		}

		.stats-section-layout-carousel .stats-section-card {
			flex: 0 0 240px;
		}

		.stat-icon-circle {
			width: 48px;
			height: 48px;
		}

		.stat-icon {
			width: 24px;
			height: 24px;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .stats-section-background-muted {
		background-color: var(--color-neutral-800, #1f2937);
	}

	[data-theme='dark'] .stats-section-background-primary {
		background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
	}

	[data-theme='dark'] .stats-section-background-gradient {
		background: linear-gradient(135deg, #1e3a8a 0%, #92400e 50%, #581c87 100%);
	}

	[data-theme='dark'] .stats-section-background-pattern {
		background-color: var(--color-neutral-900, #111827);
		background-image:
			radial-gradient(var(--color-primary-800, #1e40af) 1px, transparent 1px),
			radial-gradient(var(--color-accent-800, #92400e) 1px, transparent 1px);
	}

	[data-theme='dark'] .stats-decoration-left {
		background: radial-gradient(circle, rgba(37, 99, 235, 0.2) 0%, transparent 70%);
	}

	[data-theme='dark'] .stats-decoration-right {
		background: radial-gradient(circle, rgba(217, 119, 6, 0.2) 0%, transparent 70%);
	}

	/* Scrollbar customizada para carousel */
	.stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar {
		height: 8px;
	}

	.stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-track {
		background: var(--color-neutral-200, #e5e7eb);
		border-radius: 4px;
	}

	.stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-thumb {
		background: var(--color-primary-500, #3b82f6);
		border-radius: 4px;
		transition: background 0.2s ease;
	}

	.stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-thumb:hover {
		background: var(--color-primary-600, #2563eb);
	}

	[data-theme='dark'] .stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-track {
		background: var(--color-neutral-700, #374151);
	}

	/* Print styles */
	@media print {
		.stats-section {
			padding: 2rem 0;
			break-inside: avoid;
		}

		.stats-section-decoration {
			display: none;
		}

		.stats-section-animated .stats-section-card {
			opacity: 1 !important;
			transform: none !important;
		}
	}

	/* Reduced motion */
	@media (prefers-reduced-motion: reduce) {
		.stats-section-animated .stats-section-card,
		.stats-grid-visible .stats-section-card,
		.stats-decoration-left,
		.stats-decoration-right,
		.stat-icon-circle {
			animation: none !important;
			transition: none !important;
		}
	}

	/* High contrast mode */
	@media (prefers-contrast: high) {
		.stats-section-card {
			border: 2px solid currentColor;
		}

		.stat-icon-circle {
			border: 2px solid currentColor;
		}
	}
</style>
