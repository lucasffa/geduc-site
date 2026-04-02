<!-- src/lib/components/atoms/PdfPageCanvas.svelte -->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';

	// Import estático com ?url — Vite resolve o caminho em build-time e
	// retorna a URL correta para o worker (não relativa ao componente).
	import pdfjsWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

	/** URL do PDF a renderizar. */
	export let url: string;

	let canvasEl: HTMLCanvasElement;
	let status: 'idle' | 'loading' | 'ready' | 'error' = 'idle';
	let renderTask: { cancel(): void; promise: Promise<void> } | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let pdfjsLib: any = null;
	let currentUrl = '';

	onMount(async () => {
		const lib = await import('pdfjs-dist');
		lib.GlobalWorkerOptions.workerSrc = pdfjsWorkerUrl;
		pdfjsLib = lib;

		if (url) await renderPage(url);
	});

	onDestroy(() => {
		renderTask?.cancel();
	});

	$: if (pdfjsLib && canvasEl && url !== currentUrl) renderPage(url);

	async function renderPage(pdfUrl: string) {
		if (!pdfjsLib || !canvasEl) return;

		currentUrl = pdfUrl;
		status = 'loading';

		renderTask?.cancel();
		renderTask = null;

		try {
			const pdf = await pdfjsLib.getDocument(pdfUrl).promise;
			const page = await pdf.getPage(1);

			const container = canvasEl.parentElement;
			const containerW = container?.clientWidth ?? 842;
			const containerH = container?.clientHeight ?? 595;

			const base = page.getViewport({ scale: 1 });
			const scale = containerW / base.width;
			const viewport = page.getViewport({ scale });

			canvasEl.width  = containerW;
			canvasEl.height = containerH;

			const ctx = canvasEl.getContext('2d')!;
			ctx.clearRect(0, 0, containerW, containerH);

			renderTask = page.render({ canvasContext: ctx, viewport });
			await renderTask.promise;

			status = 'ready';
		} catch (e: unknown) {
			if ((e as { name?: string })?.name !== 'RenderingCancelledException') {
				console.warn('[PdfPageCanvas]', e);
				status = 'error';
			}
		}
	}
</script>

{#if status === 'loading'}
	<div class="state-overlay">
		<span class="spinner"></span>
		Carregando template…
	</div>
{:else if status === 'error'}
	<div class="state-overlay state-error">Não foi possível exibir o PDF</div>
{/if}

<canvas
	bind:this={canvasEl}
	class="pdf-canvas"
	class:hidden={status !== 'ready'}
	aria-hidden="true"
></canvas>

<style>
	.pdf-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		pointer-events: none;
		z-index: 0;
	}

	.pdf-canvas.hidden {
		visibility: hidden;
	}

	.state-overlay {
		position: absolute;
		inset: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		font-size: 11px;
		color: var(--text-color-subtle);
		background: rgba(255, 255, 255, 0.75);
		pointer-events: none;
	}

	.state-error {
		color: var(--color-danger-600, #dc2626);
	}

	.spinner {
		display: inline-block;
		width: 14px;
		height: 14px;
		border: 2px solid var(--color-neutral-200);
		border-top-color: var(--color-primary-500, #6366f1);
		border-radius: 50%;
		animation: spin 0.7s linear infinite;
		flex-shrink: 0;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
