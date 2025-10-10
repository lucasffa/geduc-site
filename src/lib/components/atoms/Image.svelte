<!-- src/lib/components/atoms/Image.svelte -->
<script lang="ts">
	import type { ImageProps } from '$lib/types/components';

	export let src: ImageProps['src'];
	export let alt: ImageProps['alt'];
	export let width: ImageProps['width'] = undefined;
	export let height: ImageProps['height'] = undefined;
	export let aspectRatio: ImageProps['aspectRatio'] = 'auto';
	export let objectFit: ImageProps['objectFit'] = 'cover';
	export let loading: ImageProps['loading'] = 'lazy';
	export let priority: ImageProps['priority'] = false;
	export let placeholder: ImageProps['placeholder'] = undefined;
	export let blendMode: ImageProps['blendMode'] = undefined;
	export let maskMode: ImageProps['maskMode'] = undefined;
	export let maskBlendMode: ImageProps['maskBlendMode'] = 'luminosity';
	export let maskColor: ImageProps['maskColor'] = undefined;
	// Eventos
	export let onload: ImageProps['onload'] = undefined;
	export let onerror: ImageProps['onerror'] = undefined;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Estado interno
	let loaded = false;
	let error = false;
	let imageElement: HTMLImageElement;
	
	// Detecta se a imagem é SVG
	$: isSVG = src?.toLowerCase().endsWith('.svg') || src?.includes('data:image/svg+xml');
	
	// Determina se deve usar blend ou mask
	$: useBlendMode = isSVG && blendMode;
	$: useMaskMode = !isSVG && maskMode && maskColor;
	
	// Debug
	$: if (useMaskMode) {
		console.log('🎭 Mask Mode ativado:', { src, maskMode, maskColor, maskBlendMode });
	}

	// Classes CSS baseadas nas props
	$: classes = [
		'image',
		`image-aspect-${aspectRatio}`,
		`image-fit-${objectFit}`,
		useBlendMode && `blend-mode-${blendMode}`,
		useMaskMode && `mask-mode-${maskMode}`,
		useMaskMode && maskBlendMode && `mask-blend-${maskBlendMode}`,
		!loaded && 'image-loading',
		error && 'image-error',
		className
	]
		.filter(Boolean)
		.join(' ');
		
	// CSS Custom Properties para máscara - idiomático Svelte
	$: inlineStyles = useMaskMode 
		? `background-image: url("${src}"); background-color: ${maskColor}; -webkit-mask-image: url("${src}"); mask-image: url("${src}");`
		: '';

	// Handlers de eventos
	function handleLoad() {
		loaded = true;
		onload?.();
	}

	function handleError() {
		error = true;
		onerror?.();
	}

	// Preload se priority for true
	$: if (priority && src) {
		if (typeof window !== 'undefined') {
			const link = document.createElement('link');
			link.rel = 'preload';
			link.as = 'image';
			link.href = src;
			document.head.appendChild(link);
		}
	}
</script>

<div class="image-container">
	{#if placeholder && !loaded && !error}
		<div class="image-placeholder">
			{#if placeholder.startsWith('data:') || placeholder.startsWith('http')}
				<img src={placeholder} alt="" class="image-placeholder-img" />
			{:else}
				<div class="image-placeholder-text">{placeholder}</div>
			{/if}
		</div>
	{/if}

	{#if useMaskMode}
		<!-- Para imagens raster com máscara - usa background-image -->
		<div 
			class="image-element-masked {classes}"
			style={inlineStyles}
			role="img"
			aria-label={alt}
		>
			<!-- Imagem invisível para carregar e manter acessibilidade -->
			<img
				bind:this={imageElement}
				{src}
				{alt}
				{width}
				{height}
				loading={priority ? 'eager' : loading}
				class="image-loader"
				on:load={handleLoad}
				on:error={handleError}
			/>
		</div>
	{:else}
		<!-- Para SVGs e imagens normais -->
		<img
			bind:this={imageElement}
			{src}
			{alt}
			{width}
			{height}
			loading={priority ? 'eager' : loading}
			class="image-element {classes}"
			on:load={handleLoad}
			on:error={handleError}
			{...$$restProps}
		/>
	{/if}

	{#if error}
		<div class="image-error-state">
			<div class="image-error-icon">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
					<circle cx="8.5" cy="8.5" r="1.5" />
					<path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
				</svg>
			</div>
			<span class="image-error-text">Imagem não pôde ser carregada</span>
		</div>
	{/if}
</div>

<style>
	.image-container {
		position: relative;
		display: block;
		overflow: hidden;
	}

	.image-element {
		width: 100%;
		height: 100%;
		object-fit: var(--object-fit, cover);
		transition: opacity var(--transition-normal) var(--transition-timing-default);
	}

	/* Elemento mascarado - usa background-image com mask */
	.image-element-masked {
		width: 100%;
		height: 100%;
		/* background-image e background-color vêm do inline style */
		background-size: cover;
		background-position: center;
		background-repeat: no-repeat;
	}

	/* Imagem loader invisível */
	.image-loader {
		position: absolute;
		width: 0;
		height: 0;
		opacity: 0;
		pointer-events: none;
	}

	/* Aspect Ratios */
	.image-aspect-square,
	.image-aspect-square.image-element-masked {
		aspect-ratio: 1 / 1;
	}

	.image-aspect-16\/9,
	.image-aspect-16\/9.image-element-masked {
		aspect-ratio: 16 / 9;
	}

	.image-aspect-4\/3,
	.image-aspect-4\/3.image-element-masked {
		aspect-ratio: 4 / 3;
	}

	.image-aspect-3\/2,
	.image-aspect-3\/2.image-element-masked {
		aspect-ratio: 3 / 2;
	}

	.image-aspect-auto,
	.image-aspect-auto.image-element-masked {
		aspect-ratio: auto;
	}

	/* Object Fit */
	.image-fit-cover .image-element {
		object-fit: cover;
	}

	.image-fit-contain .image-element {
		object-fit: contain;
	}

	.image-fit-fill .image-element {
		object-fit: fill;
	}

	.image-fit-scale-down .image-element {
		object-fit: scale-down;
	}

	.image-fit-none .image-element {
		object-fit: none;
	}

	/* Mask Modes - para imagens raster (PNG, JPG, WEBP, AVIF) */
	/* O mask-image vem do inline style, aqui só configuramos o modo e tamanho */
	.mask-mode-alpha.image-element-masked {
		-webkit-mask-mode: alpha;
		-webkit-mask-size: cover;
		-webkit-mask-position: center;
		-webkit-mask-repeat: no-repeat;
		mask-mode: alpha;
		mask-size: cover;
		mask-position: center;
		mask-repeat: no-repeat;
	}

	.mask-mode-luminance.image-element-masked {
		-webkit-mask-mode: luminance;
		-webkit-mask-size: cover;
		-webkit-mask-position: center;
		-webkit-mask-repeat: no-repeat;
		mask-mode: luminance;
		mask-size: cover;
		mask-position: center;
		mask-repeat: no-repeat;
	}

	.mask-mode-match-source.image-element-masked {
		-webkit-mask-mode: match-source;
		-webkit-mask-size: cover;
		-webkit-mask-position: center;
		-webkit-mask-repeat: no-repeat;
		mask-mode: match-source;
		mask-size: cover;
		mask-position: center;
		mask-repeat: no-repeat;
	}

	/* Blend modes para máscaras */
	.mask-blend-multiply.image-element-masked {
		background-blend-mode: multiply;
	}

	.mask-blend-screen.image-element-masked {
		background-blend-mode: screen;
	}

	.mask-blend-overlay.image-element-masked {
		background-blend-mode: overlay;
	}

	.mask-blend-darken.image-element-masked {
		background-blend-mode: darken;
	}

	.mask-blend-lighten.image-element-masked {
		background-blend-mode: lighten;
	}

	.mask-blend-luminosity.image-element-masked {
		background-blend-mode: luminosity;
	}

	/* Blend Modes - apenas para SVGs */

	.blend-mode-screen .image-element {
		mix-blend-mode: screen;
	}

	.blend-mode-multiply .image-element {
		mix-blend-mode: multiply;
	}

	.blend-mode-overlay .image-element {
		mix-blend-mode: overlay;
	}

	.blend-mode-darken .image-element {
		mix-blend-mode: darken;
	}

	.blend-mode-lighten .image-element {
		mix-blend-mode: lighten;
	}

	.blend-mode-color-dodge .image-element {
		mix-blend-mode: color-dodge;
	}

	.blend-mode-color-burn .image-element {
		mix-blend-mode: color-burn;
	}

	.blend-mode-hard-light .image-element {
		mix-blend-mode: hard-light;
	}

	.blend-mode-soft-light .image-element {
		mix-blend-mode: soft-light;
	}

	.blend-mode-difference .image-element {
		mix-blend-mode: difference;
	}

	.blend-mode-exclusion .image-element {
		mix-blend-mode: exclusion;
	}

	.blend-mode-hue .image-element {
		mix-blend-mode: hue;
	}

	.blend-mode-saturation .image-element {
		mix-blend-mode: saturation;
	}

	.blend-mode-color .image-element {
		mix-blend-mode: color;
	}

	.blend-mode-luminosity .image-element {
		mix-blend-mode: luminosity;
	}

	/* Estados de carregamento */
	.image-loading .image-element {
		opacity: 0;
	}

	.image-loading::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			var(--color-neutral-200) 25%,
			var(--color-neutral-100) 50%,
			var(--color-neutral-200) 75%
		);
		background-size: 200% 100%;
		animation: shimmer 2s infinite;
	}

	@keyframes shimmer {
		0% {
			background-position: -200% 0;
		}
		100% {
			background-position: 200% 0;
		}
	}

	/* Placeholder */
	.image-placeholder {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background-color: var(--color-neutral-100);
		z-index: 1;
	}

	.image-placeholder-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		filter: blur(8px);
		opacity: 0.5;
	}

	.image-placeholder-text {
		color: var(--text-color-subtle);
		font-size: var(--font-size-sm);
		text-align: center;
	}

	/* Estado de erro */
	.image-error .image-element {
		opacity: 0;
	}

	.image-error-state {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		background-color: var(--color-neutral-100);
		color: var(--text-color-subtle);
		gap: var(--spacing-sm);
	}

	.image-error-icon {
		width: 24px;
		height: 24px;
		opacity: 0.5;
	}

	.image-error-icon svg {
		width: 100%;
		height: 100%;
	}

	.image-error-text {
		font-size: var(--font-size-sm);
		text-align: center;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.image-container {
			border-radius: var(--border-radius-md);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .image-container {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .image-placeholder {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .image-error-state {
		background-color: var(--color-neutral-800);
	}

	[data-theme='dark'] .image-loading::after {
		background: linear-gradient(
			90deg,
			var(--color-neutral-700) 25%,
			var(--color-neutral-800) 50%,
			var(--color-neutral-700) 75%
		);
	}

	/* Hover effects para imagens interativas */
	.image-container:hover .image-element {
		transform: scale(1.05);
		transition: transform var(--transition-normal) var(--transition-timing-default);
	}

	/* Efeito halftone específico mencionado na hierarquia */
	.image-halftone::after {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-image: radial-gradient(circle, rgba(0, 0, 0, 0.1) 1px, transparent 1px);
		background-size: 4px 4px;
		pointer-events: none;
		mix-blend-mode: multiply;
	}
</style>
