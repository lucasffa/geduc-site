<!-- src/lib/components/organisms/HeroSection.svelte -->
<script lang="ts">
	import type { HeroSectionProps } from '$lib/types/components';
	import { Components } from '$lib/components';

	const { Heading, Text, Button, Image } = Components.Atoms;

	export let title: HeroSectionProps['title'];
	export let subtitle: HeroSectionProps['subtitle'] = undefined;
	export let description: HeroSectionProps['description'] = undefined;
	export let actions: HeroSectionProps['actions'] = [];
	export let media: HeroSectionProps['media'] = undefined;
	export let background: HeroSectionProps['background'] = undefined;
	export let layout: HeroSectionProps['layout'] = 'centered';
	export let size: HeroSectionProps['size'] = 'lg';
	export let decorative: HeroSectionProps['decorative'] = false;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'hero-section',
		`hero-section-layout-${layout}`,
		`hero-section-size-${size}`,
		decorative && 'hero-section-decorative',
		className
	]
		.filter(Boolean)
		.join(' ');

	// Estilo de background customizado
	$: backgroundStyle = background ? generateBackgroundStyle(background) : undefined;

	function generateBackgroundStyle(bg: NonNullable<HeroSectionProps['background']>): string {
		switch (bg.type) {
			case 'color':
				return `background-color: ${bg.value}`;
			case 'gradient':
				return `background: ${bg.value}`;
			case 'image':
				return `background-image: url(${bg.value}); background-size: cover; background-position: center;`;
			default:
				return '';
		}
	}
</script>

<section class={classes} style={backgroundStyle}>
	{#if decorative}
		<div class="hero-section-decorations">
			<div class="hero-decoration hero-decoration-1"></div>
			<div class="hero-decoration hero-decoration-2"></div>
			<div class="hero-decoration hero-decoration-3"></div>
		</div>
	{/if}

	<div class="hero-section-container">
		<div class="hero-section-content">
			{#if subtitle}
				<Text as="span" size="md" weight="semibold" color="primary" class="hero-section-subtitle">
					{subtitle}
				</Text>
			{/if}

			<Heading level={1} size="4xl" weight="bold" class="hero-section-title">
				{title}
			</Heading>

			{#if description}
				<Text as="p" size="lg" color="secondary" class="hero-section-description">
					{description}
				</Text>
			{/if}

			{#if actions && actions.length > 0}
				<div class="hero-section-actions">
					{#each actions as action}
						<Button
							href={action.href}
							variant={action.variant || 'primary'}
							size="lg"
							{...action.onclick && { 'on:click': action.onclick }}
							class="hero-section-action"
						>
							{action.label}
						</Button>
					{/each}
				</div>
			{/if}
		</div>

		{#if media}
			<div class="hero-section-media">
				{#if media.type === 'image'}
					<Image
						src={media.src}
						alt={media.alt || 'Hero image'}
						aspectRatio="auto"
						loading="eager"
						priority
						class="hero-section-image"
					/>
				{:else if media.type === 'video'}
					<video
						src={media.src}
						poster={media.poster}
						autoplay
						muted
						loop
						playsinline
						class="hero-section-video"
					>
						<track kind="captions" />
					</video>
				{:else if media.type === 'illustration'}
					<div class="hero-section-illustrations">
						<!-- Ilustrações específicas mencionadas na hierarquia -->
						<div class="hero-illustration hero-illustration-brain">
							<Image
								src="/images/illustrations/brain.svg"
								alt="Ilustração de cérebro representando conhecimento"
								class="image-halftone"
							/>
						</div>
						<div class="hero-illustration hero-illustration-lamp">
							<Image
								src="/images/illustrations/lamp.svg"
								alt="Ilustração de lâmpada representando ideias"
								class="image-halftone"
							/>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Slot para conteúdo customizado -->
	<slot />
</section>

<style>
	.hero-section {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(
			135deg,
			var(--color-primary-50) 0%,
			var(--color-secondary-50) 50%,
			var(--color-accent-50) 100%
		);
		overflow: hidden;
	}

	.hero-section-container {
		width: 100%;
		max-width: var(--container-max-width-xl);
		margin: 0 auto;
		padding: var(--spacing-2xl) var(--spacing-lg);
		display: flex;
		align-items: center;
		gap: var(--spacing-2xl);
		position: relative;
		z-index: 2;
	}

	/* Tamanhos */
	.hero-section-size-sm {
		min-height: 40vh;
	}

	.hero-section-size-sm .hero-section-container {
		padding: var(--spacing-xl) var(--spacing-lg);
	}

	.hero-section-size-md {
		min-height: 50vh;
	}

	.hero-section-size-lg {
		min-height: 60vh;
	}

	.hero-section-size-xl {
		min-height: 80vh;
	}

	.hero-section-size-2xl {
		min-height: 100vh;
	}

	/* Layouts */
	.hero-section-layout-centered .hero-section-container {
		flex-direction: column;
		text-align: center;
		max-width: 800px;
	}

	.hero-section-layout-left .hero-section-container {
		flex-direction: row;
		text-align: left;
	}

	.hero-section-layout-right .hero-section-container {
		flex-direction: row-reverse;
		text-align: left;
	}

	.hero-section-layout-split .hero-section-container {
		flex-direction: row;
		align-items: center;
	}

	/* Conteúdo */
	.hero-section-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.hero-section-layout-centered .hero-section-content {
		align-items: center;
		max-width: 100%;
	}

	.hero-section-subtitle {
		text-transform: uppercase;
		letter-spacing: 1px;
		margin: 0;
	}

	.hero-section-title {
		margin: 0;
		background: linear-gradient(
			135deg,
			var(--text-color-primary) 0%,
			var(--color-primary-600) 50%,
			var(--color-secondary-600) 100%
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-size: 200% 200%;
		animation: gradientShift 4s ease-in-out infinite;
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

	.hero-section-description {
		margin: 0;
		max-width: 600px;
		line-height: var(--line-height-relaxed);
	}

	.hero-section-layout-centered .hero-section-description {
		text-align: center;
	}

	/* Ações */
	.hero-section-actions {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
	}

	.hero-section-layout-centered .hero-section-actions {
		justify-content: center;
	}

	.hero-section-action {
		min-width: 160px;
	}

	/* Mídia */
	.hero-section-media {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.hero-section-layout-centered .hero-section-media {
		width: 100%;
		max-width: 600px;
		margin-top: var(--spacing-xl);
	}

	.hero-section-image,
	.hero-section-video {
		width: 100%;
		height: auto;
		border-radius: var(--border-radius-xl);
		box-shadow: var(--shadow-xl);
	}

	/* Ilustrações */
	.hero-section-illustrations {
		position: relative;
		width: 100%;
		height: 400px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.hero-illustration {
		position: absolute;
		max-width: 200px;
		max-height: 200px;
		animation: float 6s ease-in-out infinite;
	}

	.hero-illustration-brain {
		top: 20%;
		left: 10%;
		animation-delay: 0s;
	}

	.hero-illustration-lamp {
		bottom: 20%;
		right: 10%;
		animation-delay: 3s;
	}

	@keyframes float {
		0%,
		100% {
			transform: translateY(0px) rotate(0deg);
		}
		50% {
			transform: translateY(-20px) rotate(5deg);
		}
	}

	/* Decorações */
	.hero-section-decorations {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		pointer-events: none;
		z-index: 1;
	}

	.hero-decoration {
		position: absolute;
		border-radius: 50%;
		opacity: 0.1;
	}

	.hero-decoration-1 {
		width: 300px;
		height: 300px;
		background: var(--color-primary-500);
		top: -150px;
		left: -150px;
		animation: rotate 20s linear infinite;
	}

	.hero-decoration-2 {
		width: 200px;
		height: 200px;
		background: var(--color-secondary-500);
		bottom: -100px;
		right: -100px;
		animation: rotate 15s linear infinite reverse;
	}

	.hero-decoration-3 {
		width: 150px;
		height: 150px;
		background: var(--color-accent-500);
		top: 50%;
		right: 10%;
		animation: rotate 25s linear infinite;
	}

	@keyframes rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.hero-section-layout-left .hero-section-container,
		.hero-section-layout-right .hero-section-container,
		.hero-section-layout-split .hero-section-container {
			flex-direction: column;
			text-align: center;
		}

		.hero-section-container {
			padding: var(--spacing-xl) var(--spacing-md);
			gap: var(--spacing-xl);
		}

		.hero-section-title {
			font-size: var(--font-size-3xl);
		}

		.hero-section-actions {
			flex-direction: column;
			align-items: center;
		}

		.hero-section-action {
			width: 100%;
			max-width: 300px;
		}

		.hero-section-illustrations {
			height: 250px;
		}

		.hero-illustration {
			max-width: 120px;
			max-height: 120px;
		}
	}

	@media (max-width: 480px) {
		.hero-section {
			min-height: 50vh;
		}

		.hero-section-container {
			padding: var(--spacing-lg) var(--spacing-sm);
		}

		.hero-section-title {
			font-size: var(--font-size-2xl);
		}

		.hero-section-description {
			font-size: var(--font-size-base);
		}
	}

	/* Dark theme */
	[data-theme='dark'] .hero-section {
		background: linear-gradient(
			135deg,
			var(--color-primary-900) 0%,
			var(--color-secondary-900) 50%,
			var(--color-accent-900) 100%
		);
	}

	[data-theme='dark'] .hero-section-title {
		background: linear-gradient(
			135deg,
			var(--text-color-primary) 0%,
			var(--color-primary-400) 50%,
			var(--color-secondary-400) 100%
		);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
	}

	/* Animações de entrada */
	.hero-section-content {
		animation: slideInUp 1s ease-out;
	}

	.hero-section-media {
		animation: slideInRight 1s ease-out 0.3s both;
	}

	@keyframes slideInUp {
		from {
			opacity: 0;
			transform: translateY(50px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(50px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	/* Parallax effect */
	.hero-section-decorative .hero-decoration {
		animation: parallax 0.5s ease-out;
	}

	@keyframes parallax {
		from {
			transform: translateY(100px);
		}
		to {
			transform: translateY(0);
		}
	}
</style>
