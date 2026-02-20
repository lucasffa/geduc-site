<!-- src/routes/sobre/+page.svelte -->
<script lang="ts">
	import { OurTeam } from '$lib/components';
	import OurHistory from '$lib/components/organisms/OurHistory.svelte';
	import type { TimelineItemData } from '$lib/types/data';

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
</script>

<OurHistory
	title="Nossa História"
	subtitle="Uma jornada de crescimento"
	titleColor="primary"
	align="center"
	{history}
/>
title="Nossa História" titleColor="primary"
{history}
/>

<OurTeam />
