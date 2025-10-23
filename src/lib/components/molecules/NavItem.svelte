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

	{#if !active}
		<Text as="span" size="md" weight="medium" color="white">
			<slot />
		</Text>
	{:else}
		<Text as="span" size="md" weight="medium" color="primary">
			<slot />
		</Text>
	{/if}

	{#if badge}
		<Text as="span" size="md" weight="medium" class="nav-item-badge" color="black">
			{badge}
		</Text>
	{/if}
</svelte:element>

<style>
	.nav-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-md);
		text-decoration: none;
		background-color: transparent;
		border: none;
		cursor: pointer;
		transition: transform var(--transition-fast) var(--transition-timing-default);
		position: relative;
		font-family: var(--font-family-sans);
		white-space: nowrap;
	}

	.nav-item:hover:not(.nav-item-disabled) {
		transform: scale(1.05);
	}

	.nav-item:focus-visible {
		outline: 2px solid var(--color-secondary-600);
		outline-offset: 2px;
	}

	.nav-item:active:not(.nav-item-disabled) {
		transform: scale(0.95);
	}

	/* Estado ativo */
	.nav-item-active {
		background-color: var(--color-secondary-600);
		font-weight: var(--font-weight-semibold);
		border-radius: var(--border-radius-full);
		animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes popIn {
		0% {
			transform: scale(0.8);
			opacity: 0;
		}
		50% {
			transform: scale(1.1);
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.nav-item-active:hover {
		background-color: var(--color-secondary-600);
		transform: scale(1.05);
	}

	.nav-item-active:active {
		transform: scale(0.95);
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
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-bold);
		border-radius: var(--border-radius-full);
		margin-left: auto;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.nav-item {
			padding: var(--spacing-lg) var(--spacing-xl);
			justify-content: center;
			background-color: transparent;
			border: 2px solid transparent;
			border-radius: var(--border-radius-xl);
			font-size: var(--font-size-lg);
		}

		.nav-item:hover:not(.nav-item-disabled) {
			background-color: var(--color-primary-50);
			border-color: var(--color-secondary-600);
			transform: scale(1.02);
		}

		.nav-item-active {
			background-color: var(--color-secondary-600);
			border-color: var(--color-secondary-600);
			font-weight: var(--font-weight-bold);
		}

		.nav-item-active:hover {
			background-color: var(--color-secondary-800);
			border-color: var(--color-secondary-800);
			transform: scale(1.02);
		}

		.nav-item-active:active {
			transform: scale(0.98);
		}

		.nav-item-text {
			font-size: var(--font-size-lg);
		}
	}
</style>
