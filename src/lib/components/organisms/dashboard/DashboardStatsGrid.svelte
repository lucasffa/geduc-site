<!-- src/lib/components/organisms/dashboard/DashboardStatsGrid.svelte -->
<script lang="ts">
	import SimpleStatCard from '$lib/components/molecules/SimpleStatCard.svelte';

	export let stats: {
		total: number;
		certificates: {
			total: number;
			sent: number;
		};
	};

	$: pending = stats.certificates.total - stats.certificates.sent;
</script>

<div class="stats-grid">
	<SimpleStatCard value={stats.total} label="Total de Participantes" variant="default" />
	<SimpleStatCard value={stats.certificates.total} label="Certificados Gerados" variant="info" />
	<SimpleStatCard value={stats.certificates.sent} label="Certificados Enviados" variant="success" />
	<SimpleStatCard value={pending} label="Certificados Pendentes" variant="warning" />
</div>

<style>
	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-xl);
	}
</style>
