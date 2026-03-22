<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { PARTICIPANT_STATUSES, STATUS_LABELS } from '$lib/constants/participant-status';

	export let isOpen = false;
	export let mode = 'create';
	export let view = null;
	export let saving = false;
	export let customRoles = { voluntario: [], mentorado: [] };

	const dispatch = createEventDispatcher();

	let name = '';
	let selectedStatuses = [];
	let selectedRoles = [];
	let createdAfter = '';
	let createdBefore = '';

	$: allRoles = [...(customRoles.voluntario || []), ...(customRoles.mentorado || [])];

	// Reset on open (create mode)
	let prevIsOpen = false;
	$: if (isOpen && !prevIsOpen && mode === 'create') {
		name = '';
		selectedStatuses = [];
		selectedRoles = [];
		createdAfter = '';
		createdBefore = '';
	}
	$: prevIsOpen = isOpen;

	// Populate on edit
	$: if (mode === 'edit' && view) {
		name = view.name || '';
		try {
			const filters = typeof view.filters === 'string' ? JSON.parse(view.filters) : (view.filters || {});
			selectedStatuses = filters.statuses || [];
			selectedRoles = filters.roles || [];
			createdAfter = filters.createdAfter || '';
			createdBefore = filters.createdBefore || '';
		} catch {
			selectedStatuses = [];
			selectedRoles = [];
			createdAfter = '';
			createdBefore = '';
		}
	}

	$: title = mode === 'create' ? 'Nova View' : `Editar "${view?.name || ''}"`;
	$: canSave = name.trim().length > 0 && !saving;

	function handleClose() {
		dispatch('close');
	}

	function toggleStatus(status) {
		if (selectedStatuses.includes(status)) {
			selectedStatuses = selectedStatuses.filter((s) => s !== status);
		} else {
			selectedStatuses = [...selectedStatuses, status];
		}
	}

	function toggleRole(role) {
		if (selectedRoles.includes(role)) {
			selectedRoles = selectedRoles.filter((r) => r !== role);
		} else {
			selectedRoles = [...selectedRoles, role];
		}
	}

	function handleSave() {
		if (!canSave) return;
		const filters = {};
		if (selectedStatuses.length) filters.statuses = selectedStatuses;
		if (selectedRoles.length) filters.roles = selectedRoles;
		if (createdAfter) filters.createdAfter = createdAfter;
		if (createdBefore) filters.createdBefore = createdBefore;

		dispatch('save', {
			name: name.trim(),
			filters
		});
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" {title}>
	<form on:submit|preventDefault={handleSave}>
		<FormField label="Nome da View" id="view-name" required>
			<input
				id="view-name"
				class="form-input"
				bind:value={name}
				placeholder="Ex: Ativos, Mentorados, etc."
				required
			/>
		</FormField>

		<FormField label="Status" id="view-statuses">
			<div class="checkbox-group">
				{#each PARTICIPANT_STATUSES as status}
					<label class="checkbox-label">
						<input
							type="checkbox"
							checked={selectedStatuses.includes(status)}
							on:change={() => toggleStatus(status)}
						/>
						{STATUS_LABELS[status] || status}
					</label>
				{/each}
			</div>
		</FormField>

		<FormField label="Cargos" id="view-roles">
			<div class="checkbox-group">
				{#each allRoles as role}
					<label class="checkbox-label">
						<input
							type="checkbox"
							checked={selectedRoles.includes(role)}
							on:change={() => toggleRole(role)}
						/>
						{role}
					</label>
				{/each}
			</div>
		</FormField>

		<div class="date-row">
			<FormField label="Criado a partir de" id="view-after">
				<input id="view-after" type="date" class="form-input" bind:value={createdAfter} />
			</FormField>
			<FormField label="Criado até" id="view-before">
				<input id="view-before" type="date" class="form-input" bind:value={createdBefore} />
			</FormField>
		</div>

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

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs) var(--spacing-md);
		padding: var(--spacing-xs) 0;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xxs);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-700);
		cursor: pointer;
	}

	.date-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: var(--spacing-md);
	}
</style>
