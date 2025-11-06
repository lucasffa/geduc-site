<!-- src/lib/components/organisms/Footer.svelte -->
<script lang="ts">
	import type { FooterProps } from '$lib/types/components';
	import Image from '../atoms/Image.svelte';
	import Text from '../atoms/Text.svelte';
	import Button from '../atoms/Button.svelte';
	import Icon from '../atoms/Icon.svelte';
	import Anchor from '../atoms/Anchor.svelte';
	import Heading from '../atoms/Heading.svelte';
	import SocialLinks from '../molecules/SocialLinks.svelte';
  
	// Props principais
	export let logo: FooterProps['logo'] = {
		src: '/images/logo-geduc.png',
		alt: 'Logo Guardiões da Educação',
		href: '/'
	};
	export let description: FooterProps['description'] = 
		'GEDUC é a maior ONG do Brasil que transforma vidas com educação gratuita, pluralizada e verdadeiramente humana.';
	export let contact: FooterProps['contact'] = {
		email: 'contato.geducbr@gmail.com'
	};
	export let social: FooterProps['social'] = [];
	export let copyright: FooterProps['copyright'] = undefined;
	export let backToTop: FooterProps['backToTop'] = true;
	export let variant: FooterProps['variant'] = 'detailed';
  
	// Classes adicionais
	let className = '';
	export { className as class };
  
	// Estado interno
	let showBackToTop = false;
  
	// Classes CSS baseadas nas props
	$: classes = [
		'footer',
		`footer-variant-${variant}`,
		className
	].filter(Boolean).join(' ');
  
	// Monitora scroll para mostrar botão voltar ao topo
	function handleScroll() {
		if (typeof window !== 'undefined') {
			showBackToTop = window.scrollY > 300;
		}
	}
  
	// Voltar ao topo
	function scrollToTop() {
		if (typeof window !== 'undefined') {
			window.scrollTo({
				top: 0,
				behavior: 'smooth'
			});
		}
	}
  
	// Mapeia social array para formato esperado pelo SocialLinks
	$: socialLinksData = social?.map(item => ({
		platform: item.platform as any,
		url: item.url,
		label: item.label
	})) || [];
</script>
  
<svelte:window on:scroll={handleScroll} />
  
<footer class={classes}>
	<div class="footer-container">
		<!-- Seção principal do footer -->
		<div class="footer-main">
			<!-- Coluna de informações principais (esquerda) -->
			<div class="footer-brand">
				{#if logo}
					<Image
						src={logo.src}
						alt={logo.alt || 'Logo'}
						class="footer-logo"
						loading="lazy"
					/>
				{/if}

				<div class="footer-text">
					{#if description}
						<Text as="p" size="md" color="white" class="footer-description">
							{description}
						</Text>
					{/if}

					{#if contact?.email}
						<div class="footer-contact">
							<Text as="p" size="sm" class="footer-email" color="white">
								{contact.email}
							</Text>
						</div>
					{/if}
				</div>
			</div>

			<!-- Coluna de redes sociais (esquerda, abaixo da logo) -->
			{#if socialLinksData.length > 0}
				<div class="footer-social-section">
					<Heading level={3} size="md" weight="bold" class="footer-social-title" color="white">
						Nossas redes sociais
					</Heading>
					<SocialLinks
						links={socialLinksData}
						variant="icons"
						size="lg"
						orientation="horizontal"
						class="footer-social"
					/>
				</div>
			{/if}
		</div>
	</div>

	<!-- Seção de copyright -->
	<div class="footer-bottom">
		<div class="footer-bottom-container">
			{#if copyright}
				<Text as="p" size="sm" color="white" class="footer-copyright">
					{copyright}
				</Text>
			{:else}
				<Text as="p" size="sm" color="white" class="footer-copyright">
					© GEDUC Brasil
				</Text>
			{/if}
		</div>
	</div>

	<!-- Botão voltar ao topo (fixed) -->
	{#if backToTop && showBackToTop}
		<button
			class="footer-back-to-top"
			on:click={scrollToTop}
			aria-label="Voltar ao topo"
		>
			<Icon name="arrow-up" size="md" color="white" />
		</button>
	{/if}
</footer>
  
<style>
	.footer {
		position: relative;
		background-color: var(--color-primary-800);
		color: var(--text-color-inverse);
		margin-top: auto;
		padding: 3rem 1.5rem 2rem;
	}

	.footer-container {
		max-width: 1400px;
		margin: 0 auto;
		padding-left: 3rem;
	}

	/* Seção principal */
	.footer-main {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 2.5rem;
	}

	/* Brand/Logo section */
	.footer-brand {
		display: flex;
		flex-direction: row;
		align-items: flex-start;
		gap: 1.5rem;
		max-width: 650px;
	}

	.footer-logo {
		width: 180px;
		height: auto;
		flex-shrink: 0;
	}

	.footer-text {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-description {
		line-height: 1.6;
		font-size: 0.95rem;
		margin: 0;
	}

	/* Contato */
	.footer-contact {
		margin-top: 0.25rem;
	}

	.footer-email {
		font-weight: 600;
		font-size: 0.9rem;
		margin: 0;
	}

	/* Right section (social + button) */
	.footer-right {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 1rem;
		margin-left: auto;
	}

	/* Social section */
	.footer-social-section {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.75rem;
		width: 100%;
	}

	.footer-social-title {
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0;
		font-size: 0.85rem;
		font-weight: 600;
	}

	.footer-social {
		display: flex;
		gap: 1rem;
	}

	/* Back to top button (fixed - acompanha a tela) */
	.footer-back-to-top {
		position: fixed;
		bottom: 2rem;
		right: 2rem;
		width: 48px;
		height: 48px;
		background-color: var(--color-primary-600);
		border: 2px solid rgba(255, 255, 255, 0.2);
		border-radius: 8px;
		color: var(--text-color-inverse);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
		transition: all 0.2s ease;
		z-index: 1000;
		animation: slideUp 0.3s ease-out;
	}

	.footer-back-to-top:hover {
		background-color: var(--color-primary-700);
		transform: translateY(-4px);
		border-color: rgba(255, 255, 255, 0.3);
	}

	.footer-back-to-top:focus-visible {
		outline: 2px solid var(--color-accent-400);
		outline-offset: 2px;
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Bottom section */
	.footer-bottom {
		margin-top: 2rem;
		padding-top: 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}

	.footer-bottom-container {
		max-width: 1400px;
		margin: 0 auto;
		text-align: right;
	}

	.footer-copyright {
		margin: 0;
		opacity: 0.7;
		font-size: 0.85rem;
	}

	/* Responsividade */
	@media (min-width: 1024px) {
		.footer-logo {
			width: 200px;
		}
	}

	@media (max-width: 1023px) {
		.footer {
			padding: 2.5rem 1.5rem 1.5rem;
		}

		.footer-brand {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.footer-logo {
			width: 150px;
		}
	}

	@media (max-width: 768px) {
		.footer {
			padding: 2rem 1rem 1.5rem;
		}

		.footer-brand {
			gap: 1rem;
		}

		.footer-logo {
			width: 130px;
		}

		.footer-description {
			font-size: 0.9rem;
		}

		.footer-email {
			font-size: 0.85rem;
		}

		.footer-back-to-top {
			bottom: 1.5rem;
			right: 1.5rem;
			width: 44px;
			height: 44px;
		}
	}

	@media (max-width: 480px) {
		.footer {
			padding: 1.5rem 1rem;
		}

		.footer-logo {
			width: 110px;
		}

		.footer-description {
			font-size: 0.85rem;
		}
	}

	/* Dark theme adjustments */
	[data-theme="dark"] .footer {
		background-color: var(--color-neutral-900);
	}

	[data-theme="dark"] .footer-bottom {
		border-top-color: var(--color-neutral-800);
	}

	[data-theme="dark"] .footer-back-to-top {
		background-color: var(--color-neutral-800);
		border-color: var(--color-neutral-700);
	}

	[data-theme="dark"] .footer-back-to-top:hover {
		background-color: var(--color-neutral-700);
	}

	/* Animações */
	.footer {
		animation: fadeIn 0.6s ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}
</style>