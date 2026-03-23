<!-- src/lib/components/organisms/dashboard/TestEmailModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';

	export let isOpen: boolean = false;
	export let sending: boolean = false;

	const dispatch = createEventDispatcher();

	let testEmail = '';

	$: if (isOpen) {
		testEmail = '';
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSend() {
		if (!testEmail) return;
		dispatch('send', { email: testEmail });
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Enviar E-mail de Teste">
	<FormField label="E-mail de destino (para teste)" id="test-email">
		<input id="test-email" class="form-control" type="email" bind:value={testEmail} placeholder="seu@email.com" />
	</FormField>

	<p class="hint">O certificado será enviado para este e-mail, permitindo revisar antes do disparo oficial.</p>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" disabled={!testEmail} loading={sending} on:click={handleSend}>
			Enviar Teste
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}
</style>
