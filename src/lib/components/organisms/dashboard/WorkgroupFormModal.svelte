<!-- src/lib/components/organisms/dashboard/WorkgroupFormModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let saving = false;

	const dispatch = createEventDispatcher();

	let name = '';
	let description = '';

	$: if (isOpen) {
		name = '';
		description = '';
	}

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		dispatch('save', { name, description });
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" title="Novo Grupo de Trabalho">
	<form on:submit|preventDefault={handleSave}>
		<FormField label="Nome" id="grp-name" required>
			<input
				id="grp-name"
				class="form-input"
				bind:value={name}
				required
			/>
		</FormField>

		<FormField label="Descricao" id="grp-desc">
			<textarea
				id="grp-desc"
				class="form-input"
				bind:value={description}
				rows="3"
			></textarea>
		</FormField>

		<!-- Hidden submit button so Enter key works -->
		<button type="submit" hidden></button>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="ghost" onclick={handleClose}>Cancelar</Button>
		<Button variant="primary" loading={saving} onclick={handleSave}>Criar</Button>
	</svelte:fragment>
</Modal>

<style>
	.form-input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-family: var(--font-family-sans);
		font-size: var(--font-size-sm);
		box-sizing: border-box;
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 2px var(--color-primary-100);
	}
</style>
