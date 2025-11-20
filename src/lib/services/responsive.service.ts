// src/lib/services/responsive.service.ts
import type { Size } from '$lib/types/components';
import { readable } from 'svelte/store';

/**
 * Breakpoints padrão seguindo melhores práticas de design responsivo
 */
export const BREAKPOINTS = {
	xs: 0,
	sm: 640,
	md: 768,
	lg: 1024,
	xl: 1280,
	'2xl': 1536,
	'3xl': 1920
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Mapeamento de sizes por breakpoint para cada componente atom
 */
export type ResponsiveSizeMap = Record<
	'heading' | 'subtitle' | 'description',
	Record<Breakpoint, Size>
>;

/**
 * Configuração padrão de sizes responsivos para SectionHeader
 */
export const SECTION_HEADER_RESPONSIVE_SIZES: ResponsiveSizeMap = {
	heading: {
		xs: 'xl',
		sm: '2xl',
		md: '3xl',
		lg: '4xl',
		xl: '5xl',
		'2xl': '6xl',
		'3xl': '7xl'
	},
	subtitle: {
		xs: 'sm',
		sm: 'md',
		md: 'lg',
		lg: 'xl',
		xl: 'xl',
		'2xl': '2xl',
		'3xl': '2xl'
	},
	description: {
		xs: 'md',
		sm: 'md',
		md: 'md',
		lg: 'md',
		xl: 'lg',
		'2xl': 'lg',
		'3xl': 'xl'
	}
};

/**
 * Obtém o breakpoint atual baseado na largura da janela
 */
export function getCurrentBreakpoint(width: number): Breakpoint {
	if (width >= BREAKPOINTS['3xl']) return '3xl';
	if (width >= BREAKPOINTS['2xl']) return '2xl';
	if (width >= BREAKPOINTS.xl) return 'xl';
	if (width >= BREAKPOINTS.lg) return 'lg';
	if (width >= BREAKPOINTS.md) return 'md';
	if (width >= BREAKPOINTS.sm) return 'sm';
	return 'xs';
}

/**
 * Obtém o size apropriado para um componente baseado no breakpoint atual
 */
export function getResponsiveSize(
	component: keyof ResponsiveSizeMap,
	breakpoint: Breakpoint,
	customMap?: Partial<ResponsiveSizeMap>
): Size {
	const sizeMap = customMap?.[component] || SECTION_HEADER_RESPONSIVE_SIZES[component];
	return sizeMap[breakpoint];
}

/**
 * Store reativo que monitora o breakpoint atual
 * Utiliza matchMedia para performance otimizada
 */
export function createBreakpointStore() {
	if (typeof window === 'undefined') {
		// SSR: retorna breakpoint padrão
		return readable<Breakpoint>('lg', () => {});
	}

	return readable<Breakpoint>(getCurrentBreakpoint(window.innerWidth), (set) => {
		const queries = Object.entries(BREAKPOINTS)
			.filter(([_, value]) => value > 0)
			.map(([key, value]) => ({
				key: key as Breakpoint,
				query: window.matchMedia(`(min-width: ${value}px)`)
			}));

		const updateBreakpoint = () => {
			const current = getCurrentBreakpoint(window.innerWidth);
			set(current);
		};

		// Adiciona listeners para cada media query
		queries.forEach(({ query }) => {
			query.addEventListener('change', updateBreakpoint);
		});

		// Listener de resize como fallback
		window.addEventListener('resize', updateBreakpoint);

		// Cleanup
		return () => {
			queries.forEach(({ query }) => {
				query.removeEventListener('change', updateBreakpoint);
			});
			window.removeEventListener('resize', updateBreakpoint);
		};
	});
}

/**
 * Mapeamento de sizes responsivos para TextBlock
 * IMPORTANTE: Para corpo de texto, apenas breakpoints a partir de 768px (md)
 * xs e sm: retornam o size padrão (não responsivo)
 */
export const TEXT_BLOCK_RESPONSIVE_SIZES = {
	md: 'md',
	lg: 'md',
	xl: 'lg',
	'2xl': 'lg',
	'3xl': 'xl'
} as const satisfies Partial<Record<Breakpoint, Size>>;

/**
 * Serviço de responsividade
 * Fornece métodos para obter sizes responsivos baseados em breakpoints
 */
export class ResponsiveService {
	private static instance: ResponsiveService;
	private breakpointStore = createBreakpointStore();

	private constructor() {}

	static getInstance(): ResponsiveService {
		if (!ResponsiveService.instance) {
			ResponsiveService.instance = new ResponsiveService();
		}
		return ResponsiveService.instance;
	}

	/**
	 * Obtém o store de breakpoint atual
	 */
	getBreakpointStore() {
		return this.breakpointStore;
	}

	/**
	 * Obtém sizes responsivos para todos os componentes de um SectionHeader
	 */
	getSectionHeaderSizes(
		breakpoint: Breakpoint,
		customMap?: Partial<ResponsiveSizeMap>
	): Record<'heading' | 'subtitle' | 'description', Size> {
		return {
			heading: getResponsiveSize('heading', breakpoint, customMap),
			subtitle: getResponsiveSize('subtitle', breakpoint, customMap),
			description: getResponsiveSize('description', breakpoint, customMap)
		};
	}

	/**
	 * Obtém size responsivo para TextBlock
	 * Retorna undefined para breakpoints abaixo de md (xs, sm)
	 * permitindo que o componente use o size padrão
	 */
	getTextBlockSize(
		breakpoint: Breakpoint,
		customMap?: Partial<Record<Breakpoint, Size>>
	): Size | undefined {
		const sizeMap = (customMap || TEXT_BLOCK_RESPONSIVE_SIZES) as Record<string, Size | undefined>;
		return sizeMap[breakpoint];
	}

	/**
	 * Cria um mapeamento customizado de sizes
	 */
	createCustomSizeMap(
		overrides: Partial<ResponsiveSizeMap>
	): ResponsiveSizeMap {
		return {
			heading: { ...SECTION_HEADER_RESPONSIVE_SIZES.heading, ...overrides.heading },
			subtitle: { ...SECTION_HEADER_RESPONSIVE_SIZES.subtitle, ...overrides.subtitle },
			description: { ...SECTION_HEADER_RESPONSIVE_SIZES.description, ...overrides.description }
		};
	}
}

/**
 * Instância singleton do serviço
 */
export const responsiveService = ResponsiveService.getInstance();

