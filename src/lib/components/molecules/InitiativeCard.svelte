<!-- src/lib/components/molecules/InitiativeCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	import Image from '../atoms/Image.svelte';
	import SectionHeader from './SectionHeader.svelte';
	import TextBlock from './TextBlock.svelte';
	import Button from '../atoms/Button.svelte';

	import type { InitiativeCardProps } from '$lib/types/components';

	// ─── Props ─────────────────────────────────────────────
	export let id: InitiativeCardProps['id'];
	export let title: InitiativeCardProps['title'];
	export let description: InitiativeCardProps['description'];
	export let illustration: InitiativeCardProps['illustration'];
	export let illustrationAlt: InitiativeCardProps['illustrationAlt'];
	export let href: InitiativeCardProps['href'] = undefined;
	export let variant: 'light' | 'dark' = 'light';

	let className = '';
	export { className as class };

	let style = '';
	export { style };

	// ─── Events ────────────────────────────────────────────
	const dispatch = createEventDispatcher<{
		click: { id: string; href?: string };
	}>();

	// ─── Reactive Classes ─────────────────────────────────
	$: classes = ['initiative-card', `initiative-card-${variant}`, className]
		.filter(Boolean)
		.join(' ');

	// ─── Handlers ─────────────────────────────────────────
	function handleClick() {
		dispatch('click', { id, href });
	}

	$: decorationColor =
	variant === 'dark'
		? 'var(--color-yellow-600)'
		: 'var(--color-yellow-800)';

</script>

<article class={classes} {style} aria-label={title}>
	<!-- Imagem -->
	<div class="initiative-card-image-wrapper">
		<div class="initiative-card-image-inner">
			<Image
				src={illustration}
				alt={illustrationAlt}
				objectFit="contain"
				loading="lazy"
				class="initiative-card-image"
			/>
		</div>
	</div>

	<!-- Conteúdo -->
	<div class="initiative-card-content">
		<SectionHeader
			{title}
			titleColor="primary"
			align="left"
			headingLevel={3}
			spacing="tight"
			decoration={true}
			{decorationColor}
		/>

		<TextBlock
			content={description}
			variant="paragraphs"
			spacing="normal"
			align="left"
			color="neutral"
			weight="normal"
			leading="relaxed"
			size="sm"
			class="initiative-card-description"
		/>

		<Button
			variant="primary"
			size="lg"
			onclick={handleClick}
			aria-label={`Saiba mais sobre ${title}`}
		>
			Saiba Mais
		</Button>
	</div>
</article>

<style>
	/* ─── Base ─────────────────────────────────────────── */
	.initiative-card {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		align-items: center;

		gap: var(--spacing-2xl, 4rem);
		padding: var(--spacing-lg, 2rem);

		border-radius: var(--border-radius-xl, 20px);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

		margin: 0;

		background-color: var(--color-yellow-600, #fbbf24);

		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.initiative-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
	}

	/* ─── Imagem ───────────────────────────────────────── */
	.initiative-card-image-wrapper {
		width: 100%;
		max-width: 420px;

		height: 220px;
		min-height: 220px;

		display: flex;
		align-items: center;
		justify-content: center;

		border-radius: var(--border-radius-2xl, 20px);
		overflow: hidden;

		background-color: var(--color-yellow-800);

		flex-shrink: 0;
	}

	.initiative-card-image-inner {
		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Corrige comportamento do componente Image */
	.initiative-card-image-wrapper :global(.image-container) {
		width: 100%;
		height: 100%;

		display: flex;
		align-items: center;
		justify-content: center;

		background-color: transparent;
		overflow: visible;
	}

	.initiative-card-image-wrapper :global(img),
	.initiative-card-image-wrapper :global(.image-element) {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	/* ─── Conteúdo ─────────────────────────────────────── */
	.initiative-card-content {
		display: flex;
		flex-direction: column;
		align-items: flex-start;

		gap: var(--spacing-sm, 0.5rem);
		flex: 1;
	}

	/* ─── Variantes ───────────────────────────────────── */
	.initiative-card-light {
		background-color: var(--color-yellow-600, #f6cb5a);
	}

	.initiative-card-light .initiative-card-image-wrapper {
		background-color: var(--color-yellow-800);
	}

	.initiative-card-dark {
		background-color: var(--color-yellow-800);
	}

	.initiative-card-dark .initiative-card-image-wrapper {
		background-color: var(--color-yellow-600);
	}

	/* ─── Responsividade ──────────────────────────────── */
	@media (max-width: 600px) {
		.initiative-card {
			grid-template-columns: 1fr;
			align-items: flex-start;
		}

		.initiative-card-image-wrapper {
			width: 100%;
			height: 160px;
		}
	}

	/* ─── Acessibilidade ──────────────────────────────── */
	@media (prefers-reduced-motion: reduce) {
		.initiative-card:hover {
			transform: none;
		}
	}
</style>
