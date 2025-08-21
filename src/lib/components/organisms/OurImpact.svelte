<!-- src/lib/components/organisms/OurImpact.svelte -->
<script lang="ts">
	import type { OurImpactProps } from '$lib/types/components';
	import { createEventDispatcher } from 'svelte';
	import Text from '../atoms/Text.svelte';
	import Image from '../atoms/Image.svelte';
	import SectionHeader from '../molecules/SectionHeader.svelte';
	import TextBlock from '../molecules/TextBlock.svelte';

	// Props principais
	export let title: OurImpactProps['title'] = undefined;
	export let description: OurImpactProps['description'] = undefined;
	export let impactText: OurImpactProps['impactText'] = undefined;
	export let background: OurImpactProps['background'] = 'none';
	export let layout: OurImpactProps['layout'] = 'default';

	// Props de BaseComponentProps
	export let id: string | undefined = undefined;
	export let visible: boolean = true;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Atributos HTML padrão
	let style = '';
	export { style };

	// Event dispatcher para eventos customizados
	const dispatch = createEventDispatcher<{
		mapClick: { source: string };
		sectionLoad: { id: string };
	}>();

	// Classes CSS baseadas nas props
	$: classes = [
		'our-impact',
		`our-impact-layout-${layout}`,
		`our-impact-background-${background}`,
		visible ? '' : 'our-impact-hidden',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Função para lidar com clique no mapa
	function handleMapClick() {
		dispatch('mapClick', { source: 'brazil-map' });
	}

	// Notifica quando o componente é carregado
	import { onMount } from 'svelte';
	onMount(() => {
		if (id) {
			dispatch('sectionLoad', { id });
		}
	});
</script>

<section 
	class={classes} 
	{id} 
	{style}
	aria-label={title ?? "Seção de impacto"}
>
	<div class="our-impact-container">
		{#if title}
			<SectionHeader
				title={title}
				align="center"
				decorative
				class="our-impact-header"
			/>
		{/if}

		<!-- Texto sobre o impacto -->
		{#if impactText}
			<TextBlock
				content={impactText}
				variant="paragraphs"
				spacing="normal"
				align="center"
				size="lg"
				color="secondary"
				weight="normal"
				leading="relaxed"
				class="our-impact-text"
				on:textRender={(e) => console.log('Texto renderizado:', e.detail)}
			/>
		{/if}

		<!-- Mapa do Brasil -->
		<div class="our-impact-map">
			<button
				type="button"
				class="our-impact-map-button"
				on:click={handleMapClick}
				aria-label="Visualizar alcance nacional no mapa do Brasil"
			>
				<Image
					src="/images/illustrations/brazil-map.svg"
					alt="Mapa do Brasil mostrando alcance nacional"
					aspectRatio="auto"
					loading="lazy"
					class="impact-map-image image-halftone"
				/>
			</button>
		</div>

		<!-- Slot para conteúdo adicional -->
		<slot />
	</div>
</section>

<style>
	.our-impact {
		position: relative;
		padding: var(--spacing-4xl) 0;
		overflow: hidden;
		transition: opacity var(--transition-normal) var(--transition-timing-default);
	}

	.our-impact-hidden {
		opacity: 0;
		pointer-events: none;
	}

	.our-impact-container {
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: 0 var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-2xl);
		align-items: center;
		text-align: center;
	}

	/* Backgrounds */
	.our-impact-background-none {
		background: transparent;
	}

	.our-impact-background-muted {
		background-color: var(--color-neutral-50);
	}

	.our-impact-background-primary {
		background: linear-gradient(135deg, var(--color-primary-100) 0%, var(--color-primary-50) 100%);
	}

	.our-impact-background-gradient {
		background: linear-gradient(
			135deg,
			var(--color-primary-50) 0%,
			var(--color-secondary-50) 50%,
			var(--color-accent-50) 100%
		);
	}

	/* Header */
	.our-impact-header {
		max-width: 800px;
	}

	/* Texto sobre o impacto */
	.our-impact-text {
		max-width: 800px;
		margin: 0 auto;
		text-align: center;
		line-height: var(--line-height-relaxed);
	}

	/* Mapa */
	.our-impact-map {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: var(--spacing-xl) 0;
		position: relative;
	}

	.our-impact-map-button {
		background: transparent;
		border: none;
		padding: 0;
		cursor: pointer;
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-normal) var(--transition-timing-default);
		position: relative;
		overflow: hidden;
	}

	.our-impact-map-button:hover {
		transform: scale(1.02);
	}

	.our-impact-map-button:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 4px;
	}

	.impact-map-image {
		max-width: 300px;
		height: auto;
		opacity: 0.7;
		filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
		transition: all var(--transition-normal) var(--transition-timing-default);
		display: block;
	}

	.our-impact-map-button:hover .impact-map-image {
		opacity: 1;
		transform: scale(1.03);
	}

	.our-impact-map-button:active .impact-map-image {
		transform: scale(0.98);
	}

	/* Layouts */

	.our-impact-layout-split .our-impact-container {
		flex-direction: row;
		align-items: center;
		text-align: left;
		gap: var(--spacing-3xl);
	}

	.our-impact-layout-split .our-impact-header,
	.our-impact-layout-split .our-impact-text {
		text-align: left;
		flex: 1;
	}

	.our-impact-layout-split .our-impact-map {
		flex: 1;
		justify-content: flex-end;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.our-impact {
			padding: var(--spacing-3xl) 0;
		}

		.our-impact-container {
			padding: 0 var(--spacing-md);
			gap: var(--spacing-xl);
		}

		.our-impact-layout-split .our-impact-container {
			flex-direction: column;
			text-align: center;
		}

		.our-impact-layout-split .our-impact-header,
		.our-impact-layout-split .our-impact-text {
			text-align: center;
		}

		.our-impact-layout-split .our-impact-map {
			justify-content: center;
		}

		.impact-map-image {
			max-width: 200px;
		}
	}

	@media (max-width: 480px) {
		.our-impact-container {
			padding: 0 var(--spacing-sm);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .our-impact-background-muted {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .our-impact-background-primary {
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
	}

	[data-theme='dark'] .our-impact-background-gradient {
		background: linear-gradient(
			135deg,
			var(--color-primary-900) 0%,
			var(--color-secondary-900) 50%,
			var(--color-accent-900) 100%
		);
	}

	/* Efeitos decorativos */
	.our-impact::before {
		content: '';
		position: absolute;
		top: 10%;
		left: -5%;
		width: 200px;
		height: 200px;
		background: radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%);
		border-radius: 50%;
		opacity: 0.5;
		z-index: -1;
		animation: float 8s ease-in-out infinite;
	}

	.our-impact::after {
		content: '';
		position: absolute;
		bottom: 10%;
		right: -5%;
		width: 150px;
		height: 150px;
		background: radial-gradient(circle, var(--color-secondary-200) 0%, transparent 70%);
		border-radius: 50%;
		opacity: 0.5;
		z-index: -1;
		animation: float 10s ease-in-out infinite reverse;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(10deg);
		}
	}
</style>
