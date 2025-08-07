<!-- src/lib/components/atoms/Heading.svelte -->
<script lang="ts">
	import type { HeadingProps } from '$lib/types/components';

	export let level: HeadingProps['level'];
	export let size: HeadingProps['size'] = undefined;
	export let weight: HeadingProps['weight'] = 'bold';
	export let color: HeadingProps['color'] = 'primary';
	export let align: HeadingProps['align'] = 'left';
	export let gradient: HeadingProps['gradient'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Mapeia o level para o elemento HTML
	$: element = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

	// Se size não for especificado, usa o padrão baseado no level
	$: headingSize = size || getSizeFromLevel(level);

	function getSizeFromLevel(level: HeadingProps['level']): HeadingProps['size'] {
		const sizeMap = {
			1: '3xl',
			2: '2xl',
			3: 'xl',
			4: 'lg',
			5: 'md',
			6: 'base',
			7: 'sm',
			8: 'xs',
			9: '4xl',
			10: '5xl',
			11: '6xl',
			12: '7xl',
			13: '8xl'
		} as const;

		return sizeMap[level] as HeadingProps['size'];
	}

	// Classes CSS baseadas nas props
	$: classes = [
		'heading',
		`heading-level-${level}`,
		`heading-size-${headingSize}`,
		`heading-weight-${weight}`,
		`heading-color-${typeof color === 'string' && color.startsWith('#') ? 'custom' : color}`,
		`heading-align-${align}`,
		gradient && 'heading-gradient',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Style customizado para cores hexadecimais
	$: customColor = typeof color === 'string' && color.startsWith('#') ? color : undefined;
</script>

<svelte:element this={element} class={classes} style:color={customColor} {...$$restProps}>
	<slot />
</svelte:element>

<style>
	.heading {
		margin: 0;
		font-family: var(--font-family-sans);
		line-height: var(--line-height-tight);
	}

	/* Tamanhos */
	.heading-size-xs {
		font-size: var(--font-size-xs);
	}

	.heading-size-sm {
		font-size: var(--font-size-sm);
	}

	.heading-size-base {
		font-size: var(--font-size-base);
	}

	.heading-size-md {
		font-size: var(--font-size-md);
	}

	.heading-size-lg {
		font-size: var(--font-size-lg);
	}

	.heading-size-xl {
		font-size: var(--font-size-xl);
	}

	.heading-size-2xl {
		font-size: var(--font-size-2xl);
	}

	.heading-size-3xl {
		font-size: var(--font-size-3xl);
	}

	.heading-size-4xl {
		font-size: var(--font-size-4xl);
	}

	/* Pesos */
	.heading-weight-light {
		font-weight: var(--font-weight-light);
	}

	.heading-weight-normal {
		font-weight: var(--font-weight-normal);
	}

	.heading-weight-medium {
		font-weight: var(--font-weight-medium);
	}

	.heading-weight-semibold {
		font-weight: var(--font-weight-semibold);
	}

	.heading-weight-bold {
		font-weight: var(--font-weight-bold);
	}

	.heading-weight-extrabold {
		font-weight: 800;
	}

	/* Cores */
	.heading-color-primary {
		color: var(--text-color-primary);
	}

	.heading-color-secondary {
		color: var(--text-color-secondary);
	}

	.heading-color-accent {
		color: var(--color-accent-500);
	}

	.heading-color-neutral {
		color: var(--text-color-subtle);
	}

	.heading-color-success {
		color: var(--color-success);
	}

	.heading-color-warning {
		color: var(--color-warning);
	}

	.heading-color-error {
		color: var(--color-error);
	}

	.heading-color-info {
		color: var(--color-info);
	}

	.heading-color-inverse {
		color: var(--text-color-inverse);
	}

	.heading-color-subtle {
		color: var(--text-color-subtle);
	}

	/* Alinhamentos */
	.heading-align-left {
		text-align: left;
	}

	.heading-align-center {
		text-align: center;
	}

	.heading-align-right {
		text-align: right;
	}

	.heading-align-justify {
		text-align: justify;
	}

	/* Gradient */
	.heading-gradient {
		background: linear-gradient(
			135deg,
			var(--color-primary-500) 0%,
			var(--color-secondary-500) 50%,
			var(--color-accent-500) 100%
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 200%;
		animation: gradientShift 3s ease-in-out infinite;
	}

	@keyframes gradientShift {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	/* Estilos específicos por level para hierarquia semântica */
	.heading-level-1 {
		margin-bottom: var(--spacing-lg);
	}

	.heading-level-2 {
		margin-bottom: var(--spacing-md);
	}

	.heading-level-3 {
		margin-bottom: var(--spacing-md);
	}

	.heading-level-4 {
		margin-bottom: var(--spacing-sm);
	}

	.heading-level-5 {
		margin-bottom: var(--spacing-sm);
	}

	.heading-level-6 {
		margin-bottom: var(--spacing-sm);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.heading-size-4xl {
			font-size: var(--font-size-3xl);
		}

		.heading-size-3xl {
			font-size: var(--font-size-2xl);
		}

		.heading-size-2xl {
			font-size: var(--font-size-xl);
		}
	}

	@media (max-width: 480px) {
		.heading-size-3xl {
			font-size: var(--font-size-xl);
		}

		.heading-size-2xl {
			font-size: var(--font-size-lg);
		}

		.heading-size-xl {
			font-size: var(--font-size-md);
		}
	}
</style>
