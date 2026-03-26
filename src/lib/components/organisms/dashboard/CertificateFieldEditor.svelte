<!-- src/lib/components/organisms/dashboard/CertificateFieldEditor.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import FieldConfigRow from '$lib/components/molecules/FieldConfigRow.svelte';
	import PdfPageCanvas from '$lib/components/atoms/PdfPageCanvas.svelte';
	import type { CertField, FontInfo } from '$lib/types/dashboard';
	import { DEFAULT_CERT_FIELDS, FIELD_CHIP_COLORS } from '$lib/constants/cert-fields';

	/** Campos configurados — bindável pelo pai. */
	export let fields: CertField[] = DEFAULT_CERT_FIELDS.map((f) => ({ ...f }));
	export let fonts: FontInfo[] = [];
	/** URL do PDF do template selecionado para exibir como fundo do canvas. */
	export let templatePreviewUrl: string | null = null;

	const dispatch = createEventDispatcher<{ change: CertField[] }>();

	// ──────────────────────────────────────────────
	// Canvas / estado de drag
	// ──────────────────────────────────────────────

	/** Dimensões do PDF em pontos (A4 paisagem) */
	const PDF_W = 842;
	const PDF_H = 595;

	let canvasEl: HTMLDivElement;
	let canvasClientWidth = 0;
	/** Escala px-por-pt: quantos pixels CSS correspondem a 1 ponto PDF no canvas atual. */
	$: fontScale = canvasClientWidth > 0 ? canvasClientWidth / PDF_W : 0.72;

	let selectedKey: string | null = null;

	// Drag state
	let dragging: string | null = null;
	let dragStartPct = { x: 0, y: 0 };
	let dragStartPtr = { x: 0, y: 0 };

	// Resize state (arrastar handle de canto)
	let resizing: string | null = null;
	let resizeStartSize = 0;
	let resizeStartPtrX = 0;

	function updateField(key: string, patch: Partial<CertField>) {
		fields = fields.map((f) => (f.key === key ? { ...f, ...patch } : f));
		dispatch('change', fields);
	}

	function onRowChange(e: CustomEvent<CertField>) {
		fields = fields.map((f) => (f.key === e.detail.key ? e.detail : f));
		dispatch('change', fields);
	}

	// ──────────────────────────────────────────────
	// Drag — mover campo
	// ──────────────────────────────────────────────

	function onChipPointerDown(e: PointerEvent, key: string) {
		if ((e.target as HTMLElement).dataset.resize) return; // ignore — cabe ao resize handler
		selectedKey = key;
		dragging = key;

		const field = fields.find((f) => f.key === key)!;
		dragStartPct = { x: field.x, y: field.y };
		dragStartPtr = { x: e.clientX, y: e.clientY };

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();
	}

	function onChipPointerMove(e: PointerEvent, key: string) {
		if (dragging !== key || !canvasEl) return;

		const rect = canvasEl.getBoundingClientRect();
		const dx = ((e.clientX - dragStartPtr.x) / rect.width) * 100;
		const dy = ((e.clientY - dragStartPtr.y) / rect.height) * 100;

		updateField(key, {
			x: clamp(dragStartPct.x + dx, 0, 100),
			y: clamp(dragStartPct.y + dy, 0, 100)
		});
	}

	function onChipPointerUp(_e: PointerEvent, _key: string) {
		dragging = null;
	}

	// ──────────────────────────────────────────────
	// Resize — arrastar handle lateral (aumenta/diminui fontSize)
	// ──────────────────────────────────────────────

	function onResizePointerDown(e: PointerEvent, key: string) {
		resizing = key;
		resizeStartSize = fields.find((f) => f.key === key)?.fontSize ?? 14;
		resizeStartPtrX = e.clientX;

		(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
		e.preventDefault();
		e.stopPropagation();
	}

	function onResizePointerMove(e: PointerEvent, key: string) {
		if (resizing !== key || !canvasEl) return;

		// 1px de arraste horizontal = ~0.1pt de tamanho (sensível mas controlado)
		const rect = canvasEl.getBoundingClientRect();
		const sensitivity = 80 / rect.width; // 80pt em 100% da largura
		const delta = (e.clientX - resizeStartPtrX) * sensitivity;
		const newSize = clamp(Math.round(resizeStartSize + delta), 6, 120);

		updateField(key, { fontSize: newSize });
	}

	function onResizePointerUp(_e: PointerEvent) {
		resizing = null;
	}

	// ──────────────────────────────────────────────
	// Keyboard nudge no campo selecionado
	// ──────────────────────────────────────────────

	function onKeyDown(e: KeyboardEvent) {
		if (!selectedKey) return;
		const step = e.shiftKey ? 1 : 0.5; // shift = passo maior
		let patch: Partial<CertField> | null = null;

		if (e.key === 'ArrowLeft')  patch = { x: clamp((fields.find(f => f.key === selectedKey)!.x) - step, 0, 100) };
		if (e.key === 'ArrowRight') patch = { x: clamp((fields.find(f => f.key === selectedKey)!.x) + step, 0, 100) };
		if (e.key === 'ArrowUp')    patch = { y: clamp((fields.find(f => f.key === selectedKey)!.y) - step, 0, 100) };
		if (e.key === 'ArrowDown')  patch = { y: clamp((fields.find(f => f.key === selectedKey)!.y) + step, 0, 100) };
		if (e.key === 'Escape') { selectedKey = null; return; }

		if (patch) {
			e.preventDefault();
			updateField(selectedKey, patch);
		}
	}

	// ──────────────────────────────────────────────
	// Clique no canvas fora de chips → deseleciona
	// ──────────────────────────────────────────────

	function onCanvasClick(e: MouseEvent) {
		if ((e.target as HTMLElement) === canvasEl) selectedKey = null;
	}

	// ──────────────────────────────────────────────
	// Helpers
	// ──────────────────────────────────────────────

	function clamp(v: number, min: number, max: number) {
		return Math.min(max, Math.max(min, v));
	}

	function pxLabel(field: CertField) {
		const xPx = Math.round((field.x / 100) * PDF_W);
		const yPx = Math.round((field.y / 100) * PDF_H);
		return `x:${xPx} y:${yPx} pt`;
	}

	function resetDefaults() {
		fields = DEFAULT_CERT_FIELDS.map((f) => ({ ...f }));
		dispatch('change', fields);
	}
</script>

<svelte:window on:keydown={onKeyDown} />

<div class="data-table-wrapper field-editor">
	<div class="table-toolbar">
		<h3 class="section-heading">Editor de Campos do Certificado</h3>
		<button class="btn btn-ghost btn-sm" on:click={resetDefaults} title="Restaurar posições padrão">
			Restaurar padrão
		</button>
	</div>

	<div class="editor-body">
		<!-- ── Painel esquerdo: lista de campos ── -->
		<div class="field-panel">
			<p class="panel-hint">Habilite/desabilite e configure cada campo:</p>

			{#each fields as field}
				<FieldConfigRow {field} {fonts} on:change={onRowChange} />
			{/each}

			{#if selectedKey}
				{@const sel = fields.find((f) => f.key === selectedKey)}
				{#if sel}
					<div class="coords-box">
						<span class="coords-title">Campo selecionado: <strong>{sel.label}</strong></span>
						<div class="coords-inputs">
							<label>
								X (%)
								<input
									class="coord-input"
									type="number"
									min="0"
									max="100"
									step="0.1"
									value={sel.x.toFixed(1)}
									on:change={(e) =>
										updateField(selectedKey, { x: clamp(parseFloat((e.currentTarget as HTMLInputElement).value), 0, 100) })}
								/>
							</label>
							<label>
								Y (%)
								<input
									class="coord-input"
									type="number"
									min="0"
									max="100"
									step="0.1"
									value={sel.y.toFixed(1)}
									on:change={(e) =>
										updateField(selectedKey, { y: clamp(parseFloat((e.currentTarget as HTMLInputElement).value), 0, 100) })}
								/>
							</label>
							<label>
								Tamanho
								<input
									class="coord-input"
									type="number"
									min="6"
									max="120"
									value={sel.fontSize}
									on:change={(e) =>
										updateField(selectedKey, { fontSize: clamp(parseInt((e.currentTarget as HTMLInputElement).value), 6, 120) })}
								/>
							</label>
						</div>
						<p class="coords-hint">Setas do teclado = nudge · Shift+seta = passo maior</p>
					</div>
				{/if}
			{/if}
		</div>

		<!-- ── Canvas visual (A4 paisagem) ── -->
		<div class="canvas-wrapper">
			<div
				class="canvas-area"
				class:has-template={!!templatePreviewUrl}
				bind:this={canvasEl}
				bind:clientWidth={canvasClientWidth}
				on:click={onCanvasClick}
				role="presentation"
			>
				<!-- PDF do template renderizado como canvas de fundo -->
				{#if templatePreviewUrl}
					<PdfPageCanvas url={templatePreviewUrl} />
				{/if}

				<!-- Grade de referência (visível sem template, sutil com template) -->
				<div class="canvas-grid" aria-hidden="true"></div>

				<!-- Chips de campos -->
				{#each fields as field}
					{#if field.enabled}
						{@const chipColor = FIELD_CHIP_COLORS[field.key]}
						{@const isSelected = selectedKey === field.key}
						{@const isDragging = dragging === field.key}

						<div
							class="field-chip"
							class:selected={isSelected}
							class:is-dragging={isDragging}
							style="
								left: {field.x}%;
								top: {field.y}%;
								background: {chipColor};
								font-size: {Math.max(7, field.fontSize * fontScale)}px;
								line-height: 1.2;
							"
							on:pointerdown={(e) => onChipPointerDown(e, field.key)}
							on:pointermove={(e) => onChipPointerMove(e, field.key)}
							on:pointerup={(e) => onChipPointerUp(e, field.key)}
							on:lostpointercapture={(e) => onChipPointerUp(e, field.key)}
							role="button"
							tabindex="0"
							aria-label="Campo {field.label}"
						>
							<span class="chip-label">{field.label}</span>
							<span class="chip-size">{field.fontSize}pt</span>

							<!-- Handle de resize (arrastar para direita = maior, esq = menor) -->
							<div
								class="resize-handle"
								data-resize="true"
								title="Arrastar para redimensionar fonte"
								on:pointerdown={(e) => onResizePointerDown(e, field.key)}
								on:pointermove={(e) => onResizePointerMove(e, field.key)}
								on:pointerup={onResizePointerUp}
								on:lostpointercapture={onResizePointerUp}
								role="presentation"
							>
								<svg width="8" height="8" viewBox="0 0 8 8" fill="currentColor">
									<path d="M7 1L1 7M4 1L1 4M7 4L4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
								</svg>
							</div>
						</div>

						<!-- Tooltip de coordenadas quando selecionado -->
						{#if isSelected}
							<div
								class="coords-tooltip"
								style="left: {field.x}%; top: calc({field.y}% - 22px);"
							>
								{pxLabel(field)}
							</div>
						{/if}
					{/if}
				{/each}

				<!-- Réguas de referência (linhas de centro) -->
				<div class="ruler-h" aria-hidden="true"></div>
				<div class="ruler-v" aria-hidden="true"></div>
			</div>

			<p class="canvas-hint">
				Arraste os chips para posicionar · Handle <svg class="hint-icon" viewBox="0 0 8 8"><path d="M7 1L1 7M4 1L1 4M7 4L4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg> para redimensionar · Setas do teclado para ajuste fino
			</p>
		</div>
	</div>
</div>

<style>
	.field-editor {
		margin-bottom: var(--spacing-xl);
	}

	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
	}

	/* ── Layout principal ── */
	.editor-body {
		display: grid;
		grid-template-columns: 420px 1fr;
		gap: var(--spacing-lg);
		padding: var(--spacing-lg);
		align-items: start;
	}

	@media (max-width: 900px) {
		.editor-body {
			grid-template-columns: 1fr;
		}
	}

	/* ── Painel de campos ── */
	.field-panel {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.panel-hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		margin-bottom: var(--spacing-xs);
	}

	/* ── Caixa de coords do campo selecionado ── */
	.coords-box {
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background: var(--color-primary-50, #eef2ff);
		border: 1px solid var(--color-primary-200, #c7d2fe);
		border-radius: var(--border-radius-md);
	}

	.coords-title {
		font-size: var(--font-size-xs);
		color: var(--color-primary-700, #3730a3);
		display: block;
		margin-bottom: var(--spacing-xs);
	}

	.coords-inputs {
		display: flex;
		gap: var(--spacing-sm);
		flex-wrap: wrap;
	}

	.coords-inputs label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		font-size: var(--font-size-xs);
		color: var(--color-neutral-600);
	}

	.coord-input {
		width: 72px;
		height: 28px;
		padding: 0 var(--spacing-xs);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		text-align: center;
	}

	.coords-hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		margin-top: var(--spacing-xs);
	}

	/* ── Canvas ── */
	.canvas-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.canvas-area {
		position: relative;
		aspect-ratio: 842 / 595;
		width: 100%;
		background: #fff;
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		cursor: default;
		user-select: none;
	}

	/* Grade sutil de 25% */
	.canvas-grid {
		position: absolute;
		inset: 0;
		pointer-events: none;
		z-index: 1;
		background-image:
			linear-gradient(rgba(0, 0, 0, 0.04) 1px, transparent 1px),
			linear-gradient(90deg, rgba(0, 0, 0, 0.04) 1px, transparent 1px);
		background-size: 25% 25%;
		transition: opacity 0.2s;
	}

	/* Com template: grade quase invisível para não poluir o PDF */
	.canvas-area.has-template .canvas-grid {
		opacity: 0.3;
	}

	/* Réguas centrais */
	.ruler-h {
		position: absolute;
		left: 0; right: 0; top: 50%;
		height: 1px;
		background: rgba(100, 116, 139, 0.2);
		pointer-events: none;
		z-index: 2;
	}

	.ruler-v {
		position: absolute;
		top: 0; bottom: 0; left: 50%;
		width: 1px;
		background: rgba(100, 116, 139, 0.2);
		pointer-events: none;
		z-index: 2;
	}

	/* ── Chips ── */
	.field-chip {
		position: absolute;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 3px 6px 3px 8px;
		border-radius: 4px;
		color: #fff;
		font-weight: 600;
		cursor: grab;
		touch-action: none;
		white-space: nowrap;
		box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
		border: 2px solid transparent;
		transition: box-shadow 0.1s, border-color 0.1s;
		z-index: 3;
	}

	.field-chip:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
		z-index: 4;
	}

	.field-chip.selected {
		border-color: rgba(255, 255, 255, 0.9);
		box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.4), 0 2px 8px rgba(0, 0, 0, 0.35);
		z-index: 5;
	}

	.field-chip.is-dragging {
		cursor: grabbing;
		opacity: 0.9;
		z-index: 10;
	}

	.chip-label {
		line-height: 1;
	}

	.chip-size {
		font-size: 9px;
		opacity: 0.75;
		font-weight: 400;
	}

	/* Handle de resize (canto inferior direito do chip) */
	.resize-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		cursor: ew-resize;
		opacity: 0.7;
		border-radius: 2px;
		margin-left: 2px;
		flex-shrink: 0;
		transition: opacity 0.1s, background 0.1s;
	}

	.resize-handle:hover {
		opacity: 1;
		background: rgba(255, 255, 255, 0.2);
	}

	.resize-handle svg {
		pointer-events: none;
	}

	/* Tooltip de coords */
	.coords-tooltip {
		position: absolute;
		transform: translateX(-50%);
		background: rgba(15, 23, 42, 0.85);
		color: #fff;
		font-size: 9px;
		padding: 2px 5px;
		border-radius: 3px;
		pointer-events: none;
		white-space: nowrap;
		z-index: 20;
		letter-spacing: 0.3px;
		backdrop-filter: blur(2px);
	}

	.canvas-hint {
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.hint-icon {
		width: 10px;
		height: 10px;
		display: inline-block;
		vertical-align: middle;
		color: var(--text-color-subtle);
		fill: none;
	}
</style>
