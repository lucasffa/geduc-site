<!-- src/lib/components/molecules/NavItem.svelte -->
<script lang="ts">
	import type { NavItemProps } from '$lib/types/components';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';

	export let active: NavItemProps['active'] = false;
	export let disabled: NavItemProps['disabled'] = false;
	export let badge: NavItemProps['badge'] = undefined;
	export let icon: NavItemProps['icon'] = undefined;
	export let href: NavItemProps['href'] = undefined;
	export let target: NavItemProps['target'] = undefined;
	export let rel: NavItemProps['rel'] = undefined;
	export let external: NavItemProps['external'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Determina qual elemento usar
	$: element = href ? 'a' : 'button';

	// Classes CSS baseadas nas props
	$: classes = ['nav-item', active && 'nav-item-active', disabled && 'nav-item-disabled', className]
		.filter(Boolean)
		.join(' ');

	// Props específicas do link
	$: linkProps = href
		? {
				href,
				target: external ? '_blank' : target,
				rel: external ? 'noopener noreferrer' : rel
			}
		: {};

	// Props específicas do button
	$: buttonProps = !href
		? {
				type: 'button' as const,
				disabled: disabled
			}
		: {};
</script>

<svelte:element this={element} class={classes} {...linkProps} {...buttonProps} {...$$restProps}>
	{#if icon}
		<Icon name={icon} size="sm" class="nav-item-icon" />
	{/if}

	<Text as="span" size="md" weight="medium" class="nav-item-text">
		<slot />
	</Text>

	{#if badge}
		<span class="nav-item-badge">
			{badge}
		</span>
	{/if}
</svelte:element>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		text-decoration: none;
		color: var(--text-color-primary);
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: all var(--transition-fast) var(--transition-timing-default);
		position: relative;
		font-family: var(--font-family-sans);
		white-space: nowrap;
	}

	.nav-item:hover:not(.nav-item-disabled) {
		background-color: var(--color-primary-100);
		color: var(--color-primary-700);
		transform: translateY(-1px);
	}

	.nav-item:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.nav-item:active:not(.nav-item-disabled) {
		transform: translateY(0);
		background-color: var(--color-primary-200);
	}

	/* Estado ativo */
	.nav-item-active {
		background-color: var(--color-primary-500);
		color: var(--color-neutral-0);
		font-weight: var(--font-weight-semibold);
	}

	.nav-item-active:hover {
		background-color: var(--color-primary-600);
		color: var(--color-neutral-0);
	}

	.nav-item-active::before {
		content: '';
		position: absolute;
		left: 0;
		top: 50%;
		transform: translateY(-50%);
		width: 3px;
		height: 70%;
		background-color: var(--color-accent-500);
		border-radius: 0 var(--border-radius-sm) var(--border-radius-sm) 0;
	}

	/* Estado desabilitado */
	.nav-item-disabled {
		opacity: 0.5;
		cursor: not-allowed;
		pointer-events: none;
	}

	/* Elementos */
	.nav-item-icon {
		flex-shrink: 0;
		color: inherit;
	}

	.nav-item-text {
		color: inherit;
		font-weight: inherit;
	}

	.nav-item-badge {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 20px;
		height: 20px;
		padding: 0 var(--spacing-xs);
		background-color: var(--color-error);
		color: var(--color-neutral-0);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		border-radius: var(--border-radius-full);
		margin-left: auto;
	}

	.nav-item-active .nav-item-badge {
		background-color: var(--color-accent-500);
		color: var(--text-color-primary);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.nav-item {
			padding: var(--spacing-md) var(--spacing-lg);
			justify-content: flex-start;
		}

		.nav-item-text {
			font-size: var(--font-size-lg);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .nav-item:hover:not(.nav-item-disabled) {
		background-color: var(--color-primary-900);
		color: var(--color-primary-300);
	}

	[data-theme='dark'] .nav-item:active:not(.nav-item-disabled) {
		background-color: var(--color-primary-800);
	}

	[data-theme='dark'] .nav-item-active {
		background-color: var(--color-primary-700);
		color: var(--color-neutral-0);
	}

	[data-theme='dark'] .nav-item-active:hover {
		background-color: var(--color-primary-600);
	}

	/* Efeitos de animação */
	.nav-item::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 0;
		height: 2px;
		background-color: var(--color-primary-500);
		transition: all var(--transition-fast) var(--transition-timing-default);
		transform: translateX(-50%);
	}

	.nav-item:hover::after,
	.nav-item-active::after {
		width: 80%;
	}

	.nav-item-active::after {
		background-color: var(--color-accent-500);
	}
</style>
