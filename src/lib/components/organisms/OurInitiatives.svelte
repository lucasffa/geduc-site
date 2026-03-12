<!-- src/lib/components/organisms/OurInitiatives.svelte -->
<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import SectionHeader from '../molecules/SectionHeader.svelte';
	import InitiativeCard from '../molecules/InitiativeCard.svelte';
	import type { InitiativeCardProps, OurInitiativesProps } from '$lib/types/components';

	export let sectionTitle: OurInitiativesProps['sectionTitle'] = 'Nossas iniciativas';
	export let initiatives: OurInitiativesProps['initiatives'] = [];
	export let background: OurInitiativesProps['background'] = 'none';
	export let visible: OurInitiativesProps['visible'] = true;
	export let id: OurInitiativesProps['id'] = undefined;

	let className = '';
	export { className as class };

	let style = '';
	export { style };

	const dispatch = createEventDispatcher<{
		initiativeClick: { initiative: InitiativeCardProps };
		sectionLoad: { id: string };
	}>();

	$: classes = [
		'our-initiatives',
		`our-initiatives-background-${background}`,
		visible ? '' : 'our-initiatives-hidden',
		className
	]
		.filter(Boolean)
		.join(' ');

	function handleCardClick(event: CustomEvent<{ id: string; href?: string }>) {
		const initiative = initiatives?.find((i) => i.id === event.detail.id);
		if (initiative) {
			dispatch('initiativeClick', { initiative });
		}
	}

	onMount(() => {
		if (id) {
			dispatch('sectionLoad', { id });
		}
	});
</script>

<section class={classes} {id} {style} aria-label={sectionTitle ?? 'Nossas iniciativas'}>
	<div class="our-initiatives-container">
		{#if sectionTitle}
			<SectionHeader
				title={sectionTitle}
				titleColor="primary"
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationPosition="bottom"
			/>
		{/if}

		<div class="our-initiatives-list" role="list">
			{#each initiatives ?? [] as initiative (initiative.id)}
				<div role="listitem">
					<InitiativeCard
						id={initiative.id}
						title={initiative.title}
						description={initiative.description}
						illustration={initiative.illustration}
						illustrationAlt={initiative.illustrationAlt}
						href={initiative.href}
						on:click={handleCardClick}
					/>
				</div>
			{/each}
		</div>

		<slot />
	</div>
</section>

<style>
	.our-initiatives {
		padding: var(--spacing-4xl, 4rem) 0;
		transition: opacity var(--transition-normal, 0.3s) var(--transition-timing-default, ease);
	}

	.our-initiatives-hidden {
		opacity: 0;
		pointer-events: none;
	}

	.our-initiatives-container {
		max-width: var(--container-max-width-xl, 900px);
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 1.5rem);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl, 2rem);
	}

	.our-initiatives-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl, 1.5rem);
	}

	/* ─── Backgrounds ─── */
	.our-initiatives-background-none {
		background: transparent;
	}

	.our-initiatives-background-muted {
		background-color: var(--color-neutral-50);
	}

	.our-initiatives-background-primary {
		background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-50) 100%);
	}

	.our-initiatives-background-gradient {
		background: linear-gradient(
			135deg,
			var(--color-primary-50) 0%,
			var(--color-secondary-50) 50%,
			var(--color-accent-50) 100%
		);
	}

	/* ─── Dark theme ─── */
	[data-theme='dark'] .our-initiatives-background-muted {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .our-initiatives-background-primary {
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
	}

	/* ─── Responsividade ─── */
	@media (max-width: 768px) {
		.our-initiatives {
			padding: var(--spacing-3xl, 3rem) 0;
		}

		.our-initiatives-container {
			padding: 0 var(--spacing-md, 1rem);
		}
	}

	@media (max-width: 480px) {
		.our-initiatives-container {
			padding: 0 var(--spacing-sm, 0.75rem);
		}
	}
</style>
