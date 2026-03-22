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

	const dispatch = createEventDispatcher();

	let email = '';
	let role = 'volunteer';

	$: if (isOpen) {
		email = '';
		role = 'volunteer';
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSubmit() {
		dispatch('save', { email, role });
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" title="Convidar Usuário">
	<form on:submit|preventDefault={handleSubmit}>
		<FormField label="E-mail" id="inv-email" required>
			<input
				id="inv-email"
				type="email"
				bind:value={email}
				required
				class="form-input"
			/>
		</FormField>

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
		<Button variant="primary" loading={saving} onclick={handleSubmit}>Enviar Convite</Button>
	</svelte:fragment>
</Modal>

<style>
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
