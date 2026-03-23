<script lang="ts">
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import OrgTable from '$lib/components/organisms/sysadmin/OrgTable.svelte';
	import OrgFormModal from '$lib/components/organisms/sysadmin/OrgFormModal.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { invalidateAll } from '$app/navigation';

	export let data: any;

	let showCreateModal = false;
	let showEditModal = false;
	let editOrg: any = null;
	let creating = false;

	async function createOrg(e: CustomEvent) {
		const formData = e.detail;
		if (!formData.name || !formData.slug) return;
		creating = true;
		try {
			const res = await fetch('/sysadmin/api/organizations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`Organização "${formData.name}" criada!`, 'success');
				showCreateModal = false;
				invalidateAll();
			} else {
				addToast(result.error || 'Erro ao criar', 'error');
			}
		} catch {
			addToast('Erro ao criar organização', 'error');
		} finally {
			creating = false;
		}
	}

	function openEdit(e: CustomEvent) {
		editOrg = e.detail;
		showEditModal = true;
	}

	async function saveEdit(e: CustomEvent) {
		if (!editOrg) return;
		const formData = e.detail;
		try {
			const res = await fetch(`/sysadmin/api/organizations/${editOrg.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});
			if (res.ok) {
				addToast('Organização atualizada!', 'success');
				showEditModal = false;
				invalidateAll();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro ao atualizar', 'error');
			}
		} catch {
			addToast('Erro ao atualizar', 'error');
		}
	}

	async function toggleActive(e: CustomEvent) {
		const org = e.detail;
		try {
			const res = await fetch(`/sysadmin/api/organizations/${org.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !org.isActive })
			});
			if (res.ok) {
				addToast(`Organização ${org.isActive ? 'desativada' : 'ativada'}`, 'success');
				invalidateAll();
			}
		} catch {
			addToast('Erro ao alterar status', 'error');
		}
	}

	async function deleteOrg(e: CustomEvent) {
		const org = e.detail;
		if (!confirm(`Deseja realmente excluir "${org.name}"? Esta ação é um soft delete.`)) return;
		try {
			const res = await fetch(`/sysadmin/api/organizations/${org.id}`, { method: 'DELETE' });
			if (res.ok) {
				addToast(`"${org.name}" removida`, 'success');
				invalidateAll();
			}
		} catch {
			addToast('Erro ao excluir', 'error');
		}
	}
</script>

<svelte:head>
	<title>Organizações | Sysadmin</title>
</svelte:head>

<PageHeader title="Organizações" subtitle="{data.organizations.length} organização(ões) cadastrada(s)">
	<Button variant="primary" on:click={() => { showCreateModal = true; }}>Nova Organização</Button>
</PageHeader>

<OrgTable
	organizations={data.organizations}
	on:edit={openEdit}
	on:toggle={toggleActive}
	on:delete={deleteOrg}
/>

<OrgFormModal
	isOpen={showCreateModal}
	mode="create"
	saving={creating}
	on:close={() => { showCreateModal = false; }}
	on:save={createOrg}
/>

<OrgFormModal
	isOpen={showEditModal}
	mode="edit"
	org={editOrg}
	on:close={() => { showEditModal = false; }}
	on:save={saveEdit}
/>
