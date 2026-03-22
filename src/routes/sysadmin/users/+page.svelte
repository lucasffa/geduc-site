<script>
	import { ROLE_LABELS, ROLES } from '$lib/constants/roles';
	import { addToast } from '$lib/stores/dashboard';
	import { invalidateAll } from '$app/navigation';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import UserFilters from '$lib/components/organisms/sysadmin/UserFilters.svelte';
	import UserTable from '$lib/components/organisms/sysadmin/UserTable.svelte';
	import UserEditModal from '$lib/components/organisms/sysadmin/UserEditModal.svelte';

	export let data;

	let search = '';
	let filterRole = '';
	let filterOrg = '';
	let showEditModal = false;
	let editUser = null;

	$: filtered = data.users.filter(u => {
		const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
		const matchRole = !filterRole || u.role === filterRole;
		const matchOrg = !filterOrg || u.organizationId === filterOrg;
		return matchSearch && matchRole && matchOrg;
	});

	function openEdit(user) {
		editUser = user;
		showEditModal = true;
	}

	function closeEdit() {
		showEditModal = false;
		editUser = null;
	}

	async function saveEdit(e) {
		if (!editUser) return;
		const { role, organizationId } = e.detail;
		try {
			const res = await fetch(`/sysadmin/api/users/${editUser.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					role,
					organizationId: organizationId || null
				})
			});
			if (res.ok) {
				addToast('Usuário atualizado!', 'success');
				closeEdit();
				invalidateAll();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro', 'error');
			}
		} catch {
			addToast('Erro ao atualizar', 'error');
		}
	}

	async function toggleActive(e) {
		const user = e.detail;
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

	async function deleteUser(e) {
		const user = e.detail;
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

<PageHeader title="Usuários do Sistema" subtitle="{data.users.length} usuário(s) no total" />

<UserFilters
	{search}
	roles={ROLES}
	roleLabels={ROLE_LABELS}
	organizations={data.organizations}
	{filterRole}
	{filterOrg}
	on:search={(e) => { search = e.detail; }}
	on:filterRole={(e) => { filterRole = e.detail; }}
	on:filterOrg={(e) => { filterOrg = e.detail; }}
/>

<UserTable
	users={filtered}
	on:edit={(e) => openEdit(e.detail)}
	on:toggle={toggleActive}
	on:delete={deleteUser}
/>

<UserEditModal
	isOpen={showEditModal}
	user={editUser}
	organizations={data.organizations}
	roles={ROLES}
	roleLabels={ROLE_LABELS}
	on:close={closeEdit}
	on:save={saveEdit}
/>
