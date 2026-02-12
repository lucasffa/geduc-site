<!-- src/lib/components/molecules/TimelineItem.svelte -->
<script lang="ts">
	import Text from '../atoms/Text.svelte';
	import type { TimelineItemData } from '$lib/types/data';

	export let item: TimelineItemData;
	export let side: 'left' | 'right' = 'left';
	export let index: number = 0;
</script>

<article
	class="timeline-item {side}"
	role="listitem"
	style="--delay: {index * 0.1}s"
>
	<!-- Conteúdo -->
	<div class="content">
		<Text as="div" size="lg" weight="bold" color="primary">
			{item.title}
		</Text>

		<Text size="sm" color="secondary" leading="relaxed">
			{item.description}
		</Text>
	</div>

	<!-- Marcador central -->
	<div class="marker" aria-hidden="true">
		<div class="dot"></div>

		<div class="year">
			<Text size="xs" weight="bold" color="white">
				{item.year}
			</Text>
		</div>
	</div>
</article>

<style>
	.timeline-item {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		min-height: 140px;
		opacity: 0;
		animation: fadeUp 0.6s ease forwards;
		animation-delay: var(--delay);
	}

	/* Alternância desktop */
	.timeline-item.left {
		justify-content: flex-start;
	}

	.timeline-item.right {
		justify-content: flex-end;
	}

	/* Conteúdo */
	.content {
		width: 42%;
		background: var(--background-color-card);
		padding: var(--spacing-xl);
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-sm);
		border: 1px solid var(--border-color-default);
		transition: all var(--transition-normal);
		position: relative;
		z-index: 1;
	}

	.timeline-item.right .content {
		text-align: right;
	}

	.content:hover {
		transform: translateY(-6px);
		box-shadow: var(--shadow-md);
	}

	/* Marker */
	.marker {
		position: absolute;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		flex-direction: column;
		align-items: center;
		z-index: 2;
	}

	.dot {
		width: 16px;
		height: 16px;
		background: var(--color-primary-500);
		border-radius: 50%;
		border: 4px solid var(--background-color-card);
		box-shadow: 0 0 0 4px var(--color-primary-200);
		transition: transform 0.3s ease;
	}

	.timeline-item:hover .dot {
		transform: scale(1.2);
	}

	.year {
		margin-top: var(--spacing-xs);
		background: var(--color-primary-600);
		padding: 6px 12px;
		border-radius: 999px;
	}

	/* MOBILE */
	@media (max-width: 768px) {
		.timeline-item {
			justify-content: flex-start !important;
			padding-left: 50px;
		}

		.content {
			width: 100%;
			text-align: left !important;
		}

		.marker {
			left: 20px;
			transform: none;
		}
	}

	/* Animation */
	@keyframes fadeUp {
		from {
			transform: translateY(20px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}
</style>