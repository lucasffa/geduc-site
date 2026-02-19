<!-- src/lib/components/molecules/TimelineItem.svelte -->
<script lang="ts">
	import Text from '../atoms/Text.svelte';
	import type { TimelineItemData } from '$lib/types/data';
	import Image from '../atoms/Image.svelte';
	import TextBlock from './TextBlock.svelte';

	export let item: TimelineItemData;
	export let index: number = 0;

	$: isEven = index % 2 === 0;

	$: topContent = isEven ? 'text' : 'image';
	$: bottomContent = isEven ? 'image' : 'text';
</script>

<article class="timeline-item">
	<!-- Bloco Superior -->
	<div class="top">
		{#if topContent === 'text'}
			<div class="content">
				<Text weight="bold">{item.title}</Text>
				<TextBlock
					content={item.description}
					variant="paragraphs"
					spacing="normal"
					align="left"
					color="neutral"
					weight="normal"
					leading="relaxed"
					class="our-impact-text"
					size="sm"
				/>
			</div>
		{:else}
			<div class="image-placeholder">
				<Image src={item.image} alt={item.title} />
			</div>
		{/if}
	</div>

	<!-- Marcador na linha do tempo -->
	<div class="marker">
		<span class="year">{item.year}</span>
	</div>

	<!-- Bloco Inferior -->
	<div class="bottom">
		{#if bottomContent === 'text'}
			<div class="content">
				<Text weight="bold">{item.title}</Text>
				<TextBlock
					content={item.description}
					variant="paragraphs"
					spacing="normal"
					align="left"
					color="neutral"
					weight="normal"
					leading="relaxed"
					class="our-impact-text"
					size="sm"
				/>
			</div>
		{:else}
			<div class="image-placeholder">
				<Image src={item.image} alt={item.title} />
			</div>
		{/if}
	</div>
</article>

<style>
	.timeline-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* Largura fixa para cada item — ajuste conforme necessário */
		flex: 0 0 240px;
		width: 240px;
		position: relative;
		scroll-snap-align: start;
	}

	/* Blocos superior e inferior com altura mínima consistente */
	.top,
	.bottom {
		width: 100%;
		min-height: 140px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content {
		padding: var(--spacing-md, 0.75rem);
		text-align: left;
		width: 100%;
	}

	.image-placeholder {
		width: 100%;
		height: 120px;
		border-radius: var(--border-radius-md, 8px);
		overflow: hidden;
		background: var(--color-neutral-100, #f0f0f0);
	}

	.image-placeholder :global(img) {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Marcador: envolve o badge do ano e fica sobre a linha horizontal */
	.marker {
		position: relative;
		z-index: 3;
		display: flex;
		align-items: center;
		justify-content: center;
		/* Margem vertical pequena para não inflar a altura */
		margin: var(--spacing-xs, 0.25rem) 0;
	}

	.year {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		color: white;
		background: var(--color-primary-600, #3b3fc7);
		padding: 0.35rem 1rem;
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 600;
		white-space: nowrap;
		/* Garante que o badge fique sobre a linha ::before do timeline */
		position: relative;
		z-index: 3;
	}
</style>