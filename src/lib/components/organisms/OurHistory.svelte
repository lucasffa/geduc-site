<!-- src/lib/components/organisms/OurHistory.svelte -->
<script lang="ts">
	import TimelineItem from '../molecules/TimelineItem.svelte';
	import type { TimelineItemData } from '$lib/types/data';

	export let history: TimelineItemData[] = [];
</script>

<section class="our-history">
	<div class="timeline">
		<!-- Linha vertical única -->
		<div class="timeline-line"></div>

		{#each history as item, index}
			<TimelineItem
				{item}
				side={index % 2 === 0 ? 'left' : 'right'}
			/>
		{/each}
	</div>
</section>

<style>
	.our-history {
		position: relative;
		padding: var(--spacing-3xl) 0;
	}

	.timeline {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 5rem;
	}

	.timeline-line {
		position: absolute;
		left: 50%;
		top: 0;
		bottom: 0;
		width: 4px;
		transform: translateX(-50%);
		background: linear-gradient(
			to bottom,
			var(--color-primary-300),
			var(--color-primary-600)
		);
		border-radius: 999px;
	}
</style>