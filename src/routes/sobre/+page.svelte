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
			description: 'lorem ipsum dolor sit amet, consectetur adipiscing elit. lorem ipsum dolor sit amet, consectetur adipiscing elit.lorem ipsum dolor sit amet, consectetur adipiscing elit.',
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
		},
	];
</script>

<OurHistory title="Nossa História" titleColor="primary" {history} />

<Partners {partners} />

<OurTeam />
