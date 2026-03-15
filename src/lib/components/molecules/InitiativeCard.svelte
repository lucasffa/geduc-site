<!-- src/lib/components/molecules/InitiativeCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Image from '../atoms/Image.svelte';
	import type { InitiativeCardProps } from '$lib/types/components';
	import SectionHeader from './SectionHeader.svelte';
	import TextBlock from './TextBlock.svelte';
	import Button from '../atoms/Button.svelte';

	export let id: InitiativeCardProps['id'];
	export let title: InitiativeCardProps['title'];
	export let description: InitiativeCardProps['description'];
	export let illustration: InitiativeCardProps['illustration'];
	export let illustrationAlt: InitiativeCardProps['illustrationAlt'];
	export let href: InitiativeCardProps['href'] = undefined;

	let className = '';
	export { className as class };

	let style = '';
	export { style };

	const dispatch = createEventDispatcher<{
		click: { id: string; href?: string };
	}>();

	$: classes = ['initiative-card', className].filter(Boolean).join(' ');

	function handleClick() {
		dispatch('click', { id, href });
	}

	// Criar uma versão "invertida" do card para intercalar com uma clara e uma escura, assim como no figma
</script>

<article class={classes} {style} aria-label={title}>
	<!-- Imagem -->
	<div class="initiative-card-image-wrapper">
		<Image
			src={illustration}
			alt={illustrationAlt}
			objectFit="contain"
			loading="lazy"
			class="initiative-card-image"
		/>
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
		/>
			<!-- Mexer no atomo adicionar mais cores, eu preciso fazer o esquema de inverter na decoração tbm -->

		<TextBlock
			content={description}
			variant="paragraphs"
			spacing="normal"
			align="left"
			color="neutral"
			weight="normal"
			leading="relaxed"
			class="initiative-card-description"
			size="sm"
		/>

		<Button
			variant="primary"
			size="lg"
			onclick={handleClick}
			aria-label={`Saiba mais sobre ${title}`}
		>
			Saiba Mais
		</Button>
		<!-- Mexer no atomo adicionar mais cores ele ta apenas com um azul claro -->

		<!-- Falar com o Lucas sobre isso -->

	</div>
</article>

<style>
	.initiative-card {
		display: grid;
		grid-template-columns: 1fr 1.4fr;
		align-items: center;
		gap: 4rem;
		background-color: var(--color-yellow-600, #fbbf24);
		border-radius: var(--border-radius-xl, 16px);
		padding: var(--spacing-lg, 2rem);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		margin: 0;
		transition:
			transform 0.2s ease,
			box-shadow 0.2s ease;
	}

	.initiative-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
	}

	/* Imagem */
	.initiative-card-image-wrapper {
		width: 100%;
		height: 220px;
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--border-radius-lg, 12px);
		overflow: hidden;
		/* Fundo laranja mais escuro como no design */
		background-color: #f2a842;
		flex-shrink: 0;
	}

	/* Garante que o componente Image preencha o wrapper corretamente */
	.initiative-card-image-wrapper :global(.image-container) {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: transparent;
		overflow: visible;
	}

	.initiative-card-image-wrapper :global(.image-element) {
		width: 85%;
		height: 85%;
		object-fit: contain;
	}

	/* Conteúdo */
	.initiative-card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm, 0.5rem);
	}

	/* ─── Responsividade ─── */
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

	/* ─── Dark theme ─── */
	[data-theme='dark'] .initiative-card {
		background-color: var(--color-yellow-500, #f59e0b);
	}

	/* ─── Acessibilidade ─── */
	@media (prefers-reduced-motion: reduce) {
		.initiative-card:hover {
			transform: none;
		}
	}
</style>