<script>
	import { page } from '$app/stores';
	import ToastContainer from '$lib/components/molecules/ToastContainer.svelte';
	import UserAvatar from '$lib/components/molecules/UserAvatar.svelte';

	export let data;

	$: links = [
		{ href: '/sysadmin', label: 'Visão Geral' },
		{ href: '/sysadmin/organizations', label: 'Organizações' },
		{ href: '/sysadmin/users', label: 'Usuários' },
		{ href: '/sysadmin/audit-log', label: 'Auditoria Global' }
	];
</script>

<div class="sysadmin-layout">
	<aside class="sysadmin-sidebar">
		<div class="sysadmin-sidebar-header">
			<h2>GEDUC</h2>
			<span>Painel Sysadmin</span>
		</div>

		<nav class="sysadmin-nav">
			{#each links as link}
				<a
					href={link.href}
					class="sysadmin-nav-link"
					class:active={$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/sysadmin')}
				>
					{link.label}
				</a>
			{/each}
		</nav>

		<div class="sysadmin-sidebar-footer">
			<UserAvatar name={data.user?.name || ''} role="Sysadmin" size="sm" />
			<a href="/dashboard" class="sysadmin-back">← Dashboard</a>
			<form method="POST" action="/auth/logout">
				<button type="submit" class="sysadmin-logout">Sair</button>
			</form>
		</div>
	</aside>

	<div class="sysadmin-content">
		<main class="sysadmin-main">
			<slot />
		</main>
	</div>

	<ToastContainer />
</div>

<style>
	.sysadmin-layout {
		display: flex;
		min-height: 100vh;
	}

	.sysadmin-sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
		color: #fff;
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
	}

	.sysadmin-sidebar-header {
		padding: var(--spacing-xl) var(--spacing-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sysadmin-sidebar-header h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
	}

	.sysadmin-sidebar-header span {
		display: block;
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		margin-top: var(--spacing-xxs);
	}

	.sysadmin-nav {
		flex: 1;
		padding: var(--spacing-md) 0;
	}

	.sysadmin-nav-link {
		display: block;
		padding: var(--spacing-sm) var(--spacing-lg);
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: var(--font-size-sm);
		border-left: 3px solid transparent;
		transition: all var(--transition-fast);
	}

	.sysadmin-nav-link:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.08);
	}

	.sysadmin-nav-link.active {
		color: #fff;
		background: rgba(255, 255, 255, 0.12);
		border-left-color: #e74c3c;
		font-weight: var(--font-weight-medium);
	}

	.sysadmin-sidebar-footer {
		padding: var(--spacing-md) var(--spacing-lg);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.sysadmin-sidebar-footer :global(.avatar-name),
	.sysadmin-sidebar-footer :global(.badge) {
		color: rgba(255, 255, 255, 0.8);
	}

	.sysadmin-sidebar-footer :global(.avatar-circle) {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
	}

	.sysadmin-back {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		text-decoration: none;
	}

	.sysadmin-back:hover { color: #fff; }

	.sysadmin-logout {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		text-align: left;
	}

	.sysadmin-logout:hover { color: #e74c3c; }

	.sysadmin-content {
		flex: 1;
		margin-left: 260px;
	}

	.sysadmin-main {
		padding: var(--spacing-xl);
		background: var(--color-neutral-50);
		min-height: 100vh;
	}

	@media (max-width: 768px) {
		.sysadmin-sidebar { display: none; }
		.sysadmin-content { margin-left: 0; }
	}
</style>
