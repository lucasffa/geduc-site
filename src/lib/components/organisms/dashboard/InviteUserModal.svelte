<!-- src/lib/components/organisms/dashboard/InviteUserModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let roles = [];
	export let roleLabels = {};
	export let saving = false;
	export let mode = 'email'; // 'email' or 'link'

	const dispatch = createEventDispatcher();

	let inviteMode = 'email';
	let email = '';
	let role = 'volunteer';

	$: if (isOpen) {
		inviteMode = mode;
		email = '';
		role = 'volunteer';
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSubmit() {
		dispatch('save', { email: inviteMode === 'link' ? email.trim() : email.trim(), role, mode: inviteMode });
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" title="Convidar Usuário">
	<form on:submit|preventDefault={handleSubmit}>
		<div class="invite-mode-row">
			<label>
				<input type="radio" name="inviteMode" value="email" bind:group={inviteMode} />
				Por e-mail
			</label>
			<label>
				<input type="radio" name="inviteMode" value="link" bind:group={inviteMode} />
				Por link
			</label>
		</div>

		{#if inviteMode === 'email'}
			<FormField label="E-mail" id="inv-email" required>
				<input
					id="inv-email"
					type="email"
					bind:value={email}
					required
					class="form-input"
				/>
			</FormField>
		{:else}
			<FormField label="E-mail (opcional)" id="inv-email">
				<input
					id="inv-email"
					type="email"
					bind:value={email}
					class="form-input"
				/>
			</FormField>
			<p class="invite-help">Será gerado um link de convite; usuário poderá informar e-mail ao aceitar se não preencher aqui.</p>
		{/if}

		<FormField label="Função" id="inv-role">
			<select id="inv-role" bind:value={role} class="form-input">
				{#each roles as r}
					<option value={r}>{roleLabels[r] || r}</option>
				{/each}
			</select>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="ghost" onclick={handleClose}>Cancelar</Button>
		<Button variant="primary" loading={saving} onclick={handleSubmit}>
			{inviteMode === 'link' ? 'Gerar Link' : 'Enviar Convite'}
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.invite-mode-row {
		display: flex;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-md);
		font-size: var(--font-size-sm);
	}

	.invite-mode-row label {
		cursor: pointer;
	}

	.invite-help {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
		margin-bottom: var(--spacing-sm);
	}

	.form-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-base);
		font-family: var(--font-family-sans);
		box-sizing: border-box;
	}
</style>
