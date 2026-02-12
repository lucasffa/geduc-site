<!-- src/lib/components/organisms/OurHistory.svelte -->
<script lang="ts">
	import TimelineItem from '../molecules/TimelineItem.svelte';
	import type { TimelineItemData } from '$lib/types/data';
	import SectionHeader from '../molecules/SectionHeader.svelte';
	import type { SectionHeaderProps } from '$lib/types/components';

	export let history: TimelineItemData[] = [];

	export let title: SectionHeaderProps['title'] = " ";
	export let titleColor: SectionHeaderProps['titleColor'] = 'primary';
	export let align: SectionHeaderProps['align'] = 'center';
</script>

<section class="our-history">
	<div class="container">
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

		<div class="timeline-wrapper">
			<div class="timeline-line"></div>

			<div class="timeline">
				{#each history as item, index}
					<TimelineItem {item} {index} />
				{/each}
			</div>
		</div>
	</div>
</section>

<style>
	.our-history {
		position: relative;
		padding: var(--spacing-4xl) 0;
	}
	
	.container {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-3xl);
	}

	.timeline-wrapper {
		position: relative;
		padding: 6rem 0;
	}

	.timeline {
		display: flex;
		gap: var(--spacing-4xl);
		position: relative;
		z-index: 1;
	}

	.timeline::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 4px;
		background: var(--color-primary-600);
		transform: translateY(-50%);
	}

	/* A LINHA */
	.timeline-line {
		position: absolute;
		top: 50%;
		left: 0;
		width: 100%;
		height: 4px;
		background-color: var(--color-primary-600);
		transform: translateY(-50%);
		border-radius: var(--border-radius-full);
		z-index: 0;
	}
</style>
