<script lang="ts">
	import type { PageData } from './$types';
	import OurInitiatives from '$lib/components/organisms/OurInitiatives.svelte';

	const initiatives = {
		title: 'Nossas iniciativas',
		initiatives: [
			{
				id: 'mentoria-lala',
				title: 'Mentoria LALA',
				description:
					'Nossa mentoria para a Latin America Leadership Academy (LALA) ajuda a contar sua história com impacto! Com apoio individual, aulas estratégicas e uma rede que acredita no seu potencial, preparamos jovens de todo o Brasil para se destacarem no processo seletivo.',
				illustration: 'images/illustrations/banderias-lala.png',
				illustrationAlt: 'Mentoria LALA'
			},
			{
				id: 'workshops',
				title: 'Workshops',
				description:
					'Espaços abertos e acessíveis para quem quer refletir, aprender e trocar ideias. A cada encontro, trazemos temas que ampliam a visão sobre a educação e o mundo, incentivando o pensamento crítico e o protagonismo juvenil, porque aprender também é dialogar.',
				illustration: 'images/illustrations/engrenagens.png',
				illustrationAlt: 'Workshops educacionais'
			},
			{
				id: 'programa-olimpico',
				title: 'Programa Olímpico',
				description:
					'Por meio de aulas gravadas, oferecemos suporte nas  matérias cobradas pelas olimpíadas acadêmicas do Brasil. Queremos democratizar o acesso ao conhecimento e mostrar que todes podem brilhar nesse universo, independentemente da região em que estudam.',
				illustration: 'images/illustrations/medalhas.png',
				illustrationAlt: 'Programa Olímpico'
			},
			{
				id: 'feira-de-atividades',
				title: 'Feira de Atividades',
				description:
					'Evento pensado para quem quer explorar novas paixões, descobrir projetos inspiradores e encontrar oportunidades além da escola. Tudo isso em um só lugar e totalmente online! Participe, conheça iniciativas de todo o Brasil e mergulhe no universo das atividades extracurriculares.',
				illustration: 'images/illustrations/atividades.png',
				illustrationAlt: 'Feira de atividades educacionais'
			}
		]
	};
</script>

<OurInitiatives sectionTitle={initiatives.title} initiatives={initiatives.initiatives} />
