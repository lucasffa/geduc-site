<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import PendingInvites from '$lib/components/organisms/dashboard/PendingInvites.svelte';
	import InviteUserModal from '$lib/components/organisms/dashboard/InviteUserModal.svelte';
	import { ROLE_LABELS, INVITABLE_ROLES } from '$lib/constants/roles';
	import { addToast } from '$lib/stores/dashboard';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';

	export let data;

	$: orgUsers = data.users;
	$: pendingInvitations = data.invitations;

	let showInviteModal = false;
	let inviting = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'email', label: 'E-mail' },
		{ key: 'role', label: 'Função', width: '130px' },
		{ key: 'isActive', label: 'Ativo', width: '80px' },
		{ key: 'lastLoginAt', label: 'Último Login', width: '140px' }
	];

	async function handleInviteSave(event) {
		const { email, role } = event.detail;
		inviting = true;
		try {
			const res = await fetch('/dashboard/api/users/invite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, role, name: '' })
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar convite');
			addToast('Convite enviado com sucesso', 'success');
			showInviteModal = false;
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			inviting = false;
		}
	}

	async function toggleActive(userId, currentActive) {
		try {
			const res = await fetch(`/dashboard/api/users/${userId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !currentActive })
			});
			if (!res.ok) throw new Error('Erro');
			addToast(currentActive ? 'Usuário desativado' : 'Usuário ativado', 'success');
			goto($pageStore.url.toString(), { invalidateAll: true });
		} catch (err) {
			addToast(err.message, 'error');
		}
	}
</script>

<svelte:head>
	<title>Usuários — {data.brandName}</title>
</svelte:head>

<div class="usuarios-page">
	<PageHeader title="Usuários">
		<Button variant="primary" size="sm" onclick={() => showInviteModal = true}>
			+ Convidar Usuário
		</Button>
	</PageHeader>

	<PendingInvites invitations={pendingInvitations} roleLabels={ROLE_LABELS} />

	<DataTable
		{columns}
		data={orgUsers}
		searchable={false}
	>
		<svelte:fragment slot="cell" let:column let:value>
			{#if column === 'role'}
				<Badge text={ROLE_LABELS[value] || value} variant="role" />
			{:else if column === 'isActive'}
				<Badge text={value ? 'Ativo' : 'Inativo'} variant={value ? 'success' : 'error'} />
			{:else if column === 'lastLoginAt'}
				{value ? new Date(value).toLocaleString('pt-BR') : 'Nunca'}
			{:else}
				{value ?? '—'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<button
				class="action-btn"
				on:click={() => toggleActive(row.id, row.isActive)}
				title={row.isActive ? 'Desativar' : 'Ativar'}
			>
				{row.isActive ? '🔒' : '🔓'}
			</button>
		</svelte:fragment>
	</DataTable>
</div>

<InviteUserModal
	isOpen={showInviteModal}
	roles={INVITABLE_ROLES}
	roleLabels={ROLE_LABELS}
	saving={inviting}
	on:close={() => showInviteModal = false}
	on:save={handleInviteSave}
/>

<style>
	.usuarios-page { max-width: 1200px; }
	.action-btn { background: none; border: none; cursor: pointer; padding: 2px 4px; font-size: var(--font-size-sm); }
</style>
