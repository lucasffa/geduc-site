<!-- src/components/organisms/Partners.svelte -->
<script lang="ts">
	import TextBlock from '../molecules/TextBlock.svelte';
	import Image from '../atoms/Image.svelte';
	import type { Partner } from '$lib/types/data';
	import { onMount, onDestroy } from 'svelte';

	export let title: string = 'Conheça os parceiros do **GEDUC**:';
	export let partners: Partner[] = [];

	let className = '';
	export { className as class };

	let trackEl: HTMLDivElement;
	let animationId: number;
	let offset = 0;
	const speed = 0.4;
	const itemWidth = 50; // largura aproximada por item (logo + gap)

	$: duplicated = [...partners, ...partners, ...partners];

	function animate() {
		if (trackEl) {
			offset += speed;
			if (offset >= partners.length * itemWidth) {
				offset = 0;
			}
			trackEl.style.transform = `translateX(-${offset}px)`;
		}
		animationId = requestAnimationFrame(animate);
	}

	onMount(() => {
		animationId = requestAnimationFrame(animate);
	});

	onDestroy(() => {
		cancelAnimationFrame(animationId);
	});

	$: classes = ['partners-section', className].filter(Boolean).join(' ');
</script>

<section class={classes} aria-label="Parceiros">
	<div class="partners-inner">

		<!-- Texto -->
		<div class="partners-text">
			<TextBlock
				content={title}
				variant="paragraphs"
				align="left"
				color="neutral"
				weight="semibold"
				size="md"
				leading="normal"
			/>
		</div>

		<!-- Carrossel -->
		<div class="partners-carousel">
			<div class="carousel-fade-left" aria-hidden="true"></div>
			<div class="carousel-fade-right" aria-hidden="true"></div>

			<div class="carousel-track" bind:this={trackEl}>
				{#each duplicated as partner, i (partner.id + '-' + i)}
					<div class="carousel-item">
						<Image
							src={partner.logo}
							alt={partner.name}
							aspectRatio="auto"
							objectFit="contain"
							loading="lazy"
						/>
					</div>
				{/each}
			</div>
		</div>

	</div>
</section>

<style>
	.partners-section {
        height: 100%;
		padding: var(--spacing-xl) 0;
		background-color: var(--color-neutral-200);
		
	}

	.partners-inner {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		display: grid;
		grid-template-columns: 220px 1fr;
		align-items: center;
		gap: var(--spacing-xl);
	}

	/* Carrossel */
	.partners-carousel {
		position: relative;
		overflow: hidden;
	}

	.carousel-fade-left,
	.carousel-fade-right {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 48px;
		z-index: 2;
		pointer-events: none;
	}

	.carousel-fade-left {
		left: 0;
		background: linear-gradient(to right, var(--color-neutral-200), transparent);
	}

	.carousel-fade-right {
		right: 0;
		background: linear-gradient(to left, var(--color-neutral-200), transparent);
	}

	.carousel-track {
		display: flex;
		align-items: center;
		gap: var(--spacing-3xl);
		width: max-content;
		will-change: transform;
	}

	.carousel-item {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 40px;
		width: 120px;
		opacity: 0.55;
		transition: opacity var(--transition-normal) var(--transition-timing-default);
		filter: grayscale(1);
	}

	.carousel-item:hover {
		opacity: 1;
		filter: grayscale(0);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.partners-inner {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
			padding: 0 var(--spacing-md);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.carousel-track {
			will-change: auto;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .carousel-fade-left {
		background: linear-gradient(to right, var(--background-color-card), transparent);
	}

	[data-theme='dark'] .carousel-fade-right {
		background: linear-gradient(to left, var(--background-color-card), transparent);
	}
</style>