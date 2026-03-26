<!-- src/lib/components/organisms/dashboard/FontManager.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FontInfo } from '$lib/types/dashboard';

	export let fonts: FontInfo[] = [];
	export let uploading: boolean = false;

	const dispatch = createEventDispatcher<{
		upload: { file: File; name: string };
		delete: { fontId: string };
	}>();

	let uploadName = '';
	let uploadFile: File | null = null;
	let showForm = false;
	let fileInput: HTMLInputElement;

	function onFileChange(e: Event) {
		const f = (e.currentTarget as HTMLInputElement).files?.[0] ?? null;
		uploadFile = f;
		if (f && !uploadName) uploadName = f.name.replace(/\.(ttf|otf)$/i, '');
	}

	function handleUpload() {
		if (!uploadFile) return;
		dispatch('upload', { file: uploadFile, name: uploadName.trim() });
	}

	function resetForm() {
		uploadName = '';
		uploadFile = null;
		showForm = false;
		if (fileInput) fileInput.value = '';
	}

	export function onUploadSuccess() {
		resetForm();
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('pt-BR');
	}
</script>

<div class="data-table-wrapper font-manager">
	<div class="table-toolbar">
		<h3 class="section-heading">Fontes Personalizadas</h3>
		<button class="btn btn-outline btn-sm" on:click={() => { showForm = !showForm; }}>
			{showForm ? 'Cancelar' : '+ Adicionar Fonte'}
		</button>
	</div>

	{#if showForm}
		<div class="upload-form">
			<div class="form-row">
				<div class="form-group">
					<label for="font-file">Arquivo (TTF ou OTF)</label>
					<input
						id="font-file"
						class="form-control"
						type="file"
						accept=".ttf,.otf"
						on:change={onFileChange}
						bind:this={fileInput}
					/>
				</div>
				<div class="form-group">
					<label for="font-name">Nome de exibição</label>
					<input
						id="font-name"
						class="form-control"
						type="text"
						bind:value={uploadName}
						placeholder="Ex: Roboto Regular"
					/>
				</div>
				<div class="form-group form-group-action">
					<label>&nbsp;</label>
					<button
						class="btn btn-primary"
						disabled={!uploadFile || uploading}
						on:click={handleUpload}
					>
						{#if uploading}<span class="loading-spinner spinner-sm"></span>{/if}
						Salvar Fonte
					</button>
				</div>
			</div>
			<p class="upload-hint">
				Use fontes TTF/OTF. Após o upload, ela ficará disponível no editor de campos.
			</p>
		</div>
	{/if}

	{#if fonts.length > 0}
		<div class="font-list">
			{#each fonts as font}
				<div class="font-item">
					<div class="font-info">
						<span class="font-name">{font.name}</span>
						<span class="font-meta">{font.originalFilename ?? ''} · {formatDate(font.createdAt)}</span>
					</div>
					<button
						class="btn btn-danger btn-sm"
						on:click={() => dispatch('delete', { fontId: font.id })}
						title="Remover fonte"
					>
						Remover
					</button>
				</div>
			{/each}
		</div>
	{:else if !showForm}
		<p class="empty-state">Nenhuma fonte personalizada. Clique em "Adicionar Fonte" para começar.</p>
	{/if}
</div>

<style>
	.font-manager {
		margin-bottom: var(--spacing-xl);
	}

	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
	}

	.upload-form {
		padding: var(--spacing-md) var(--spacing-lg);
		border-bottom: 1px solid var(--color-neutral-100);
		background: var(--color-neutral-50);
	}

	.form-row {
		display: flex;
		gap: var(--spacing-md);
		align-items: flex-end;
		flex-wrap: wrap;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		flex: 1;
		min-width: 180px;
	}

	.form-group label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-600);
	}

	.form-group-action {
		flex: 0;
	}

	.upload-hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		margin-top: var(--spacing-sm);
	}

	.font-list {
		padding: var(--spacing-sm) var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.font-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		border: 1px solid var(--color-neutral-100);
		background: var(--color-white, #fff);
	}

	.font-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.font-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
	}

	.font-meta {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}

	.empty-state {
		padding: var(--spacing-md) var(--spacing-lg);
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
	}

	.spinner-sm {
		width: 14px;
		height: 14px;
	}
</style>
