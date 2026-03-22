<!-- src/lib/components/organisms/sysadmin/OrgFormModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let isOpen: boolean = false;
	export let mode: 'create' | 'edit' = 'create';
	export let org: any = null;
	export let saving: boolean = false;

	const dispatch = createEventDispatcher();

	// Form fields
	let name = '';
	let slug = '';
	let brandName = '';
	let logoUrl = '';
	let primaryColor = '#324acb';

	// Auto-slug for create mode
	$: autoSlug = name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	$: if (mode === 'create' && (!slug || slug === prevAutoSlug)) {
		slug = autoSlug;
	}

	let prevAutoSlug = '';
	$: prevAutoSlug = autoSlug;

	// When org changes (edit mode), populate fields
	$: if (mode === 'edit' && org) {
		name = org.name;
		brandName = org.brandName || '';
		logoUrl = org.logoUrl || '';
		primaryColor = org.primaryColor || '#324acb';
	}

	// Reset fields when modal opens in create mode
	$: if (isOpen && mode === 'create') {
		name = '';
		slug = '';
		brandName = '';
		logoUrl = '';
		primaryColor = '#324acb';
	}

	$: title = mode === 'create' ? 'Nova Organização' : `Editar "${org?.name || ''}"`;

	$: canSave = mode === 'create' ? (name && slug && !saving) : !!name;

	function handleClose() {
		dispatch('close');
	}

	function handleSave() {
		if (!canSave) return;
		if (mode === 'create') {
			dispatch('save', {
				name,
				slug,
				brandName: brandName || name,
				logoUrl: logoUrl || null,
				primaryColor
			});
		} else {
			dispatch('save', {
				name,
				brandName,
				logoUrl,
				primaryColor
			});
		}
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" {title}>
	{#if mode === 'create'}
		<FormField label="Nome" id="org-name" required>
			<input id="org-name" class="form-control" bind:value={name} placeholder="Ex: GEDUC Campinas" />
		</FormField>
		<FormField label="Slug" id="org-slug" required>
			<input id="org-slug" class="form-control" bind:value={slug} placeholder="geduc-campinas" />
			<small>Identificador único, usado no banco de dados</small>
		</FormField>
	{:else}
		<FormField label="Nome" id="edit-name">
			<input id="edit-name" class="form-control" bind:value={name} />
		</FormField>
	{/if}

	<FormField label="Nome da Marca" id="{mode}-brand">
		<input id="{mode}-brand" class="form-control" bind:value={brandName} placeholder="Nome exibido no dashboard" />
	</FormField>
	<FormField label="URL do Logo" id="{mode}-logo">
		<input id="{mode}-logo" class="form-control" bind:value={logoUrl} placeholder="https://..." />
	</FormField>
	<FormField label="Cor Primária" id="{mode}-color">
		<input id="{mode}-color" type="color" bind:value={primaryColor} />
	</FormField>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" disabled={!canSave} loading={saving} on:click={handleSave}>
			{#if mode === 'create'}
				{saving ? 'Criando...' : 'Criar Organização'}
			{:else}
				Salvar
			{/if}
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

	small {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}
</style>
