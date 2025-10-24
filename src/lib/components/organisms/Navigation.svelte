<!-- src/lib/components/organisms/Navigation.svelte -->
<script lang="ts">
	import type { NavigationProps } from '$lib/types/components';
	import Button from '../atoms/Button.svelte';
	import Icon from '../atoms/Icon.svelte';
	import NavItem from '../molecules/NavItem.svelte';

	export let items: NavigationProps['items'];
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
			<Button href={cta.href} variant={cta.variant || 'primary'} size="sm" class="navigation-cta">
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
				<Icon name={mobileMenuOpen ? 'x' : 'menu'} size="lg" color="primary" />
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
		background-color: var(--background-color-header);
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
		width: 48px;
		height: 48px;
		background: transparent;
		border: none;
		border-radius: var(--border-radius-lg);
		cursor: pointer;
		transition: all var(--transition-normal) var(--transition-timing-default);
		position: relative;
		z-index: 1001;
	}

	.navigation-mobile-toggle:hover {
		transform: scale(1.05);
	}

	.navigation-mobile-toggle:active {
		transform: scale(0.95);
	}

	.navigation-mobile-toggle:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	/* Mobile Menu */
	.navigation-mobile-menu {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(255, 255, 255, 0.98);
		backdrop-filter: blur(10px);
		transform: translateY(-100%);
		opacity: 0;
		visibility: hidden;
		transition: all var(--transition-normal) var(--transition-timing-default);
		z-index: 1000;
	}

	.navigation-mobile-menu-open {
		transform: translateY(0);
		opacity: 1;
		visibility: visible;
	}

	.navigation-mobile-content {
		padding: calc(20 * var(--spacing-unit)) var(--spacing-xl) var(--spacing-xl);
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		max-width: calc(200 * var(--spacing-unit)); /* 800px */
		margin: 0 auto;
		height: 100%;
		justify-content: center;
	}

	.navigation-mobile-item {
		width: 100%;
		justify-content: center;
		padding: var(--spacing-lg) var(--spacing-xl);
		border-radius: var(--border-radius-xl);
		background-color: transparent;
		border: 2px solid transparent;
		font-size: var(--font-size-lg);
		transition: all var(--transition-normal) var(--transition-timing-default);
		animation: slideInFromTop 0.4s ease-out backwards;
	}

	.navigation-mobile-item:nth-child(1) {
		animation-delay: 0.1s;
	}

	.navigation-mobile-item:nth-child(2) {
		animation-delay: 0.15s;
	}

	.navigation-mobile-item:nth-child(3) {
		animation-delay: 0.2s;
	}

	.navigation-mobile-item:nth-child(4) {
		animation-delay: 0.25s;
	}

	.navigation-mobile-item:nth-child(5) {
		animation-delay: 0.3s;
	}

	.navigation-mobile-cta {
		margin-top: var(--spacing-lg);
		animation: slideInFromTop 0.4s ease-out backwards;
		animation-delay: 0.35s;
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
			margin: 0 auto;
		}

		.navigation-container {
			padding: var(--spacing-sm) var(--spacing-md);
			justify-content: center;
		}
	}

	@media (min-width: 769px) {
		.navigation-mobile-menu {
			display: none;
		}
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

	@keyframes slideInFromTop {
		from {
			opacity: 0;
			transform: translateY(-20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
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
