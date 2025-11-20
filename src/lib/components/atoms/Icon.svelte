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

	// Mapeamento completo de ícones SVG
	const iconMap: Record<string, { path: string; viewBox?: string; fill?: boolean }> = {
		// Redes Sociais
		facebook: {
			path: 'M17.5847 13.5L18.2513 9.15656H14.0836V6.33797C14.0836 5.14969 14.6658 3.99141 16.5324 3.99141H18.4271V0.293438C18.4271 0.293438 16.7077 0 15.0638 0C11.6316 0 9.38815 2.08031 9.38815 5.84625V9.15656H5.573V13.5H9.38815V24H14.0836V13.5H17.5847Z',
			fill: true
		},
		linkedin: {
			path: 'M22.2857 0H1.70893C0.766071 0 0 0.776786 0 1.73036V22.2696C0 23.2232 0.766071 24 1.70893 24H22.2857C23.2286 24 24 23.2232 24 22.2696V1.73036C24 0.776786 23.2286 0 22.2857 0ZM7.25357 20.5714H3.69643V9.11786H7.25893V20.5714H7.25357ZM5.475 7.55357C4.33393 7.55357 3.4125 6.62679 3.4125 5.49107C3.4125 4.35536 4.33393 3.42857 5.475 3.42857C6.61071 3.42857 7.5375 4.35536 7.5375 5.49107C7.5375 6.63214 6.61607 7.55357 5.475 7.55357V7.55357ZM20.5875 20.5714H17.0304V15C17.0304 13.6714 17.0036 11.9625 15.1821 11.9625C13.3286 11.9625 13.0446 13.4089 13.0446 14.9036V20.5714H9.4875V9.11786H12.9V10.6821H12.9482C13.425 9.78214 14.5875 8.83393 16.3179 8.83393C19.9179 8.83393 20.5875 11.2071 20.5875 14.2929V20.5714V20.5714Z',
			fill: true
		},
		instagram: {
			path: 'M12.0027 5.8467C8.59744 5.8467 5.85075 8.594 5.85075 12C5.85075 15.406 8.59744 18.1533 12.0027 18.1533C15.4079 18.1533 18.1546 15.406 18.1546 12C18.1546 8.594 15.4079 5.8467 12.0027 5.8467ZM12.0027 16.0004C9.80212 16.0004 8.00312 14.2064 8.00312 12C8.00312 9.7936 9.79677 7.99955 12.0027 7.99955C14.2086 7.99955 16.0022 9.7936 16.0022 12C16.0022 14.2064 14.2032 16.0004 12.0027 16.0004V16.0004ZM19.8412 5.595C19.8412 6.39295 19.1987 7.03024 18.4062 7.03024C17.6085 7.03024 16.9713 6.38759 16.9713 5.595C16.9713 4.80241 17.6138 4.15977 18.4062 4.15977C19.1987 4.15977 19.8412 4.80241 19.8412 5.595ZM23.9157 7.05166C23.8247 5.12909 23.3856 3.42609 21.9775 2.02298C20.5747 0.619882 18.8721 0.180743 16.9499 0.0843468C14.9689 -0.0281156 9.03112 -0.0281156 7.05008 0.0843468C5.1333 0.175388 3.43068 0.614526 2.02253 2.01763C0.614389 3.42073 0.180703 5.12373 0.0843279 7.0463C-0.0281093 9.02778 -0.0281093 14.9669 0.0843279 16.9483C0.175349 18.8709 0.614389 20.5739 2.02253 21.977C3.43068 23.3801 5.12794 23.8193 7.05008 23.9157C9.03112 24.0281 14.9689 24.0281 16.9499 23.9157C18.8721 23.8246 20.5747 23.3855 21.9775 21.977C23.3803 20.5739 23.8193 18.8709 23.9157 16.9483C24.0281 14.9669 24.0281 9.03314 23.9157 7.05166V7.05166ZM21.3564 19.0744C20.9388 20.1241 20.1303 20.9327 19.0755 21.3558C17.496 21.9824 13.7481 21.8378 12.0027 21.8378C10.2572 21.8378 6.50396 21.977 4.92984 21.3558C3.88042 20.9381 3.07195 20.1294 2.64897 19.0744C2.02253 17.4946 2.16709 13.7458 2.16709 12C2.16709 10.2542 2.02789 6.50006 2.64897 4.92558C3.06659 3.87593 3.87507 3.06728 4.92984 2.6442C6.50931 2.01763 10.2572 2.16222 12.0027 2.16222C13.7481 2.16222 17.5014 2.02298 19.0755 2.6442C20.1249 3.06192 20.9334 3.87058 21.3564 4.92558C21.9828 6.50541 21.8383 10.2542 21.8383 12C21.8383 13.7458 21.9828 17.4999 21.3564 19.0744Z',
			fill: true
		},
		twitter: {
			path: 'M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z',
			fill: false
		},
		youtube: {
			path: 'M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z M9.75 15.02l0-6.59 5.75 3.3z',
			fill: false
		},

		// Comunicação
		mail: {
			path: 'M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6',
			fill: false
		},
		phone: {
			path: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z',
			fill: false
		},
		'map-pin': {
			path: 'M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
			fill: false
		},

		// Navegação
		'arrow-up': {
			path: 'M12 19V5 M5 12l7-7 7 7',
			fill: false
		},
		'arrow-down': {
			path: 'M12 5v14 M19 12l-7 7-7-7',
			fill: false
		},
		'arrow-left': {
			path: 'M19 12H5 M12 19l-7-7 7-7',
			fill: false
		},
		'arrow-right': {
			path: 'M5 12h14 M12 5l7 7-7 7',
			fill: false
		},
		'chevron-left': {
			path: 'M15 18l-6-6 6-6',
			fill: false
		},
		'chevron-right': {
			path: 'M9 18l6-6-6-6',
			fill: false
		},
		'chevron-up': {
			path: 'M18 15l-6-6-6 6',
			fill: false
		},
		'chevron-down': {
			path: 'M6 9l6 6 6-6',
			fill: false
		},

		// Ações
		menu: {
			path: 'M3 12h18 M3 6h18 M3 18h18',
			fill: false
		},
		close: {
			path: 'M18 6L6 18 M6 6l12 12',
			fill: false
		},
		search: {
			path: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35',
			fill: false
		},
		plus: {
			path: 'M12 5v14 M5 12h14',
			fill: false
		},
		minus: {
			path: 'M5 12h14',
			fill: false
		},

		// Estados
		loader: {
			path: 'M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83',
			fill: false
		},
		'check-circle': {
			path: 'M22 11.08V12a10 10 0 1 1-5.93-9.14 M22 4L12 14.01l-3-3',
			fill: false
		},
		'alert-circle': {
			path: 'M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z M12 8v4 M12 16h.01',
			fill: false
		},

		// Outros
		star: {
			path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
			fill: true
		},
		heart: {
			path: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z',
			fill: true
		},
		quote: {
			path: 'M10 8v8h-5V8h5zm10 0v8h-5V8h5z',
			viewBox: '0 0 24 24',
			fill: true
		},
		book: {
			path: 'M4 19.5A2.5 2.5 0 0 1 6.5 17H20 M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z',
			fill: false
		},
		calendar: {
			path: 'M19 4H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zM16 2v4M8 2v4M3 10h18',
			fill: false
		},
		user: {
			path: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
			fill: false
		},
		settings: {
			path: 'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z',
			fill: false
		},
		link: {
			path: 'M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71 M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71',
			fill: false
		},
		'external-link': {
			path: 'M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6 M15 3h6v6 M10 14L21 3',
			fill: false
		}
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
			white: '#ffffff',
			current: 'currentColor'
		};

		return colorMap[color as keyof typeof colorMap] || colorMap.neutral;
	}

	$: iconSize = getIconSize(size);
	$: iconColor = getIconColor(color);
	$: iconData = iconMap[name] || iconMap['menu']; // fallback para menu
	$: viewBox = iconData.viewBox || '0 0 24 24';
	$: shouldFill = iconData.fill || false;
</script>

<svg
	class="icon {className}"
	class:animated
	width={iconSize}
	height={iconSize}
	{viewBox}
	fill={shouldFill ? iconColor : 'none'}
	stroke={shouldFill ? 'none' : iconColor}
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	role={decorative ? 'presentation' : 'img'}
	aria-hidden={decorative}
	aria-label={title}
	style:transform={rotation ? `rotate(${rotation}deg)` : undefined}
	{...$$restProps}
>
	{#if title && !decorative}
		<title>{title}</title>
	{/if}
	<path d={iconData.path} />
</svg>

<style>
	.icon {
		display: inline-block;
		vertical-align: middle;
		flex-shrink: 0;
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

	.animated {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	.icon:not(.animated):hover {
		transform: scale(1.1);
	}
</style>
