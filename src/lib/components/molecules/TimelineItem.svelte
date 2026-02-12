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
			<Image src={item.image} alt={item.title} />
		{/if}
	</div>

	<div class="marker">
		<div class="dot"></div>
		<span class="year">{item.year}</span>
	</div>

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
			<Image src={item.image} alt={item.title} />
		{/if}
	</div>
</article>

<style>
	.timeline-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		min-width: 280px;
		position: relative;
	}

	.top,
	.bottom {
		height: 180px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.content {
		background: var(--background-color);
		padding: var(--spacing-lg);
		text-align: center;
	}

	img {
		width: 200px;
		height: 140px;
		object-fit: cover;
		border-radius: var(--border-radius-md);
	}

	.marker {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin: 1rem 0;
	}

	.dot {
		width: 14px;
		height: 14px;
		background: var(--color-primary-500);
		border-radius: 50%;
	}

	.year {
		position: absolute;
		color: white;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: var(--color-primary-600);
		padding: 0.5rem 1rem;
		border-radius: 999px;
		z-index: 2;
	}
</style>
