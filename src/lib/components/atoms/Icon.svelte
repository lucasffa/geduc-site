<!-- src/lib/components/atoms/Icon.svelte -->
<script lang="ts">
	import type { IconProps } from '$lib/types/components';

	export let name: IconProps['name'];
	export let size: IconProps['size'] = 'md';
	export let color: IconProps['color'] = 'primary';
	export let title: IconProps['title'] = undefined;
	export let decorative: IconProps['decorative'] = false;
	export let rotation: IconProps['rotation'] = 0;
	export let animated: IconProps['animated'] = false;

	// Classes adicionais passadas pelo componente pai
	let className = '';
	export { className as class };

	// Map de ícones - por enquanto apenas círculos como boilerplate
	const iconMap: Record<string, string> = {
		facebook: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
		linkedin: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
		instagram: 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
		'arrow-up': 'M12 12m-10 0a10 10 0 1 0 20 0a10 10 0 1 0 -20 0',
		'quote': 'M3.57725 6.296H0.02525L2.61725 0.248H4.94525L3.57725 6.296ZM8.42525 6.296H4.87325L7.46525 0.248H9.79325L8.42525 6.296Z',
		'star': 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
		'chevron-left': 'M15 18l-6-6 6-6',
		'chevron-right': 'M9 18l6-6-6-6'
	};

	// Determina o tamanho em pixels
	function getIconSize(size: IconProps['size']): string {
		if (typeof size === 'number') return `${size}px`;

		const sizeMap = {
			xs: '12px',
			sm: '16px',
			md: '24px',
			lg: '32px',
			xl: '40px',
			'2xl': '48px'
		};

		return sizeMap[size as keyof typeof sizeMap] || sizeMap.md;
	}

	// Determina a cor do ícone
	function getIconColor(color: IconProps['color']): string {
		if (typeof color === 'string' && color.startsWith('#')) return color;

		const colorMap = {
			primary: 'var(--color-primary-500)',
			secondary: 'var(--color-secondary-500)',
			accent: 'var(--color-accent-500)',
			neutral: 'var(--icon-color-default)',
			success: 'var(--icon-color-success)',
			warning: 'var(--icon-color-warning)',
			error: 'var(--icon-color-error)',
			info: 'var(--icon-color-info)',
			white: '#ffffff'
		};

		return colorMap[color as keyof typeof colorMap] || colorMap.neutral;
	}

	$: iconSize = getIconSize(size);
	$: iconColor = getIconColor(color);
	$: pathData = iconMap[name] || iconMap['facebook']; // fallback
</script>

<svg
	class="icon {className}"
	width={iconSize}
	height={iconSize}
	viewBox="0 0 24 24"
	fill={name === 'star' ? iconColor : 'none'}
	stroke={name === 'star' ? 'none' : iconColor}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	role={decorative ? 'presentation' : 'img'}
	aria-hidden={decorative}
	aria-label={title}
	style:transform={rotation ? `rotate(${rotation}deg)` : undefined}
	class:animated
	{...$$restProps}
>
	{#if title && !decorative}
		<title>{title}</title>
	{/if}
	<path d={pathData} />
</svg>

<style>
	.icon {
		display: inline-block;
		vertical-align: middle;
		flex-shrink: 0;
	}

	.animated {
		transition: transform var(--transition-normal) var(--transition-timing-default);
	}

	.animated:hover {
		transform: scale(1.1);
	}
</style>
