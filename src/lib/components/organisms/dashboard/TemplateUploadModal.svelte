<!-- src/lib/components/organisms/dashboard/TemplateUploadModal.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';

	export let isOpen: boolean = false;
	export let uploading: boolean = false;

	const dispatch = createEventDispatcher();

	let uploadName = '';
	let uploadFile = null;

	$: if (isOpen) {
		uploadName = '';
		uploadFile = null;
	}

	function handleClose() {
		dispatch('close');
	}

	function handleFileChange(e) {
		uploadFile = e.target.files?.[0] || null;
	}

	function handleUpload() {
		if (!uploadFile) return;
		dispatch('upload', { file: uploadFile, name: uploadName });
	}
</script>

<Modal {isOpen} onClose={handleClose} title="Upload de Template PDF">
	<FormField label="Nome do Template" id="template-name">
		<input id="template-name" class="form-control" bind:value={uploadName} placeholder="Ex: modelo_2024" />
	</FormField>

	<FormField label="Arquivo PDF" id="template-file">
		<input id="template-file" class="form-control" type="file" accept=".pdf" on:change={handleFileChange} />
	</FormField>

	<div class="upload-hint">
		O sistema escreverá nome, cargo, carga horária e período sobre o PDF. Posicione o layout do template de forma que haja espaço na região central.
	</div>

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>Cancelar</Button>
		<Button variant="primary" disabled={!uploadFile} loading={uploading} on:click={handleUpload}>
			Salvar Template
		</Button>
	</svelte:fragment>
</Modal>

<style>
	.upload-hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		padding: var(--spacing-sm);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-lg);
	}
</style>
