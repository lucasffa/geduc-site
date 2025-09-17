<!-- src/lib/components/atoms/Text.svelte -->
<script lang="ts">
	import type { TextProps } from '$lib/types/components';

	export let as: TextProps['as'] = 'p';
	export let size: TextProps['size'] = 'md';
	export let weight: TextProps['weight'] = 'normal';
	export let color: TextProps['color'] = 'primary';
	export let align: TextProps['align'] = 'left';
	export let leading: TextProps['leading'] = 'normal';
	export let truncate: TextProps['truncate'] = false;
	export let maxLines: TextProps['maxLines'] = undefined;
	export let lineHeight: TextProps['lineHeight'] = 'normal';

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'text',
		`text-size-${size}`,
		`text-weight-${weight}`,
		`text-color-${typeof color === 'string' && color.startsWith('#') ? 'custom' : color}`,
		`text-align-${align}`,
		`text-leading-${leading}`,
		`text-lineheight-${lineHeight}`,
		truncate && 'text-truncate',
		maxLines && 'text-clamp',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Style customizado para cores hexadecimais e maxLines
	$: customColor = typeof color === 'string' && color.startsWith('#') ? color : undefined;
	$: lineClampStyle = maxLines ? `-webkit-line-clamp: ${maxLines}` : undefined;
</script>

<svelte:element
	this={as}
	class={classes}
	style:color={customColor}
	style:-webkit-line-clamp={maxLines}
	{...$$restProps}
>
	<slot />
</svelte:element>

<style>
	.text {
		margin: 0;
		font-family: var(--font-family-sans);
	}

	/* Tamanhos */
	.text-size-xs {
		font-size: var(--font-size-xs);
	}

	.text-size-sm {
		font-size: var(--font-size-sm);
	}

	.text-size-md {
		font-size: var(--font-size-base);
	}

	.text-size-lg {
		font-size: var(--font-size-lg);
	}

	.text-size-xl {
		font-size: var(--font-size-xl);
	}

	.text-size-2xl {
		font-size: var(--font-size-2xl);
	}

	/* Pesos */
	.text-weight-light {
		font-weight: var(--font-weight-light);
	}

	.text-weight-normal {
		font-weight: var(--font-weight-normal);
	}

	.text-weight-medium {
		font-weight: var(--font-weight-medium);
	}

	.text-weight-semibold {
		font-weight: var(--font-weight-semibold);
	}

	.text-weight-bold {
		font-weight: var(--font-weight-bold);
	}

	/* Cores */
	.text-color-primary {
		color: var(--text-color-primary);
	}

	.text-color-secondary {
		color: var(--text-color-secondary);
	}

	.text-color-accent {
		color: var(--color-accent-500);
	}

	.text-color-neutral {
		color: var(--text-color-subtle);
	}
	.text-color-white {
		color: var(--color-neutral-0);
	}
	.text-color-success {
		color: var(--color-success);
	}

	.text-color-warning {
		color: var(--color-warning);
	}

	.text-color-error {
		color: var(--color-error);
	}

	.text-color-info {
		color: var(--color-info);
	}

	.text-color-inverse {
		color: var(--text-color-inverse);
	}

	.text-color-subtle {
		color: var(--text-color-subtle);
	}

	/* Alinhamentos */
	.text-align-left {
		text-align: left;
	}

	.text-align-center {
		text-align: center;
	}

	.text-align-right {
		text-align: right;
	}

	.text-align-justify {
		text-align: justify;
	}

	/* Line Heights */
	.text-leading-tight {
		line-height: var(--line-height-tight);
	}

	.text-leading-normal {
		line-height: var(--line-height-normal);
	}

	.text-leading-relaxed {
		line-height: var(--line-height-relaxed);
	}

	.text-leading-loose {
		line-height: 2;
	}

	/* Line Height específicos */
	.text-lineheight-normal {
		line-height: var(--line-height-normal);
	}

	.text-lineheight-tight {
		line-height: var(--line-height-tight);
	}

	.text-lineheight-relaxed {
		line-height: var(--line-height-relaxed);
	}

	.text-lineheight-loose {
		line-height: var(--line-height-loose);
	}

	/* Truncate */
	.text-truncate {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	/* Line clamp */
	.text-clamp {
		display: -webkit-box;
		-webkit-box-orient: vertical;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* Tags específicas */
	strong,
	.text[data-weight='bold'] {
		font-weight: var(--font-weight-bold);
	}

	em,
	.text[data-style='italic'] {
		font-style: italic;
	}

	small,
	.text-size-xs {
		font-size: var(--font-size-xs);
	}

	mark {
		background-color: var(--color-accent-200);
		color: var(--text-color-primary);
		padding: 0 0.2em;
		border-radius: var(--border-radius-sm);
	}

	/* Estilos para elementos HTML renderizados via markdown */
	.text :global(strong) {
		font-weight: var(--font-weight-bold);
	}

	.text :global(em) {
		font-style: italic;
	}

	.text :global(u) {
		text-decoration: underline;
	}

	.text :global(s) {
		text-decoration: line-through;
	}

	.text :global(code) {
		background-color: var(--color-neutral-100);
		color: var(--color-neutral-800);
		padding: 0.125rem 0.25rem;
		border-radius: var(--border-radius-sm);
		font-family: var(--font-family-mono);
		font-size: 0.875em;
	}

	.text :global(a) {
		color: var(--color-primary-500);
		text-decoration: underline;
		text-decoration-color: var(--color-primary-200);
		transition: all var(--transition-fast);
	}

	.text :global(a:hover) {
		color: var(--color-primary-600);
		text-decoration-color: var(--color-primary-400);
	}

	/* Dark theme para markdown */
	[data-theme='dark'] .text :global(code) {
		background-color: var(--color-neutral-800);
		color: var(--color-neutral-200);
	}
</style>
