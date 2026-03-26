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
	const SCROLL_TOLERANCE = 8;

	const calculateScrollState = () => {
		if (!timelineWrapper) return;

		const { scrollLeft, scrollWidth, clientWidth } = timelineWrapper;

		isAtStart = scrollLeft <= SCROLL_TOLERANCE;

		isAtEnd = scrollLeft + clientWidth >= scrollWidth - SCROLL_TOLERANCE;
	};

	const handleScroll = () => {
		calculateScrollState();
		dispatch('timelineScroll', { position: timelineWrapper.scrollLeft });
	};

	const scrollToEdge = (direction: 'left' | 'right') => {
		if (!timelineWrapper) return;

		const target = direction === 'right' ? timelineWrapper.scrollWidth : 0;

		timelineWrapper.scrollTo({
			left: target,
			behavior: 'smooth'
		});

		// Atualiza estado durante animação
		let i = 0;
		const interval = setInterval(() => {
			calculateScrollState();
			i++;
			if (i > 10) clearInterval(interval);
		}, 50);
	};

	const updateScrollState = () => {
		if (!timelineWrapper) return;
		// Atualiza apenas scrollLeft — isAtStart e isAtEnd são derivados reativos
		scrollLeft = timelineWrapper.scrollLeft;
	};

	onMount(async () => {
		if (id) dispatch('sectionLoad', { id });

		await tick();

		requestAnimationFrame(() => {
			calculateScrollState();
		});

		resizeObserver = new ResizeObserver(() => {
			calculateScrollState();
		});

		if (timelineWrapper) {
			resizeObserver.observe(timelineWrapper);
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
				<Image
					src="/images/illustrations/relogios.png"
					alt="Nossa história"
					blendMode="multiply"
					loading="lazy"
				/>
			</div>

			<!-- Timeline -->
			<div class="our-history-timeline">
				<div class="nav-button" class:hidden={isAtStart}>
					<Button
						icon="chevron-left"
						variant="ghost"
						onclick={() => scrollToEdge('left')}
					/>
				</div>

				<div class="timeline-fade-container" class:at-start={isAtStart} class:at-end={isAtEnd}>
					<div bind:this={timelineWrapper} class="timeline-wrapper" on:scroll={handleScroll}>
						<div class="timeline">
							{#each history as item, index}
								<TimelineItem {item} {index} />
							{/each}
						</div>
					</div>
				</div>

				<div class="nav-button" class:hidden={isAtEnd}>
					<Button
						icon="chevron-right"
						variant="ghost"
						onclick={() => scrollToEdge('right')}
					/>
				</div>
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
		/* Mudar para 100% a width */
		max-width: 100%;
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
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

	.nav-button {
		width: 40px; /* ou tamanho real do botão */
		display: flex;
		justify-content: center;
	}

	.hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* =========================
	   Fade container — pai do scroll
	========================= */

	.timeline-fade-container {
		flex: 1;
		min-width: 0;
		position: relative;
	}

	.timeline-fade-container::before {
		left: 0;
		background: linear-gradient(to right, var(--background-color-card) 20%, transparent);
		opacity: 1;
	}

	.timeline-fade-container.at-start::before {
		opacity: 0;
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

	.timeline-fade-container::after {
		right: 0;
		background: linear-gradient(to left, var(--background-color-card) 20%, transparent);
		opacity: 1;
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
		top: 50%;
		transform: translateY(-50%);
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
