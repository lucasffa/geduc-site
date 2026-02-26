<!-- src/routes/sobre/+page.svelte -->
<script lang="ts">
	import { OurTeam } from '$lib/components';
	import OurHistory from '$lib/components/organisms/OurHistory.svelte';
	import Partners from '$lib/components/organisms/Partners.svelte';
	import type { Partner, TimelineItemData } from '$lib/types/data';

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
		id: '1',
		name: 'Parceiro 1',
		logo: '/images/partners/partner1.png',
		category: 'educational',
		featured: true
	},
	{
		id: '2',
		name: 'Parceiro 2',
		logo: '/images/partners/partner2.png',
		category: 'nonprofit',
		featured: true
	},
	{
		id: '3',
		name: 'Parceiro 3',
		logo: '/images/partners/partner3.png',
		category: 'sponsor',
		featured: false
	},
	{
		id: '4',
		name: 'Parceiro 4',
		logo: '/images/partners/partner4.png',
		category: 'government',
		featured: false
	}
];
	
</script>

<OurHistory title="Nossa História" titleColor="primary" {history} />

<Partners {partners} />

<OurTeam />
