<!-- src/lib/components/organisms/OurTeam.svelte -->
<script lang="ts">
	import type { TeamMember } from '$lib/types/data';
	import type { SectionHeaderProps, OurTeamProps } from '$lib/types/components';
	import type { TeamDepartment } from '$lib/types/enums';
	import SectionHeader from '../molecules/SectionHeader.svelte';
	import TeamMemberCard from '../molecules/TeamMemberCard.svelte';
	import Text from '../atoms/Text.svelte';

	export let title: OurTeamProps['title'] = ' ';
	export let titleColor: OurTeamProps['titleColor'] = 'primary';
	export let subtitle: OurTeamProps['subtitle'] = undefined;
	export let members: OurTeamProps['members'] = [];
	export let departments: OurTeamProps['departments'] = [
		{ value: 'todos', label: 'Todos' },
		{ value: 'administrativo' as TeamDepartment, label: 'Administrativo' },
		{ value: 'marketing' as TeamDepartment, label: 'Marketing' },
		{ value: 'tecnologia' as TeamDepartment, label: 'Tecnologia' },
		{ value: 'design' as TeamDepartment, label: 'Design' },
		{ value: 'eventos' as TeamDepartment, label: 'Eventos' },
		{ value: 'projetos' as TeamDepartment, label: 'Projetos' }
	];

	// Filtro ativo
	let activeFilter: TeamDepartment | 'todos' = 'todos';

	// Membros filtrados
	$: filteredMembers =
		activeFilter === 'todos' ? members : members.filter((m) => m.department === activeFilter);

	function setFilter(value: TeamDepartment | 'todos') {
		activeFilter = value;
	}
</script>

<section class="our-team">
	<div class="container">
		{#if title}
			<SectionHeader
				{title}
				{titleColor}
				align="center"
				decorativeLetter={true}
				decoration={true}
				decorationColor="var(--color-yellow-600)"
				decorationPosition="bottom"
			/>
		{/if}

		{#if subtitle}
			<div class="our-team-subtitle">
				<Text as="p" size="md" color="neutral" align="center">
					{subtitle}
				</Text>
			</div>
		{/if}

		<!-- Filtros por departamento -->
		{#if departments && departments.length > 0}
			<div class="department-filters">
				{#each departments as dept}
					<button
						class="filter-tab"
						class:active={activeFilter === dept.value}
						on:click={() => setFilter(dept.value)}
						type="button"
					>
						{dept.label}
					</button>
				{/each}
			</div>
		{/if}

		<!-- Grid de membros -->
		<div class="team-grid">
			{#each filteredMembers as member (member.id)}
				<TeamMemberCard {member} />
			{/each}
		</div>
	</div>

	<!-- Decoração diagonal amarela no fundo -->
	<div class="yellow-decoration" aria-hidden="true"></div>
</section>

<style>
	.our-team {
		position: relative;
		padding: var(--spacing-4xl, 4rem) 0;
		overflow: hidden;
	}

	.container {
		position: relative;
		z-index: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xl, 1.5rem);
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 var(--spacing-lg, 1rem);
	}

	/* Subtítulo */
	.our-team-subtitle {
		max-width: 700px;
		text-align: center;
	}

	/* Filtros de departamento */
	.department-filters {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--spacing-sm, 0.5rem);
	}

	.filter-tab {
		padding: var(--spacing-xs, 0.25rem) var(--spacing-lg, 1rem);
		border: 2px solid transparent;
		border-radius: var(--border-radius-full, 999px);
		background: transparent;
		color: var(--text-color-secondary, #555);
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: var(--font-weight-medium, 500);
		cursor: pointer;
		transition: all var(--transition-fast, 0.15s) var(--transition-timing-default, ease);
		white-space: nowrap;
	}

	.filter-tab:hover {
		color: var(--color-primary-600, #2b4acb);
		border-color: var(--color-primary-200, #c2cff5);
	}

	.filter-tab.active {
		background: var(--color-primary-700, #1e3aac);
		color: var(--color-neutral-0, #fff);
		border-color: var(--color-primary-700, #1e3aac);
		font-weight: var(--font-weight-bold, 700);
	}

	/* Grid de cards */
	.team-grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: var(--spacing-xl, 1.5rem);
		width: 100%;
	}

	/* Decoração diagonal amarela */
	.yellow-decoration {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 100%;
		height: 40%;
		background: var(--color-yellow-600, #e6a817);
		clip-path: polygon(100% 30%, 100% 100%, 0% 100%);
		z-index: 0;
	}

	/* Responsividade */
	@media (max-width: 1024px) {
		.team-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	@media (max-width: 768px) {
		.team-grid {
			grid-template-columns: repeat(2, 1fr);
			gap: var(--spacing-lg, 1rem);
		}

		.our-team {
			padding: var(--spacing-3xl, 3rem) 0;
		}
	}

	@media (max-width: 480px) {
		.team-grid {
			grid-template-columns: 1fr;
			max-width: 300px;
			margin: 0 auto;
		}

		.department-filters {
			gap: var(--spacing-xs, 0.25rem);
		}

		.filter-tab {
			font-size: var(--font-size-xs, 0.75rem);
			padding: var(--spacing-xs, 0.25rem) var(--spacing-md, 0.75rem);
		}
	}
</style>
