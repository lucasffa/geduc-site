<!-- src/lib/components/organisms/sysadmin/UserEditModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let user = null;
	export let organizations = [];
	export let roles = [];
	export let roleLabels = {};

	const dispatch = createEventDispatcher();

	let editRole = '';
	let editOrgId = '';

	$: if (user) {
		editRole = user.role;
		editOrgId = user.organizationId || '';
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		dispatch('save', { role: editRole, organizationId: editOrgId });
	}

	$: isSysadmin = user?.role === 'sysadmin';
	$: modalTitle = user ? `Editar "${user.name}"` : 'Editar Usuário';
</script>

<Modal {isOpen} onClose={handleClose} title={modalTitle}>
	<FormField label="Cargo" id="edit-role">
		<select id="edit-role" class="form-control" bind:value={editRole} disabled={isSysadmin}>
			{#each roles.filter(r => r !== 'sysadmin') as role}
				<option value={role}>{roleLabels[role]}</option>
			{/each}
			{#if isSysadmin}
				<option value="sysadmin">{roleLabels['sysadmin']}</option>
			{/if}
		</select>
	</FormField>

	<FormField label="Organização" id="edit-org">
		<select id="edit-org" class="form-control" bind:value={editOrgId}>
			<option value="">Nenhuma</option>
			{#each organizations as org}
				<option value={org.id}>{org.name}</option>
			{/each}
		</select>
	</FormField>

	<svelte:fragment slot="footer">
		<Button variant="secondary" onclick={handleClose}>Cancelar</Button>
		<Button variant="primary" onclick={handleSave}>Salvar</Button>
	</svelte:fragment>
</Modal>

<style>
	.form-control {
		width: 100%;
		padding: var(--spacing-sm);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
	}
</style>
