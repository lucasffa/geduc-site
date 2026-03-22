<script>
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { ROLE_LABELS } from '$lib/constants/roles';

	export let data;

	$: stats = data.stats;
</script>

<svelte:head>
	<title>Sysadmin | GEDUC</title>
</svelte:head>

<div class="page-header">
	<h1>Painel Sysadmin</h1>
	<p>Visão geral do sistema</p>
</div>

<div class="stats-grid">
	<div class="stat-card">
		<div class="stat-value">{stats.organizations}</div>
		<div class="stat-label">Organizações</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{stats.totalUsers}</div>
		<div class="stat-label">Usuários Total</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{stats.activeUsers}</div>
		<div class="stat-label">Usuários Ativos</div>
	</div>
	<div class="stat-card">
		<div class="stat-value">{stats.auditEntries}</div>
		<div class="stat-label">Entradas no Log</div>
	</div>
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
		<a href="/sysadmin/organizations" class="quick-link">
			<strong>Gerenciar Organizações</strong>
			<span>Criar, editar e desativar organizações</span>
		</a>
		<a href="/sysadmin/users" class="quick-link">
			<strong>Gerenciar Usuários</strong>
			<span>Ver todos os usuários do sistema</span>
		</a>
		<a href="/sysadmin/audit-log" class="quick-link">
			<strong>Log de Auditoria</strong>
			<span>Histórico global de ações</span>
		</a>
	</div>
</div>

<style>
	.page-header { margin-bottom: var(--spacing-xl); }
	.page-header h1 { font-size: var(--font-size-2xl); color: var(--color-primary-900); margin: 0; }
	.page-header p { color: var(--text-color-subtle); font-size: var(--font-size-sm); margin-top: var(--spacing-xxs); }

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-2xl);
	}

	.stat-card {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		box-shadow: var(--shadow-sm);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary-700);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
		margin-top: var(--spacing-xxs);
	}

	.section { margin-bottom: var(--spacing-2xl); }
	.section h2 { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); color: var(--color-primary-900); }

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

	.role-count { font-weight: var(--font-weight-semibold); font-size: var(--font-size-lg); }

	.quick-links h2 { font-size: var(--font-size-lg); margin-bottom: var(--spacing-md); color: var(--color-primary-900); }

	.links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-md);
	}

	.quick-link {
		display: block;
		background: var(--color-neutral-0);
		padding: var(--spacing-lg);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		text-decoration: none;
		color: inherit;
		transition: box-shadow var(--transition-fast);
		border-left: 3px solid var(--color-primary-500);
	}

	.quick-link:hover { box-shadow: var(--shadow-md); }
	.quick-link strong { display: block; color: var(--color-primary-800); margin-bottom: var(--spacing-xxs); }
	.quick-link span { font-size: var(--font-size-sm); color: var(--text-color-subtle); }
</style>
