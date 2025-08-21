<!-- src/lib/components/molecules/TextBlock.svelte -->
<script lang="ts">
	import type { TextBlockProps } from '$lib/types/components';
	import { createEventDispatcher } from 'svelte';
	import Text from '../atoms/Text.svelte';

	// Props principais
	export let content: TextBlockProps['content'];
	export let variant: TextBlockProps['variant'] = 'paragraphs';
	export let spacing: TextBlockProps['spacing'] = 'normal';
	export let align: TextBlockProps['align'] = 'left';
	export let size: TextBlockProps['size'] = 'md';
	export let color: TextBlockProps['color'] = 'secondary';
	export let weight: TextBlockProps['weight'] = 'normal';
	export let leading: TextBlockProps['leading'] = 'relaxed';

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
		textRender: { paragraphs: number; wordCount: number };
	}>();

	// Classes CSS baseadas nas props
	$: classes = [
		'text-block',
		`text-block-variant-${variant}`,
		`text-block-spacing-${spacing}`,
		`text-block-align-${align}`,
		`text-block-size-${size}`,
		`text-block-color-${color}`,
		`text-block-weight-${weight}`,
		`text-block-leading-${leading}`,
		visible ? '' : 'text-block-hidden',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Processa o conteúdo e divide em parágrafos
	$: paragraphs = content
		? content
				.split('\n')
				.map((line: string) => line.trim())
				.filter((line: string) => line.length > 0)
		: [];

	// Notifica quando o componente é renderizado
	import { onMount } from 'svelte';
	onMount(() => {
		if (paragraphs.length > 0) {
			const wordCount = paragraphs.reduce((total: number, p: string) => total + p.split(' ').length, 0);
			dispatch('textRender', { paragraphs: paragraphs.length, wordCount });
		}
	});
</script>

<div 
	class={classes} 
	{id} 
	{style}
	role="text"
	aria-label="Bloco de texto com múltiplos parágrafos"
>
	{#if variant === 'paragraphs'}
		<!-- Renderiza como parágrafos HTML semânticos -->
		{#each paragraphs as paragraph, index}
			<Text
				as="p"
				{size}
				{color}
				{align}
				{weight}
				{leading}
				class="text-block-paragraph"
				style="animation-delay: {index * 0.1}s"
			>
				{paragraph}
			</Text>
		{/each}
	{:else if variant === 'list'}
		<!-- Renderiza como lista ordenada -->
		<ol class="text-block-list">
			{#each paragraphs as paragraph, index}
				<li class="text-block-list-item">
					<Text
						{size}
						{color}
						{align}
						{weight}
						{leading}
					>
						{paragraph}
					</Text>
				</li>
			{/each}
		</ol>
	{:else if variant === 'cards'}
		<!-- Renderiza como cards individuais -->
		<div class="text-block-cards">
			{#each paragraphs as paragraph, index}
				<div class="text-block-card">
					<Text
						{size}
						{color}
						{align}
						{weight}
						{leading}
					>
						{paragraph}
					</Text>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Slot para conteúdo adicional -->
	<slot />
</div>

<style>
	.text-block {
		position: relative;
		transition: opacity var(--transition-normal) var(--transition-timing-default);
	}

	.text-block-hidden {
		opacity: 0;
		pointer-events: none;
	}

	/* Variantes de renderização */
	.text-block-variant-paragraphs {
		/* Layout padrão de parágrafos */
	}

	.text-block-variant-list {
		/* Layout de lista */
	}

	.text-block-variant-cards {
		/* Layout de cards */
	}

	/* Espaçamento entre elementos */
	.text-block-spacing-tight .text-block-paragraph,
	.text-block-spacing-tight .text-block-list-item,
	.text-block-spacing-tight .text-block-card {
		margin-bottom: var(--spacing-sm);
	}

	.text-block-spacing-normal .text-block-paragraph,
	.text-block-spacing-normal .text-block-list-item,
	.text-block-spacing-normal .text-block-card {
		margin-bottom: var(--spacing-md);
	}

	.text-block-spacing-loose .text-block-paragraph,
	.text-block-spacing-loose .text-block-list-item,
	.text-block-spacing-loose .text-block-card {
		margin-bottom: var(--spacing-lg);
	}

	.text-block-paragraph:last-child,
	.text-block-list-item:last-child,
	.text-block-card:last-child {
		margin-bottom: 0;
	}

	/* Alinhamento */
	.text-block-align-left {
		text-align: left;
	}

	.text-block-align-center {
		text-align: center;
	}

	.text-block-align-right {
		text-align: right;
	}

	.text-block-align-justify {
		text-align: justify;
	}

	/* Lista */
	.text-block-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.text-block-list-item {
		position: relative;
		padding-left: var(--spacing-lg);
	}

	.text-block-list-item::before {
		content: '•';
		position: absolute;
		left: 0;
		top: 0;
		color: var(--color-primary-500);
		font-weight: bold;
	}

	/* Cards */
	.text-block-cards {
		display: grid;
		gap: var(--spacing-md);
	}

	.text-block-card {
		background: var(--background-color-card);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		border: 1px solid var(--border-color-default);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-normal) var(--transition-timing-default);
	}

	.text-block-card:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}

	/* Animações de entrada */
	.text-block-paragraph {
		opacity: 0;
		transform: translateY(20px);
		animation: fadeInUp 0.6s ease-out forwards;
	}

	@keyframes fadeInUp {
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.text-block-cards {
			grid-template-columns: 1fr;
		}

		.text-block-spacing-loose .text-block-paragraph,
		.text-block-spacing-loose .text-block-list-item,
		.text-block-spacing-loose .text-block-card {
			margin-bottom: var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.text-block-card {
			padding: var(--spacing-md);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .text-block-card {
		background: var(--background-color-card);
		border-color: var(--border-color-default);
	}

	/* Acessibilidade */
	@media (prefers-reduced-motion: reduce) {
		.text-block-paragraph {
			animation: none;
			opacity: 1;
			transform: none;
		}

		.text-block-card:hover {
			transform: none;
		}
	}
</style>
