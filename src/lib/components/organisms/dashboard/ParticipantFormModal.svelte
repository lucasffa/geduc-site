<!-- src/lib/components/organisms/dashboard/ParticipantFormModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen = false;
	/** @type {'create' | 'edit'} */
	export let mode = 'create';
	/** @type {{ id?: any, name?: string, email?: string, role?: string, notes?: string, workloadHours?: number } | null} */
	export let participant = null;
	export let saving = false;
	/** @type {readonly string[] | string[]} */
	export let roles = [];
	/** @type {Record<string, string>} */
	export let roleLabels = {};

	const dispatch = createEventDispatcher();

	let name = '';
	let email = '';
	let role = 'mentorado';
	let notes = '';
	let workloadHours = 0;

	$: if (isOpen) {
		if (mode === 'edit' && participant) {
			name = participant.name || '';
			email = participant.email || '';
			role = participant.role || 'mentorado';
			notes = participant.notes || '';
			workloadHours = participant.workloadHours || 0;
		} else if (mode === 'create') {
			name = '';
			email = '';
			role = 'mentorado';
			notes = '';
			workloadHours = 0;
		}
	}

	$: title = mode === 'create' ? 'Novo Participante' : 'Editar Participante';
	$: submitLabel = mode === 'create' ? 'Criar' : 'Salvar';

	function handleClose() {
		dispatch('close');
	}

	function handleSubmit() {
		/** @type {Record<string, any>} */
		const data = { name, email, role, notes };
		if (mode === 'edit') {
			data.workloadHours = workloadHours;
			if (participant?.id) {
				data.id = participant.id;
			}
		}
		dispatch('save', data);
	}
</script>

<Modal {isOpen} onClose={handleClose} {title}>
	<form on:submit|preventDefault={handleSubmit}>
		<FormField label="Nome" id="{mode}-name" required>
			<input id="{mode}-name" bind:value={name} required class="form-input" />
		</FormField>

		<FormField label="E-mail" id="{mode}-email" required>
			<input id="{mode}-email" type="email" bind:value={email} required class="form-input" />
		</FormField>

		<FormField label="Cargo" id="{mode}-role">
			<select id="{mode}-role" bind:value={role} class="form-input">
				{#each roles as r}
					<option value={r}>{roleLabels[r] || r}</option>
				{/each}
			</select>
		</FormField>

		{#if mode === 'edit'}
			<FormField label="Carga Horaria" id="edit-hours">
				<input id="edit-hours" type="number" bind:value={workloadHours} class="form-input" />
			</FormField>
		{/if}

		<FormField label="Observacoes" id="{mode}-notes">
			<textarea id="{mode}-notes" bind:value={notes} rows="3" class="form-input"></textarea>
		</FormField>

		<!-- Hidden submit button so form submit works; footer buttons below -->
		<button type="submit" hidden></button>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="ghost" onclick={handleClose}>Cancelar</Button>
		<Button variant="primary" loading={saving} onclick={handleSubmit}>{submitLabel}</Button>
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

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 3px rgba(50, 74, 203, 0.1);
	}
</style>
