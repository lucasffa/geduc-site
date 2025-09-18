// src/routes/+page.ts
import type { PageLoad } from './$types';
import type { HomePageProps } from '$lib/types/components';

export const load: PageLoad = async ({ fetch, params }) => {
	try {
		// Dados podem vir de APIs, CMS, arquivos JSON, etc.
		// Aqui estamos simulando carregamento de dados

		const pageData: HomePageProps = {
			hero: {
				title: 'Guardiões da Educação: Transformando Vidas Através do Conhecimento',
				subtitle: 'Projeto Educacional Nacional',
				description:
					'Somos um projeto educacional dedicado a democratizar o acesso ao ensino superior de qualidade, conectando estudantes a oportunidades transformadoras em todo o Brasil.',
				actions: [
					{
						label: 'Saiba Mais',
						href: '/sobre',
						variant: 'primary'
					},
					{
						label: 'Assista o Vídeo',
						href: '/video',
						variant: 'outline'
					}
				],
				media: {
					type: 'illustration',
					src: '/images/hero-illustration.svg',
					alt: 'Ilustração representando educação e conhecimento'
				},
				background: {
					type: 'gradient',
					value:
						'linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-secondary-50) 50%, var(--color-accent-50) 100%)'
				},
				layout: 'split',
				size: 'xl',
				decorative: true
			},

			ourImpact: {
				title: 'Nosso Impacto',
				titleColor: 'primary',
				impactText:
					'Nosso projeto já alcançou mais de **100 cidades** em **20 estados brasileiros**, impactando diretamente **25 mil pessoas** e conectando uma rede de mais de 30 voluntários comprometidos com a transformação.\nDe Manaus a Porto Alegre, somos prova viva de que a Educação, quando é humana e acessível, rompe fronteiras, une realidades e cria futuros.\nConfira os estados brasileiros impactados pelas nossas iniciativas no mapa ao lado!!',
				background: 'gradient' as const,
				layout: 'split-2-1' as const
			},

			stats: {
				title: 'Estatísticas',
				stats: [
					{
						value: '100+',
						label: 'Cidades alcançadas',
						description: 'Presença nacional expandindo oportunidades educacionais',
						icon: {
							name: 'map-pin',
							color: 'primary'
						},
						color: 'primary'
					},
					{
						value: '30+',
						label: 'Voluntários especializados',
						description: 'Educadores dedicados de todo o Brasil',
						icon: {
							name: 'users',
							color: 'secondary'
						},
						color: 'secondary'
					},
					{
						value: '750k+',
						label: 'Pessoas impactadas',
						description: 'Vidas transformadas através da educação',
						icon: {
							name: 'heart',
							color: 'accent'
						},
						color: 'accent'
					},
					{
						value: '25k+',
						label: 'Estudantes beneficiados',
						description: 'Jovens com acesso a oportunidades únicas',
						icon: {
							name: 'graduation-cap',
							color: 'success'
						},
						color: 'success'
					}
				],
				layout: 'grid',
				columns: 4,
				background: 'gradient',
				animated: true
			},

			about: {
				title: 'Sobre Nós',
				titleColor: 'neutral',
				description:
					'Fundado em 2020, nascemos como uma proposta **alternativa à educação formal**: uma resposta ao distanciamento escolar, à rotina engessada e à falta de engajamento dos estudantes. Começamos com a ideia de oferecer atividades diferentes que estimulassem o **pensamento crítico, a empatia e o prazer de aprender nos alunos**.',
				media: {
					src: '/images/illustrations/about-education.svg',
					alt: 'Ilustração sobre educação e conhecimento',
					aspectRatio: 'auto',
					objectFit: 'fill',
					loading: 'lazy'
				},
				actions: [
					{
						label: 'Saiba Mais',
						href: '/sobre',
						variant: 'secondary',
						size: 'lg'
					}
				],
				background: 'accent',
				layout: 'split'
			},

			initiatives: {
				title: 'Nossas Iniciativas',
				description:
					'Programas inovadores e abrangentes que conectam jovens talentos brasileiros às melhores oportunidades educacionais do país.',
				initiatives: [
					{
						id: 'mentoria-oportunidades',
						title: 'Mentoria de Oportunidades',
						description:
							'Preparação especializada para vestibulares e processos seletivos das melhores universidades brasileiras.',
						href: '/iniciativas/mentoria',
						featured: true
					},
					{
						id: 'clube-classicos',
						title: 'Clube dos Clássicos',
						description:
							'Discussões literárias e filosóficas profundas para ampliar horizontes culturais e desenvolvimento crítico.',
						href: '/iniciativas/clube-classicos',
						featured: false
					},
					{
						id: 'workshop-soft-skills',
						title: 'Workshop de Soft Skills',
						description:
							'Desenvolvimento de habilidades interpessoais e competências profissionais essenciais para o século XXI.',
						href: '/iniciativas/soft-skills',
						featured: false
					},
					{
						id: 'programa-intercambio',
						title: 'Programa de Intercâmbio',
						description:
							'Oportunidades internacionais exclusivas para ampliar perspectivas globais e vivências multiculturais.',
						href: '/iniciativas/intercambio',
						featured: false
					}
				],
				layout: 'grid',
				columns: 4,
				filterable: false
			},

			testimonials: {
				title: 'Depoimentos',
				description:
					'Histórias reais de transformação e sucesso de estudantes que tiveram suas vidas mudadas através dos nossos programas.',
				testimonials: [
					{
						id: 'testimonial-gabriela',
						quote:
							'O programa mudou completamente minha perspectiva sobre educação e possibilidades. Através das mentorias especializadas, consegui ingressar na universidade dos meus sonhos e desenvolver habilidades que nunca imaginei possuir. A rede de apoio é incomparável.',
						author: {
							name: 'Gabriela Saito Pereira',
							title: 'Estudante de Ciências Atuariais',
							avatar: '/images/testimonials/gabriela-saito.jpg',
							company: 'UFRJ - Universidade Federal do Rio de Janeiro'
						},
						rating: 5,
						featured: true,
						date: '2023-11-15'
					},
					{
						id: 'testimonial-marcus',
						quote:
							'A experiência foi transformadora. Os voluntários realmente se importam com nosso crescimento pessoal e profissional. Além do suporte acadêmico, encontrei uma comunidade que me inspirou a sonhar mais alto.',
						author: {
							name: 'Marcus Silva Santos',
							title: 'Estudante de Engenharia Mecânica',
							avatar: '/images/testimonials/marcus-silva.jpg',
							company: 'USP - Universidade de São Paulo'
						},
						rating: 5,
						featured: false,
						date: '2023-10-22'
					},
					{
						id: 'testimonial-ana',
						quote:
							'Graças ao GEDUC, consegui não apenas uma vaga na universidade, mas também uma bolsa de estudos integral. O programa me deu ferramentas para vida toda.',
						author: {
							name: 'Ana Carolina Lima',
							title: 'Estudante de Medicina',
							avatar: '/images/testimonials/ana-carolina.jpg',
							company: 'UNIFESP - Universidade Federal de São Paulo'
						},
						rating: 5,
						featured: false,
						date: '2023-09-10'
					}
				],
				layout: 'grid',
				columns: 2,
				autoplay: false,
				autoplayInterval: 5000,
				navigation: true,
				indicators: true
			},

			meta: {
				title: 'Guardiões da Educação - Transformando Vidas Através do Conhecimento',
				description:
					'Projeto educacional nacional dedicado a democratizar o acesso ao ensino de qualidade, conectando estudantes brasileiros a oportunidades transformadoras.',
				keywords: [
					'educação',
					'ensino superior',
					'mentoria educacional',
					'vestibular',
					'oportunidades estudantis',
					'educação Brasil',
					'projetos sociais',
					'transformação social',
					'acesso universitário',
					'desenvolvimento estudantil'
				],
				image: '/images/og-image-geduc.jpg'
			}
		};

		return {
			pageData,
			// Dados adicionais que podem ser necessários
			timestamp: new Date().toISOString(),
			version: '1.0.0'
		};
	} catch (error) {
		console.error('Erro ao carregar dados da página:', error);

		// Fallback com dados mínimos em caso de erro
		return {
			pageData: {
				hero: {
					title: 'Guardiões da Educação',
					description: 'Transformando vidas através do conhecimento.',
					actions: [],
					layout: 'centered' as const,
					size: 'lg' as const
				},
				ourImpact: {
					title: 'Nosso Impacto',
					titleColor: 'primary' as const,
					impactText: 'Transformando vidas através da educação.',
					background: 'none' as const,
					layout: 'default' as const
				},
				stats: {
					stats: [],
					layout: 'grid' as const,
					columns: 4 as const
				},
				about: {
					title: 'Sobre Nós',
					description: 'Construindo pontes através da educação.',
					actions: []
				},
				initiatives: {
					initiatives: [],
					layout: 'grid' as const,
					columns: 4 as const
				},
				testimonials: {
					testimonials: [],
					layout: 'grid' as const,
					columns: 2 as const
				},
				meta: {
					title: 'Guardiões da Educação',
					description: 'Transformando vidas através do conhecimento.'
				}
			},
			error: 'Dados não puderam ser carregados completamente',
			timestamp: new Date().toISOString(),
			version: '1.0.0'
		};
	}
};

// Pré-renderização estática para melhor performance
export const prerender = true;

// Cache da página
export const csr = true;
