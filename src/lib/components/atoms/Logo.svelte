<!-- src/lib/components/atoms/Logo.svelte -->
<script lang="ts">
	import type { LogoProps } from '$lib/types/components';

	export let variant: LogoProps['variant'] = 'full';
	export let theme: LogoProps['theme'] = 'light';
	export let size: LogoProps['size'] = 'md';
	export let interactive: LogoProps['interactive'] = false;
	export let href: LogoProps['href'] = '/';
	export let target: LogoProps['target'] = undefined;
	export let rel: LogoProps['rel'] = undefined;
	export let external: LogoProps['external'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Determina qual elemento usar
	$: element = interactive ? 'a' : 'div';

	// Classes CSS baseadas nas props
	$: classes = [
		'logo',
		`logo-${variant}`,
		`logo-theme-${theme}`,
		`logo-size-${size}`,
		interactive && 'logo-interactive',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Props específicas do link
	$: linkProps = interactive
		? {
				href,
				target: external ? '_blank' : target,
				rel: external ? 'noopener noreferrer' : rel
			}
		: {};

	// Texto do logo baseado na variante
	$: logoText = variant === 'text-only' || variant === 'full' ? 'Guardiões da Educação' : '';
	$: showIcon = variant === 'icon-only' || variant === 'full';
	$: showText = variant === 'text-only' || variant === 'full';
</script>

<svelte:element this={element} class={classes} {...linkProps} {...$$restProps}>
	{#if showIcon}
		<div class="logo-icon">
			<svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
				<!-- Ícone representativo do livro/educação -->
				<rect
					x="8"
					y="10"
					width="24"
					height="20"
					rx="2"
					stroke="currentColor"
					stroke-width="2"
					fill="none"
				/>
				<path
					d="M12 18h16M12 22h12M12 26h8"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
				<circle cx="20" cy="6" r="3" fill="currentColor" />
				<path d="M20 9v1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
			</svg>
		</div>
	{/if}

	{#if showText}
		<div class="logo-text">
			<span class="logo-title">{logoText}</span>
			{#if variant === 'full'}
				<span class="logo-subtitle">GEDUC</span>
			{/if}
		</div>
	{/if}
</svelte:element>

<style>
	.logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		text-decoration: none;
		color: inherit;
		font-family: var(--font-family-sans);
	}

	.logo-interactive {
		cursor: pointer;
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

	.logo-interactive:hover {
		transform: translateY(-1px);
		opacity: 0.9;
	}

	.logo-interactive:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
		border-radius: var(--border-radius-sm);
	}

	/* Tamanhos */
	.logo-size-xs .logo-icon {
		width: 20px;
		height: 20px;
	}

	.logo-size-xs .logo-title {
		font-size: var(--font-size-sm);
	}

	.logo-size-xs .logo-subtitle {
		font-size: var(--font-size-xs);
	}

	.logo-size-sm .logo-icon {
		width: 24px;
		height: 24px;
	}

	.logo-size-sm .logo-title {
		font-size: var(--font-size-base);
	}

	.logo-size-sm .logo-subtitle {
		font-size: var(--font-size-sm);
	}

	.logo-size-md .logo-icon {
		width: 32px;
		height: 32px;
	}

	.logo-size-md .logo-title {
		font-size: var(--font-size-lg);
	}

	.logo-size-md .logo-subtitle {
		font-size: var(--font-size-base);
	}

	.logo-size-lg .logo-icon {
		width: 40px;
		height: 40px;
	}

	.logo-size-lg .logo-title {
		font-size: var(--font-size-xl);
	}

	.logo-size-lg .logo-subtitle {
		font-size: var(--font-size-lg);
	}

	.logo-size-xl .logo-icon {
		width: 48px;
		height: 48px;
	}

	.logo-size-xl .logo-title {
		font-size: var(--font-size-2xl);
	}

	.logo-size-xl .logo-subtitle {
		font-size: var(--font-size-xl);
	}

	/* Temas */
	.logo-theme-light {
		color: var(--text-color-primary);
	}

	.logo-theme-dark {
		color: var(--text-color-inverse);
	}

	.logo-theme-auto {
		color: var(--text-color-primary);
	}

	@media (prefers-color-scheme: dark) {
		.logo-theme-auto {
			color: var(--text-color-inverse);
		}
	}

	/* Elementos */
	.logo-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary-500);
	}

	.logo-icon svg {
		width: 100%;
		height: 100%;
	}

	.logo-text {
		display: flex;
		flex-direction: column;
		line-height: var(--line-height-tight);
	}

	.logo-title {
		font-weight: var(--font-weight-bold);
		margin: 0;
	}

	.logo-subtitle {
		font-weight: var(--font-weight-medium);
		opacity: 0.8;
		margin: 0;
		margin-top: -2px;
	}

	/* Variantes específicas */
	.logo-icon-only .logo-text {
		display: none;
	}

	.logo-text-only .logo-icon {
		display: none;
	}

	.logo-full {
		gap: var(--spacing-md);
	}

	/* Estados de hover para tema dark */
	.logo-theme-dark.logo-interactive:hover .logo-icon {
		color: var(--color-accent-500);
	}

	.logo-theme-light.logo-interactive:hover .logo-icon {
		color: var(--color-primary-600);
	}
</style>
