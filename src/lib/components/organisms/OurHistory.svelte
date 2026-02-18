<!-- src/lib/components/organisms/OurHistory.svelte -->
<script lang="ts">
	import { onMount, onDestroy, createEventDispatcher, tick } from 'svelte';
	import type { TimelineItemData } from '$lib/types/data';
	import type { SectionHeaderProps } from '$lib/types/components';

	import TimelineItem from '../molecules/TimelineItem.svelte';
	import SectionHeader from '../molecules/SectionHeader.svelte';
	import Image from '../atoms/Image.svelte';
	import Button from '../atoms/Button.svelte';

	/* =========================
	   Props principais
	========================= */

	export let history: TimelineItemData[] = [];

	export let title: SectionHeaderProps['title'] = ' ';
	export let titleColor: SectionHeaderProps['titleColor'] = 'primary';

	export let background: 'none' | 'muted' | 'primary' | 'gradient' = 'none';
	export let layout: 'default' | 'split' | 'split-reverse' = 'default';

	/* =========================
	   Base props
	========================= */

	export let id: string | undefined = undefined;
	export let visible: boolean = true;

	let className = '';
	export { className as class };

	let style = '';
	export { style };

	/* =========================
	   Eventos
	========================= */

	const dispatch = createEventDispatcher<{
		timelineScroll: { position: number };
		sectionLoad: { id: string };
	}>();

	/* =========================
	   Scroll State
	========================= */

	let timelineWrapper: HTMLDivElement;
	let scrollLeft = 0;
	let isAtStart = true;
	let isAtEnd = false;
	let resizeObserver: ResizeObserver;

	// Derivados reativos — fonte única de verdade
	$: isAtStart = scrollLeft <= 1;
	$: isAtEnd = timelineWrapper
		? scrollLeft + timelineWrapper.clientWidth >= timelineWrapper.scrollWidth - 1
		: true; // Se timelineWrapper não estiver definido, assume que está no fim para evitar mostrar o fade direito

	const handleScroll = () => {
		scrollLeft = timelineWrapper.scrollLeft;
		dispatch('timelineScroll', { position: scrollLeft });
	};

	const scrollByItems = (direction: 'left' | 'right') => {
		if (!timelineWrapper) return;

		const firstItem = timelineWrapper.querySelector('.timeline-item') as HTMLElement;

		if (!firstItem) return;

		// Pega a largura real do item incluindo a gap
		const itemWidth = firstItem.offsetWidth;
		const timelineEl = timelineWrapper.querySelector('.timeline') as HTMLElement;
		const gap = timelineEl
			? parseInt(getComputedStyle(timelineEl).gap || getComputedStyle(timelineEl).columnGap || '0')
			: 0;

		// Rola 3 itens por vez (ou ajuste conforme preferência)
		const scrollAmount = (itemWidth + gap) * 3;

		timelineWrapper.scrollBy({
			left: direction === 'right' ? scrollAmount : -scrollAmount,
			behavior: 'smooth'
		});
	};

	const updateScrollState = () => {
		if (!timelineWrapper) return;
		// Atualiza apenas scrollLeft — isAtStart e isAtEnd são derivados reativos
		scrollLeft = timelineWrapper.scrollLeft;
	};

	onMount(async () => {
		if (id) dispatch('sectionLoad', { id });

		resizeObserver = new ResizeObserver(() => {
			updateScrollState();
		});

		if (timelineWrapper) {
			resizeObserver.observe(timelineWrapper);
			// Aguarda o DOM estabilizar para que clientWidth e scrollWidth
			// tenham os valores reais e isAtEnd seja calculado corretamente
			await tick();
			requestAnimationFrame(() => {
				updateScrollState();
			});
		}
	});

	onDestroy(() => {
		resizeObserver?.disconnect();
	});

	/* =========================
	   Classes dinâmicas
	========================= */

	$: classes = [
		'our-history',
		`our-history-background-${background}`,
		visible ? '' : 'our-history-hidden',
		className
	]
		.filter(Boolean)
		.join(' ');

	$: containerClasses = ['our-history-container', layout !== 'default' ? `layout-${layout}` : '']
		.filter(Boolean)
		.join(' ');
</script>

<section class={classes} {id} {style} aria-label={title ?? 'Seção de história'}>
	<div class={containerClasses}>
		<!-- Header -->
		{#if title}
			<SectionHeader
				{title}
				{titleColor}
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationColor="var(--color-yellow-600)"
				decorationPosition="bottom"
			/>
		{/if}

		<div class="our-history-content">
			<!-- Imagem lateral opcional -->
			<div class="our-history-media">
				<Image src="/images/clock.png" alt="Nossa história" />
			</div>

			<!-- Timeline -->
			<div class="our-history-timeline">
				<Button
					icon="chevron-left"
					variant="ghost"
					disabled={isAtStart}
					onclick={() => scrollByItems('left')}
				/>

				<div class="timeline-fade-container" class:at-start={isAtStart} class:at-end={isAtEnd}>
					<div bind:this={timelineWrapper} class="timeline-wrapper" on:scroll={handleScroll}>
						<div class="timeline">
							{#each history as item, index}
								<TimelineItem {item} {index} />
							{/each}
						</div>
					</div>
				</div>

				<Button
					icon="chevron-right"
					variant="ghost"
					disabled={isAtEnd}
					onclick={() => scrollByItems('right')}
				/>
			</div>
		</div>

		<slot />
	</div>
</section>

<style>
	/* =========================
	   Base
	========================= */

	.our-history {
		position: relative;
		padding: var(--spacing-4xl) 0;
		overflow: hidden;
		transition: opacity var(--transition-normal);
	}

	.our-history-hidden {
		opacity: 0;
		pointer-events: none;
	}

	.our-history-container {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3xl);
	}

	/* =========================
	   Backgrounds
	========================= */

	.our-history-background-none {
		background: transparent;
	}

	.our-history-background-muted {
		background-color: var(--color-neutral-50);
	}

	.our-history-background-primary {
		background: linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50));
	}

	.our-history-background-gradient {
		background: linear-gradient(135deg, var(--color-primary-50), var(--color-secondary-50));
	}

	/* =========================
	   Layout
	========================= */

	.our-history-content {
		display: grid;
		grid-template-columns: 1fr 2fr;
		align-items: center;
		gap: var(--spacing-2xl);
	}

	.layout-split-reverse .our-history-content {
		grid-template-columns: 2fr 1fr;
	}

	/* =========================
	   Fade container — pai do scroll
	========================= */

	.timeline-fade-container {
		flex: 1;
		min-width: 0;
		position: relative;
	}

	.timeline-fade-container::before,
	.timeline-fade-container::after {
		content: '';
		position: absolute;
		top: 0;
		width: 80px;
		height: 100%;
		pointer-events: none;
		z-index: 4;
		transition: opacity 0.35s ease;
	}

	.timeline-fade-container:not(.at-end)::after {
		content: '';
		position: absolute;
		top: 0;
		right: 0;
		width: 80px;
		height: 100%;
		pointer-events: none;
		z-index: 4;
		background: linear-gradient(to left, white 20%, transparent);
	}
	.timeline-fade-container::after {
		right: 0;
		background: linear-gradient(to left, white 20%, transparent);
	}

	/* Esconde o fade do lado onde não há mais conteúdo */
	.timeline-fade-container.at-start::before {
		opacity: 0;
	}

	.timeline-fade-container.at-end::after {
		opacity: 0;
	}

	/* =========================
	   Timeline wrapper 
	========================= */

	.our-history-timeline {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		min-width: 0;
	}

	.timeline-wrapper {
		width: 100%;
		overflow-x: auto;
		scrollbar-width: none;
		-ms-overflow-style: none;
		scroll-behavior: smooth;
		scroll-snap-type: x mandatory;
		cursor: grab;
	}

	.timeline-wrapper::-webkit-scrollbar {
		display: none;
	}

	.timeline-wrapper:active {
		cursor: grabbing;
	}

	/* =========================
	   Timeline interna
	========================= */

	.timeline {
		width: max-content;
		display: flex;
		gap: var(--spacing-2xl, 2rem);
		position: relative;
		padding: 0 var(--spacing-sm, 0.5rem);
	}

	.timeline::before {
		content: '';
		position: absolute;
		top: calc(140px + 0.25rem + 0.35rem + 0.5em / 2);
		left: 0;
		right: 0;
		height: 3px;
		background: var(--color-primary-600, #3b3fc7);
		z-index: 1;
	}

	/* =========================
	   Responsividade
	========================= */

	@media (max-width: 768px) {
		.our-history-content {
			grid-template-columns: 1fr;
		}

		.our-history-media {
			display: none;
		}
	}
</style>
