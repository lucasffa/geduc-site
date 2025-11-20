<!-- src/lib/components/molecules/SectionHeader.svelte -->
<script lang="ts">
	import type { SectionHeaderProps, TextAlign, HeadingLevel, Size } from '$lib/types/components';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import { responsiveService, type ResponsiveSizeMap } from '$lib/services/responsive.service';

	export let title: SectionHeaderProps['title'];
	export let subtitle: SectionHeaderProps['subtitle'] = undefined;
	export let description: SectionHeaderProps['description'] = undefined;
	export let align: SectionHeaderProps['align'] = 'left';
	export let spacing: SectionHeaderProps['spacing'] = 'normal';
	export let decorative: SectionHeaderProps['decorative'] = false;
	export let actions: SectionHeaderProps['actions'] = undefined;
	export let titleColor: SectionHeaderProps['titleColor'] = 'primary';
	export let headingLevel: SectionHeaderProps['headingLevel'] = 2;

	// Novas props para funcionalidades avançadas
	export let decorativeLetter: boolean = false;
	export let decoration: boolean = false;
	export let decorationColor: string = 'var(--color-yellow-600)';
	export let decorationPosition: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

	// Prop para customização do mapeamento responsivo
	export let customSizeMap: Partial<ResponsiveSizeMap> | undefined = undefined;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Mapeamento de espaçamentos para classes CSS
	const spacingMap = {
		tight: 'section-header-spacing-tight',
		normal: 'section-header-spacing-normal',
		loose: 'section-header-spacing-loose'
	} as const;

	// Mapeamento de alinhamentos para classes CSS
	const alignMap: Record<Exclude<TextAlign, 'justify'>, string> = {
		left: 'section-header-align-left',
		center: 'section-header-align-center',
		right: 'section-header-align-right'
	} as const;

	// Classes CSS baseadas nas props
	$: classes = [
		'section-header',
		spacing && spacingMap[spacing],
		align && alignMap[align as Exclude<TextAlign, 'justify'>],
		decorative && 'section-header-decorative',
		className
	]
		.filter(Boolean)
		.join(' ');

	// ========================================
	// BLOCO REATIVO: Media Queries CSS-like via Serviço Externo
	// ========================================

	// Store reativo de breakpoint do serviço
	const breakpointStore = responsiveService.getBreakpointStore();

	// Sizes responsivos calculados reativamente baseados no breakpoint atual
	$: responsiveSizes = responsiveService.getSectionHeaderSizes($breakpointStore, customSizeMap);

	// Sizes individuais para cada componente atom
	$: headingSize = responsiveSizes.heading;
	$: subtitleSize = responsiveSizes.subtitle;
	$: descriptionSize = responsiveSizes.description;
</script>

<header class={classes}>
	{#if title}
		<Heading
			level={headingLevel}
			{align}
			{decorativeLetter}
			decoration={decoration ? 'underline' : undefined}
			{decorationColor}
			{decorationPosition}
			color={titleColor}
		>
			{title}
		</Heading>
	{/if}

	{#if subtitle}
		<Text as="p" size={subtitleSize} color="neutral" {align} class="section-header-subtitle">
			{subtitle}
		</Text>
	{/if}

	{#if description}
		<Text as="p" size={descriptionSize} color="neutral" {align} class="section-header-description">
			{description}
		</Text>
	{/if}

	{#if actions}
		<div class="section-header-actions">
			{@render actions()}
		</div>
	{/if}
</header>

<style>
	.section-header {
		width: 100%;
		margin-bottom: 0;
	}

	/* Alinhamentos */
	.section-header-align-left {
		text-align: left;
	}

	.section-header-align-center {
		text-align: center;
	}

	.section-header-align-right {
		text-align: right;
	}

	/* Espaçamentos */
	.section-header-spacing-tight .section-header-subtitle {
		margin-top: var(--spacing-sm);
	}

	.section-header-spacing-tight .section-header-description {
		margin-top: var(--spacing-sm);
	}

	.section-header-spacing-tight .section-header-actions {
		margin-top: var(--spacing-md);
	}

	.section-header-spacing-normal .section-header-subtitle {
		margin-top: var(--spacing-md);
	}

	.section-header-spacing-normal .section-header-description {
		margin-top: var(--spacing-md);
	}

	.section-header-spacing-normal .section-header-actions {
		margin-top: var(--spacing-lg);
	}

	.section-header-spacing-loose .section-header-subtitle {
		margin-top: var(--spacing-lg);
	}

	.section-header-spacing-loose .section-header-description {
		margin-top: var(--spacing-lg);
	}

	.section-header-spacing-loose .section-header-actions {
		margin-top: var(--spacing-xl);
	}

	/* Subtítulo */
	.section-header-subtitle {
		max-width: 600px;
		margin-left: auto;
		margin-right: auto;
	}

	.section-header-align-left .section-header-subtitle {
		margin-left: 0;
		margin-right: auto;
	}

	.section-header-align-right .section-header-subtitle {
		margin-left: auto;
		margin-right: 0;
	}

	/* Descrição */
	.section-header-description {
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.section-header-align-left .section-header-description {
		margin-left: 0;
		margin-right: auto;
	}

	.section-header-align-right .section-header-description {
		margin-left: auto;
		margin-right: 0;
	}

	/* Ações */
	.section-header-actions {
		display: flex;
		gap: var(--spacing-md);
		justify-content: center;
		flex-wrap: wrap;
	}

	.section-header-align-left .section-header-actions {
		justify-content: flex-start;
	}

	.section-header-align-right .section-header-actions {
		justify-content: flex-end;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.section-header {
			margin-bottom: var(--spacing-lg);
		}

		.section-header-actions {
			flex-direction: column;
			align-items: center;
		}

		.section-header-align-left .section-header-actions {
			align-items: flex-start;
		}

		.section-header-align-right .section-header-actions {
			align-items: flex-end;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .section-header {
		color: var(--text-color-primary);
	}
</style>
