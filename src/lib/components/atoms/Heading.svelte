<!-- src/lib/components/atoms/Heading.svelte -->
<script lang="ts">
	import type {
		HeadingProps,
		Size,
		FontWeight,
		ColorVariant,
		TextAlign
	} from '$lib/types/components';
	import Image from './Image.svelte';
	import { onMount } from 'svelte';

	export let level: HeadingProps['level'] = 1;
	export let size: HeadingProps['size'] = undefined;
	export let weight: HeadingProps['weight'] = undefined;
	export let color: HeadingProps['color'] = undefined;
	export let align: HeadingProps['align'] = 'left';
	export let gradient: HeadingProps['gradient'] = false;
	export let children: HeadingProps['children'];

	// Novas props para funcionalidades avançadas
	export let decorativeLetter: HeadingProps['decorativeLetter'] = false;
	export let decoration: HeadingProps['decoration'] = undefined;
	export let decorationColor: HeadingProps['decorationColor'] = undefined;
	export let decorationPosition: HeadingProps['decorationPosition'] = 'bottom';

	// Classes adicionais
	let className = '';
	export { className as class };

	// Estado interno
	let decorativeImageLoaded = false;
	let decorativeImageError = false;
	let headingElement: HTMLElement | undefined;
	let slotElement: HTMLElement | undefined;
	let fullText = '';
	let firstLetter = '';
	let textWithoutFirstLetter = '';

	// Função para processar o texto do slot
	function processSlotText() {
		if (slotElement) {
			fullText = slotElement.textContent?.trim() || '';
			firstLetter = fullText.charAt(0).toLowerCase();
			textWithoutFirstLetter = fullText.substring(1);

			console.log('🔤 Texto processado:', {
				fullText,
				firstLetter,
				textWithoutFirstLetter
			});
		}
	}

	// Função para gerar o caminho da imagem
	function getImagePath(letter: string): string {
		return `/images/decorative-letters/letter-${letter}.png`;
	}

	// Mapeamento de níveis para tags HTML
	const tagMap = {
		1: 'h1',
		2: 'h2',
		3: 'h3',
		4: 'h4',
		5: 'h5',
		6: 'h6'
	} as const;

	// Mapeamento de tamanhos para classes CSS
	const sizeMap: Record<Size, string> = {
		xs: 'heading-xs',
		sm: 'heading-sm',
		md: 'heading-md',
		lg: 'heading-lg',
		xl: 'heading-xl',
		'2xl': 'heading-2xl',
		'3xl': 'heading-3xl',
		'4xl': 'heading-4xl',
		'5xl': 'heading-4xl', // Fallback para tamanhos maiores
		'6xl': 'heading-4xl',
		'7xl': 'heading-4xl',
		'8xl': 'heading-4xl'
	} as const;

	// Mapeamento de pesos para classes CSS
	const weightMap: Record<FontWeight, string> = {
		light: 'font-light',
		normal: 'font-normal',
		medium: 'font-medium',
		semibold: 'font-semibold',
		bold: 'font-bold',
		extrabold: 'font-extrabold'
	} as const;

	// Mapeamento de cores para classes CSS
	const colorMap: Record<ColorVariant, string> = {
		primary: 'text-primary',
		secondary: 'text-secondary',
		accent: 'text-accent',
		neutral: 'text-neutral',
		success: 'text-success',
		warning: 'text-warning',
		error: 'text-error',
		info: 'text-info'
	} as const;

	// Mapeamento de alinhamentos para classes CSS
	const alignMap: Record<TextAlign, string> = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right',
		justify: 'text-justify'
	} as const;

	// Mapeamento de posições de decoração para classes CSS
	const decorationPositionMap: Record<string, string> = {
		top: 'decoration-top',
		bottom: 'decoration-bottom',
		left: 'decoration-left',
		right: 'decoration-right'
	} as const;

	// Classes CSS baseadas nas props
	$: classes = [
		'heading',
		`heading-level-${level}`,
		size && sizeMap[size],
		weight && weightMap[weight],
		color && (colorMap[color as ColorVariant] || ''),
		align && alignMap[align],
		gradient && 'heading-gradient',
		decorativeLetter && 'heading-decorative',
		decoration &&
			decorationPosition &&
			`heading-decoration ${decorationPositionMap[decorationPosition]}`,
		className
	]
		.filter(Boolean)
		.join(' ');

	// Debug: verificar props
	$: console.log('🎯 Heading Props:', {
		level,
		decorativeLetter,
		children: typeof children,
		classes
	});

	// Handlers para imagem decorativa
	function handleDecorativeImageLoad() {
		decorativeImageLoaded = true;
		console.log('✅ Imagem decorativa carregada');
	}

	function handleDecorativeImageError() {
		decorativeImageError = true;
		console.log('❌ Erro ao carregar imagem decorativa');
	}

	// Processa o texto após a montagem
	onMount(() => {
		if (decorativeLetter) {
			// Aguarda um tick para garantir que o conteúdo foi renderizado
			setTimeout(processSlotText, 0);
		}
	});

	// Reprocessa quando o conteúdo muda
	$: if (decorativeLetter && slotElement) {
		processSlotText();
	}

	// Tag HTML dinâmica baseada no nível
	$: tag = tagMap[level];

	// Estilos inline para cores customizadas
	$: customColorStyle = color && !colorMap[color as ColorVariant] ? `color: ${color};` : '';
	$: decorationColorStyle = decorationColor ? `background-color: ${decorationColor};` : '';
</script>

<svelte:element
	this={tag}
	bind:this={headingElement}
	class={classes}
	style={customColorStyle}
	{...$$restProps}
>
	{#if decorativeLetter}
		<!-- Renderiza com letra decorativa -->
		<div class="heading-decorative-wrapper">
			<div class="heading-decorative-letter">
				<Image
					src={getImagePath(firstLetter || 'n')}
					alt={`Letra decorativa ${(firstLetter || 'N').toUpperCase()}`}
					width={48}
					height={48}
					objectFit="contain"
					priority={true}
					onload={handleDecorativeImageLoad}
					onerror={handleDecorativeImageError}
				/>
			</div>
			<span class="heading-decorative-text">
				{textWithoutFirstLetter}
			</span>
		</div>

		<!-- Slot escondido para capturar o texto -->
		<div bind:this={slotElement} class="slot-hidden">
			<slot />
		</div>
	{:else}
		<slot />
	{/if}

	{#if decoration}
		<div class="heading-decoration-line" style={decorationColorStyle}></div>
	{/if}
</svelte:element>

<style>
	.heading {
		margin: 0;
		line-height: var(--line-height-tight);
		color: var(--text-color-primary);
	}

	/* Tamanhos baseados no nível semântico */
	.heading-level-1 {
		font-size: var(--heading-1-font-size);
		font-weight: var(--heading-1-font-weight);
		line-height: var(--heading-1-line-height);
	}

	.heading-level-2 {
		font-size: var(--heading-2-font-size);
		font-weight: var(--heading-2-font-weight);
		line-height: var(--heading-2-line-height);
	}

	.heading-level-3 {
		font-size: var(--heading-3-font-size);
		font-weight: var(--heading-3-font-weight);
		line-height: var(--heading-3-line-height);
	}

	.heading-level-4 {
		font-size: var(--heading-4-font-size);
		font-weight: var(--heading-4-font-weight);
		line-height: var(--heading-4-line-height);
	}

	.heading-level-5 {
		font-size: var(--heading-5-font-size);
		font-weight: var(--heading-5-font-weight);
		line-height: var(--heading-5-line-height);
	}

	.heading-level-6 {
		font-size: var(--heading-6-font-size);
		font-weight: var(--heading-6-font-weight);
		line-height: var(--heading-6-line-height);
	}

	/* Tamanhos customizados */
	.heading-xs {
		font-size: var(--font-size-xs);
	}
	.heading-sm {
		font-size: var(--font-size-sm);
	}
	.heading-md {
		font-size: var(--font-size-md);
	}
	.heading-lg {
		font-size: var(--font-size-lg);
	}
	.heading-xl {
		font-size: var(--font-size-xl);
	}
	.heading-2xl {
		font-size: var(--font-size-2xl);
	}
	.heading-3xl {
		font-size: var(--font-size-3xl);
	}
	.heading-4xl {
		font-size: var(--font-size-4xl);
	}

	/* Pesos customizados */
	.font-light {
		font-weight: var(--font-weight-light);
	}
	.font-normal {
		font-weight: var(--font-weight-normal);
	}
	.font-medium {
		font-weight: var(--font-weight-medium);
	}
	.font-semibold {
		font-weight: var(--font-weight-semibold);
	}
	.font-bold {
		font-weight: var(--font-weight-bold);
	}
	.font-extrabold {
		font-weight: 800;
	}

	/* Cores customizadas */
	.text-primary {
		color: var(--text-color-primary);
	}
	.text-secondary {
		color: var(--text-color-secondary);
	}
	.text-accent {
		color: var(--color-accent-500);
	}
	.text-neutral {
		color: var(--color-neutral-700);
	}
	.text-success {
		color: var(--color-success);
	}
	.text-warning {
		color: var(--color-warning);
	}
	.text-error {
		color: var(--color-error);
	}
	.text-info {
		color: var(--color-info);
	}

	/* Alinhamentos */
	.text-left {
		text-align: left;
	}
	.text-center {
		text-align: center;
	}
	.text-right {
		text-align: right;
	}
	.text-justify {
		text-align: justify;
	}

	/* Gradiente */
	.heading-gradient {
		background: linear-gradient(135deg, var(--color-primary-600), var(--color-secondary-600));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	/* Letra decorativa */
	.heading-decorative {
		position: relative;
	}

	.heading-decorative-wrapper {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.heading-decorative-letter {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.heading-decorative-letter-fallback {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background-color: var(--color-yellow-600);
		border-radius: var(--border-radius-sm);
		color: var(--text-color-inverse);
	}

	.heading-decorative-letter-text {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--text-color-inverse);
	}

	.heading-decorative-text {
		display: inline;
	}

	/* Slot escondido para capturar texto */
	.slot-hidden {
		position: absolute;
		visibility: hidden;
		height: 0;
		overflow: hidden;
		pointer-events: none;
	}

	/* Decoração */
	.heading-decoration {
		position: relative;
	}

	.heading-decoration-line {
		position: absolute;
		background-color: var(--color-yellow-600);
		transition: all var(--transition-normal) var(--transition-timing-default);
	}

	/* Posições de decoração */
	.heading-decoration.decoration-bottom .heading-decoration-line {
		bottom: -4px;
		left: 0;
		width: 100%;
		height: 3px;
		border-radius: var(--border-radius-sm);
	}

	.heading-decoration.decoration-top .heading-decoration-line {
		top: -4px;
		left: 0;
		width: 100%;
		height: 3px;
		border-radius: var(--border-radius-sm);
	}

	.heading-decoration.decoration-left .heading-decoration-line {
		left: -8px;
		top: 0;
		width: 3px;
		height: 100%;
		border-radius: var(--border-radius-sm);
	}

	.heading-decoration.decoration-right .heading-decoration-line {
		right: -8px;
		top: 0;
		width: 3px;
		height: 100%;
		border-radius: var(--border-radius-sm);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.heading-decorative-wrapper {
			gap: var(--spacing-xs);
		}

		.heading-decorative-letter {
			width: 36px;
			height: 36px;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .heading {
		color: var(--text-color-primary);
	}

	[data-theme='dark'] .heading-gradient {
		background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-400));
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
</style>
