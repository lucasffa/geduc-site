<!-- src/lib/components/organisms/HeroSection.svelte -->
<script lang="ts">
	import type { HeroSectionProps } from '$lib/types/components';
	import Heading from '../atoms/Heading.svelte';
	import Text from '../atoms/Text.svelte';
	import Button from '../atoms/Button.svelte';
	import Image from '../atoms/Image.svelte';
	import Modal from './Modal.svelte';

	export let title: HeroSectionProps['title'];
	export let subtitle: HeroSectionProps['subtitle'] = undefined;
	export let highlight: HeroSectionProps['highlight'] = undefined;
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

	let isVideoModalOpen = false;

	function openVideoModal() {
		isVideoModalOpen = true;
		console.log('Modal abrido');
	}
	const closeVideoModal = () => (isVideoModalOpen = false);

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

	<!-- Background illustrations positioned behind content -->
	{#if media && media.type === 'illustration'}
		<div class="hero-section-media hero-section-media-background">
			<div class="hero-section-illustrations">
				<!-- Ilustrações específicas mencionadas na hierarquia -->
				<div class="hero-illustration hero-illustration-brain">
					<Image
						src="/images/illustrations/cerebro.png"
						alt="Ilustração de cérebro representando conhecimento"
						class="image-halftone"
						
						aspectRatio="square"
						objectFit="contain"
						loading="lazy"
						priority
					/>
				</div>
				<div class="hero-illustration hero-illustration-lamp">
					<Image
						src="/images/illustrations/lampada.png"
						alt="Ilustração de lâmpada representando ideias"
						class="image-halftone"
						
						aspectRatio="auto"
						objectFit="contain"
						loading="lazy"
						priority
					/>
				</div>
			</div>
		</div>
	{/if}

	<div class="hero-section-container">
		<div class="hero-section-content">
			<div class="hero-headings-container">
				<Heading level={1} size="4xl" weight="bold" color="neutral" class="hero-section-title">
					{title}
				</Heading>
				{#if subtitle}
					<div class="hero-subtitle-wrapper">
						<Heading level={1} size="3xl" weight="bold" color="white" class="hero-section-subtitle">
							{subtitle}
						</Heading>
					</div>
				{/if}
				{#if highlight}
					<div class="hero-highlight-wrapper">
						<Heading
							level={1}
							size="4xl"
							weight="bold"
							shadow="drop"
							color="white"
							class="hero-section-highlight"
						>
							{highlight}
						</Heading>
						<!-- #TODO: USAR O ATOMO de ICONE LINHA 83 REFERENCIA -->
					</div>
				{/if}
			</div>
			{#if description}
				<Text as="p" size="lg" color="white" align="center" class="hero-section-description">
					{description}
				</Text>
			{/if}

			{#if actions && actions.length > 0}
				<div class="hero-section-actions">
					{#each actions as action}
						{#if action.label === 'Assista o Vídeo'}
							<Button
								variant={action.variant || 'primary'}
								size="lg"
								onclick={(event) => {
									openVideoModal();
								}}
								class="hero-section-action"
							>
								{action.label}
							</Button>
						{:else}
							<Button
								href={action.href || '#'}
								variant={action.variant || 'primary'}
								size="lg"
								class="hero-section-action"
							>
								{action.label}
							</Button>
						{/if}
					{/each}
				</div>
			{/if}
		</div>

		{#if media && media.type !== 'illustration'}
			<div class="hero-section-media">
				{#if media.type === 'image'}
					<Image
						src={media.src}
						alt={media.alt || 'Hero image'}
						aspectRatio="auto"
						objectFit="cover"
						loading="eager"
						priority
						class="hero-section-image image-halftone"
						blendMode="screen"
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
				{/if}
			</div>
		{/if}
	</div>

	<Modal isOpen={isVideoModalOpen} onClose={closeVideoModal} size="lg">
		<slot name="header">
			<h2>Vídeo Institucional</h2>
		</slot>

		<video
			src="/videos/hero-video.mp4"
			controls
			autoplay
			muted
			loop
			style="width: 100%; height: auto; border-radius: var(--border-radius-lg);"
		></video>
	</Modal>

	<slot />
</section>

<style>
	.hero-section {
		position: relative;
		min-height: 60vh;
		display: flex;
		align-items: center;
		justify-content: center;
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
		z-index: 3;
	}

	.hero-headings-container {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: var(--spacing-sm);
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
		text-align: center;
	}

	/* Conteúdo */
	.hero-section-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		justify-content: center;
		align-items: flex-start;
	}

	.hero-section-layout-centered .hero-section-content {
		align-items: center;
		max-width: 100%;
		text-align: center;
	}

	.hero-section-layout-split .hero-section-content {
		align-items: center;
		text-align: center;
	}

	.hero-section-subtitle {
		text-transform: uppercase;
		letter-spacing: var(--spacing-xxxs);
		margin: 0;
		width: 100%;
		text-align: inherit;
		text-shadow: var(--shadow-md);
	}

	.hero-subtitle {
		margin: 0;
		font-weight: 800;
		color: var(--color-neutral-900); /* contraste */
	}

	.hero-subtitle-icon {
		position: absolute;
		top: 4px;
		right: 4px;
		width: 20px; /* ajusta o tamanho */
		height: 20px;
		pointer-events: none; /* não atrapalha clique */
	}

	.hero-section-highlight {
		text-transform: uppercase;
		letter-spacing: var(--spacing-xxxs);
		margin: 0;
		width: 100%;
		text-align: inherit;
	}

	.hero-highlight-wrapper {
		position: relative;
		display: inline-block;
		background-color: var(--color-yellow-600);
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--border-radius-xl);
		margin: var(--spacing-md) 0;
	}

	.hero-section-title {
		margin: 0;
		width: 100%;
		text-align: inherit;
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
		border-radius: 100px;
	}

	/* Mídia */
	.hero-section-media {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	/* Background media (illustrations behind text) */
	.hero-section-media-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: 1;
		pointer-events: none;
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
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		mix-blend-mode: screen;
	}

	.hero-section-media-background .hero-section-illustrations {
		height: 100vh;
		max-height: 800px;
		width: 100vw;
		position: absolute;
		left: 0;
		right: 0;
	}

	.hero-illustration {
		position: absolute;
		max-width: 300px;
		max-height: 300px;
		animation: float 6s ease-in-out infinite;
	}

	.hero-illustration-brain {
		top: 15%;
		left: 5%;
		animation-delay: 0s;
	}

	.hero-illustration-lamp {
		bottom: 15%;
		right: 5%;
		animation-delay: 3s;
	}

	/* Background illustrations positioning */
	.hero-section-media-background .hero-illustration-brain {
		top: 40%;
		left: 7%;
		max-width: 350px;
		max-height: 350px;
	}

	.hero-section-media-background .hero-illustration-lamp {
		bottom: 27%;
		right: 7%;
		max-width: 380px;
		max-height: 380px;
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
			max-width: 180px;
			max-height: 180px;
		}

		.hero-section-media-background .hero-section-illustrations {
			height: 60vh;
			max-height: 500px;
			width: 100vw;
			position: absolute;
			left: 0;
			right: 0;
		}

		.hero-section-media-background .hero-illustration {
			max-width: 220px;
			max-height: 220px;
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
