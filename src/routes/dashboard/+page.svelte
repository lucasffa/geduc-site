<script lang="ts">
	import { onMount } from 'svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';
	import type { ParticipantStatus } from '$lib/constants/participant-status';
	import type { StatsData } from '$lib/types/dashboard';

	let stats: StatsData | null = $state(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await fetch('/dashboard/api/stats');
			if (res.ok) {
				stats = await res.json();
			}
		} catch (e) {
			console.error('Erro ao carregar estatísticas:', e);
		} finally {
			loading = false;
		}
	});

	function formatDate(dateStr: string | null): string {
		if (!dateStr) return '';
		return new Date(dateStr).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Dashboard | GEDUC</title>
</svelte:head>

<div class="dashboard-header">
	<h1>Visão Geral</h1>
</div>

{#if loading}
	<div class="loading-overlay">
		<div class="loading-spinner"></div>
	</div>
{:else if stats}
	<div class="stats-grid">
		<div class="stat-card" style="--card-accent: var(--color-primary-600)">
			<div class="stat-label">Total de Participantes</div>
			<div class="stat-value">{stats.total}</div>
		</div>

		{#each Object.entries(stats.byStatus) as [status, count]}
			<div class="stat-card" style="--card-accent: var(--color-blue-500)">
				<div class="stat-label">{STATUS_LABELS[status as ParticipantStatus] || status}</div>
				<div class="stat-value">{count}</div>
			</div>
		{/each}

		<div class="stat-card" style="--card-accent: var(--color-green-600)">
			<div class="stat-label">Certificados Gerados</div>
			<div class="stat-value">{stats.certificates.total}</div>
		</div>

		<div class="stat-card" style="--card-accent: var(--color-green-800)">
			<div class="stat-label">Certificados Enviados</div>
			<div class="stat-value">{stats.certificates.sent}</div>
		</div>
	</div>

	<!-- Distribuição por Cargo -->
	{#if Object.keys(stats.byRole).length > 0}
		<div class="data-table-wrapper" style="margin-bottom: var(--spacing-2xl)">
			<div class="table-toolbar">
				<h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-primary-900);">Distribuição por Cargo</h3>
			</div>
			<table class="data-table">
				<thead>
					<tr>
						<th>Cargo</th>
						<th>Quantidade</th>
						<th>Proporção</th>
					</tr>
				</thead>
				<tbody>
					{#each Object.entries(stats.byRole) as [role, count]}
						<tr>
							<td style="text-transform: capitalize; font-weight: var(--font-weight-medium);">{role}</td>
							<td>{count}</td>
							<td>
								<div style="display: flex; align-items: center; gap: var(--spacing-sm);">
									<div style="flex: 1; max-width: 200px; height: 8px; background: var(--color-neutral-200); border-radius: var(--border-radius-full); overflow: hidden;">
										<div style="height: 100%; width: {stats.total > 0 ? (count / stats.total * 100) : 0}%; background: var(--color-primary-600); border-radius: var(--border-radius-full); transition: width var(--transition-normal);"></div>
									</div>
									<span style="font-size: var(--font-size-xs); color: var(--text-color-subtle);">
										{stats.total > 0 ? Math.round(count / stats.total * 100) : 0}%
									</span>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Atividade Recente -->
	<div class="data-table-wrapper">
		<div class="table-toolbar">
			<h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-primary-900);">Atividade Recente</h3>
		</div>
		{#if stats.recentActivity && stats.recentActivity.length > 0}
			<div style="padding: var(--spacing-lg);">
				<div class="timeline">
					{#each stats.recentActivity as activity}
						<div class="timeline-item">
							<div class="timeline-date">{formatDate(activity.changedAt)}</div>
							<div class="timeline-content">
								<strong>{activity.participantName || 'Participante'}</strong>
								{#if activity.fromStatus}
									mudou de <span class="status-badge status-badge--{activity.fromStatus}">{STATUS_LABELS[activity.fromStatus as ParticipantStatus] || activity.fromStatus}</span>
									para
								{:else}
									registrado como
								{/if}
								<span class="status-badge status-badge--{activity.toStatus}">{STATUS_LABELS[activity.toStatus as ParticipantStatus] || activity.toStatus}</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else}
			<div class="empty-state">
				<h3>Nenhuma atividade recente</h3>
				<p>As mudanças de status dos participantes aparecerão aqui.</p>
			</div>
		{/if}
	</div>
{:else}
	<div class="empty-state">
		<h3>Bem-vindo ao Dashboard GEDUC</h3>
		<p>Comece importando uma planilha na seção de Participantes.</p>
	</div>
{/if}
