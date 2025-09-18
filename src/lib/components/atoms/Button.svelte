<!-- src/lib/components/atoms/Button.svelte -->
<script lang="ts">
	import type { ButtonProps } from '$lib/types/components';
	import Icon from '$lib/components/atoms/Icon.svelte';

	export let variant: ButtonProps['variant'] = 'primary';
	export let size: ButtonProps['size'] = 'md';
	export let disabled: ButtonProps['disabled'] = false;
	export let loading: ButtonProps['loading'] = false;
	export let type: ButtonProps['type'] = 'button';
	export let icon: ButtonProps['icon'] = undefined;
	export let iconPosition: ButtonProps['iconPosition'] = 'left';
	export let fullWidth: ButtonProps['fullWidth'] = false;
	export let href: ButtonProps['href'] = undefined;
	export let target: ButtonProps['target'] = undefined;
	export let rel: ButtonProps['rel'] = undefined;
	export let external: ButtonProps['external'] = false;
	export let download: ButtonProps['download'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Determina qual elemento usar
	$: element = href ? 'a' : 'button';

	// Classes CSS baseadas nas props
	$: classes = [
		'button',
		`button-${variant}`,
		`button-size-${size}`,
		disabled && 'button-disabled',
		loading && 'button-loading',
		fullWidth && 'button-full-width',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Props específicas do link
	$: linkProps = href
		? {
				href,
				target: external ? '_blank' : target,
				rel: external ? 'noopener noreferrer' : rel,
				download: download === true ? '' : download || undefined
			}
		: {};

	// Props específicas do button
	$: buttonProps = !href
		? {
				type,
				disabled: disabled || loading
			}
		: {};
</script>

<svelte:element this={element} class={classes} {...linkProps} {...buttonProps} {...$$restProps}>
	{#if loading}
		<Icon name="loader" size="sm" class="button-spinner" animated />
	{:else if icon && iconPosition === 'left'}
		<Icon name={icon} size="sm" class="button-icon button-icon-left" />
	{/if}

	<span class="button-content">
		<slot />
	</span>

	{#if icon && iconPosition === 'right' && !loading}
		<Icon name={icon} size="sm" class="button-icon button-icon-right" />
	{/if}
</svelte:element>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--border-radius-full);
		border: var(--border-width-default) solid transparent;
		font-family: var(--font-family-sans);
		font-weight: var(--font-weight-medium);
		line-height: var(--line-height-tight);
		text-decoration: none;
		cursor: pointer;
		transition: all var(--transition-fast) var(--transition-timing-default);
		user-select: none;
		position: relative;
		overflow: hidden;
	}

	.button:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	/* Tamanhos */
	.button-size-xs {
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: var(--font-size-xs);
	}

	.button-size-sm {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.button-size-md {
		padding: var(--spacing-md) var(--spacing-sm);
		font-size: var(--font-size-base);
	}

	.button-size-lg {
		padding: var(--spacing-md) var(--spacing-3xl);
		font-size: var(--font-size-base);
	}

	.button-size-xl {
		padding: var(--spacing-xl) var(--spacing-2xl);
		font-size: var(--font-size-xl);
	}

	/* Variantes */
	.button-primary {
		background-color: var(--color-primary-500);
		color: var(--color-neutral-0);
		border-color: var(--color-primary-500);
	}

	.button-primary:hover:not(.button-disabled) {
		background-color: var(--color-primary-600);
		border-color: var(--color-primary-600);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.button-primary:active:not(.button-disabled) {
		background-color: var(--color-primary-700);
		border-color: var(--color-primary-700);
		transform: translateY(0);
	}

	.button-secondary {
		background-color: var(--color-secondary-600);
		color: var(--color-primary-900);
		font-weight: var(--font-weight-bold);
		border-color: var(--color-secondary-600);
		/* Adicionando espaçamento entre as letras */
		letter-spacing: var(--spacing-xxxs);
	}

	.button-secondary:hover:not(.button-disabled) {
		background-color: var(--color-secondary-700);
		border-color: var(--color-secondary-700);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.button-secondary:active:not(.button-disabled) {
		background-color: var(--color-secondary-700);
		border-color: var(--color-secondary-700);
		transform: translateY(0);
	}

	.button-outline {
		background-color: transparent;
		color: var(--color-primary-500);
		border-color: var(--color-primary-500);
	}

	.button-outline:hover:not(.button-disabled) {
		background-color: var(--color-primary-500);
		color: var(--color-neutral-0);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.button-outline:active:not(.button-disabled) {
		background-color: var(--color-primary-600);
		border-color: var(--color-primary-600);
		transform: translateY(0);
	}

	.button-ghost {
		background-color: transparent;
		color: var(--color-primary-500);
		border-color: transparent;
	}

	.button-ghost:hover:not(.button-disabled) {
		background-color: var(--color-primary-100);
		color: var(--color-primary-600);
	}

	.button-ghost:active:not(.button-disabled) {
		background-color: var(--color-primary-200);
		color: var(--color-primary-700);
	}

	.button-danger {
		background-color: var(--color-error);
		color: var(--color-neutral-0);
		border-color: var(--color-error);
	}

	.button-danger:hover:not(.button-disabled) {
		background-color: var(--color-error-dark);
		border-color: var(--color-error-dark);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.button-danger:active:not(.button-disabled) {
		background-color: var(--color-red-800);
		border-color: var(--color-red-800);
		transform: translateY(0);
	}

	/* Estados */
	.button-disabled {
		opacity: 0.6;
		cursor: not-allowed;
		pointer-events: none;
	}

	.button-loading {
		cursor: wait;
	}

	.button-full-width {
		width: 100%;
	}

	/* Ícones */
	.button-icon {
		flex-shrink: 0;
	}

	.button-spinner {
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

	.button-content {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	/* Ripple effect */
	.button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.3);
		transform: translate(-50%, -50%);
		transition:
			width 0.3s,
			height 0.3s;
	}

	.button:active:not(.button-disabled)::before {
		width: 300px;
		height: 300px;
	}
</style>
