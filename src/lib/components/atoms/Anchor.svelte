<!-- src/lib/components/atoms/Anchor.svelte -->
<script lang="ts">
	import type { AnchorProps } from '$lib/types/components';
	import Icon from './Icon.svelte';

	export let href: AnchorProps['href'] = '';
	export let target: AnchorProps['target'] = '_self';
	export let rel: AnchorProps['rel'] = undefined;
	export let external: AnchorProps['external'] = false;
	export let download: AnchorProps['download'] = false;
	
	export let size: AnchorProps['size'] = 'md';
	export let weight: AnchorProps['weight'] = 'normal';
	export let color: AnchorProps['color'] = 'primary';
	export let align: AnchorProps['align'] = 'left';
	export let leading: AnchorProps['leading'] = 'normal';
	export let truncate: AnchorProps['truncate'] = false;
	export let maxLines: AnchorProps['maxLines'] = undefined;
	export let variant: AnchorProps['variant'] = 'default';
	export let showExternalIcon: AnchorProps['showExternalIcon'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Determinar se é link externo
	$: isExternal = external || (href && (href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:')));
	
	// Configurar rel para links externos
	$: computedRel = rel || (isExternal && target === '_blank' ? 'noopener noreferrer' : undefined);
	
	// Classes CSS baseadas nas props
	$: classes = [
		'anchor',
		`anchor-size-${size}`,
		`anchor-weight-${weight}`,
		`anchor-color-${typeof color === 'string' && color.startsWith('#') ? 'custom' : color}`,
		`anchor-align-${align}`,
		`anchor-leading-${leading}`,
		`anchor-variant-${variant}`,
		truncate && 'anchor-truncate',
		maxLines && 'anchor-clamp',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Style customizado para cores hexadecimais e maxLines
	$: customColor = typeof color === 'string' && color.startsWith('#') ? color : undefined;
	$: lineClampStyle = maxLines ? `-webkit-line-clamp: ${maxLines}` : undefined;
</script>

<a
	{href}
	{target}
	rel={computedRel}
	download={download}
	class={classes}
	style:color={customColor}
	style:-webkit-line-clamp={maxLines}
	{...$$restProps}
>
	<slot />
	{#if showExternalIcon && isExternal}
		<Icon name="external-link" size="xs" class="anchor-external-icon" />
	{/if}
</a>

<style>
	.anchor {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		text-decoration: none;
		font-family: var(--font-family-sans);
		transition: all 0.2s ease-in-out;
		cursor: pointer;
	}

	/* Tamanhos */
	.anchor-size-xs {
		font-size: var(--font-size-xs);
	}

	.anchor-size-sm {
		font-size: var(--font-size-sm);
	}

	.anchor-size-md {
		font-size: var(--font-size-base);
	}

	.anchor-size-lg {
		font-size: var(--font-size-lg);
	}

	.anchor-size-xl {
		font-size: var(--font-size-xl);
	}

	.anchor-size-2xl {
		font-size: var(--font-size-2xl);
	}

	/* Pesos */
	.anchor-weight-light {
		font-weight: var(--font-weight-light);
	}

	.anchor-weight-normal {
		font-weight: var(--font-weight-normal);
	}

	.anchor-weight-medium {
		font-weight: var(--font-weight-medium);
	}

	.anchor-weight-semibold {
		font-weight: var(--font-weight-semibold);
	}

	.anchor-weight-bold {
		font-weight: var(--font-weight-bold);
	}

	/* Cores */
	.anchor-color-primary {
		color: var(--color-primary-600);
	}

	.anchor-color-secondary {
		color: var(--text-color-secondary);
	}

	.anchor-color-accent {
		color: var(--color-accent-500);
	}

	.anchor-color-neutral {
		color: var(--text-color-subtle);
	}

	.anchor-color-success {
		color: var(--color-success);
	}

	.anchor-color-warning {
		color: var(--color-warning);
	}

	.anchor-color-error {
		color: var(--color-error);
	}

	.anchor-color-info {
		color: var(--color-info);
	}

	.anchor-color-inverse {
		color: var(--text-color-inverse);
	}

	.anchor-color-subtle {
		color: var(--text-color-subtle);
	}

	/* Alinhamentos */
	.anchor-align-left {
		text-align: left;
	}

	.anchor-align-center {
		text-align: center;
	}

	.anchor-align-right {
		text-align: right;
	}

	.anchor-align-justify {
		text-align: justify;
	}

	/* Line Heights */
	.anchor-leading-tight {
		line-height: var(--line-height-tight);
	}

	.anchor-leading-normal {
		line-height: var(--line-height-normal);
	}

	.anchor-leading-relaxed {
		line-height: var(--line-height-relaxed);
	}

	.anchor-leading-loose {
		line-height: 2;
	}

	/* Variantes */
	.anchor-variant-default {
		text-decoration: underline;
		text-decoration-color: currentColor;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.anchor-variant-default:hover {
		text-decoration-thickness: 2px;
	}

	.anchor-variant-underline {
		text-decoration: underline;
		text-decoration-color: currentColor;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	.anchor-variant-underline:hover {
		text-decoration-thickness: 2px;
	}

	.anchor-variant-button {
		background-color: var(--color-primary-600);
		color: white;
		padding: 0.5rem 1rem;
		border-radius: var(--border-radius-md);
		text-decoration: none;
		font-weight: var(--font-weight-medium);
	}

	.anchor-variant-button:hover {
		background-color: var(--color-primary-700);
		transform: translateY(-1px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.anchor-variant-minimal {
		text-decoration: none;
	}

	.anchor-variant-minimal:hover {
		text-decoration: underline;
		text-decoration-color: currentColor;
		text-decoration-thickness: 1px;
		text-underline-offset: 2px;
	}

	/* Truncate */
	.anchor-truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Line clamp */
	.anchor-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Ícone externo */
	.anchor-external-icon {
		opacity: 0.7;
		transition: opacity 0.2s ease-in-out;
	}

	.anchor:hover .anchor-external-icon {
		opacity: 1;
	}

	/* Estados de hover */
	.anchor:hover {
		opacity: 0.8;
	}

	.anchor:focus {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
		border-radius: var(--border-radius-sm);
	}

	/* Estados desabilitados */
	.anchor:disabled,
	.anchor[aria-disabled="true"] {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}
</style> 