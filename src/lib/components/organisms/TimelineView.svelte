<!-- src/lib/components/organisms/TimelineView.svelte -->
<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';

	/** @typedef {{ id: string; date: string; description: string; type?: string }} TimelineEntry */

	/** @type {TimelineEntry[]} */
	export let entries = [];
	export let emptyMessage = 'Nenhum evento registrado.';
</script>

<div class="timeline">
	{#if entries.length === 0}
		<p class="timeline-empty">{emptyMessage}</p>
	{:else}
		{#each entries as entry}
			<div class="timeline-item">
				<div class="timeline-dot"></div>
				<div class="timeline-content">
					<span class="timeline-date">{entry.date}</span>
					<p class="timeline-desc">{entry.description}</p>
					{#if entry.type}
						<Badge text={entry.type} variant="info" size="sm" />
					{/if}
				</div>
			</div>
		{/each}
	{/if}
</div>

<style>
	.timeline {
		position: relative;
		padding-left: var(--spacing-xl);
	}

	.timeline::before {
		content: '';
		position: absolute;
		left: 8px;
		top: 0;
		bottom: 0;
		width: 2px;
		background: var(--color-neutral-200);
	}

	.timeline-item {
		position: relative;
		padding-bottom: var(--spacing-md);
	}

	.timeline-dot {
		position: absolute;
		left: calc(-1 * var(--spacing-xl) + 4px);
		top: 4px;
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-primary-500);
		border: 2px solid var(--color-neutral-0);
		box-shadow: 0 0 0 2px var(--color-primary-200);
	}

	.timeline-content {
		background: var(--color-neutral-50);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-neutral-200);
	}

	.timeline-date {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
	}

	.timeline-desc {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-700);
		margin: var(--spacing-xxs) 0;
	}

	.timeline-empty {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-400);
		text-align: center;
		padding: var(--spacing-xl);
	}
</style>
