<!-- src/lib/components/organisms/sysadmin/UserCreateModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let organizations = [];
	export let roles = [];
	export let roleLabels = {};
	export let saving = false;

	const dispatch = createEventDispatcher();

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let role = 'volunteer';
	let organizationId = '';

	$: if (isOpen) {
		name = '';
		email = '';
		password = '';
		confirmPassword = '';
		role = 'volunteer';
		organizationId = '';
	}

	$: canSave = name.trim().length >= 2 && email.includes('@') && password.length >= 8 && password === confirmPassword && !saving;
	$: passwordMismatch = confirmPassword.length > 0 && password !== confirmPassword;

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		if (!canSave) return;
		dispatch('save', {
			name: name.trim(),
			email: email.trim().toLowerCase(),
			password,
			role,
			organizationId: organizationId || null
		});
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" title="Criar Usuário (sem convite)">
	<FormField label="Nome" id="create-user-name" required>
		<input id="create-user-name" class="form-control" bind:value={name} placeholder="Nome completo" />
	</FormField>

	<FormField label="E-mail" id="create-user-email" required>
		<input id="create-user-email" class="form-control" type="email" bind:value={email} placeholder="email@exemplo.com" />
	</FormField>

	<FormField label="Senha" id="create-user-password" required>
		<input id="create-user-password" class="form-control" type="password" bind:value={password} placeholder="Mínimo 8 caracteres" />
	</FormField>

	<FormField label="Confirmar Senha" id="create-user-confirm" required>
		<input id="create-user-confirm" class="form-control" type="password" bind:value={confirmPassword} placeholder="Repita a senha" />
		{#if passwordMismatch}
			<small class="error-text">Senhas não conferem</small>
		{/if}
	</FormField>

	<FormField label="Cargo" id="create-user-role">
		<select id="create-user-role" class="form-control" bind:value={role}>
			{#each roles.filter(r => r !== 'sysadmin') as r}
				<option value={r}>{roleLabels[r]}</option>
			{/each}
		</select>
	</FormField>

	<FormField label="Organização" id="create-user-org">
		<select id="create-user-org" class="form-control" bind:value={organizationId}>
			<option value="">Nenhuma</option>
			{#each organizations as org}
				<option value={org.id}>{org.name}</option>
			{/each}
		</select>
	</FormField>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" disabled={!canSave} loading={saving} on:click={handleSave}>
			{saving ? 'Criando...' : 'Criar Usuário'}
		</Button>
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

	.error-text {
		color: var(--color-error);
		font-size: var(--font-size-xs);
	}
</style>
