<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { ROLE_LABELS, INVITABLE_ROLES } from '$lib/constants/roles';
	import { addToast } from '$lib/stores/dashboard';
	import { goto } from '$app/navigation';
	import { page as pageStore } from '$app/stores';

	export let data;

	$: orgUsers = data.users;
	$: pendingInvitations = data.invitations;

	let showInviteModal = false;
	let inviteData = { email: '', role: 'volunteer', name: '' };
	let inviting = false;

	const columns = [
		{ key: 'name', label: 'Nome' },
		{ key: 'email', label: 'E-mail' },
		{ key: 'role', label: 'Função', width: '130px' },
		{ key: 'isActive', label: 'Ativo', width: '80px' },
		{ key: 'lastLoginAt', label: 'Último Login', width: '140px' }
	];

	async function sendInvite() {
		inviting = true;
		try {
			const res = await fetch('/dashboard/api/users/invite', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(inviteData)
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro ao enviar convite');
			addToast('Convite enviado com sucesso', 'success');
			showInviteModal = false;
			inviteData = { email: '', role: 'volunteer', name: '' };
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
	<div class="page-header">
		<h1 class="page-title">Usuários</h1>
		<Button variant="primary" size="sm" onclick={() => showInviteModal = true}>
			+ Convidar Usuário
		</Button>
	</div>

	{#if pendingInvitations.length > 0}
		<div class="pending-section">
			<h3>Convites Pendentes ({pendingInvitations.length})</h3>
			<div class="invites-list">
				{#each pendingInvitations as inv}
					<div class="invite-item">
						<span>{inv.email}</span>
						<Badge text={ROLE_LABELS[inv.role] || inv.role} variant="role" />
						<span class="invite-expires">Expira: {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}

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

<!-- Invite Modal -->
{#if showInviteModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => showInviteModal = false} on:keydown={() => showInviteModal = false}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-content" on:click|stopPropagation on:keydown|stopPropagation>
			<h2>Convidar Usuário</h2>
			<form on:submit|preventDefault={sendInvite}>
				<div class="form-group">
					<label for="inv-email">E-mail</label>
					<input id="inv-email" type="email" bind:value={inviteData.email} required />
				</div>
				<div class="form-group">
					<label for="inv-role">Função</label>
					<select id="inv-role" bind:value={inviteData.role}>
						{#each INVITABLE_ROLES as r}
							<option value={r}>{ROLE_LABELS[r]}</option>
						{/each}
					</select>
				</div>
				<div class="modal-actions">
					<Button variant="ghost" onclick={() => showInviteModal = false}>Cancelar</Button>
					<Button type="submit" variant="primary" loading={inviting}>Enviar Convite</Button>
				</div>
			</form>
		</div>
	</div>
{/if}

<style>
	.usuarios-page { max-width: 1200px; }
	.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--spacing-lg); }
	.page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-neutral-900); margin: 0; }
	.pending-section { background: var(--color-yellow-100); border-radius: var(--border-radius-lg); padding: var(--spacing-md); margin-bottom: var(--spacing-lg); }
	.pending-section h3 { margin: 0 0 var(--spacing-sm); font-size: var(--font-size-sm); color: var(--color-yellow-900); }
	.invites-list { display: flex; flex-direction: column; gap: var(--spacing-xs); }
	.invite-item { display: flex; align-items: center; gap: var(--spacing-sm); font-size: var(--font-size-sm); }
	.invite-expires { color: var(--color-neutral-500); font-size: var(--font-size-xs); }
	.action-btn { background: none; border: none; cursor: pointer; padding: 2px 4px; font-size: var(--font-size-sm); }
	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
	.modal-content { background: var(--color-neutral-0); border-radius: var(--border-radius-xl); padding: var(--spacing-xl); max-width: 500px; width: 90%; box-shadow: var(--shadow-xl); }
	.modal-content h2 { margin: 0 0 var(--spacing-lg); font-size: var(--font-size-lg); }
	.modal-actions { display: flex; justify-content: flex-end; gap: var(--spacing-sm); margin-top: var(--spacing-lg); }
	.form-group { margin-bottom: var(--spacing-md); }
	.form-group label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-neutral-700); margin-bottom: var(--spacing-xs); }
	.form-group input, .form-group select { width: 100%; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--color-neutral-300); border-radius: var(--border-radius-md); font-size: var(--font-size-base); font-family: var(--font-family-sans); box-sizing: border-box; }
</style>
