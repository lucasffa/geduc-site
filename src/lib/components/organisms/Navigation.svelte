<!-- src/lib/components/organisms/Navigation.svelte -->
<script lang="ts">
	import type { NavigationProps } from '$lib/types/components';
	import Logo from '../atoms/Logo.svelte';
	import Button from '../atoms/Button.svelte';
	import NavItem from '../molecules/NavItem.svelte';
	import Icon from '../atoms/Icon.svelte';

	export let items: NavigationProps['items'];
	export let logo: NavigationProps['logo'] = undefined;
	export let cta: NavigationProps['cta'] = undefined;
	export let variant: NavigationProps['variant'] = 'default';
	export let sticky: NavigationProps['sticky'] = false;
	export let mobileMenu: NavigationProps['mobileMenu'] = true;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Estado interno
	let mobileMenuOpen = false;
	let scrolled = false;

	// Classes CSS baseadas nas props
	$: classes = [
		'navigation',
		`navigation-variant-${variant}`,
		sticky && 'navigation-sticky',
		scrolled && 'navigation-scrolled',
		mobileMenuOpen && 'navigation-mobile-open',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Monitora scroll para efeito sticky
	function handleScroll() {
		if (typeof window !== 'undefined') {
			scrolled = window.scrollY > 20;
		}
	}

	// Toggle mobile menu
	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	// Fecha mobile menu ao clicar em item
	function handleNavItemClick() {
		mobileMenuOpen = false;
	}

	// Fecha mobile menu ao pressionar Escape
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && mobileMenuOpen) {
			mobileMenuOpen = false;
		}
	}
</script>

<svelte:window on:scroll={handleScroll} on:keydown={handleKeydown} />

<nav class={classes}>
	<div class="navigation-container">
		<!-- Logo -->
		{#if logo}
			<Logo variant="full" size="md" interactive href={logo.href} class="navigation-logo" />
		{/if}

		<!-- Desktop Navigation -->
		<div class="navigation-menu">
			{#each items as item}
				<NavItem
					href={item.href}
					active={item.active}
					external={item.external}
					class="navigation-item"
				>
					{item.label}
				</NavItem>
			{/each}
		</div>

		<!-- CTA Button -->
		{#if cta}
			<Button href={cta.href} variant={cta.variant || 'primary'} size="md" class="navigation-cta">
				{cta.label}
			</Button>
		{/if}

		<!-- Mobile Menu Button -->
		{#if mobileMenu}
			<button
				class="navigation-mobile-toggle"
				on:click={toggleMobileMenu}
				aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
				aria-expanded={mobileMenuOpen}
			>
				<Icon name={mobileMenuOpen ? 'x' : 'menu'} size="md" />
			</button>
		{/if}
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenu}
		<div class="navigation-mobile-menu" class:navigation-mobile-menu-open={mobileMenuOpen}>
			<div class="navigation-mobile-content">
				{#each items as item}
					<NavItem
						href={item.href}
						active={item.active}
						external={item.external}
						class="navigation-mobile-item"
						on:click={handleNavItemClick}
					>
						{item.label}
					</NavItem>
				{/each}

				{#if cta}
					<Button
						href={cta.href}
						variant={cta.variant || 'primary'}
						size="lg"
						fullWidth
						class="navigation-mobile-cta"
						on:click={handleNavItemClick}
					>
						{cta.label}
					</Button>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Overlay para mobile menu -->
	{#if mobileMenuOpen}
		<div
			class="navigation-overlay"
			on:click={toggleMobileMenu}
			on:keydown={null}
			role="button"
			tabindex="-1"
		></div>
	{/if}
</nav>

<style>
	.navigation {
		position: relative;
		width: 100%;
		z-index: 1000;
		transition: all var(--transition-normal) var(--transition-timing-default);
	}

	.navigation-container {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-lg);
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
	}

	/* Variantes */
	.navigation-variant-default {
		background-color: var(--background-color-card);
		border-bottom: 1px solid var(--border-color-default);
		box-shadow: var(--shadow-sm);
	}

	.navigation-variant-transparent {
		background-color: transparent;
		border-bottom: none;
		box-shadow: none;
	}

	.navigation-variant-minimal {
		background-color: var(--background-color-card);
		border-bottom: 1px solid var(--border-color-default);
		box-shadow: none;
	}

	/* Sticky behavior */
	.navigation-sticky {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
	}

	.navigation-scrolled {
		background-color: var(--background-color-card);
		box-shadow: var(--shadow-md);
		backdrop-filter: blur(10px);
	}

	.navigation-variant-transparent.navigation-scrolled {
		background-color: rgba(255, 255, 255, 0.95);
	}

	/* Logo */
	.navigation-logo {
		flex-shrink: 0;
	}

	/* Desktop Menu */
	.navigation-menu {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		flex: 1;
		justify-content: center;
	}

	.navigation-item {
		white-space: nowrap;
	}

	/* CTA */
	.navigation-cta {
		flex-shrink: 0;
		margin-left: var(--spacing-md);
	}

	/* Mobile Toggle */
	.navigation-mobile-toggle {
		display: none;
		align-items: center;
		justify-content: center;
		width: 40px;
		height: 40px;
		background: transparent;
		border: none;
		border-radius: var(--border-radius-md);
		color: var(--icon-color-default);
		cursor: pointer;
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

	.navigation-mobile-toggle:hover {
		background-color: var(--color-neutral-100);
		color: var(--color-primary-500);
	}

	.navigation-mobile-toggle:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	/* Mobile Menu */
	.navigation-mobile-menu {
		position: fixed;
		top: 100%;
		left: 0;
		right: 0;
		background-color: var(--background-color-card);
		border-top: 1px solid var(--border-color-default);
		box-shadow: var(--shadow-lg);
		transform: translateY(-100%);
		opacity: 0;
		visibility: hidden;
		transition: all var(--transition-normal) var(--transition-timing-default);
		z-index: 999;
	}

	.navigation-mobile-menu-open {
		transform: translateY(0);
		opacity: 1;
		visibility: visible;
	}

	.navigation-mobile-content {
		padding: var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
		max-height: 70vh;
		overflow-y: auto;
	}

	.navigation-mobile-item {
		width: 100%;
		justify-content: center;
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--border-radius-lg);
	}

	.navigation-mobile-cta {
		margin-top: var(--spacing-md);
	}

	/* Overlay */
	.navigation-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(4px);
		z-index: 998;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.navigation-menu {
			display: none;
		}

		.navigation-cta {
			display: none;
		}

		.navigation-mobile-toggle {
			display: flex;
		}

		.navigation-container {
			padding: var(--spacing-sm) var(--spacing-md);
		}
	}

	@media (min-width: 769px) {
		.navigation-mobile-menu {
			display: none;
		}

		.navigation-overlay {
			display: none;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .navigation-variant-transparent.navigation-scrolled {
		background-color: rgba(33, 33, 33, 0.95);
	}

	[data-theme='dark'] .navigation-mobile-toggle:hover {
		background-color: var(--color-neutral-800);
	}

	/* Animações */
	.navigation {
		animation: slideDown 0.6s ease-out;
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateY(-100%);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Efeitos especiais */
	.navigation-variant-transparent::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(255, 255, 255, 0.1) 50%,
			transparent 100%
		);
		opacity: 0;
		transition: opacity var(--transition-normal) var(--transition-timing-default);
	}

	.navigation-variant-transparent:hover::before {
		opacity: 1;
	}

	/* Indicador de página ativa */
	.navigation::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 2px;
		background: linear-gradient(
			90deg,
			var(--color-primary-500),
			var(--color-secondary-500),
			var(--color-accent-500)
		);
		background-size: 200% 100%;
		animation: gradientMove 3s ease-in-out infinite;
	}

	@keyframes gradientMove {
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

	/* Estados de loading */
	.navigation-loading {
		opacity: 0.7;
		pointer-events: none;
	}

	.navigation-loading::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(
			90deg,
			transparent 25%,
			rgba(255, 255, 255, 0.2) 50%,
			transparent 75%
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
</style>
