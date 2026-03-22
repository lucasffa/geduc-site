<!-- src/lib/components/organisms/dashboard/WorkgroupFormModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	export let mode = 'create';
	export let workgroup = null;
	export let saving = false;

	const dispatch = createEventDispatcher();

	let name = '';
	let description = '';

	// Reset on open (create mode)
	let prevIsOpen = false;
	$: if (isOpen && !prevIsOpen && mode === 'create') {
		name = '';
		description = '';
	}
	$: prevIsOpen = isOpen;

	// Populate on edit
	$: if (mode === 'edit' && workgroup) {
		name = workgroup.name || '';
		description = workgroup.description || '';
	}

	$: title = mode === 'create' ? 'Novo Grupo de Trabalho' : `Editar "${workgroup?.name || ''}"`;
	$: canSave = name.trim().length > 0 && !saving;

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		if (!canSave) return;
		dispatch('save', { name: name.trim(), description: description.trim() });
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" {title}>
	<form on:submit|preventDefault={handleSave}>
		<FormField label="Nome" id="grp-name" required>
			<input
				id="grp-name"
				class="form-input"
				bind:value={name}
				required
			/>
		</FormField>

		<FormField label="Descrição" id="grp-desc">
			<textarea
				id="grp-desc"
				class="form-input"
				bind:value={description}
				rows="3"
			></textarea>
		</FormField>

		<button type="submit" hidden></button>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" disabled={!canSave} loading={saving} on:click={handleSave}>
			{mode === 'create' ? 'Criar' : 'Salvar'}
		</Button>
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
