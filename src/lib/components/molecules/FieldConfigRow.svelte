<!-- src/lib/components/molecules/FieldConfigRow.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { CertField, FontInfo } from '$lib/types/dashboard';

	export let field: CertField;
	export let fonts: FontInfo[] = [];

	const dispatch = createEventDispatcher<{ change: CertField }>();

	function patch(changes: Partial<CertField>) {
		dispatch('change', { ...field, ...changes });
	}

	function onFontChange(e: Event) {
		const val = (e.currentTarget as HTMLSelectElement).value;
		patch({ fontId: val || null });
	}

	function onSizeInput(e: Event) {
		const raw = parseInt((e.currentTarget as HTMLInputElement).value);
		if (!isNaN(raw) && raw >= 6 && raw <= 120) patch({ fontSize: raw });
	}

	function onColorInput(e: Event) {
		patch({ color: (e.currentTarget as HTMLInputElement).value });
	}
</script>

<div class="field-row" class:disabled={!field.enabled}>
	<!-- Toggle + label -->
	<label class="toggle-label">
		<input
			type="checkbox"
			class="field-checkbox"
			checked={field.enabled}
			on:change={(e) => patch({ enabled: (e.currentTarget as HTMLInputElement).checked })}
		/>
		<span class="field-name">{field.label}</span>
	</label>

	<!-- Controles (visíveis só quando habilitado) -->
	{#if field.enabled}
		<div class="field-controls">
			<!-- Fonte -->
			<select class="ctrl ctrl-font" value={field.fontId ?? ''} on:change={onFontChange}>
				<option value="">Helvetica (padrão)</option>
				{#each fonts as f}
					<option value={f.id}>{f.name}</option>
				{/each}
			</select>

			<!-- Negrito (só para fonte padrão) -->
			{#if !field.fontId}
				<button
					class="ctrl ctrl-icon"
					class:active={field.bold}
					title="Negrito"
					on:click={() => patch({ bold: !field.bold })}
				>
					<strong>B</strong>
				</button>
			{/if}

			<!-- Tamanho -->
			<input
				class="ctrl ctrl-size"
				type="number"
				min="6"
				max="120"
				value={field.fontSize}
				on:change={onSizeInput}
				title="Tamanho da fonte (px)"
			/>
			<span class="ctrl-label">pt</span>

			<!-- Cor -->
			<input
				class="ctrl ctrl-color"
				type="color"
				value={field.color}
				on:input={onColorInput}
				title="Cor do texto"
			/>

			<!-- Alinhamento -->
			<div class="align-group">
				{#each [['left','←'],['center','≡'],['right','→']] as [a, icon]}
					<button
						class="ctrl ctrl-icon"
						class:active={field.align === a}
						title="Alinhar {a}"
						on:click={() => patch({ align: a as CertField['align'] })}
					>{icon}</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.field-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: var(--border-radius-md);
		transition: background 0.15s;
	}

	.field-row:hover {
		background: var(--color-neutral-50);
	}

	.field-row.disabled {
		opacity: 0.5;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		cursor: pointer;
		min-width: 130px;
		flex-shrink: 0;
	}

	.field-checkbox {
		width: 15px;
		height: 15px;
		cursor: pointer;
	}

	.field-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
		white-space: nowrap;
	}

	.field-controls {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		flex-wrap: wrap;
	}

	.ctrl {
		height: 28px;
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-sm);
		background: var(--color-white, #fff);
		font-size: var(--font-size-xs);
		color: var(--color-neutral-700);
	}

	.ctrl-font {
		width: 140px;
		padding: 0 var(--spacing-xs);
	}

	.ctrl-size {
		width: 52px;
		padding: 0 var(--spacing-xs);
		text-align: center;
	}

	.ctrl-label {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
	}

	.ctrl-color {
		width: 28px;
		padding: 2px;
		cursor: pointer;
	}

	.ctrl-icon {
		width: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		background: var(--color-white, #fff);
		color: var(--color-neutral-600);
		font-size: var(--font-size-xs);
		transition: background 0.1s, color 0.1s;
	}

	.ctrl-icon:hover {
		background: var(--color-neutral-100);
	}

	.ctrl-icon.active {
		background: var(--color-primary-100, #e0e7ff);
		color: var(--color-primary-700, #3730a3);
		border-color: var(--color-primary-300, #a5b4fc);
	}

	.align-group {
		display: flex;
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-sm);
		overflow: hidden;
	}

	.align-group .ctrl-icon {
		border: none;
		border-radius: 0;
	}

	.align-group .ctrl-icon + .ctrl-icon {
		border-left: 1px solid var(--color-neutral-200);
	}
</style>
