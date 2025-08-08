<!-- src/lib/components/molecules/StatCard.svelte -->
<script lang="ts">
	import type { StatCardProps } from '$lib/types/components';
	import Heading from '$lib/components/atoms/Heading.svelte';
	import Text from '$lib/components/atoms/Text.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Image from '$lib/components/atoms/Image.svelte';

	export let value: StatCardProps['value'];
	export let label: StatCardProps['label'];
	export let description: StatCardProps['description'] = undefined;
	export let icon: StatCardProps['icon'] = undefined;
	export let trend: StatCardProps['trend'] = undefined;
	export let color: StatCardProps['color'] = 'primary';
	export let size: StatCardProps['size'] = 'md';
	export let variant: StatCardProps['variant'] = 'default';

	// Classes adicionais
	let className = '';
	export { className as class };

	// Atributos HTML padrão
	let style = '';
	export { style };

	// Classes CSS baseadas nas props
	/**
	 * Como isto funciona:
	 *
	 * A variável reativa `classes` monta uma string de classes CSS baseada nas propriedades recebidas pelo componente.
	 * Cada prop relevante (variant, size, color, etc.) adiciona uma classe específica, permitindo customização visual via CSS.
	 * A classe adicional `className` permite que o usuário do componente adicione classes extras.
	 * O resultado é uma string de classes que será aplicada ao elemento principal do StatCard.
	 */
	$: classes = [
		'stat-card',
		`stat-card-variant-${variant}`,
		`stat-card-size-${size}`,
		`stat-card-color-${color}`,
		className
	]
		.filter(Boolean)
		.join(' ');

	// Formata o valor para exibição
	$: displayValue = typeof value === 'number' ? formatNumber(value) : value;

	function formatNumber(num: number): string {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'k';
		}
		return num.toString();
	}

	// Ícone da tendência
	$: trendIcon =
		trend?.direction === 'up'
			? 'arrow-up'
			: trend?.direction === 'down'
				? 'arrow-down'
				: 'arrow-right';
</script>

<div class={classes} {style}>
	<div class="stat-card-header">
		{#if icon}
			<div class="stat-card-icon">
				<Icon name={icon.name} size="lg" color={icon.color || color} />
			</div>
		{/if}

		<slot name="illustration">
			<!-- Slot para ilustrações customizadas como as mencionadas na hierarquia -->
		</slot>
	</div>

	<div class="stat-card-content">
		<Heading level={2} size="2xl" weight="bold" class="stat-card-value">
			{displayValue}
		</Heading>

		<Text as="p" size="md" weight="medium" class="stat-card-label">
			{label}
		</Text>

		{#if description}
			<Text as="p" size="sm" color="subtle" class="stat-card-description">
				{description}
			</Text>
		{/if}

		{#if trend}
			<div class="stat-card-trend stat-card-trend-{trend.direction}">
				<Icon name={trendIcon} size="xs" class="stat-card-trend-icon" />
				<Text as="span" size="sm" weight="medium" class="stat-card-trend-value">
					{Math.abs(trend.value)}%
				</Text>
				{#if trend.label}
					<Text as="span" size="xs" color="subtle" class="stat-card-trend-label">
						{trend.label}
					</Text>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.stat-card {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-fast) var(--transition-timing-default);
		position: relative;
		overflow: hidden;
	}

	.stat-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	/* Tamanhos */
	.stat-card-size-sm {
		padding: var(--spacing-md);
		gap: var(--spacing-sm);
	}

	.stat-card-size-md {
		padding: var(--spacing-lg);
		gap: var(--spacing-md);
	}

	.stat-card-size-lg {
		padding: var(--spacing-xl);
		gap: var(--spacing-lg);
	}

	/* Variantes */
	.stat-card-variant-default {
		border: 1px solid var(--border-color-default);
	}

	.stat-card-variant-minimal {
		background-color: transparent;
		box-shadow: none;
		border: none;
		padding: var(--spacing-md);
	}

	.stat-card-variant-highlighted {
		background: linear-gradient(135deg, var(--color-accent-200) 0%, var(--color-accent-100) 100%);
		border: 1px solid var(--color-accent-300);
	}

	.stat-card-variant-highlighted .stat-card-value {
		color: var(--color-accent-900);
	}

	/* Cores */
	.stat-card-color-primary::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-primary-500);
	}

	.stat-card-color-secondary::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-secondary-500);
	}

	.stat-card-color-accent::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-accent-500);
	}

	.stat-card-color-success::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-success);
	}

	.stat-card-color-warning::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-warning);
	}

	.stat-card-color-error::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		background-color: var(--color-error);
	}

	/* Header */
	.stat-card-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		min-height: 40px;
	}

	.stat-card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 48px;
		height: 48px;
		background-color: var(--color-primary-100);
		border-radius: var(--border-radius-lg);
		color: var(--color-primary-600);
	}

	/* Content */
	.stat-card-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.stat-card-value {
		margin: 0;
		line-height: 1;
	}

	.stat-card-label {
		margin: 0;
		color: var(--text-color-secondary);
	}

	.stat-card-description {
		margin: 0;
		line-height: var(--line-height-relaxed);
	}

	/* Trend */
	.stat-card-trend {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-sm);
		width: fit-content;
	}

	.stat-card-trend-up {
		background-color: var(--color-success-light);
		color: var(--color-success-dark);
	}

	.stat-card-trend-down {
		background-color: var(--color-error-light);
		color: var(--color-error-dark);
	}

	.stat-card-trend-neutral {
		background-color: var(--color-neutral-200);
		color: var(--color-neutral-700);
	}

	.stat-card-trend-icon {
		flex-shrink: 0;
	}

	.stat-card-trend-value {
		font-weight: var(--font-weight-semibold);
	}

	.stat-card-trend-label {
		margin-left: var(--spacing-xs);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.stat-card {
			padding: var(--spacing-md);
		}

		.stat-card-size-lg {
			padding: var(--spacing-lg);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .stat-card {
		background-color: var(--background-color-card);
		border-color: var(--border-color-default);
	}

	[data-theme='dark'] .stat-card-variant-highlighted {
		background: linear-gradient(135deg, var(--color-accent-800) 0%, var(--color-accent-900) 100%);
		border-color: var(--color-accent-700);
	}

	[data-theme='dark'] .stat-card-variant-highlighted .stat-card-value {
		color: var(--color-accent-200);
	}

	[data-theme='dark'] .stat-card-icon {
		background-color: var(--color-primary-900);
		color: var(--color-primary-300);
	}

	/* Animação de counter */
	.stat-card-value {
		animation: countUp 0.8s ease-out;
	}

	@keyframes countUp {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Hover effects específicos por cor */
	.stat-card-color-primary:hover {
		border-color: var(--color-primary-300);
	}

	.stat-card-color-secondary:hover {
		border-color: var(--color-secondary-300);
	}

	.stat-card-color-accent:hover {
		border-color: var(--color-accent-400);
	}
</style>
