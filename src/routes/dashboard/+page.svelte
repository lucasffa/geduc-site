<script>
	import DashboardStatsGrid from '$lib/components/organisms/dashboard/DashboardStatsGrid.svelte';
	import StatusBreakdown from '$lib/components/organisms/dashboard/StatusBreakdown.svelte';
	import TimelineView from '$lib/components/organisms/TimelineView.svelte';
	import PermissionGate from '$lib/components/molecules/PermissionGate.svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';

	export let data;

	$: stats = data.stats;
	$: permissions = data.permissions;
</script>

<svelte:head>
	<title>Dashboard — {data.brandName}</title>
</svelte:head>

<div class="dashboard-overview">
	<h1 class="page-title">Visão Geral</h1>

	<DashboardStatsGrid {stats} />

	<div class="dashboard-sections">
		<PermissionGate allowed={permissions.canViewStats}>
			<StatusBreakdown title="Por Status" items={stats.byStatus} labels={STATUS_LABELS} />
			<StatusBreakdown title="Por Cargo" items={stats.byRole} />
		</PermissionGate>

		<section class="dashboard-section">
			<h2 class="section-title">Atividade Recente</h2>
			<TimelineView entries={stats.recentActivity} />
		</section>
	</div>
</div>

<style>
	.dashboard-overview {
		max-width: 1200px;
	}

	.page-title {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-900);
		margin: 0 0 var(--spacing-xl);
	}

	.dashboard-sections {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.dashboard-section {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-neutral-200);
	}

	.section-title {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
		margin: 0 0 var(--spacing-md);
	}
</style>
