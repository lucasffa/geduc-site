<!-- src/lib/components/atoms/Heading.svelte -->
<script lang="ts">
	import type {
		HeadingProps,
		Size,
		FontWeight,
		ColorVariant,
		TextAlign,
		ShadowType
	} from '$lib/types/components';
	import Image from './Image.svelte';
	import { onMount } from 'svelte';
	import { logger } from '$lib/utils/logger';

	export let level: HeadingProps['level'] = 1;
	export let shadow: HeadingProps['shadow'] = undefined;
	export let size: HeadingProps['size'] = undefined;
	export let weight: HeadingProps['weight'] = undefined;
	export let color: HeadingProps['color'] = 'accent';
	export let align: HeadingProps['align'] = 'left';
	export let gradient: HeadingProps['gradient'] = false;
	export let children: HeadingProps['children'];

	// Novas props para funcionalidades avançadas
	export let decorativeLetter: HeadingProps['decorativeLetter'] = false;
	export let decoration: HeadingProps['decoration'] = undefined;
	export let decorationColor: HeadingProps['decorationColor'] = undefined;
	export let decorationPosition: HeadingProps['decorationPosition'] = 'bottom';
	export let decorationStyle: 'text-width' | 'full-width' = 'text-width';

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

			logger.info('🔤 Texto processado:', {
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

	// Handlers para imagem decorativa
	function handleDecorativeImageLoad() {
		decorativeImageLoaded = true;
		logger.info('✅ Imagem decorativa carregada');
	}

	function handleDecorativeImageError() {
		decorativeImageError = true;
		logger.error('❌ Erro ao carregar imagem decorativa');
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
		info: 'text-info',
		white: 'text-white'
	} as const;

	// Mapeamento de alinhamentos para classes CSS
	const alignMap: Record<TextAlign, string> = {
		left: 'text-left',
		center: 'text-center',
		right: 'text-right',
		justify: 'text-justify'
	} as const;

	// Mapeamento de shadows para classes CSS
	const shadowMap: Record<ShadowType, string> = {
		sm: 'heading-shadow-sm',
		md: 'heading-shadow-md',
		lg: 'heading-shadow-lg',
		xl: 'heading-shadow-xl',
		inner: 'heading-shadow-inner',
		outline: 'heading-shadow-outline',
		drop: 'heading-shadow-drop',
		none: 'heading-shadow-none'
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
		shadow && shadowMap[shadow],
		decoration &&
			decorationPosition &&
			`heading-decoration ${decorationPositionMap[decorationPosition]} decoration-${decorationStyle}`,
		className
	]
		.filter(Boolean)
		.join(' ');

	// Estilos inline calculados reativamente
	$: customStyles = {
		color: color && !colorMap[color as ColorVariant] ? color : undefined,
		textShadow: shadow && !shadowMap[shadow] ? shadow : undefined
	};

	// Debug: verificar props
	$: logger.info('🎯 Heading Props:', {
		level,
		shadow,
		decorativeLetter,
		children: typeof children,
		classes,
		customStyles
	});

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
	$: decorationColor = decorationColor;

	// Caminho da imagem da letra decorativa
	$: imagePath = getImagePath(firstLetter || 'n');
</script>

<svelte:element
	this={tag}
	bind:this={headingElement}
	class={classes}
	style:color={customStyles.color}
	style:text-shadow={customStyles.textShadow}
	{...$$restProps}
>
	{#if decoration}
		<div class="heading-decoration-line" style:background-color={decorationColor}></div>
	{/if}

	{#if decorativeLetter}
		<!-- Renderiza com letra decorativa -->
		<div class="heading-decorative-wrapper">
			<div class="heading-decorative-letter">
				<Image
					src={imagePath}
					alt={`Letra decorativa ${(firstLetter || 'N').toUpperCase()}`}
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
</svelte:element>

<style>
	.heading {
		margin: 0;
		line-height: var(--line-height-tight);
		color: var(--text-color-primary);
		display: inline-block;
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
		color: var(--color-secondary-600);
	}
	.text-white {
		color: var(--color-neutral-0);
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

	/* Shadows do texto usando CSS Variables */
	.heading-shadow-sm {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
	}

	.heading-shadow-md {
		text-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
	}

	.heading-shadow-lg {
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
	}

	.heading-shadow-xl {
		text-shadow: 0 6px 12px rgba(0, 0, 0, 0.25);
	}

	.heading-shadow-inner {
		text-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.heading-shadow-drop {
		filter: var(--shadow-drop);
	}

	.heading-shadow-outline {
		text-shadow: 
			-1px -1px 0 rgba(0, 0, 0, 0.3),
			1px -1px 0 rgba(0, 0, 0, 0.3),
			-1px 1px 0 rgba(0, 0, 0, 0.3),
			1px 1px 0 rgba(0, 0, 0, 0.3);
	}

	.heading-shadow-none {
		text-shadow: none;
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
		position: relative;
		z-index: 2;
	}

	.heading-decorative-letter {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		z-index: 3;
		font-size: inherit;
		width: 2em;
		height: 2em;
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
		position: relative;
		z-index: 2;
		background-color: var(--surface-color-primary);
		padding: 0 var(--spacing-xs);
		margin-left: calc(-1 * var(--spacing-xs));
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
		z-index: 1;
	}

	/* Posições de decoração - Text Width (padrão) */
	.heading-decoration.decoration-bottom.decoration-text-width .heading-decoration-line {
		top: 35px;
		left: 0px;
		right: 0px;
		height: 15px;
		border-radius: var(--border-radius-sm);
		margin: 0 var(--spacing-sm);
	}

	.heading-decoration.decoration-top.decoration-text-width .heading-decoration-line {
		top: -4px;
		left: 0;
		right: 0;
		height: 3px;
		border-radius: var(--border-radius-sm);
	}

	/* Posições de decoração - Full Width */
	.heading-decoration.decoration-bottom.decoration-full-width .heading-decoration-line {
		top: 30px;
		left: 50%;
		transform: translateX(-50%);
		width: 100vw;
		height: 15px;
		border-radius: 0;
	}

	.heading-decoration.decoration-top.decoration-full-width .heading-decoration-line {
		top: -4px;
		left: 50%;
		transform: translateX(-50%);
		width: 100vw;
		height: 3px;
		border-radius: 0;
	}

	/* Posições laterais (mantém comportamento igual para ambos tipos) */
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
			width: 2em;
			height: 2em;
		}

		/* Posições de decoração - Text Width (padrão) */
		.heading-decoration.decoration-bottom.decoration-text-width .heading-decoration-line {
			top: 35px;
			left: 0px;
			right: 0;
			height: 15px;
			border-radius: var(--border-radius-sm);
		}
	}

	/* Conteúdo com decoração */
	.heading-decoration:not(.heading-decorative) {
		background-color: var(--surface-color-primary);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		z-index: 2;
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

	[data-theme='dark'] .heading-decoration:not(.heading-decorative) {
		background-color: var(--surface-color-primary);
	}

	[data-theme='dark'] .heading-decorative-text {
		background-color: var(--surface-color-primary);
	}
</style>
