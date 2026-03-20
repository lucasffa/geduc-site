<!-- src/routes/sobre/+page.svelte -->
<script lang="ts">
	import { OurTeam } from '$lib/components';
	import HeroSection from '$lib/components/organisms/HeroSection.svelte';
	import OurHistory from '$lib/components/organisms/OurHistory.svelte';
	import Partners from '$lib/components/organisms/Partners.svelte';
	import type { Partner, TimelineItemData, TeamMember } from '$lib/types/data';
	import { TeamDepartment, SocialPlatform } from '$lib/types/enums';

	const history: TimelineItemData[] = [
		{
			year: '2018',
			title: 'Fundação',
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			image: '#'
		},
		{
			year: '2020',
			title: 'Expansão',
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			image: '#'
		},
		{
			year: '2024',
			title: 'Modernização',
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			image: '#'
		},
		{
			year: '2025',
			title: 'Inovação',
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			image: '#'
		},
		{
			year: '2026',
			title: 'Inovação',
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit.',
			image: '#'
		}
	];

	const partners: Partner[] = [
		{
			id: '0',
			name: 'crimson',
			logo: '/images/partners/crimson.png',
			category: 'educational',
			featured: false
		},
		{
			id: '1',
			name: 'aspire',
			logo: '/images/partners/aspire.png',
			category: 'educational',
			featured: false
		},
		{
			id: '2',
			name: 'education usa',
			logo: '/images/partners/education usa.png',
			category: 'educational',
			featured: false
		},
		{
			id: '3',
			name: 'estado rj',
			logo: '/images/partners/estado rj.png',
			category: 'educational',
			featured: false
		},
		{
			id: '4',
			name: 'inspira sonho',
			logo: '/images/partners/inspira sonho.png',
			category: 'educational',
			featured: false
		},
		{
			id: '5',
			name: 'lala',
			logo: '/images/partners/lala.png',
			category: 'educational',
			featured: false
		},
		{
			id: '6',
			name: 'prolider',
			logo: '/images/partners/prolider.png',
			category: 'educational',
			featured: false
		},
		{
			id: '7',
			name: 'rise',
			logo: '/images/partners/rise.png',
			category: 'educational',
			featured: false
		}
	];

	const teamMembers: TeamMember[] = [
		{
			id: '1',
			name: 'Lizandra Souza',
			position: 'Gestão de Projetos e Marketing',
			department: TeamDepartment.PROJETOS,
			avatar: '/images/team/liza.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/lizandra-souza',
					label: 'LinkedIn'
				}
			],
			featured: true,
			joinDate: '2022-01-01'
		},
		{
			id: '2',
			name: 'Julia Meireles',
			position: 'Diretora de Estratégia e Marketing',
			department: TeamDepartment.MARKETING,
			avatar: '/images/team/julia.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/julia-meireles',
					label: 'LinkedIn'
				}
			],
			featured: true,
			joinDate: '2021-06-01'
		},
		{
			id: '3',
			name: 'Gabriela Saito',
			position: 'Gestão de Projetos e Design',
			department: TeamDepartment.DESIGN,
			avatar: '/images/team/gabi.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/gabriela-saito',
					label: 'LinkedIn'
				}
			],
			featured: true,
			joinDate: '2022-03-01'
		},
		{
			id: '4',
			name: 'Lucas Sobrenome',
			position: 'Diretor de Tecnologia',
			department: TeamDepartment.TECNOLOGIA,
			avatar: '/images/team/lucas.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/lucas',
					label: 'LinkedIn'
				}
			],
			featured: true,
			joinDate: '2020-01-01'
		},
		{
			id: '5',
			name: 'Lizandra Souza',
			position: 'Gestão de Projetos e Marketing',
			department: TeamDepartment.PROJETOS,
			avatar: '/images/team/liza.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/lizandra-souza',
					label: 'LinkedIn'
				}
			],
			featured: false,
			joinDate: '2022-01-01'
		},
		{
			id: '6',
			name: 'Julia Meireles',
			position: 'Diretora de Estratégia e Marketing',
			department: TeamDepartment.MARKETING,
			avatar: '/images/team/julia.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/julia-meireles',
					label: 'LinkedIn'
				}
			],
			featured: false,
			joinDate: '2021-06-01'
		},
		{
			id: '7',
			name: 'Gabriela Saito',
			position: 'Gestão de Projetos e Design',
			department: TeamDepartment.DESIGN,
			avatar: '/images/team/gabi.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/gabriela-saito',
					label: 'LinkedIn'
				}
			],
			featured: false,
			joinDate: '2022-03-01'
		},
		{
			id: '8',
			name: 'Lucas Sobrenome',
			position: 'Diretor de Tecnologia',
			department: TeamDepartment.TECNOLOGIA,
			avatar: '/images/team/lucas.png',
			socialLinks: [
				{
					platform: SocialPlatform.LINKEDIN,
					url: 'https://linkedin.com/in/lucas',
					label: 'LinkedIn'
				}
			],
			featured: false,
			joinDate: '2020-01-01'
		}
	];
</script>

<HeroSection
	variant="about"
	title="Missão, visão e valores"
	visionTitle="Nossa vissão"
	visionText="Por meio das nossas iniciativas, queremos transformar a educação para formar seres humanos, respeitando todas as cores, sexualidades, gêneros e etnias."
	teamImage="/images/team/HeroImage.png"
	missionText="Humanizar a educação, oferecendo aos jovens experiências que vão além da escola para que se apaixonem pelo aprendizado e descubram um mundo de possibilidades!"
	valuesText="Acreditamos no poder da empatia, amor e experiência. São esses os pilares que nos guiam e tornam a educação capaz de transformar vidas verdadeiramente."
/>

<OurHistory title="Nossa História" titleColor="primary" {history} />

<Partners {partners} />

<OurTeam
	title="Conheça o nosso"
	titleColor="primary"
	subtitle="As mentes por trás do nosso impacto, o time de jovens que fazem o Geduca acontecer."
	members={teamMembers}
/>
