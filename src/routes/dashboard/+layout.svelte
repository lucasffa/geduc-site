<script>
	import './dashboard.css';
	let { children } = $props();

	let sidebarOpen = $state(false);
	let currentPath = $state('');

	function toggleSidebar() {
		sidebarOpen = !sidebarOpen;
	}

	function closeSidebar() {
		sidebarOpen = false;
	}
</script>

<div class="dashboard-layout">
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<aside class="dashboard-sidebar" class:open={sidebarOpen} onclick={closeSidebar} onkeydown={closeSidebar}>
		<div class="sidebar-logo">
			<h2>GEDUC</h2>
			<span>Painel de Gestão</span>
		</div>

		<nav class="sidebar-nav">
			<a href="/dashboard" class:active={currentPath === '/dashboard'}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
				</svg>
				Visão Geral
			</a>
			<a href="/dashboard/participantes" class:active={currentPath?.includes('/participantes')}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
				</svg>
				Participantes
			</a>
			<a href="/dashboard/certificados" class:active={currentPath?.includes('/certificados')}>
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
				</svg>
				Certificados
			</a>
		</nav>

		<div class="sidebar-footer">
			<a href="/">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16">
					<path d="M15 18l-6-6 6-6"/>
				</svg>
				Voltar ao site
			</a>
		</div>
	</aside>

	<main class="dashboard-main">
		<button class="mobile-menu-btn" onclick={toggleSidebar} aria-label="Menu">
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
				<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
			</svg>
		</button>
		{@render children()}
	</main>
</div>
