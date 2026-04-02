<!-- src/lib/components/organisms/SysadminSidebar.svelte -->
<script lang="ts">
	import UserAvatar from '$lib/components/molecules/UserAvatar.svelte';
	import { page } from '$app/stores';
	import { sidebarOpen, closeSidebar } from '$lib/stores/sysadmin';

	export let userName = '';
	export let userRole = 'Sysadmin';

	$: links = [
		{ href: '/sysadmin', label: 'Visao Geral' },
		{ href: '/sysadmin/organizations', label: 'Organizacoes' },
		{ href: '/sysadmin/users', label: 'Usuarios' },
		{ href: '/sysadmin/audit-log', label: 'Auditoria Global' }
	];
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if $sidebarOpen}
	<div class="sidebar-overlay" on:click={closeSidebar} on:keydown={closeSidebar}></div>
{/if}
<aside class="sidebar" class:open={$sidebarOpen}>
	<div class="sidebar-header">
		<h2>GEDUC</h2>
		<span class="sidebar-subtitle">Painel Sysadmin</span>
	</div>

	<nav class="sidebar-nav">
		{#each links as link}
			<a
				href={link.href}
				class="sidebar-link"
				class:active={$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/sysadmin')}
				on:click={closeSidebar}
			>
				{link.label}
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<UserAvatar name={userName} role={userRole} size="sm" />
		<a href="/dashboard" class="sidebar-back">← Dashboard</a>
		<form method="POST" action="/auth/logout" class="sidebar-logout-form">
			<button type="submit" class="sidebar-back">Sair</button>
		</form>
	</div>
</aside>

<style>
	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
		color: #fff;
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		overflow-y: auto;
		transition: transform var(--transition-normal);
	}

	.sidebar-overlay {
		display: none;
	}

	.sidebar-header {
		padding: var(--spacing-xl) var(--spacing-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-header h2 {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		letter-spacing: var(--letter-spacing-wide);
		margin: 0;
	}

	.sidebar-subtitle {
		display: block;
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		margin-top: var(--spacing-xxs);
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--spacing-md) 0;
		overflow-y: auto;
	}

	.sidebar-link {
		display: block;
		padding: var(--spacing-sm) var(--spacing-lg);
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: var(--font-size-sm);
		border-left: 3px solid transparent;
		transition: all var(--transition-fast);
	}

	.sidebar-link:hover {
		color: #fff;
		background: rgba(255, 255, 255, 0.08);
	}

	.sidebar-link.active {
		color: #fff;
		background: rgba(255, 255, 255, 0.12);
		border-left-color: #e74c3c;
		font-weight: var(--font-weight-medium);
	}

	.sidebar-footer {
		padding: var(--spacing-md) var(--spacing-lg);
		border-top: 1px solid rgba(255, 255, 255, 0.1);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.sidebar-footer :global(.avatar-name),
	.sidebar-footer :global(.badge) {
		color: rgba(255, 255, 255, 0.8);
	}

	.sidebar-footer :global(.avatar-circle) {
		background: rgba(255, 255, 255, 0.15);
		color: #fff;
	}

	.sidebar-back {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		text-decoration: none;
	}

	.sidebar-back:hover {
		color: #fff;
	}

	.sidebar-logout-form {
		margin: 0;
	}

	.sidebar-logout-form button {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	@media (max-width: 768px) {
		.sidebar {
			transform: translateX(-100%);
		}
		.sidebar.open {
			transform: translateX(0);
		}
		.sidebar-overlay {
			display: block;
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background: rgba(0, 0, 0, 0.5);
			z-index: 99;
		}
	}
</style>
