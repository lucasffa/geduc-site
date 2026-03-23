<!-- src/lib/components/organisms/sysadmin/SysadminOverview.svelte -->
<script lang="ts">
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import SimpleStatCard from '$lib/components/molecules/SimpleStatCard.svelte';
	import QuickLinkCard from '$lib/components/molecules/QuickLinkCard.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { ROLE_LABELS } from '$lib/constants/roles';

	export let stats;
</script>

<PageHeader title="Painel Sysadmin" subtitle="Visão geral do sistema" />

<div class="stats-grid">
	<SimpleStatCard value={stats.organizations} label="Organizações" />
	<SimpleStatCard value={stats.totalUsers} label="Usuários Total" variant="info" />
	<SimpleStatCard value={stats.activeUsers} label="Usuários Ativos" variant="success" />
	<SimpleStatCard value={stats.auditEntries} label="Entradas no Log" variant="warning" />
</div>

<div class="section">
	<h2>Usuários por Cargo</h2>
	<div class="role-grid">
		{#each Object.entries(stats.usersByRole) as [role, roleCount]}
			<div class="role-item">
				<Badge variant="role" text={ROLE_LABELS[role] || role} />
				<span class="role-count">{roleCount}</span>
			</div>
		{/each}
	</div>
</div>

<div class="quick-links">
	<h2>Ações Rápidas</h2>
	<div class="links-grid">
		<QuickLinkCard
			href="/sysadmin/organizations"
			title="Gerenciar Organizações"
			description="Criar, editar e desativar organizações"
		/>
		<QuickLinkCard
			href="/sysadmin/users"
			title="Gerenciar Usuários"
			description="Ver todos os usuários do sistema"
		/>
		<QuickLinkCard
			href="/sysadmin/audit-log"
			title="Log de Auditoria"
			description="Histórico global de ações"
		/>
	</div>
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.section {
		margin-bottom: var(--spacing-2xl);
	}

	.section h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
		color: var(--color-primary-900);
	}

	.role-grid {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-md);
	}

	.role-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		background: var(--color-neutral-0);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
	}

	.role-count {
		font-weight: var(--font-weight-semibold);
		font-size: var(--font-size-lg);
	}

	.quick-links h2 {
		font-size: var(--font-size-lg);
		margin-bottom: var(--spacing-md);
		color: var(--color-primary-900);
	}

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}
</style>
