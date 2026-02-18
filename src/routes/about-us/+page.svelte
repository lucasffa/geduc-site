<!-- src/routes/about-us/+page.svelte -->
<script lang="ts">
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
		titleColor="primary"
		align="center"
		{history}
	/>

