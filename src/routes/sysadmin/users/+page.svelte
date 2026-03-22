<script>
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { ROLE_LABELS, ROLES } from '$lib/constants/roles';
	import { addToast } from '$lib/stores/dashboard';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let search = '';
	let filterRole = '';
	let filterOrg = '';
	let showEditModal = false;
	let editUser = null;
	let editRole = '';
	let editOrgId = '';

	$: filtered = data.users.filter(u => {
		const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
		const matchRole = !filterRole || u.role === filterRole;
		const matchOrg = !filterOrg || u.organizationId === filterOrg;
		return matchSearch && matchRole && matchOrg;
	});

	function openEdit(user) {
		editUser = user;
		editRole = user.role;
		editOrgId = user.organizationId || '';
		showEditModal = true;
	}

	async function saveEdit() {
		if (!editUser) return;
		try {
			const res = await fetch(`/sysadmin/api/users/${editUser.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					role: editRole,
					organizationId: editOrgId || null
				})
			});
			if (res.ok) {
				addToast('Usuário atualizado!', 'success');
				showEditModal = false;
				invalidateAll();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro', 'error');
			}
		} catch {
			addToast('Erro ao atualizar', 'error');
		}
	}

	async function toggleActive(user) {
		try {
			const res = await fetch(`/sysadmin/api/users/${user.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !user.isActive })
			});
			if (res.ok) {
				addToast(`Usuário ${user.isActive ? 'desativado' : 'ativado'}`, 'success');
				invalidateAll();
			}
		} catch {
			addToast('Erro', 'error');
		}
	}

	async function deleteUser(user) {
		if (!confirm(`Excluir "${user.name}"? (soft delete)`)) return;
		try {
			const res = await fetch(`/sysadmin/api/users/${user.id}`, { method: 'DELETE' });
			if (res.ok) {
				addToast('Usuário removido', 'success');
				invalidateAll();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro', 'error');
			}
		} catch {
			addToast('Erro ao excluir', 'error');
		}
	}
</script>

<svelte:head>
	<title>Usuários | Sysadmin</title>
</svelte:head>

<div class="page-header">
	<div>
		<h1>Usuários do Sistema</h1>
		<p>{data.users.length} usuário(s) no total</p>
	</div>
</div>

<div class="filters">
	<input class="form-control filter-search" placeholder="Buscar por nome ou e-mail..." bind:value={search} />
	<select class="form-control filter-select" bind:value={filterRole}>
		<option value="">Todos os cargos</option>
		{#each ROLES as role}
			<option value={role}>{ROLE_LABELS[role]}</option>
		{/each}
	</select>
	<select class="form-control filter-select" bind:value={filterOrg}>
		<option value="">Todas as orgs</option>
		{#each data.organizations as org}
			<option value={org.id}>{org.name}</option>
		{/each}
	</select>
</div>

<div class="table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				<th>Nome</th>
				<th>E-mail</th>
				<th>Cargo</th>
				<th>Organização</th>
				<th>Status</th>
				<th>Último Login</th>
				<th>Ações</th>
			</tr>
		</thead>
		<tbody>
			{#each filtered as user}
				<tr>
					<td class="td-name">{user.name}</td>
					<td>{user.email}</td>
					<td><Badge variant="role" text={ROLE_LABELS[user.role] || user.role} size="sm" /></td>
					<td>{user.orgName || '—'}</td>
					<td>
						<Badge
							variant={user.isActive ? 'success' : 'error'}
							text={user.isActive ? 'Ativo' : 'Inativo'}
							size="sm"
						/>
					</td>
					<td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}</td>
					<td>
						<div class="actions">
							<button class="btn btn-sm btn-outline" on:click={() => openEdit(user)}>Editar</button>
							<button class="btn btn-sm btn-outline" on:click={() => toggleActive(user)}>
								{user.isActive ? 'Desativar' : 'Ativar'}
							</button>
							<button class="btn btn-sm btn-danger" on:click={() => deleteUser(user)}>Excluir</button>
						</div>
					</td>
				</tr>
			{:else}
				<tr><td colspan="7" class="empty">Nenhum usuário encontrado</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Edit Modal -->
{#if showEditModal && editUser}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => { showEditModal = false; }} on:keydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" on:click|stopPropagation on:keydown|stopPropagation>
			<div class="modal-header"><h3>Editar "{editUser.name}"</h3><button class="modal-close" on:click={() => { showEditModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-group">
					<label for="edit-role">Cargo</label>
					<select id="edit-role" class="form-control" bind:value={editRole}>
						{#each ROLES as role}
							<option value={role}>{ROLE_LABELS[role]}</option>
						{/each}
					</select>
				</div>
				<div class="form-group">
					<label for="edit-org">Organização</label>
					<select id="edit-org" class="form-control" bind:value={editOrgId}>
						<option value="">Nenhuma</option>
						{#each data.organizations as org}
							<option value={org.id}>{org.name}</option>
						{/each}
					</select>
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => { showEditModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" on:click={saveEdit}>Salvar</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header { margin-bottom: var(--spacing-lg); }
	.page-header h1 { font-size: var(--font-size-2xl); color: var(--color-primary-900); margin: 0; }
	.page-header p { color: var(--text-color-subtle); font-size: var(--font-size-sm); margin-top: var(--spacing-xxs); }

	.filters { display: flex; gap: var(--spacing-sm); margin-bottom: var(--spacing-lg); flex-wrap: wrap; }
	.filter-search { flex: 1; min-width: 200px; }
	.filter-select { min-width: 160px; }

	.table-wrapper { background: var(--color-neutral-0); border-radius: var(--border-radius-lg); box-shadow: var(--shadow-sm); overflow-x: auto; }
	.data-table { width: 100%; border-collapse: collapse; }
	.data-table th { padding: var(--spacing-sm) var(--spacing-md); text-align: left; font-size: var(--font-size-xs); color: var(--text-color-subtle); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-neutral-200); }
	.data-table td { padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); border-bottom: 1px solid var(--color-neutral-100); }
	.td-name { font-weight: var(--font-weight-medium); }
	.empty { text-align: center; color: var(--text-color-subtle); padding: var(--spacing-2xl) !important; }
	.actions { display: flex; gap: var(--spacing-xs); }

	.btn { display: inline-flex; align-items: center; padding: var(--spacing-xs) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); cursor: pointer; border: none; transition: all var(--transition-fast); }
	.btn-primary { background: var(--color-primary-600); color: #fff; }
	.btn-primary:hover { background: var(--color-primary-700); }
	.btn-secondary { background: var(--color-neutral-200); color: var(--text-color-default); }
	.btn-sm { padding: 4px 8px; font-size: var(--font-size-xs); }
	.btn-outline { background: transparent; border: 1px solid var(--color-neutral-300); color: var(--text-color-default); }
	.btn-outline:hover { background: var(--color-neutral-100); }
	.btn-danger { background: var(--color-error); color: #fff; }
	.btn-danger:hover { opacity: 0.9; }

	.form-control { width: 100%; padding: var(--spacing-sm); border: 1px solid var(--color-neutral-300); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); }

	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
	.modal { background: var(--color-neutral-0); border-radius: var(--border-radius-xl); width: 90%; max-width: 500px; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--color-neutral-200); }
	.modal-header h3 { margin: 0; font-size: var(--font-size-lg); }
	.modal-close { background: none; border: none; font-size: var(--font-size-lg); cursor: pointer; color: var(--text-color-subtle); }
	.modal-body { padding: var(--spacing-lg); }
	.modal-footer { padding: var(--spacing-md) var(--spacing-lg); border-top: 1px solid var(--color-neutral-200); display: flex; justify-content: flex-end; gap: var(--spacing-sm); }
	.form-group { margin-bottom: var(--spacing-md); }
	.form-group label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xxs); }
</style>
