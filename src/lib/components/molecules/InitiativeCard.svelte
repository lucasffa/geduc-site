<!-- src/lib/components/molecules/InitiativeCard.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Image from '../atoms/Image.svelte';
	import Text from '../atoms/Text.svelte';
	import Heading from '../atoms/Heading.svelte';
	import type { InitiativeCardProps } from '$lib/types/components';

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
</script>

<article class={classes} {style} aria-label={title}>
	<!-- Imagem -->
	<div class="initiative-card-image-wrapper">
		<Image
			src={illustration}
			alt={illustrationAlt}
			aspectRatio="square"
			objectFit="cover"
			loading="lazy"
			class="initiative-card-image"
		/>
	</div>

	<!-- Conteúdo -->
	<div class="initiative-card-content">
		<Heading level={3} size="xl" weight="bold" color="primary" class="initiative-card-title">
			{title}<span class="initiative-card-title-dot" aria-hidden="true">.</span>
		</Heading>

		<Text as="p" size="sm" color="secondary" leading="relaxed" class="initiative-card-description">
			{description}
		</Text>

		<button
			type="button"
			class="initiative-card-button"
			on:click={handleClick}
			aria-label="Saiba mais sobre {title}"
		>
			Saiba Mais
		</button>
	</div>

	<!-- Slot para conteúdo extra (badge, tag, etc.) -->
	<slot />
</article>

<style>
	.initiative-card {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: var(--spacing-xl, 1.5rem);
		background-color: var(--color-yellow-400, #fbbf24);
		border-radius: var(--border-radius-xl, 16px);
		padding: var(--spacing-lg, 1.25rem);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
		flex-shrink: 0;
		width: 120px;
		height: 120px;
		border-radius: var(--border-radius-lg, 12px);
		overflow: hidden;
		background-color: rgba(0, 0, 0, 0.06);
	}

	/* Conteúdo */
	.initiative-card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm, 0.5rem);
	}

	.initiative-card-title-dot {
		color: var(--color-neutral-900, #111);
	}

	/* Botão */
	.initiative-card-button {
		align-self: flex-start;
		margin-top: var(--spacing-xs, 0.25rem);
		background-color: var(--color-primary-600, #2563eb);
		color: #fff;
		border: none;
		border-radius: var(--border-radius-full, 9999px);
		padding: 8px 22px;
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: 600;
		cursor: pointer;
		transition:
			background-color 0.2s ease,
			transform 0.15s ease;
		letter-spacing: 0.01em;
	}

	.initiative-card-button:hover {
		background-color: var(--color-primary-700, #1d4ed8);
		transform: translateY(-1px);
	}

	.initiative-card-button:active {
		transform: translateY(0);
	}

	.initiative-card-button:focus-visible {
		outline: 2px solid var(--color-primary-500, #3b82f6);
		outline-offset: 3px;
	}

	/* ─── Responsividade ─── */
	@media (max-width: 600px) {
		.initiative-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.initiative-card-image-wrapper {
			width: 100%;
			height: 160px;
		}

		.initiative-card-button {
			align-self: stretch;
			text-align: center;
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

		.initiative-card-button:hover {
			transform: none;
		}
	}
</style>