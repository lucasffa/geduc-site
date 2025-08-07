<!-- src/lib/components/molecules/SectionHeader.svelte -->
<script lang="ts">
	import type { SectionHeaderProps } from '$lib/types/components';
	import { Components } from '$lib/components';

	const { Heading, Text } = Components.Atoms;

	export let title: SectionHeaderProps['title'];
	export let subtitle: SectionHeaderProps['subtitle'] = undefined;
	export let description: SectionHeaderProps['description'] = undefined;
	export let align: SectionHeaderProps['align'] = 'center';
	export let spacing: SectionHeaderProps['spacing'] = 'normal';
	export let decorative: SectionHeaderProps['decorative'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'section-header',
		`section-header-align-${align}`,
		`section-header-spacing-${spacing}`,
		decorative && 'section-header-decorative',
		className
	]
		.filter(Boolean)
		.join(' ');
</script>

<header class={classes}>
	{#if decorative}
		<div class="section-header-decorator"></div>
	{/if}

	<div class="section-header-content">
		{#if subtitle}
			<Text as="span" size="sm" weight="semibold" color="primary" class="section-header-subtitle">
				{subtitle}
			</Text>
		{/if}

		<Heading level={2} size="2xl" weight="bold" class="section-header-title">
			{title}
		</Heading>

		{#if description}
			<Text as="p" size="md" color="secondary" class="section-header-description">
				{description}
			</Text>
		{/if}

		<slot name="actions">
			<!-- Slot para ações adicionais como botões ou links -->
		</slot>
	</div>

	{#if decorative}
		<div class="section-header-decorator section-header-decorator-bottom"></div>
	{/if}
</header>

<style>
	.section-header {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-2xl);
	}

	/* Alinhamentos */
	.section-header-align-left {
		text-align: left;
		align-items: flex-start;
	}

	.section-header-align-center {
		text-align: center;
		align-items: center;
	}

	.section-header-align-right {
		text-align: right;
		align-items: flex-end;
	}

	/* Espaçamentos */
	.section-header-spacing-tight {
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-xl);
	}

	.section-header-spacing-normal {
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-2xl);
	}

	.section-header-spacing-loose {
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-3xl);
	}

	/* Conteúdo */
	.section-header-content {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		position: relative;
		z-index: 2;
	}

	.section-header-align-center .section-header-content {
		align-items: center;
		max-width: 800px;
		margin: 0 auto;
	}

	.section-header-align-left .section-header-content {
		align-items: flex-start;
	}

	.section-header-align-right .section-header-content {
		align-items: flex-end;
	}

	/* Elementos */
	.section-header-subtitle {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 1px;
		position: relative;
		display: inline-block;
	}

	.section-header-subtitle::after {
		content: '';
		position: absolute;
		bottom: -4px;
		left: 0;
		width: 100%;
		height: 2px;
		background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
		border-radius: 1px;
	}

	.section-header-title {
		margin: 0;
		position: relative;
	}

	.section-header-description {
		margin: 0;
		max-width: 600px;
		line-height: var(--line-height-relaxed);
	}

	/* Decorativo */
	.section-header-decorative .section-header-title::before {
		content: '';
		position: absolute;
		top: 50%;
		left: -60px;
		width: 40px;
		height: 3px;
		background: linear-gradient(90deg, var(--color-primary-500), var(--color-accent-500));
		border-radius: var(--border-radius-sm);
		transform: translateY(-50%);
	}

	.section-header-align-center.section-header-decorative .section-header-title::before {
		left: 50%;
		top: -20px;
		transform: translateX(-50%);
	}

	.section-header-align-right.section-header-decorative .section-header-title::before {
		left: auto;
		right: -60px;
	}

	.section-header-decorator {
		position: absolute;
		width: 100px;
		height: 100px;
		background: radial-gradient(circle, var(--color-primary-200) 0%, transparent 70%);
		border-radius: 50%;
		z-index: 1;
	}

	.section-header-align-left .section-header-decorator {
		top: -20px;
		left: -50px;
	}

	.section-header-align-center .section-header-decorator {
		top: -30px;
		left: 50%;
		transform: translateX(-50%);
	}

	.section-header-align-right .section-header-decorator {
		top: -20px;
		right: -50px;
	}

	.section-header-decorator-bottom {
		background: radial-gradient(circle, var(--color-secondary-200) 0%, transparent 70%);
		top: auto;
		bottom: -40px;
	}

	.section-header-align-left .section-header-decorator-bottom {
		left: auto;
		right: -30px;
	}

	.section-header-align-center .section-header-decorator-bottom {
		left: 30%;
	}

	.section-header-align-right .section-header-decorator-bottom {
		right: auto;
		left: -30px;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.section-header {
			margin-bottom: var(--spacing-xl);
		}

		.section-header-spacing-loose {
			margin-bottom: var(--spacing-2xl);
		}

		.section-header-title {
			font-size: var(--font-size-xl);
		}

		.section-header-decorative .section-header-title::before {
			display: none;
		}

		.section-header-decorator {
			width: 60px;
			height: 60px;
		}

		.section-header-content {
			gap: var(--spacing-sm);
		}
	}

	@media (max-width: 480px) {
		.section-header-align-left,
		.section-header-align-right {
			text-align: center;
			align-items: center;
		}

		.section-header-content {
			align-items: center;
		}

		.section-header-description {
			text-align: center;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .section-header-decorator {
		background: radial-gradient(circle, var(--color-primary-800) 0%, transparent 70%);
	}

	[data-theme='dark'] .section-header-decorator-bottom {
		background: radial-gradient(circle, var(--color-secondary-800) 0%, transparent 70%);
	}

	/* Animações */
	.section-header {
		animation: fadeInUp 0.8s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(30px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	.section-header-subtitle {
		animation: slideInLeft 0.6s ease-out 0.2s both;
	}

	.section-header-title {
		animation: slideInLeft 0.6s ease-out 0.4s both;
	}

	.section-header-description {
		animation: slideInLeft 0.6s ease-out 0.6s both;
	}

	@keyframes slideInLeft {
		from {
			opacity: 0;
			transform: translateX(-20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Hover effects */
	.section-header-title:hover {
		color: var(--color-primary-600);
		transition: color var(--transition-fast) var(--transition-timing-default);
	}

	/* Estados especiais */
	.section-header-highlight .section-header-title {
		background: linear-gradient(
			135deg,
			var(--color-primary-500),
			var(--color-secondary-500),
			var(--color-accent-500)
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 200%;
		animation: gradientShift 3s ease-in-out infinite;
	}

	@keyframes gradientShift {
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
</style>
