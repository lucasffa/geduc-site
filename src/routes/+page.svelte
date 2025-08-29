<!-- src/routes/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';
	import HomePage from '$lib/components/templates/HomePage.svelte';
	import Navigation from '$lib/components/organisms/Navigation.svelte';
	import HeroSection from '$lib/components/organisms/HeroSection.svelte';
	import StatsSection from '$lib/components/organisms/StatsSection.svelte';
	import OurImpact from '$lib/components/organisms/OurImpact.svelte';
	import InitiativesSection from '$lib/components/organisms/InitiativesSection.svelte';
	import TestimonialsSection from '$lib/components/organisms/TestimonialsSection.svelte';
	import Footer from '$lib/components/organisms/Footer.svelte';
import AboutUs from '$lib/components/organisms/AboutUs.svelte';
import SectionHeader from '$lib/components/molecules/SectionHeader.svelte';
import Text from '$lib/components/atoms/Text.svelte';
import Button from '$lib/components/atoms/Button.svelte';
import Image from '$lib/components/atoms/Image.svelte';

	export let data: PageData;

	// Dados da navegação
	const navigationData = {
		items: [
			{ label: 'Home', href: '/', active: true },
			{ label: 'Sobre nós', href: '/sobre' },
			{ label: 'Iniciativas', href: '/iniciativas' },
			{ label: 'Summer Camp', href: '/summer-camp' },
			{ label: 'Contato', href: '/contato' }
		],
		logo: {
			src: '/images/logo.svg',
			alt: 'Logo Guardiões da Educação',
			href: '/'
		},
		cta: {
			label: 'Participar',
			href: '/participar',
			variant: 'primary' as const
		}
	};

	// Dados do footer
	const footerData = {
		logo: {
			src: '/images/logo.svg',
			alt: 'Logo Guardiões da Educação',
			href: '/'
		},
		description:
			'GEDUC é a maior ONG educacional do Brasil, dedicada a democratizar o acesso ao ensino de qualidade.',
		contact: {
			email: 'contato.geducbr@gmail.com',
			phone: '+55 (11) 9999-9999',
			address: 'São Paulo, Brasil'
		},
		social: [
			{
				platform: 'facebook',
				url: 'https://facebook.com/geducbrasil',
				label: 'Facebook'
			},
			{
				platform: 'linkedin',
				url: 'https://linkedin.com/company/geduc',
				label: 'LinkedIn'
			},
			{
				platform: 'instagram',
				url: 'https://instagram.com/geducbrasil',
				label: 'Instagram'
			}
		],
		links: [
			{
				title: 'Programas',
				items: [
					{ label: 'Mentoria', href: '/mentoria' },
					{ label: 'Workshops', href: '/workshops' },
					{ label: 'Summer Camp', href: '/summer-camp' }
				]
			},
			{
				title: 'Sobre',
				items: [
					{ label: 'Nossa História', href: '/historia' },
					{ label: 'Equipe', href: '/equipe' },
					{ label: 'Missão', href: '/missao' }
				]
			},
			{
				title: 'Suporte',
				items: [
					{ label: 'FAQ', href: '/faq' },
					{ label: 'Contato', href: '/contato' },
					{ label: 'Ajuda', href: '/ajuda' }
				]
			}
		],
		newsletter: {
			title: 'Newsletter',
			description: 'Receba novidades e oportunidades diretamente no seu email.',
			placeholder: 'Seu melhor email',
			onSubmit: (email: string) => {
				console.log('Newsletter signup:', email);
				// Implementar lógica de inscrição
			}
		},
		copyright: '© 2024 GEDUC Brasil. Todos os direitos reservados.',
		backToTop: true,
		variant: 'detailed' as const
	};

	// Handlers de eventos
	function handleNavigationClick(event: CustomEvent) {
		console.log('Navigation clicked:', event.detail);
	}

	function handleHeroAction(event: CustomEvent) {
		console.log('Hero action:', event.detail);
	}

	function handleInitiativeClick(event: CustomEvent) {
		console.log('Initiative clicked:', event.detail);
	}

	function handleTestimonialClick(event: CustomEvent) {
		console.log('Testimonial clicked:', event.detail);
	}

	function handleFooterAction(event: CustomEvent) {
		console.log('Footer action:', event.detail);
	}
</script>

<HomePage
	showNavigation={true}
	showFooter={true}
	padding={true}
	maxWidth="xl"
	gradientBackground={false}
	animated={true}
	className="geduc-home-page"
	on:navigationClick={handleNavigationClick}
	on:heroAction={handleHeroAction}
	on:initiativeClick={handleInitiativeClick}
	on:testimonialClick={handleTestimonialClick}
	on:footerAction={handleFooterAction}
>
	<!-- Meta tags -->
	<svelte:fragment slot="head">
		<title>{data.pageData.meta.title}</title>
		<meta name="description" content={data.pageData.meta.description} />
		<meta
			name="keywords"
			content={'keywords' in data.pageData.meta && data.pageData.meta.keywords
				? data.pageData.meta.keywords.join(', ')
				: ''}
		/>
		<meta property="og:title" content={data.pageData.meta.title} />
		<meta property="og:description" content={data.pageData.meta.description} />
		<meta
			property="og:image"
			content={'image' in data.pageData.meta ? data.pageData.meta.image || '' : ''}
		/>
		<meta property="og:url" content="https://geducbrasil.org" />
		<meta name="twitter:card" content="summary_large_image" />
		<link rel="canonical" href="https://geducbrasil.org" />
	</svelte:fragment>

	<!-- Navegação -->
	<svelte:fragment slot="navigation" let:dispatch>
		<Navigation
			items={navigationData.items}
			logo={navigationData.logo}
			cta={navigationData.cta}
			variant="transparent"
			sticky={true}
			mobileMenu={true}
			on:click={(e) =>
				dispatch('navigationClick', {
					href: e.detail.href,
					label: e.detail.label
				})}
		/>
	</svelte:fragment>

	<!-- Hero Section -->
	<svelte:fragment slot="hero" let:dispatch>
		<HeroSection
			title={data.pageData.hero.title}
			subtitle={'subtitle' in data.pageData.hero ? data.pageData.hero.subtitle : undefined}
			description={data.pageData.hero.description}
			actions={data.pageData.hero.actions}
			media={'media' in data.pageData.hero ? data.pageData.hero.media : undefined}
			background={'background' in data.pageData.hero ? data.pageData.hero.background : undefined}
			layout={data.pageData.hero.layout}
			size={data.pageData.hero.size}
			decorative={'decorative' in data.pageData.hero ? data.pageData.hero.decorative : false}
			on:action={(e) =>
				dispatch('heroAction', {
					action: e.detail.action,
					href: e.detail.href
				})}
		/>
	</svelte:fragment>

	<!-- Our Impact Section -->
	<svelte:fragment slot="ourImpact" let:dispatch>
		<OurImpact
			title="Nosso Impacto"
			impactText="Nosso projeto já alcançou mais de 100 cidades em 20 estados brasileiros, impactando diretamente 25 mil pessoas e conectando uma rede de mais de 30 voluntários comprometidos com a transformação.
De Manaus a Porto Alegre, somos prova viva de que a Educação, quando é humana e acessível, rompe fronteiras, une realidades e cria futuros.
Confira os estados brasileiros impactados pelas nossas iniciativas no mapa ao lado!"
			background="gradient"
			layout="default"
		/>
	</svelte:fragment>

	<!-- Stats Section -->
	<svelte:fragment slot="stats" let:dispatch>
		<StatsSection
			stats={data.pageData.stats.stats}
			layout={data.pageData.stats.layout}
			columns={data.pageData.stats.columns}
			background="none"
			animated={'animated' in data.pageData.stats ? data.pageData.stats.animated : false}
		/>
	</svelte:fragment>

	<!-- About Section -->
	<svelte:fragment slot="about" let:dispatch>
		<AboutUs
			title={data.pageData.about.title}
			description={data.pageData.about.description}
			media={'media' in data.pageData.about && data.pageData.about.media ? {
				src: data.pageData.about.media.src,
				alt: data.pageData.about.media.alt,
				aspectRatio: data.pageData.about.media.aspectRatio,
				objectFit: (['cover', 'contain', 'fill'].includes(data.pageData.about.media.objectFit || '')) 
					? data.pageData.about.media.objectFit as 'cover' | 'contain' | 'fill'
					: 'contain',
				loading: data.pageData.about.media.loading
			} : undefined}
			actions={data.pageData.about.actions || []}
			layout="default"
			orientation="horizontal"
			background="none"
			id="about-section"
			on:actionClick
			on:sectionLoad
		/>
	</svelte:fragment>

	<!-- Initiatives Section -->
	<svelte:fragment slot="initiatives" let:dispatch>
		<InitiativesSection
			title={'title' in data.pageData.initiatives ? data.pageData.initiatives.title : undefined}
			description={'description' in data.pageData.initiatives
				? data.pageData.initiatives.description
				: undefined}
			initiatives={data.pageData.initiatives.initiatives}
			layout={data.pageData.initiatives.layout}
			columns={data.pageData.initiatives.columns}
			filterable={'filterable' in data.pageData.initiatives
				? data.pageData.initiatives.filterable
				: undefined}
			on:click={(e) =>
				dispatch('initiativeClick', {
					id: e.detail.id,
					title: e.detail.title
				})}
		/>
	</svelte:fragment>

	<!-- Testimonials Section -->
	<svelte:fragment slot="testimonials" let:dispatch>
		<TestimonialsSection
			title={'title' in data.pageData.testimonials ? data.pageData.testimonials.title : undefined}
			description={'description' in data.pageData.testimonials
				? data.pageData.testimonials.description
				: undefined}
			testimonials={data.pageData.testimonials.testimonials}
			layout={data.pageData.testimonials.layout}
			columns={data.pageData.testimonials.columns}
			autoplay={'autoplay' in data.pageData.testimonials
				? data.pageData.testimonials.autoplay
				: false}
			autoplayInterval={'autoplayInterval' in data.pageData.testimonials
				? data.pageData.testimonials.autoplayInterval
				: 5000}
			navigation={'navigation' in data.pageData.testimonials
				? data.pageData.testimonials.navigation
				: false}
			indicators={'indicators' in data.pageData.testimonials
				? data.pageData.testimonials.indicators
				: false}
			on:click={(e) =>
				dispatch('testimonialClick', {
					id: e.detail.id,
					author: e.detail.author
				})}
		/>
	</svelte:fragment>

	<!-- Footer -->
	<svelte:fragment slot="footer" let:dispatch>
		<Footer
			logo={footerData.logo}
			description={footerData.description}
			contact={footerData.contact}
			social={footerData.social}
			links={footerData.links}
			newsletter={footerData.newsletter}
			copyright={footerData.copyright}
			backToTop={footerData.backToTop}
			variant={footerData.variant}
			on:action={(e) =>
				dispatch('footerAction', {
					action: e.detail.action,
					href: e.detail.href
				})}
		/>
	</svelte:fragment>
</HomePage>

<style>


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
</style>
