<!-- src/routes/dashboard/forms/create/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	export let data: any;
	export let form: ActionData;

	// ── Form meta ──────────────────────────────────────────────────────────────
	let title = data.form.title || '';
	let description = data.form.description || '';
	let accessType: 'public' | 'private' = data.form.isPublic ? 'public' : 'private';
	let isActive = data.form.isActive ?? true;

	$: isPublic = accessType === 'public';
	$: requiresAuth = accessType === 'private';

	// ── Field definition ───────────────────────────────────────────────────────
	type FieldType = 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'tel' | 'url';

	interface FieldOption { label: string; value: string; }
	interface Field {
		id: string;
		name: string;
		type: FieldType;
		label: string;
		placeholder?: string;
		required: boolean;
		options?: FieldOption[];
	}

	let fields: Field[] = (() => {
		try {
			const parsed = typeof data.form.definition === 'string' ? JSON.parse(data.form.definition) : data.form.definition;
			return parsed.fields || [];
		} catch {
			return [];
		}
	})();

	if (fields.length === 0) {
		fields = [
			{ id: 'field_name',  name: 'name',  type: 'text',  label: 'Nome',   required: true },
			{ id: 'field_email', name: 'email', type: 'email', label: 'E-mail', required: true }
		];
	}

	// ── UI state ───────────────────────────────────────────────────────────────
	let activeFieldId: string | null = null;
	let showTypeMenu = false;
	let typeMenuFor: string | null = null;

	// ── Computed serialized definition (fed to hidden input) ───────────────────
	$: definitionJson = JSON.stringify({
		fields: fields.map(({ id, name, type, label, placeholder, required, options }) => ({
			id, name, type, label,
			...(placeholder ? { placeholder } : {}),
			required,
			...(options?.length ? { options } : {})
		}))
	});

	// ── Field helpers ──────────────────────────────────────────────────────────
	function uid() {
		return `field_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
	}

	function addField() {
		const id = uid();
		fields = [...fields, {
			id,
			name: id,
			type: 'text',
			label: 'Pergunta sem título',
			required: false
		}];
		activeFieldId = id;
	}

	function removeField(id: string) {
		fields = fields.filter(f => f.id !== id);
		if (activeFieldId === id) activeFieldId = null;
	}

	function duplicateField(id: string) {
		const idx = fields.findIndex(f => f.id === id);
		if (idx === -1) return;
		const newId = uid();
		const copy: Field = {
			...fields[idx],
			id: newId,
			name: newId,
			label: fields[idx].label + ' (cópia)',
			options: fields[idx].options ? [...fields[idx].options!] : undefined
		};
		fields = [...fields.slice(0, idx + 1), copy, ...fields.slice(idx + 1)];
		activeFieldId = newId;
	}

	function moveField(fromIdx: number, dir: -1 | 1) {
		const toIdx = fromIdx + dir;
		if (toIdx < 0 || toIdx >= fields.length) return;
		const arr = [...fields];
		[arr[fromIdx], arr[toIdx]] = [arr[toIdx], arr[fromIdx]];
		fields = arr;
	}

	function setFieldType(id: string, type: FieldType) {
		fields = fields.map(f => {
			if (f.id !== id) return f;
			const needsOptions = ['select', 'radio', 'checkbox'].includes(type);
			return {
				...f,
				type,
				options: needsOptions ? (f.options?.length ? f.options : [
					{ label: 'Opção 1', value: 'opcao_1' },
					{ label: 'Opção 2', value: 'opcao_2' }
				]) : undefined
			};
		});
		showTypeMenu = false;
	}

	function addOption(fieldId: string) {
		fields = fields.map(f => {
			if (f.id !== fieldId) return f;
			const n = (f.options?.length ?? 0) + 1;
			return {
				...f,
				options: [...(f.options ?? []), { label: `Opção ${n}`, value: `opcao_${n}` }]
			};
		});
	}

	function removeOption(fieldId: string, optIdx: number) {
		fields = fields.map(f => {
			if (f.id !== fieldId) return f;
			const opts = f.options?.filter((_, i) => i !== optIdx) ?? [];
			return { ...f, options: opts };
		});
	}

	function updateOption(fieldId: string, optIdx: number, key: 'label' | 'value', val: string) {
		fields = fields.map(f => {
			if (f.id !== fieldId) return f;
			const opts = [...(f.options ?? [])];
			opts[optIdx] = { ...opts[optIdx], [key]: val };
			return { ...f, options: opts };
		});
	}

	// Close type menu on outside click
	function handleWindowClick(e: MouseEvent) {
		if (!(e.target as HTMLElement).closest('.type-selector-wrap')) {
			showTypeMenu = false;
		}
	}

	// ── Type metadata ──────────────────────────────────────────────────────────
	const FIELD_TYPES: { type: FieldType; label: string; icon: string }[] = [
		{ type: 'text',     label: 'Texto curto',      icon: '📝' },
		{ type: 'textarea', label: 'Texto longo',       icon: '📄' },
		{ type: 'email',    label: 'E-mail',            icon: '✉️' },
		{ type: 'number',   label: 'Número',            icon: '🔢' },
		{ type: 'tel',      label: 'Telefone',          icon: '📞' },
		{ type: 'url',      label: 'URL',               icon: '🔗' },
		{ type: 'date',     label: 'Data',              icon: '📅' },
		{ type: 'select',   label: 'Lista suspensa',    icon: '📋' },
		{ type: 'radio',    label: 'Múltipla escolha',  icon: '⭕' },
		{ type: 'checkbox', label: 'Caixas de seleção', icon: '☑️' }
	];

	const hasOptions = (type: string) => ['select', 'radio', 'checkbox'].includes(type);

	function typeLabel(t: FieldType) {
		return FIELD_TYPES.find(x => x.type === t)?.label ?? t;
	}

	function typeIcon(t: FieldType) {
		return FIELD_TYPES.find(x => x.type === t)?.icon ?? '📝';
	}
</script>

<svelte:window on:click={handleWindowClick} />

<svelte:head>
	<title>Editar formulário</title>
</svelte:head>

<div class="builder">
	<!-- ── Sticky header ─────────────────────────────────────────── -->
	<header class="builder-header">
		<button class="back-btn" type="button" on:click={() => goto('/dashboard/forms')}>
			<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<path d="M19 12H5M12 19l-7-7 7-7"/>
			</svg>
			Formulários
		</button>

		<div class="header-title-group">
			<span class="header-label">Editar formulário</span>
		</div>

		<div class="header-right">
			{#if form?.error}
				<span class="header-error" role="alert">{form.error}</span>
			{/if}
			<button class="save-btn" type="submit" form="builder-form">
				Salvar formulário
			</button>
		</div>
	</header>

	<!-- ── Main layout ───────────────────────────────────────────── -->
	<div class="builder-layout">

		<!-- Left: canvas -->
		<main class="canvas-col">
			<form
				id="builder-form"
				method="POST"
				action="?/update"
				use:enhance={() => {
					return async ({ update }) => {
						await update();
					};
				}}
			>
				<!-- Hidden definition payload — THIS is what the server reads -->
				<input type="hidden" name="definition" value={definitionJson} />
				<input type="hidden" name="isPublic" value={String(isPublic)} />
				<input type="hidden" name="requiresAuth" value={String(requiresAuth)} />
				<input type="hidden" name="isActive" value={String(isActive)} />

				<!-- Form meta card -->
				<div class="canvas-card meta-card">
					<div class="meta-stripe"></div>
					<div class="meta-body">
						<input
							class="meta-title"
							type="text"
							name="title"
							bind:value={title}
							placeholder="Título do formulário"
							required
							aria-label="Título do formulário"
						/>
						<textarea
							class="meta-desc"
							name="description"
							bind:value={description}
							placeholder="Descrição (opcional)"
							rows="2"
							aria-label="Descrição do formulário"
						></textarea>
					</div>
				</div>

				<!-- Field cards -->
				{#each fields as field, idx (field.id)}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						class="canvas-card field-card"
						class:is-active={activeFieldId === field.id}
						on:click={() => (activeFieldId = field.id)}
					>
						<!-- Drag handle + move buttons -->
						<div class="field-sidebar">
							<div class="move-btns">
								<button type="button" class="move-btn" title="Mover para cima"
									disabled={idx === 0}
									on:click|stopPropagation={() => moveField(idx, -1)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
								</button>
								<button type="button" class="move-btn" title="Mover para baixo"
									disabled={idx === fields.length - 1}
									on:click|stopPropagation={() => moveField(idx, 1)}
								>
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
								</button>
							</div>
						</div>

						<div class="field-main">
							<!-- Label + type row -->
							<div class="field-top-row">
								<input
									class="field-label-input"
									type="text"
									bind:value={field.label}
									placeholder="Pergunta sem título"
									aria-label="Rótulo do campo"
									on:click|stopPropagation
								/>

								<!-- Type selector -->
								<div class="type-selector-wrap">
									<button
										type="button"
										class="type-selector-btn"
										aria-label="Alterar tipo de campo"
										on:click|stopPropagation={() => {
											if (showTypeMenu && typeMenuFor === field.id) {
												showTypeMenu = false;
											} else {
												typeMenuFor = field.id;
												showTypeMenu = true;
											}
										}}
									>
										<span>{typeIcon(field.type)}</span>
										<span>{typeLabel(field.type)}</span>
										<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M6 9l6 6 6-6"/></svg>
									</button>

									{#if showTypeMenu && typeMenuFor === field.id}
										<div class="type-menu" role="menu">
											{#each FIELD_TYPES as ft}
												<button
													type="button"
													class="type-menu-item"
													class:is-active={field.type === ft.type}
													role="menuitem"
													on:click|stopPropagation={() => setFieldType(field.id, ft.type)}
												>
													<span class="type-menu-icon">{ft.icon}</span>
													{ft.label}
												</button>
											{/each}
										</div>
									{/if}
								</div>
							</div>

							<!-- Placeholder input (for applicable types) -->
							{#if !hasOptions(field.type) && field.type !== 'date'}
								<input
									class="field-placeholder-input"
									type="text"
									bind:value={field.placeholder}
									placeholder="Texto de ajuda (opcional)"
									aria-label="Placeholder do campo"
									on:click|stopPropagation
								/>
							{/if}

							<!-- Options editor for select/radio/checkbox -->
							{#if hasOptions(field.type) && field.options}
								<div class="options-list">
									{#each field.options as opt, optIdx}
										<div class="option-row">
											<span class="option-bullet" aria-hidden="true">
												{#if field.type === 'radio'}○{:else if field.type === 'checkbox'}□{:else}—{/if}
											</span>
											<input
												class="option-input"
												type="text"
												value={opt.label}
												placeholder="Rótulo da opção"
												aria-label="Rótulo da opção {optIdx + 1}"
												on:input={(e) => updateOption(field.id, optIdx, 'label', (e.target as HTMLInputElement).value)}
												on:click|stopPropagation
											/>
											<button
												type="button"
												class="option-remove-btn"
												title="Remover opção"
												aria-label="Remover opção {optIdx + 1}"
												on:click|stopPropagation={() => removeOption(field.id, optIdx)}
												disabled={field.options!.length <= 1}
											>
												<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
											</button>
										</div>
									{/each}
									<button
										type="button"
										class="add-option-btn"
										on:click|stopPropagation={() => addOption(field.id)}
									>
										<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
										Adicionar opção
									</button>
								</div>
							{/if}

							<!-- Required toggle + delete row -->
							<div class="field-bottom-row">
								<label class="required-toggle">
									<input type="checkbox" bind:checked={field.required} on:click|stopPropagation />
									<span>Obrigatório</span>
								</label>
								<div class="field-action-btns">
									<button type="button" class="field-action-btn" title="Duplicar" on:click|stopPropagation={() => duplicateField(field.id)}>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<rect x="9" y="9" width="13" height="13" rx="2"/>
											<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
										</svg>
									</button>
									<button
										type="button"
										class="field-action-btn field-action-btn--danger"
										title="Excluir campo"
										disabled={fields.length <= 1}
										on:click|stopPropagation={() => removeField(field.id)}
									>
										<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
											<polyline points="3 6 5 6 21 6"/>
											<path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
										</svg>
									</button>
								</div>
							</div>
						</div>
					</div>
				{/each}

				<!-- Add field -->
				<button type="button" class="add-field-btn" on:click={addField}>
					<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
					Adicionar pergunta
				</button>
			</form>
		</main>

		<!-- Right: settings panel -->
		<aside class="settings-panel">
			<h2 class="settings-title">Configurações</h2>

			<div class="settings-section">
				<p class="settings-section-title">Acesso do Formulário</p>
				<div class="settings-field radio-group-vertical">
					<label class="radio-label">
						<input type="radio" name="accessTypeGroup" value="public" bind:group={accessType} />
						<div class="radio-content">
							<span class="radio-title">Público</span>
							<span class="settings-hint">Qualquer pessoa com o link pode acessar e responder.</span>
						</div>
					</label>
					<label class="radio-label">
						<input type="radio" name="accessTypeGroup" value="private" bind:group={accessType} />
						<div class="radio-content">
							<span class="radio-title">Privado</span>
							<span class="settings-hint">Apenas usuários logados na plataforma podem responder.</span>
						</div>
					</label>
				</div>
			</div>

			<div class="settings-section">
				<p class="settings-section-title">Status</p>
				<div class="settings-field radio-group-vertical">
					<label class="radio-label">
						<input type="radio" name="isActiveGroup" value={true} bind:group={isActive} />
						<div class="radio-content">
							<span class="radio-title">Ativo</span>
							<span class="settings-hint">O formulário está aceitando novas respostas.</span>
						</div>
					</label>
					<label class="radio-label">
						<input type="radio" name="isActiveGroup" value={false} bind:group={isActive} />
						<div class="radio-content">
							<span class="radio-title">Inativo</span>
							<span class="settings-hint">Novas respostas não serão aceitas.</span>
						</div>
					</label>
				</div>
			</div>

			<div class="settings-section">
				<p class="settings-section-title">Resumo</p>
				<div class="summary-stats">
					<div class="stat">
						<span class="stat-value">{fields.length}</span>
						<span class="stat-label">campo{fields.length !== 1 ? 's' : ''}</span>
					</div>
					<div class="stat">
						<span class="stat-value">{fields.filter(f => f.required).length}</span>
						<span class="stat-label">obrigatório{fields.filter(f => f.required).length !== 1 ? 's' : ''}</span>
					</div>
				</div>
			</div>
		</aside>
	</div>
</div>

<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

	* { box-sizing: border-box; }

	.builder {
		font-family: var(--font-family-sans);
		min-height: 100vh;
		background: var(--background-color-page);
		color: var(--text-color-primary);
		display: flex;
		flex-direction: column;
	}

	/* ── Header ── */
	.builder-header {
		position: sticky;
		top: 0;
		z-index: 100;
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--background-color-card);
		border-bottom: 1px solid var(--border-color-default);
		box-shadow: 0 1px 0 rgba(0,0,0,.06);
	}

	.back-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-md);
		background: transparent;
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-sm);
		font-size: var(--caption-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--text-color-secondary);
		cursor: pointer;
		transition: background-color 0.12s, color 0.12s;
		white-space: nowrap;
	}

	.back-btn:hover { background: var(--background-color-subtle); color: var(--text-color-primary); }

	.header-title-group { flex: 1; min-width: 0; }
	.header-label {
		font-size: var(--body-text-font-size);
		font-weight: var(--font-weight-medium);
		color: var(--text-color-secondary);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.header-error {
		font-size: var(--caption-text-font-size);
		color: var(--color-error);
	}

	.save-btn {
		padding: var(--spacing-sm) var(--spacing-lg);
		background: var(--color-primary-500);
		color: var(--text-color-white);
		border: none;
		border-radius: var(--border-radius-md);
		font-size: var(--body-text-font-size);
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.15s, transform 0.1s;
		white-space: nowrap;
	}

	.save-btn:hover {
		background: var(--color-primary-600);
		transform: translateY(-1px);
	}

	/* ── Layout ── */
	.builder-layout {
		display: flex;
		flex: 1;
		gap: 0;
		align-items: flex-start;
	}

	.canvas-col {
		flex: 1;
		min-width: 0;
		padding: 2rem 2rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.canvas-col form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		max-width: 680px;
		margin: 0 auto;
		width: 100%;
	}

	/* ── Cards ── */
	.canvas-card {
		background: var(--background-color-card);
		border: 1.5px solid var(--border-color-default);
		border-radius: var(--border-radius-lg);
		overflow: hidden;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.canvas-card:hover,
	.canvas-card.is-active {
		border-color: color-mix(in srgb, var(--color-primary-500) 50%, transparent);
		box-shadow: 0 2px 12px rgba(0,0,0,.07);
	}

	/* Meta card */
	.meta-stripe {
		height: 5px;
		background: var(--color-primary-500);
	}

	.meta-body { padding: 1.5rem 1.75rem; }

	.meta-title {
		display: block;
		width: 100%;
		font-size: 1.375rem;
		font-weight: var(--font-weight-semibold);
		letter-spacing: -0.025em;
		color: var(--text-color-primary);
		border: none;
		outline: none;
		background: transparent;
		font-family: inherit;
		padding: 0 0 0.5rem;
		border-bottom: 1.5px solid transparent;
		transition: border-color 0.15s;
	}

	.meta-title:focus { border-bottom-color: var(--color-primary-500); }
	.meta-title::placeholder { color: var(--text-color-tertiary); font-weight: 400; }

	.meta-desc {
		display: block;
		width: 100%;
		margin-top: var(--spacing-md);
		font-size: var(--body-text-font-size);
		color: var(--text-color-secondary);
		border: none;
		outline: none;
		background: transparent;
		font-family: var(--font-family-sans);
		resize: none;
		padding: 0;
		line-height: 1.6;
	}

	.meta-desc::placeholder { color: var(--text-secondary, #d1d5db); }

	/* Field card */
	.field-card {
		display: flex;
		cursor: pointer;
	}

	.field-sidebar {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		padding: 1rem 0.375rem 1rem 0.75rem;
		border-right: 1px solid var(--border-color-subtle);
		gap: var(--spacing-xs);
	}

	.move-btns { display: flex; flex-direction: column; gap: 2px; }

	.move-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: none;
		background: transparent;
		border-radius: var(--border-radius-xs);
		cursor: pointer;
		color: var(--text-color-tertiary);
		transition: background-color 0.12s, color 0.12s;
	}

	.move-btn:hover:not(:disabled) { background: var(--background-color-subtle); color: var(--text-color-primary); }
	.move-btn:disabled { opacity: 0.3; cursor: default; }

	.field-main {
		flex: 1;
		padding: var(--spacing-lg) var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		min-width: 0;
	}

	.field-top-row {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.field-label-input {
		flex: 1;
		font-size: var(--body-text-font-size);
		font-weight: var(--font-weight-medium);
		letter-spacing: -0.01em;
		color: var(--text-color-primary);
		border: none;
		border-bottom: 1.5px solid transparent;
		outline: none;
		background: transparent;
		font-family: var(--font-family-sans);
		padding: var(--spacing-xs) 0;
		min-width: 0;
		transition: border-color 0.15s;
	}

	.field-label-input:focus { border-bottom-color: var(--color-primary-500); }
	.field-label-input::placeholder { color: var(--text-color-tertiary); font-weight: 400; }

	/* Type selector */
	.type-selector-wrap { position: relative; flex-shrink: 0; }

	.type-selector-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--background-color-subtle);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-sm);
		font-size: var(--caption-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--text-color-secondary);
		cursor: pointer;
		white-space: nowrap;
		transition: background-color 0.12s, border-color 0.12s;
	}

	.type-selector-btn:hover { background: var(--background-color-subtle); border-color: color-mix(in srgb, var(--color-primary-500) 30%, transparent); }

	.type-menu {
		position: absolute;
		right: 0;
		top: calc(100% + 4px);
		background: var(--background-color-card);
		border: 1px solid var(--border-color-default);
		border-radius: var(--border-radius-md);
		box-shadow: 0 8px 24px rgba(0,0,0,.12);
		z-index: 200;
		min-width: 185px;
		padding: var(--spacing-xs);
		display: flex;
		flex-direction: column;
		gap: 1px;
	}

	.type-menu-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--body-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--text-color-primary);
		background: transparent;
		border: none;
		border-radius: var(--border-radius-sm);
		cursor: pointer;
		text-align: left;
		transition: background-color 0.1s;
	}

	.type-menu-item:hover,
	.type-menu-item.is-active { background: color-mix(in srgb, var(--color-primary-500) 8%, transparent); }
	.type-menu-item.is-active { color: var(--color-primary-500); font-weight: var(--font-weight-medium); }
	.type-menu-icon { width: 1.125rem; text-align: center; }

	/* Placeholder helper input */
	.field-placeholder-input {
		width: 100%;
		font-size: var(--body-text-font-size);
		color: var(--text-color-tertiary);
		border: 1px dashed var(--border-color-default);
		border-radius: 6px;
		padding: 0.4375rem 0.75rem;
		background: var(--bg-secondary, #f8fafc);
		font-family: inherit;
		outline: none;
		transition: border-color 0.15s;
	}

	.field-placeholder-input:focus { border-color: var(--color-primary-500); background: var(--background-color-card); }
	.field-placeholder-input::placeholder { color: var(--text-color-tertiary); }

	/* Options */
	.options-list {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.option-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.option-bullet {
		flex-shrink: 0;
		width: 1rem;
		text-align: center;
		font-size: 0.875rem;
		color: var(--text-secondary, #9ca3af);
	}

	.option-input {
		flex: 1;
		font-size: var(--body-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--text-color-primary);
		border: none;
		border-bottom: 1px solid var(--border-color-default);
		padding: var(--spacing-xs) 0;
		background: transparent;
		outline: none;
		transition: border-color 0.15s;
	}

	.radio-group-vertical {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.radio-label {
		display: flex;
		align-items: flex-start;
		gap: 0.75rem;
		cursor: pointer;
		padding: 0.875rem;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
		transition: all 0.15s;
		background: var(--background-color-card, #fff);
	}

	.radio-label:hover {
		border-color: color-mix(in srgb, var(--color-primary-500, #6366f1) 40%, transparent);
		background: var(--background-color-subtle, #f8fafc);
	}

	.radio-label:has(input:checked) {
		border-color: var(--color-primary-500, #6366f1);
		background: color-mix(in srgb, var(--color-primary-500, #6366f1) 4%, transparent);
	}

	.radio-label input[type="radio"] {
		margin-top: 0.2rem;
		accent-color: var(--color-primary-500, #6366f1);
		cursor: pointer;
	}

	.radio-content {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.radio-title {
		font-weight: 500;
		color: var(--text-color-primary, #111827);
		font-size: 0.875rem;
	}

	.option-input:focus { border-bottom-color: var(--color-primary-500); }

	.option-remove-btn {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 22px;
		height: 22px;
		border: none;
		background: transparent;
		border-radius: var(--border-radius-xs);
		cursor: pointer;
		color: var(--text-color-tertiary);
		transition: background-color 0.12s, color 0.12s;
	}

	.option-remove-btn:hover:not(:disabled) { background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
	.option-remove-btn:disabled { opacity: 0.25; cursor: default; }

	.add-option-btn {
		display: inline-flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-xs);
		padding: var(--spacing-xs) 0;
		background: transparent;
		border: none;
		font-size: var(--caption-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--color-primary-500);
		cursor: pointer;
		opacity: 0.8;
		transition: opacity 0.12s;
	}

	.add-option-btn:hover { opacity: 1; }

	/* Bottom row */
	.field-bottom-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--border-color-subtle);
	}

	.required-toggle {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		font-size: var(--caption-text-font-size);
		color: var(--text-color-secondary);
		cursor: pointer;
		user-select: none;
	}

	.required-toggle input { accent-color: var(--color-primary-500); cursor: pointer; }

	.field-action-btns { display: flex; gap: 0.25rem; }

	.field-action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border: none;
		background: transparent;
		border-radius: 5px;
		cursor: pointer;
		color: var(--text-secondary, #9ca3af);
		transition: background-color 0.12s, color 0.12s;
	}

	.field-action-btn:hover:not(:disabled) { background: var(--background-color-subtle); color: var(--text-color-primary); }
	.field-action-btn--danger:hover:not(:disabled) { background: color-mix(in srgb, var(--color-error) 10%, transparent); color: var(--color-error); }
	.field-action-btn:disabled { opacity: 0.3; cursor: default; }

	/* Add field button */
	.add-field-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		width: 100%;
		max-width: 680px;
		margin: 0 auto;
		padding: var(--spacing-md);
		background: transparent;
		border: 1.5px dashed var(--border-color-default);
		border-radius: var(--border-radius-md);
		font-size: var(--body-text-font-size);
		font-family: var(--font-family-sans);
		color: var(--text-color-tertiary);
		cursor: pointer;
		transition: border-color 0.15s, color 0.15s, background-color 0.15s;
	}

	.add-field-btn:hover {
		border-color: var(--color-primary-500);
		color: var(--color-primary-500);
		background: color-mix(in srgb, var(--color-primary-500) 4%, transparent);
	}

	/* ── Settings panel ── */
	.settings-panel {
		width: 280px;
		flex-shrink: 0;
		position: sticky;
		top: 57px;
		max-height: calc(100vh - 57px);
		overflow-y: auto;
		padding: 1.75rem 1.5rem;
		background: var(--background-color-card);
		border-left: 1px solid var(--border-color-default);
	}

	.settings-title {
		font-size: var(--caption-text-font-size);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-color-tertiary);
		margin: 0 0 1.25rem;
	}

	.settings-section {
		border-top: 1px solid var(--border-color-subtle);
		padding-top: 1.25rem;
		margin-bottom: 1.25rem;
	}

	.settings-section:first-of-type { border-top: none; padding-top: 0; }

	.settings-field {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 0.75rem;
		margin-bottom: 1.25rem;
	}

	.settings-label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary, #374151);
		cursor: pointer;
		flex: 1;
	}

	.settings-hint {
		display: block;
		font-size: 0.75rem;
		font-weight: 400;
		color: var(--text-secondary, #9ca3af);
		margin-top: 0.125rem;
		line-height: 1.4;
	}

	/* Toggle switch */
	.toggle { flex-shrink: 0; cursor: pointer; }
	.toggle input { display: none; }

	.toggle-track {
		display: block;
		width: 36px;
		height: 20px;
		background: var(--border, #d1d5db);
		border-radius: 99px;
		position: relative;
		transition: background-color 0.2s;
	}

	.toggle-track::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 14px;
		height: 14px;
		background: white;
		border-radius: 50%;
		transition: transform 0.2s;
		box-shadow: 0 1px 3px rgba(0,0,0,.2);
	}

	.toggle input:checked ~ .toggle-track { background: var(--primary, #6366f1); }
	.toggle input:checked ~ .toggle-track::after { transform: translateX(16px); }

	/* Summary stats */
	.settings-section-title {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.07em;
		color: var(--text-secondary, #9ca3af);
		margin: 0 0 0.75rem;
	}

	.summary-stats {
		display: flex;
		gap: 1rem;
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.stat-value {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.03em;
		color: var(--text-primary, #111827);
		line-height: 1;
	}

	.stat-label {
		font-size: 0.75rem;
		color: var(--text-secondary, #9ca3af);
	}

	/* ── Responsive ── */
	@media (max-width: 900px) {
		.settings-panel { display: none; }
	}

	@media (max-width: 640px) {
		.canvas-col { padding: 1rem 0.75rem 3rem; }
		.builder-header { padding: 0.75rem 1rem; }
	}
</style>