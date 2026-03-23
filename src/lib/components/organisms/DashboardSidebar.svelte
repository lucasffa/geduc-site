<!-- src/lib/components/organisms/DashboardSidebar.svelte -->
<script lang="ts">
	import BrandHeader from '$lib/components/molecules/BrandHeader.svelte';
	import UserAvatar from '$lib/components/molecules/UserAvatar.svelte';
	import { page } from '$app/stores';
	import { sidebarOpen, closeSidebar } from '$lib/stores/dashboard';

	export let brandName = 'GEDUC';
	export let logoUrl: string | null = null;
	export let userName = '';
	export let userRole = '';
	export let permissions = {};
	export let isSysadmin = false;

	/** @typedef {{ href: string; label: string; icon: string; flag?: string }} NavLink */

	/** @type {NavLink[]} */
	$: links = [
		{ href: '/dashboard', label: 'Visão Geral', icon: 'grid', flag: 'canViewDashboard' },
		{ href: '/dashboard/participantes', label: 'Participantes', icon: 'users', flag: 'canViewDashboard' },
		{ href: '/dashboard/certificados', label: 'Certificados', icon: 'file-text', flag: 'canViewDashboard' },
		{ href: '/dashboard/usuarios', label: 'Usuários', icon: 'user-plus', flag: 'canManageUsers' },
		{ href: '/dashboard/workgroups', label: 'Grupos de Trabalho', icon: 'briefcase', flag: 'canManageWorkgroups' },
		{ href: '/dashboard/configuracoes', label: 'Configurações', icon: 'settings', flag: 'canManageOrganization' },
		{ href: '/dashboard/audit-log', label: 'Auditoria', icon: 'shield', flag: 'canViewAuditLog' }
	].filter(link => !link.flag || permissions[link.flag]);
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
{#if $sidebarOpen}
	<div class="sidebar-overlay" on:click={closeSidebar} on:keydown={closeSidebar}></div>
{/if}
<aside class="sidebar" class:open={$sidebarOpen}>
	<div class="sidebar-header">
		<BrandHeader {brandName} {logoUrl} size="md" />
		<span class="sidebar-subtitle">Painel de Gestão</span>
	</div>

	<nav class="sidebar-nav">
		{#each links as link}
			<a
				href={link.href}
				class="sidebar-link"
				class:active={$page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href) && link.href !== '/dashboard')}
				on:click={closeSidebar}
			>
				{link.label}
			</a>
		{/each}
	</nav>

	<div class="sidebar-footer">
		<UserAvatar name={userName} role={userRole} size="sm" />
		{#if isSysadmin}
			<a href="/sysadmin" class="sidebar-back">Painel Sysadmin</a>
		{/if}
		<a href="/" class="sidebar-back">← Voltar ao site</a>
		<form method="POST" action="/auth/logout" class="sidebar-logout-form">
			<button type="submit" class="sidebar-back">Sair</button>
		</form>
	</div>
</aside>

<style>
	.sidebar {
		width: 260px;
		background: linear-gradient(180deg, var(--color-primary-900) 0%, var(--color-primary-800) 100%);
		color: var(--color-neutral-0);
		display: flex;
		flex-direction: column;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		z-index: 100;
		transform: translateX(0);
		transition: transform var(--transition-normal);
		overflow-y: auto;
	}

	.sidebar-overlay {
		display: none;
	}

	.sidebar-header {
		padding: var(--spacing-xl) var(--spacing-lg);
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
	}

	.sidebar-subtitle {
		display: block;
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.6);
		margin-top: var(--spacing-xxs);
	}

	.sidebar-nav {
		flex: 1;
		padding: var(--spacing-md) 0;
		overflow-y: auto;
	}

	.sidebar-link {
		display: flex;
		align-items: center;
		padding: var(--spacing-sm) var(--spacing-lg);
		color: rgba(255, 255, 255, 0.7);
		text-decoration: none;
		font-size: var(--font-size-sm);
		transition: all var(--transition-fast);
		border-left: 3px solid transparent;
	}

	.sidebar-link:hover {
		color: var(--color-neutral-0);
		background: rgba(255, 255, 255, 0.08);
	}

	.sidebar-link.active {
		color: var(--color-neutral-0);
		background: rgba(255, 255, 255, 0.12);
		border-left-color: var(--color-secondary-500);
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
		color: var(--color-neutral-0);
	}

	.sidebar-back {
		font-size: var(--font-size-xs);
		color: rgba(255, 255, 255, 0.5);
		text-decoration: none;
	}

	.sidebar-back:hover {
		color: var(--color-neutral-0);
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
