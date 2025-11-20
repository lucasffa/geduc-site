<!-- src/lib/components/molecules/SocialLinks.svelte -->
<script lang="ts">
	import type { SocialLinksProps } from '$lib/types/components';
	import Icon from '$lib/components/atoms/Icon.svelte';
	import Text from '$lib/components/atoms/Text.svelte';

	export let links: SocialLinksProps['links'];
	export let size: SocialLinksProps['size'] = 'md';
	export let variant: SocialLinksProps['variant'] = 'icons';
	export let orientation: SocialLinksProps['orientation'] = 'horizontal';
	export let showLabels: SocialLinksProps['showLabels'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'social-links',
		`social-links-variant-${variant}`,
		`social-links-orientation-${orientation}`,
		`social-links-size-${size}`,
		showLabels && 'social-links-with-labels',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Mapeia plataformas para ícones
	const platformIcons = {
		facebook: 'facebook',
		linkedin: 'linkedin',
		instagram: 'instagram',
		twitter: 'twitter',
		youtube: 'youtube',
		tiktok: 'tiktok',
		whatsapp: 'whatsapp'
	};

	// Mapeia plataformas para cores
	const platformColors = {
		facebook: '#ffffff',
		linkedin: '#ffffff',
		instagram: '#ffffff',
		twitter: '#ffffff',
		youtube: '#ffffff',
		tiktok: '#ffffff',
		whatsapp: '#ffffff'
	};

	// Gera label automático se não fornecido
	function getLabel(platform: string, customLabel?: string): string {
		if (customLabel) return customLabel;

		const labels = {
			facebook: 'Facebook',
			linkedin: 'LinkedIn',
			instagram: 'Instagram',
			twitter: 'Twitter',
			youtube: 'YouTube',
			tiktok: 'TikTok',
			whatsapp: 'WhatsApp'
		};

		return labels[platform as keyof typeof labels] || platform;
	}
</script>

<div class={classes}>
	{#each links as link}
		<a
			href={link.url}
			target="_blank"
			rel="noopener noreferrer"
			class="social-links-item"
			aria-label={`Visite nosso ${getLabel(link.platform, link.label)}`}
			style:--platform-color={platformColors[link.platform]}
		>
			<Icon name={platformIcons[link.platform] || 'link'} {size}
			 color= {platformColors[link.platform]} 
			 class="social-links-icon" />

			{#if showLabels}
				<Text as="span" size="sm" weight="medium" class="social-links-label">
					{getLabel(link.platform, link.label)}
				</Text>
			{/if}
		</a>
	{/each}
</div>

<style>
	.social-links {
		display: flex;
		gap: var(--spacing-md);
	}

	/* Orientações */
	.social-links-orientation-horizontal {
		flex-direction: row;
		align-items: center;
	}

	.social-links-orientation-vertical {
		flex-direction: column;
		align-items: flex-start;
	}

	/* Tamanhos - ajusta gap baseado no tamanho */
	.social-links-size-xs {
		gap: var(--spacing-xs);
	}

	.social-links-size-sm {
		gap: var(--spacing-sm);
	}

	.social-links-size-md {
		gap: var(--spacing-md);
	}

	.social-links-size-lg {
		gap: var(--spacing-lg);
	}

	.social-links-size-xl {
		gap: var(--spacing-xl);
	}

	/* Item individual */
	.social-links-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		text-decoration: none;
		color: var(--icon-color-default);
		transition: all var(--transition-fast) var(--transition-timing-default);
		border-radius: var(--border-radius-md);
		position: relative;
	}

	.social-links-item:hover {
		color: var(--platform-color, var(--color-primary-500));
		transform: translateY(-2px);
	}

	.social-links-item:focus-visible {
		outline: 2px solid var(--color-primary-500);
		outline-offset: 2px;
	}

	.social-links-item:active {
		transform: translateY(0);
	}

	/* Variantes */
	.social-links-variant-icons .social-links-item {
		padding: var(--spacing-xs);
	}

	.social-links-variant-buttons .social-links-item {
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--background-color-card);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-md);
		box-shadow: var(--shadow-sm);
	}

	.social-links-variant-buttons .social-links-item:hover {
		background-color: var(--platform-color, var(--color-primary-500));
		color: var(--color-neutral-0);
		border-color: var(--platform-color, var(--color-primary-500));
		box-shadow: var(--shadow-md);
	}

	.social-links-variant-minimal .social-links-item {
		padding: var(--spacing-xs);
		opacity: 0.7;
	}

	.social-links-variant-minimal .social-links-item:hover {
		opacity: 1;
	}

	/* Com labels */
	.social-links-with-labels .social-links-item {
		gap: var(--spacing-sm);
	}

	.social-links-with-labels.social-links-orientation-vertical .social-links-item {
		justify-content: flex-start;
		min-width: 120px;
	}

	/* Elementos */
	.social-links-icon {
		flex-shrink: 0;
		transition: inherit;
	}

	.social-links-label {
		color: inherit;
		white-space: nowrap;
	}

	.social-links-variant-buttons .social-links-label {
		font-weight: var(--font-weight-medium);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.social-links-orientation-horizontal {
			justify-content: center;
			flex-wrap: wrap;
		}

		.social-links-with-labels.social-links-orientation-horizontal {
			flex-direction: column;
			align-items: stretch;
		}

		.social-links-with-labels .social-links-item {
			justify-content: center;
		}
	}

	@media (max-width: 480px) {
		.social-links {
			gap: var(--spacing-sm);
		}

		.social-links-variant-buttons .social-links-item {
			padding: var(--spacing-xs) var(--spacing-sm);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .social-links-item {
		color: var(--icon-color-default);
	}

	[data-theme='dark'] .social-links-variant-buttons .social-links-item {
		background-color: var(--background-color-card);
		border-color: var(--border-color-default);
	}

	[data-theme='dark'] .social-links-variant-buttons .social-links-item:hover {
		background-color: var(--platform-color, var(--color-primary-600));
	}

	/* Animações de entrada */
	.social-links-item {
		animation: fadeInScale 0.6s ease-out;
	}

	.social-links-item:nth-child(1) {
		animation-delay: 0.1s;
	}
	.social-links-item:nth-child(2) {
		animation-delay: 0.2s;
	}
	.social-links-item:nth-child(3) {
		animation-delay: 0.3s;
	}
	.social-links-item:nth-child(4) {
		animation-delay: 0.4s;
	}
	.social-links-item:nth-child(5) {
		animation-delay: 0.5s;
	}

	@keyframes fadeInScale {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	/* Efeitos especiais */
	.social-links-variant-buttons .social-links-item::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--platform-color, var(--color-primary-500));
		opacity: 0;
		border-radius: inherit;
		transition: opacity var(--transition-fast) var(--transition-timing-default);
		z-index: -1;
	}

	.social-links-variant-buttons .social-links-item:hover::before {
		opacity: 1;
	}

	/* Indicadores de atividade */
	.social-links-item.social-links-active {
		color: var(--platform-color, var(--color-primary-500));
		transform: scale(1.1);
	}

	.social-links-variant-buttons .social-links-item.social-links-active {
		background-color: var(--platform-color, var(--color-primary-500));
		color: var(--color-neutral-0);
		border-color: var(--platform-color, var(--color-primary-500));
	}

	/* Hover effects personalizados por plataforma */
	.social-links-item[href*='facebook']:hover {
		color: #1877f2;
	}

	.social-links-item[href*='linkedin']:hover {
		color: #0a66c2;
	}

	.social-links-item[href*='instagram']:hover {
		color: #e4405f;
	}

	.social-links-item[href*='twitter']:hover {
		color: #1da1f2;
	}

	.social-links-item[href*='youtube']:hover {
		color: #ff0000;
	}

	.social-links-item[href*='tiktok']:hover {
		color: #000000;
	}

	.social-links-item[href*='whatsapp']:hover {
		color: #25d366;
	}

	/* Pulse effect para chamar atenção */
	.social-links-pulse .social-links-item {
		animation: pulse 2s infinite;
	}

	@keyframes pulse {
		0% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.05);
		}
		100% {
			transform: scale(1);
		}
	}
</style>
