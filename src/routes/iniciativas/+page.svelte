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
					'Eventos voltados a estimular criatividade, raciocínio lógico e trabalho em equipe por meio de atividades práticas.',
				illustration: '#',
				illustrationAlt: 'Workshops educacionais'
			},
			{
				id: 'programa-olimpico',
				title: 'Programa Olímpico',
				description:
					'Projeto de alto impacto que oferece suporte na preparação para olimpíadas acadêmicas.',
				illustration: '#',
				illustrationAlt: 'Programa Olímpico'
			},
			{
				id: 'feira-de-atividades',
				title: 'Feira de Atividades',
				description:
					'Evento pensado para alunos explorarem novas paixões e descobrirem projetos educacionais.',
				illustration: '#',
				illustrationAlt: 'Feira de atividades educacionais'
			}
		]
	};
</script>

<OurInitiatives sectionTitle={initiatives.title} initiatives={initiatives.initiatives} />
