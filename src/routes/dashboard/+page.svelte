<script>
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

	<div class="stats-grid">
		<div class="stat-card">
			<span class="stat-value">{stats.total}</span>
			<span class="stat-label">Total de Participantes</span>
		</div>
		<div class="stat-card stat-card-info">
			<span class="stat-value">{stats.certificates.total}</span>
			<span class="stat-label">Certificados Gerados</span>
		</div>
		<div class="stat-card stat-card-success">
			<span class="stat-value">{stats.certificates.sent}</span>
			<span class="stat-label">Certificados Enviados</span>
		</div>
		<div class="stat-card stat-card-warning">
			<span class="stat-value">{stats.certificates.total - stats.certificates.sent}</span>
			<span class="stat-label">Certificados Pendentes</span>
		</div>
	</div>

	<div class="dashboard-sections">
		<PermissionGate allowed={permissions.canViewStats}>
			<section class="dashboard-section">
				<h2 class="section-title">Por Status</h2>
				<div class="status-grid">
					{#each Object.entries(stats.byStatus) as [status, statusCount]}
						<div class="status-item">
							<span class="status-count">{statusCount}</span>
							<span class="status-name">{STATUS_LABELS[status] || status}</span>
						</div>
					{/each}
				</div>
			</section>

			<section class="dashboard-section">
				<h2 class="section-title">Por Cargo</h2>
				<div class="status-grid">
					{#each Object.entries(stats.byRole) as [role, roleCount]}
						<div class="status-item">
							<span class="status-count">{roleCount}</span>
							<span class="status-name">{role}</span>
						</div>
					{/each}
				</div>
			</section>
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

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
	}

	.stat-card {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		border: 1px solid var(--color-neutral-200);
		border-top: 3px solid var(--color-primary-500);
	}

	.stat-card-info {
		border-top-color: var(--color-blue-500);
	}

	.stat-card-success {
		border-top-color: var(--color-green-500);
	}

	.stat-card-warning {
		border-top-color: var(--color-yellow-500);
	}

	.stat-value {
		display: block;
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-neutral-900);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
		margin-top: var(--spacing-xxs);
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

	.status-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
		gap: var(--spacing-sm);
	}

	.status-item {
		padding: var(--spacing-sm);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
		text-align: center;
	}

	.status-count {
		display: block;
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
	}

	.status-name {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-600);
	}
</style>
