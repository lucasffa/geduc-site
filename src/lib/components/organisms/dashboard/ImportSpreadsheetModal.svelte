<!-- src/lib/components/organisms/dashboard/ImportSpreadsheetModal.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';

	export let isOpen = false;

	const dispatch = createEventDispatcher();

	let file = null;
	let dragOver = false;
	let uploading = false;
	let result = null;
	let fileInput;
	let pasteMode = false;
	let csvText = '';

	let prevIsOpen = false;
	$: if (isOpen && !prevIsOpen) {
		file = null;
		result = null;
		uploading = false;
		pasteMode = false;
		csvText = '';
	}
	$: prevIsOpen = isOpen;

	const ACCEPTED = '.csv,.xls,.xlsx';

	function handleClose() {
		dispatch('close');
	}

	function handleDrop(e) {
		e.preventDefault();
		dragOver = false;
		const dropped = e.dataTransfer?.files?.[0];
		if (dropped) selectFile(dropped);
	}

	function handleDragOver(e) {
		e.preventDefault();
		dragOver = true;
	}

	function handleDragLeave() {
		dragOver = false;
	}

	function handleFileChange(e) {
		const selected = e.target?.files?.[0];
		if (selected) selectFile(selected);
	}

	function selectFile(f) {
		const ext = f.name.split('.').pop()?.toLowerCase();
		if (!['csv', 'xls', 'xlsx'].includes(ext)) {
			result = { error: 'Formato não suportado. Use .csv, .xls ou .xlsx' };
			return;
		}
		file = f;
		result = null;
	}

	async function handleUpload() {
		uploading = true;
		result = null;
		try {
			const formData = new FormData();
			if (pasteMode) {
				if (!csvText.trim()) return;
				const blob = new Blob([csvText], { type: 'text/csv' });
				formData.append('file', blob, 'colado.csv');
			} else {
				if (!file) return;
				formData.append('file', file);
			}
			const res = await fetch('/dashboard/api/participants/import', {
				method: 'POST',
				body: formData
			});
			const data = await res.json();
			if (res.ok) {
				result = {
					success: true,
					imported: data.imported,
					totalRows: data.totalRows,
					errors: data.errors || []
				};
				dispatch('imported', { count: data.imported });
			} else {
				result = {
					error: data.error || 'Erro ao importar',
					errors: data.errors || []
				};
			}
		} catch {
			result = { error: 'Erro de conexão' };
		} finally {
			uploading = false;
		}
	}

	function togglePasteMode() {
		pasteMode = !pasteMode;
		result = null;
	}
</script>

<Modal {isOpen} onClose={handleClose} size="md" title="Importar Participantes">
	<div class="mode-toggle">
		<button class="mode-btn" class:active={!pasteMode} on:click={() => { pasteMode = false; result = null; }}>Arquivo</button>
		<button class="mode-btn" class:active={pasteMode} on:click={() => { pasteMode = true; result = null; }}>Colar CSV</button>
	</div>

	{#if pasteMode}
		<textarea
			class="csv-textarea"
			bind:value={csvText}
			placeholder={"nome,email,cargo,status\nAna Rita,ana@email.com,mentorado,inscrito"}
			rows="8"
		></textarea>
	{:else}
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="drop-zone"
			class:drag-over={dragOver}
			class:has-file={!!file}
			on:drop={handleDrop}
			on:dragover={handleDragOver}
			on:dragleave={handleDragLeave}
			on:click={() => fileInput?.click()}
			on:keydown={(e) => { if (e.key === 'Enter') fileInput?.click(); }}
			role="button"
			tabindex="0"
		>
			<input
				bind:this={fileInput}
				type="file"
				accept={ACCEPTED}
				on:change={handleFileChange}
				hidden
			/>
			{#if file}
				<p class="file-name">{file.name}</p>
				<p class="file-hint">Clique para trocar o arquivo</p>
			{:else}
				<p class="drop-text">Arraste um arquivo aqui ou clique para selecionar</p>
				<p class="file-hint">.csv, .xls ou .xlsx</p>
			{/if}
		</div>
	{/if}

	<div class="columns-info">
		<p class="columns-title">Colunas esperadas na planilha:</p>
		<div class="columns-list">
			<Badge text="nome *" variant="success" />
			<Badge text="email *" variant="success" />
			<Badge text="cargo" variant="role" />
			<Badge text="status" variant="status" />
			<Badge text="data_inscricao" variant="role" />
			<Badge text="data_fim_ciclo" variant="role" />
			<Badge text="carga_horaria" variant="role" />
			<Badge text="observacoes" variant="role" />
		</div>
		<p class="columns-hint">* obrigatórias. As demais são opcionais.</p>
	</div>

	{#if result}
		<div class="result" class:result-success={result.success} class:result-error={!result.success}>
			{#if result.success}
				<p><strong>{result.imported}</strong> de {result.totalRows} participante(s) importado(s) com sucesso.</p>
			{:else}
				<p>{result.error}</p>
			{/if}
			{#if result.errors?.length > 0}
				<details>
					<summary>{result.errors.length} aviso(s)</summary>
					<ul class="error-list">
						{#each result.errors as err}
							<li>Linha {err.row}: {err.message}</li>
						{/each}
					</ul>
				</details>
			{/if}
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="ghost" on:click={handleClose}>
			{result?.success ? 'Fechar' : 'Cancelar'}
		</Button>
		{#if !result?.success}
			<Button
				variant="primary"
				disabled={(pasteMode ? !csvText.trim() : !file) || uploading}
				loading={uploading}
				on:click={handleUpload}
			>
				{uploading ? 'Importando...' : 'Importar'}
			</Button>
		{/if}
	</svelte:fragment>
</Modal>

<style>
	.mode-toggle {
		display: flex;
		gap: 0;
		margin-bottom: var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		overflow: hidden;
	}

	.mode-btn {
		flex: 1;
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		background: var(--color-neutral-50);
		font-size: var(--font-size-sm);
		cursor: pointer;
		transition: all 0.15s ease;
		color: var(--color-neutral-600);
	}

	.mode-btn.active {
		background: var(--color-primary-500);
		color: white;
		font-weight: var(--font-weight-medium);
	}

	.csv-textarea {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-family: monospace;
		font-size: var(--font-size-sm);
		resize: vertical;
		box-sizing: border-box;
	}

	.csv-textarea:focus {
		outline: none;
		border-color: var(--color-primary-500);
		box-shadow: 0 0 0 2px var(--color-primary-100);
	}

	.drop-zone {
		border: 2px dashed var(--color-neutral-300);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-2xl) var(--spacing-lg);
		text-align: center;
		cursor: pointer;
		transition: all 0.2s ease;
		background: var(--color-neutral-50);
	}

	.drop-zone:hover,
	.drop-zone.drag-over {
		border-color: var(--color-primary-500);
		background: var(--color-primary-50, rgba(50, 74, 203, 0.05));
	}

	.drop-zone.has-file {
		border-color: var(--color-green-500);
		background: var(--color-green-50, rgba(34, 197, 94, 0.05));
	}

	.drop-text {
		margin: 0;
		font-size: var(--font-size-sm);
		color: var(--color-neutral-600);
	}

	.file-name {
		margin: 0;
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-800);
	}

	.file-hint {
		margin: var(--spacing-xs) 0 0;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-400);
	}

	.columns-info {
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
	}

	.columns-title {
		margin: 0 0 var(--spacing-xs);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-600);
	}

	.columns-list {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
	}

	.columns-hint {
		margin: var(--spacing-xs) 0 0;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-400);
	}

	.result {
		margin-top: var(--spacing-md);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
	}

	.result p {
		margin: 0;
	}

	.result-success {
		background: var(--color-green-50, rgba(34, 197, 94, 0.1));
		border: 1px solid var(--color-green-300, #86efac);
		color: var(--color-green-800, #166534);
	}

	.result-error {
		background: var(--color-red-50, rgba(239, 68, 68, 0.1));
		border: 1px solid var(--color-red-300, #fca5a5);
		color: var(--color-red-800, #991b1b);
	}

	details {
		margin-top: var(--spacing-sm);
	}

	summary {
		cursor: pointer;
		font-size: var(--font-size-xs);
	}

	.error-list {
		margin: var(--spacing-xs) 0 0;
		padding-left: var(--spacing-md);
		font-size: var(--font-size-xs);
		max-height: 150px;
		overflow-y: auto;
	}
</style>
