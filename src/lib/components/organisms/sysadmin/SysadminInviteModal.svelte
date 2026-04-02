<!-- src/lib/components/organisms/sysadmin/SysadminInviteModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let roles: readonly string[] = [];
	export let roleLabels: Record<string, string> = {};
	export let organizations: Array<{ id: string; name: string }> = [];
	export let saving = false;

	const dispatch = createEventDispatcher();

	let inviteMode: 'email' | 'link' = 'link';
	let email = '';
	let role = 'volunteer';
	let organizationId = organizations[0]?.id || '';

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		dispatch('save', {
			mode: inviteMode,
			email: email.trim() || null,
			role,
			organizationId
		});
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Novo Convite" size="md">
	<div class="invite-form">
		<div class="invite-mode-row">
			<label><input type="radio" bind:group={inviteMode} value="email" /> Por e-mail</label>
			<label><input type="radio" bind:group={inviteMode} value="link" /> Por link</label>
		</div>

		{#if inviteMode === 'email'}
			<FormField label="E-mail" id="sysadmin-invite-email" required>
				<input id="sysadmin-invite-email" type="email" bind:value={email} required class="form-input" />
			</FormField>
		{:else}
			<FormField label="E-mail (opcional)" id="sysadmin-invite-email">
				<input id="sysadmin-invite-email" type="email" bind:value={email} class="form-input" />
			</FormField>
		{/if}

		<FormField label="Função" id="sysadmin-invite-role">
			<select id="sysadmin-invite-role" bind:value={role} class="form-input">
				{#each roles as r}
					<option value={r}>{roleLabels[r] || r}</option>
				{/each}
			</select>
		</FormField>

		<FormField label="Organização" id="sysadmin-invite-org">
			<select id="sysadmin-invite-org" bind:value={organizationId} class="form-input">
				{#each organizations as org}
					<option value={org.id}>{org.name}</option>
				{/each}
			</select>
		</FormField>
	</div>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" loading={saving} on:click={handleSave}>
			{inviteMode === 'link' ? 'Gerar link' : 'Enviar convite'}
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.invite-mode-row {
		display: flex;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}
	.form-input { width: 100%; }
</style>
