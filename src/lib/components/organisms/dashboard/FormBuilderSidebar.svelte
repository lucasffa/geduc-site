<!-- src/lib/components/organisms/FormBuilderSidebar.svelte -->
<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { FormTheme, FormSection } from '$lib/types/forms';

	export let accessType: 'public' | 'private';
	export let isActive: boolean;
	export let mode: 'create' | 'edit';
	export let theme: FormTheme;
	export let sections: FormSection[];

	const dispatch = createEventDispatcher<{
		accessTypeChange: { value: 'public' | 'private' };
		isActiveChange: { value: boolean };
		themeChange: { theme: FormTheme };
		addSection: void;
		removeSection: { sectionId: string };
		sectionTitleChange: { sectionId: string; title: string };
	}>();

	function updateTheme(key: keyof FormTheme, value: string) {
		dispatch('themeChange', { theme: { ...theme, [key]: value } });
	}

	// ── Image upload (FileReader → base64) ───────────────────────────────────
	let imageError = '';
	let imageLoading = false;
	let fileInputEl: HTMLInputElement;

	async function resizeImage(file: File, maxPx = 1200): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
			reader.onload = (e) => {
				const img = new Image();
				img.onerror = () => reject(new Error('Imagem inválida'));
				img.onload = () => {
					const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
					const w = Math.round(img.width * scale);
					const h = Math.round(img.height * scale);
					const canvas = document.createElement('canvas');
					canvas.width = w;
					canvas.height = h;
					canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
					resolve(canvas.toDataURL('image/jpeg', 0.82));
				};
				img.src = e.target!.result as string;
			};
			reader.readAsDataURL(file);
		});
	}

	async function handleImageFile(e: Event) {
		const file = (e.target as HTMLInputElement).files?.[0];
		if (!file) return;
		if (file.size > 5 * 1024 * 1024) {
			imageError = 'Arquivo muito grande. Máximo 5 MB.';
			return;
		}
		if (!file.type.startsWith('image/')) {
			imageError = 'Por favor, selecione uma imagem (JPG, PNG ou WEBP).';
			return;
		}
		imageError = '';
		imageLoading = true;
		try {
			const dataUrl = await resizeImage(file);
			updateTheme('headerImage', dataUrl);
		} catch {
			imageError = 'Não foi possível processar a imagem.';
		} finally {
			imageLoading = false;
		}
	}

	function removeImage() {
		updateTheme('headerImage', '');
		if (fileInputEl) fileInputEl.value = '';
	}

	$: hasImage = !!theme.headerImage;
</script>

<aside class="sidebar">
	<!-- ── Visibilidade ── -->
	<section class="sidebar-section">
		<h3 class="sidebar-heading">Visibilidade</h3>
		<div class="radio-group">
			<label class="radio-card" class:is-selected={accessType === 'public'}>
				<input type="radio" name="accessTypeGroup" value="public"
					checked={accessType === 'public'}
					on:change={() => dispatch('accessTypeChange', { value: 'public' })} />
				<span class="radio-icon">
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"/>
						<line x1="2" y1="12" x2="22" y2="12"/>
						<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
					</svg>
				</span>
				<span class="radio-text">
					<strong>Público</strong>
					<small>Qualquer pessoa com o link</small>
				</span>
			</label>
			<label class="radio-card" class:is-selected={accessType === 'private'}>
				<input type="radio" name="accessTypeGroup" value="private"
					checked={accessType === 'private'}
					on:change={() => dispatch('accessTypeChange', { value: 'private' })} />
				<span class="radio-icon">
					<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
						<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
					</svg>
				</span>
				<span class="radio-text">
					<strong>Privado</strong>
					<small>Exige autenticação</small>
				</span>
			</label>
		</div>

		{#if mode === 'edit'}
			<div class="toggle-row">
				<span class="toggle-label">Formulário ativo</span>
				<button type="button" class="toggle-btn" class:is-on={isActive} aria-pressed={isActive}
					on:click={() => dispatch('isActiveChange', { value: !isActive })}>
					<span class="toggle-thumb" />
				</button>
			</div>
		{/if}
	</section>

	<hr class="divider" />

	<!-- ── Aparência ── -->
	<section class="sidebar-section">
		<h3 class="sidebar-heading">Aparência</h3>

		<div class="color-row">
			<div class="color-field">
				<span class="color-label-text">Cor primária</span>
				<label class="color-picker-wrap">
					<input type="color" value={theme.primaryColor}
						on:input={(e) => updateTheme('primaryColor', (e.target as HTMLInputElement).value)} />
					<span class="color-hex">{theme.primaryColor}</span>
				</label>
			</div>
			<div class="color-field">
				<span class="color-label-text">Fundo</span>
				<label class="color-picker-wrap">
					<input type="color" value={theme.backgroundColor}
						on:input={(e) => updateTheme('backgroundColor', (e.target as HTMLInputElement).value)} />
					<span class="color-hex">{theme.backgroundColor}</span>
				</label>
			</div>
		</div>

		<label class="stack-label">
			Fonte
			<input type="text" class="text-input" value={theme.fontFamily}
				placeholder="DM Sans, Inter, Georgia…"
				on:input={(e) => updateTheme('fontFamily', (e.target as HTMLInputElement).value)} />
		</label>

		<div class="stack-label">
			<span>Imagem de capa</span>

			{#if hasImage}
				<div class="img-preview-wrap">
					<img class="img-preview" src={theme.headerImage} alt="Pré-visualização da capa" />
					<button type="button" class="img-remove-btn" title="Remover imagem" on:click={removeImage}>
						<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
							<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
						</svg>
					</button>
				</div>
			{:else}
				<button type="button" class="upload-btn" class:is-loading={imageLoading}
					on:click={() => fileInputEl?.click()}>
					{#if imageLoading}
						<span class="spinner" /> Processando…
					{:else}
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
							<path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
						</svg>
						Escolher imagem
					{/if}
				</button>
			{/if}

			<input bind:this={fileInputEl} type="file"
				accept="image/jpeg,image/png,image/webp,image/gif"
				class="file-hidden" on:change={handleImageFile} />

			{#if imageError}
				<span class="img-error">{imageError}</span>
			{:else}
				<small class="img-hint">JPG, PNG, WEBP · máx. 5 MB</small>
			{/if}
		</div>
	</section>

	<hr class="divider" />

	<!-- ── Páginas ── -->
	<section class="sidebar-section">
		<div class="pages-head">
			<h3 class="sidebar-heading" style="margin:0">Páginas</h3>
			<span class="page-badge">{sections.length}</span>
		</div>

		<div class="pages-list">
			{#each sections as section, idx (section.id)}
				<div class="page-card">
					<div class="page-card-top">
						<span class="page-num">#{idx + 1}</span>
						<input class="page-title-input" value={section.title} placeholder="Título da página"
							on:input={(e) => dispatch('sectionTitleChange', {
								sectionId: section.id,
								title: (e.target as HTMLInputElement).value
							})} />
						{#if sections.length > 1}
							<button type="button" class="page-remove-btn" title="Remover página"
								on:click={() => dispatch('removeSection', { sectionId: section.id })}>
								<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
									<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
								</svg>
							</button>
						{/if}
					</div>
					<span class="page-field-count">
						<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
							<polyline points="14 2 14 8 20 8"/>
						</svg>
						{section.fields?.length ?? 0} campo{(section.fields?.length ?? 0) !== 1 ? 's' : ''}
					</span>
				</div>
			{/each}
		</div>

		<button type="button" class="add-page-btn" on:click={() => dispatch('addSection')}>
			<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
				<path d="M12 5v14M5 12h14" />
			</svg>
			Adicionar página
		</button>
	</section>
</aside>

<style>
	.sidebar {
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 12px;
		background: var(--background-color-card, #fff);
		display: flex;
		flex-direction: column;
		position: sticky;
		top: 4.5rem;
		max-height: calc(100vh - 6rem);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--border-color-default, #e5e7eb) transparent;
	}

	.sidebar-section { padding: 0.875rem 1rem; display: grid; gap: 0.6rem; }

	.sidebar-heading {
		margin: 0;
		font-size: 0.68rem;
		font-weight: 700;
		color: var(--text-color-secondary, #9ca3af);
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	.divider { border: none; border-top: 1px solid var(--border-color-default, #f3f4f6); margin: 0; }

	/* Radio cards */
	.radio-group { display: grid; gap: 0.35rem; }
	.radio-card {
		display: flex; align-items: center; gap: 0.6rem;
		padding: 0.55rem 0.7rem;
		border: 1.5px solid var(--border-color-default, #e5e7eb);
		border-radius: 9px; cursor: pointer;
		transition: border-color 0.12s, background 0.12s;
		user-select: none;
	}
	.radio-card:hover { border-color: color-mix(in srgb, var(--builder-primary, #324acb) 45%, transparent); }
	.radio-card.is-selected {
		border-color: var(--builder-primary, #324acb);
		background: color-mix(in srgb, var(--builder-primary, #324acb) 5%, transparent);
	}
	.radio-card input { position: absolute; opacity: 0; pointer-events: none; }
	.radio-icon {
		display: flex; align-items: center; justify-content: center;
		width: 1.875rem; height: 1.875rem; border-radius: 7px; flex-shrink: 0;
		background: color-mix(in srgb, var(--builder-primary, #324acb) 10%, transparent);
		color: var(--builder-primary, #324acb);
	}
	.radio-text { display: grid; gap: 0.05rem; }
	.radio-text strong { font-size: 0.83rem; color: var(--text-color-primary, #111827); font-weight: 600; }
	.radio-text small { font-size: 0.72rem; color: var(--text-color-secondary, #9ca3af); }

	/* Toggle */
	.toggle-row { display: flex; align-items: center; justify-content: space-between; padding: 0.3rem 0; }
	.toggle-label { font-size: 0.83rem; color: var(--text-color-primary, #374151); font-weight: 500; }
	.toggle-btn {
		position: relative; width: 2.375rem; height: 1.3rem;
		border: none; border-radius: 999px;
		background: var(--border-color-default, #d1d5db);
		cursor: pointer; padding: 0; transition: background 0.18s; flex-shrink: 0;
	}
	.toggle-btn.is-on { background: var(--builder-primary, #324acb); }
	.toggle-thumb {
		position: absolute; top: 0.175rem; left: 0.175rem;
		width: 0.95rem; height: 0.95rem; border-radius: 50%;
		background: white; transition: transform 0.18s;
		box-shadow: 0 1px 3px rgba(0,0,0,.18);
	}
	.toggle-btn.is-on .toggle-thumb { transform: translateX(1.075rem); }

	/* Colors */
	.color-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
	.color-field { display: grid; gap: 0.28rem; }
	.color-label-text { font-size: 0.76rem; color: var(--text-color-secondary, #6b7280); font-weight: 500; }
	.color-picker-wrap {
		display: flex; align-items: center; gap: 0.4rem; cursor: pointer;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 7px; padding: 0.28rem 0.4rem;
		transition: border-color 0.12s;
	}
	.color-picker-wrap:hover { border-color: var(--builder-primary, #324acb); }
	input[type='color'] {
		width: 1.375rem; height: 1.375rem;
		border: none; border-radius: 4px; padding: 0;
		cursor: pointer; background: transparent; flex-shrink: 0;
	}
	.color-hex { font-size: 0.72rem; color: var(--text-color-secondary, #6b7280); font-family: monospace; }

	/* Text inputs */
	.stack-label { display: grid; gap: 0.3rem; font-size: 0.8rem; color: var(--text-color-secondary, #4b5563); font-weight: 500; }
	.text-input {
		width: 100%; border: 1px solid var(--border-color-default, #d1d5db);
		border-radius: 7px; padding: 0.42rem 0.55rem;
		font-size: 0.84rem; font-family: inherit;
		background: var(--background-color-card, #fff);
		color: var(--text-color-primary, #111827);
		outline: none; box-sizing: border-box;
		transition: border-color 0.12s, box-shadow 0.12s;
	}
	.text-input:focus {
		border-color: var(--builder-primary, #324acb);
		box-shadow: 0 0 0 2px color-mix(in srgb, var(--builder-primary, #324acb) 15%, transparent);
	}

	/* Image upload */
	.img-preview-wrap { position: relative; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color-default, #e5e7eb); }
	.img-preview { width: 100%; height: 90px; object-fit: cover; display: block; }
	.img-remove-btn {
		position: absolute; top: 0.35rem; right: 0.35rem;
		width: 1.375rem; height: 1.375rem; border-radius: 50%;
		border: none; background: rgba(0,0,0,.55); color: white;
		cursor: pointer; display: flex; align-items: center; justify-content: center;
		transition: background 0.12s;
	}
	.img-remove-btn:hover { background: rgba(0,0,0,.8); }

	.upload-btn {
		display: flex; align-items: center; justify-content: center; gap: 0.45rem;
		border: 1.5px dashed var(--border-color-default, #d1d5db);
		border-radius: 8px; padding: 0.65rem;
		font-size: 0.83rem; font-family: inherit;
		color: var(--text-color-secondary, #6b7280);
		background: var(--background-color-subtle, #f9fafb);
		cursor: pointer; width: 100%;
		transition: border-color 0.12s, color 0.12s, background 0.12s;
	}
	.upload-btn:hover:not(.is-loading) {
		border-color: var(--builder-primary, #324acb);
		color: var(--builder-primary, #324acb);
		background: color-mix(in srgb, var(--builder-primary, #324acb) 5%, transparent);
	}
	.upload-btn.is-loading { cursor: wait; opacity: 0.7; }
	.file-hidden { display: none; }
	.img-hint { font-size: 0.71rem; color: var(--text-color-secondary, #9ca3af); }
	.img-error { font-size: 0.76rem; color: var(--color-error, #dc2626); }
	.spinner {
		display: inline-block; width: 12px; height: 12px;
		border: 2px solid currentColor; border-top-color: transparent;
		border-radius: 50%; animation: spin 0.6s linear infinite;
	}
	@keyframes spin { to { transform: rotate(360deg); } }

	/* Pages */
	.pages-head { display: flex; align-items: center; gap: 0.45rem; }
	.page-badge {
		display: inline-flex; align-items: center; justify-content: center;
		min-width: 1.2rem; height: 1.2rem; padding: 0 0.2rem;
		background: color-mix(in srgb, var(--builder-primary, #324acb) 12%, transparent);
		color: var(--builder-primary, #324acb);
		font-size: 0.7rem; font-weight: 700; border-radius: 999px;
	}
	.pages-list { display: grid; gap: 0.35rem; }
	.page-card {
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px; padding: 0.5rem 0.6rem;
		background: var(--background-color-subtle, #f9fafb);
		display: grid; gap: 0.25rem;
	}
	.page-card-top { display: flex; align-items: center; gap: 0.35rem; }
	.page-num {
		font-size: 0.68rem; font-weight: 700;
		color: var(--builder-primary, #324acb);
		background: color-mix(in srgb, var(--builder-primary, #324acb) 12%, transparent);
		border-radius: 4px; padding: 0.12rem 0.3rem; flex-shrink: 0;
	}
	.page-title-input {
		flex: 1; min-width: 0;
		border: 1px solid transparent; border-radius: 5px;
		padding: 0.18rem 0.32rem;
		font-size: 0.83rem; font-family: inherit;
		background: transparent; color: var(--text-color-primary, #111827);
		outline: none; font-weight: 500;
		transition: border-color 0.12s, background 0.12s;
	}
	.page-title-input:focus {
		border-color: var(--builder-primary, #324acb);
		background: var(--background-color-card, #fff);
	}
	.page-remove-btn {
		display: flex; align-items: center; justify-content: center;
		width: 1.375rem; height: 1.375rem;
		border: none; background: transparent;
		color: var(--text-color-secondary, #9ca3af);
		border-radius: 4px; cursor: pointer; flex-shrink: 0;
		transition: background 0.1s, color 0.1s;
	}
	.page-remove-btn:hover {
		background: color-mix(in srgb, var(--color-error, #ef4444) 10%, transparent);
		color: var(--color-error, #dc2626);
	}
	.page-field-count {
		display: flex; align-items: center; gap: 0.25rem;
		font-size: 0.71rem; color: var(--text-color-secondary, #9ca3af);
	}
	.add-page-btn {
		display: flex; align-items: center; justify-content: center; gap: 0.4rem;
		background: transparent;
		border: 1.5px dashed var(--border-color-default, #d1d5db);
		border-radius: 8px; padding: 0.48rem;
		font-size: 0.81rem; font-family: inherit;
		color: var(--text-color-secondary, #6b7280);
		cursor: pointer;
		transition: border-color 0.12s, color 0.12s, background 0.12s;
	}
	.add-page-btn:hover {
		border-color: var(--builder-primary, #324acb);
		color: var(--builder-primary, #324acb);
		background: color-mix(in srgb, var(--builder-primary, #324acb) 4%, transparent);
	}

	@media (max-width: 1000px) {
		.sidebar { position: static; max-height: none; }
	}
</style>