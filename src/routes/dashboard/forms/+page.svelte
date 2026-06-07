<!-- src/routes/dashboard/forms/+page.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import Modal from '$lib/components/organisms/Modal.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import type { PageData } from './$types';
	import type { FormRecord } from '$lib/types/forms';

	export let data: PageData;

	// Reactive assignment for forms to update on enhance invalidation
	$: formsWithCount = data.forms as (FormRecord & { responseCount: number })[];

	let searchQuery = '';
	let selectedForms: string[] = [];
	let deleteModalOpen = false;
	let deleteModalFormId = '';
	let deleteModalFormTitle = '';
	let deleteModalFormCount = 0;
	let pendingDeleteForm: HTMLFormElement | null = null;

	// Show success toast if form was just created
	$: if (browser && $page.url.searchParams.has('created')) {
		const createdId = $page.url.searchParams.get('created');
		addToast('Formulário criado com sucesso!', 'success');
		if (createdId) {
			setTimeout(() => {
				const form = formsWithCount.find(f => f.id === createdId);
				if (form) openShareModal(form.id, form.title, form.publicToken, form.isPublic);
			}, 100);
		}
		// Clean up the URL parameter
		window.history.replaceState({}, '', '/dashboard/forms');
	}

	// Show success toast if form was just updated
	$: if (browser && $page.url.searchParams.has('updated')) {
		const updatedId = $page.url.searchParams.get('updated');
		addToast('Formulário atualizado com sucesso!', 'success');
		if (updatedId && updatedId !== 'true') {
			setTimeout(() => {
				const form = formsWithCount.find(f => f.id === updatedId);
				if (form) openShareModal(form.id, form.title, form.publicToken, form.isPublic);
			}, 100);
		}
		// Clean up the URL parameter
		window.history.replaceState({}, '', '/dashboard/forms');
	}

	function createForm() {
		goto('/dashboard/forms/create');
	}

	function editForm(formId: string) {
		goto(`/dashboard/forms/${formId}/edit`);
	}

	function viewResponses(formId: string) {
		goto(`/dashboard/forms/${formId}/responses`);
	}

	function openDeleteModal(formId: string, formTitle: string) {
		deleteModalFormId = formId;
		deleteModalFormTitle = formTitle;
		deleteModalFormCount = 1;
		deleteModalOpen = true;
	}

	function openBulkDeleteModal() {
		deleteModalFormId = '';
		deleteModalFormTitle = '';
		deleteModalFormCount = selectedForms.length;
		deleteModalOpen = true;
	}

	function closeDeleteModal() {
		deleteModalOpen = false;
		deleteModalFormId = '';
		deleteModalFormTitle = '';
		deleteModalFormCount = 0;
		pendingDeleteForm = null;
	}

	function confirmDelete() {
		if (pendingDeleteForm) {
			pendingDeleteForm.requestSubmit();
			closeDeleteModal();
		}
	}

	function copyPublicLink(form: any) {
		if (browser && form.publicToken) {
			const orgSlug = $page.data.organization?.slug || 'org';
			const url = `${window.location.origin}/forms/${orgSlug}/${form.publicToken}`;
			navigator.clipboard.writeText(url).then(() => addToast('Link copiado!', 'success'));
		}
	}

	let shareModalOpen = false;
	let shareModalFormId = '';
	let shareModalFormTitle = '';
	let shareModalFormAccessCode = '';
	let shareModalFormIsPublic = false;
	let shareEmail = '';
	let shareLoading = false;
	let shareTab: 'link' | 'email' | 'participants' = 'link';
	let selectedParticipants: string[] = [];

	$: shareModalPublicUrl = browser && shareModalFormAccessCode && $page.data.organization
		? `${window.location.origin}/forms/${$page.data.organization.slug}/${shareModalFormAccessCode}`
		: '';

	function openShareModal(formId: string, formTitle: string, formAccessCode: string | undefined, isPublic: boolean = true) {
		shareModalFormId = formId;
		shareModalFormTitle = formTitle;
		shareModalFormAccessCode = formAccessCode || '';
		shareModalFormIsPublic = isPublic;
		shareEmail = '';
		selectedParticipants = [];
		shareTab = 'link';
		shareModalOpen = true;
	}

	function closeShareModal() {
		shareModalOpen = false;
		shareEmail = '';
		shareLoading = false;
		selectedParticipants = [];
	}

	function toggleParticipant(id: string) {
		if (selectedParticipants.includes(id)) {
			selectedParticipants = selectedParticipants.filter(p => p !== id);
		} else {
			selectedParticipants = [...selectedParticipants, id];
		}
	}

	function toggleAllParticipants() {
		if (selectedParticipants.length === data.participants?.length) {
			selectedParticipants = [];
		} else {
			selectedParticipants = (data.participants || []).map(p => p.id);
		}
	}

	async function confirmShare() {
		shareLoading = true;

		const formData = new FormData();
		formData.append('formId', shareModalFormId);

		if (shareTab === 'email') {
			if (!shareEmail.includes('@')) {
				addToast('Email inválido', 'error');
				shareLoading = false;
				return;
			}
			formData.append('type', 'external');
			formData.append('email', shareEmail);
		} else if (shareTab === 'participants') {
			if (selectedParticipants.length === 0) {
				addToast('Selecione pelo menos um participante', 'error');
				shareLoading = false;
				return;
			}
			formData.append('type', 'participants');
			selectedParticipants.forEach(id => formData.append('participantIds', id));
		} else {
			shareLoading = false;
			return;
		}

		try {
			const actionResponse = await fetch('?/sendByEmail', {
				method: 'POST',
				body: formData,
				headers: { 'x-sveltekit-action': 'true' }
			});
			
			const actionResult = await actionResponse.json();
			const resultData = actionResult.data || {};
			
			if (actionResult.type === 'failure' || resultData.error) {
				addToast(resultData.error || 'Erro ao enviar', 'error');
			} else {
				addToast(shareTab === 'participants' ? `Enviado para ${resultData.count} participante(s)!` : 'Formulário compartilhado por email!', 'success');
				closeShareModal();
			}
		} catch (err) {
			console.error(err);
			addToast('Erro ao enviar email', 'error');
		} finally {
			shareLoading = false;
		}
	}

	function toggleFormSelection(formId: string) {
		selectedForms = selectedForms.includes(formId)
			? selectedForms.filter((id) => id !== formId)
			: [...selectedForms, formId];
	}

	function selectAllForms() {
		selectedForms =
			selectedForms.length === filteredForms.length
				? []
				: filteredForms.map((f) => f.id);
	}

	function formatDate(iso: string) {
		return new Date(iso).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		});
	}

	$: filteredForms = formsWithCount.filter(
		(form: any) =>
			form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			form.description?.toLowerCase().includes(searchQuery.toLowerCase())
	);
	$: totalResponses = formsWithCount.reduce((acc, form: any) => acc + (form.responseCount || 0), 0);
	$: activeFormsCount = formsWithCount.filter((form: any) => form.isActive).length;
</script>

<svelte:head>
	<title>Formulários</title>
</svelte:head>

<div class="page">
	<!-- ── Header ── -->
	<header class="page-header">
		<div>
			<h1>Formulários</h1>
			<p class="subtitle">Crie e gerencie formulários dinâmicos</p>
		</div>
		<button class="btn-primary" on:click={createForm}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
				<path d="M12 5v14M5 12h14"/>
			</svg>
			Novo formulário
		</button>
	</header>

	<!-- ── Toolbar ── -->
	<div class="toolbar">
		<div class="search-wrap">
			<svg class="search-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="11" cy="11" r="8"/>
				<path d="m21 21-4.35-4.35"/>
			</svg>
			<input
				type="search"
				placeholder="Buscar formulários..."
				bind:value={searchQuery}
				aria-label="Buscar formulários"
			/>
		</div>

		{#if selectedForms.length > 0}
			<div class="bulk-bar">
				<span class="bulk-count">{selectedForms.length} selecionado{selectedForms.length > 1 ? 's' : ''}</span>

				<form method="POST" action="?/bulkDuplicate" use:enhance={() => {
					return async ({ result, update }) => {
						selectedForms = [];
						if (result.type === 'success') addToast('Formulários duplicados!', 'success');
						await update();
					};
				}}>
					{#each selectedForms as id}
						<input type="hidden" name="ids" value={id} />
					{/each}
					<button type="submit" class="btn-ghost-sm">
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect x="9" y="9" width="13" height="13" rx="2"/>
							<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
						</svg>
						Duplicar
					</button>
				</form>

				<form method="POST" action="?/bulkDelete" use:enhance={() => {
					return async ({ result, update }) => {
						selectedForms = [];
						if (result.type === 'success') addToast('Formulários excluídos.', 'success');
						await update();
					};
				}}>
					{#each selectedForms as id}
						<input type="hidden" name="ids" value={id} />
					{/each}
					<button 
						type="button"
						class="btn-danger-sm"
						on:click={() => openBulkDeleteModal()}
					>
						<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<polyline points="3 6 5 6 21 6"/>
							<path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
						</svg>
						Excluir
					</button>
				</form>
			</div>
		{/if}
	</div>

	<div class="forms-kpis">
		<span class="kpi-chip"><strong>{formsWithCount.length}</strong> formulários</span>
		<span class="kpi-chip"><strong>{activeFormsCount}</strong> ativos</span>
		<span class="kpi-chip"><strong>{totalResponses}</strong> respostas</span>
	</div>

	<!-- ── Content ── -->
	<main class="content">
		{#if filteredForms.length === 0}
			<div class="empty-state">
				{#if searchQuery}
					<div class="empty-icon">🔍</div>
					<h2>Nenhum resultado</h2>
					<p>Nenhum formulário corresponde a "<strong>{searchQuery}</strong>".</p>
					<button class="btn-ghost" on:click={() => (searchQuery = '')}>Limpar busca</button>
				{:else}
					<div class="empty-icon">📋</div>
					<h2>Crie seu primeiro formulário</h2>
					<p>Comece criando um formulário para coletar respostas dos seus usuários.</p>
					<button class="btn-primary" on:click={createForm}>
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
							<path d="M12 5v14M5 12h14"/>
						</svg>
						Criar formulário
					</button>
				{/if}
			</div>
		{:else}
			<div class="list-header">
				<label class="select-all-label">
					<input
						type="checkbox"
						checked={selectedForms.length === filteredForms.length && filteredForms.length > 0}
						indeterminate={selectedForms.length > 0 && selectedForms.length < filteredForms.length}
						on:change={selectAllForms}
					/>
					<span>Selecionar todos</span>
				</label>
				<span class="results-count">
					{filteredForms.length} formulário{filteredForms.length !== 1 ? 's' : ''}
				</span>
			</div>

			<ul class="form-list" role="list">
				{#each filteredForms as form (form.id)}
					<li class="form-row" class:is-selected={selectedForms.includes(form.id)}>
						<!-- Checkbox -->
						<input
							type="checkbox"
							class="row-check"
							aria-label="Selecionar {form.title}"
							checked={selectedForms.includes(form.id)}
							on:change={() => toggleFormSelection(form.id)}
						/>

						<!-- Icon -->
						<div class="row-icon" aria-hidden="true">
							<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
								<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
								<polyline points="14 2 14 8 20 8"/>
								<line x1="16" y1="13" x2="8" y2="13"/>
								<line x1="16" y1="17" x2="8" y2="17"/>
								<polyline points="10 9 9 9 8 9"/>
							</svg>
						</div>

						<!-- Main info -->
						<button class="row-body" on:click={() => editForm(form.id)} type="button">
							<span class="row-title">{form.title}</span>
							{#if form.description}
								<span class="row-desc">{form.description}</span>
							{/if}
						</button>

						<!-- Meta chips -->
						<div class="row-meta">
							{#if form.responseCount !== undefined}
								<span class="chip chip-neutral">
									<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
										<circle cx="9" cy="7" r="4"/>
										<path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
										<path d="M16 3.13a4 4 0 0 1 0 7.75"/>
									</svg>
									{form.responseCount}
								</span>
							{/if}
							<span class="chip {form.isPublic ? 'chip-green' : 'chip-gray'}">
								{form.isPublic ? 'Público' : 'Privado'}
							</span>
							{#if !form.isActive}
								<span class="chip chip-yellow">Inativo</span>
							{/if}
							<span class="row-date">{formatDate(form.createdAt)}</span>
						</div>

						<!-- Actions -->
						<div class="row-actions">
							<button class="icon-btn" title="Editar formulário" on:click={() => editForm(form.id)}>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
									<path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
								</svg>
							</button>
							<button class="icon-btn" title="Ver respostas" on:click={() => viewResponses(form.id)}>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
								</svg>
							</button>
							<button class="icon-btn" title="Copiar link {form.isPublic ? 'público' : 'privado'}" on:click={() => copyPublicLink(form)}>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
									<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
								</svg>
							</button>
							<button class="icon-btn" title="Compartilhar" on:click={() => openShareModal(form.id, form.title, form.publicToken, form.isPublic)}>
								<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
									<path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
									<polyline points="16 6 12 2 8 6" />
									<line x1="12" y1="2" x2="12" y2="15" />
								</svg>
							</button>

							<!-- Single-item duplicate/delete via forms -->
							<form method="POST" action="?/duplicateOne" use:enhance={() =>
								async ({ result, update }) => {
									if (result.type === 'success') addToast('Formulário duplicado!', 'success');
									await update();
								}
							}>
								<input type="hidden" name="id" value={form.id} />
								<button type="submit" class="icon-btn" title="Duplicar formulário">
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<rect x="9" y="9" width="13" height="13" rx="2"/>
										<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
									</svg>
								</button>
							</form>

							<form method="POST" action="?/deleteOne" use:enhance={() =>
								async ({ result, update }) => {
									if (result.type === 'success') addToast('Formulário excluído.', 'success');
									await update();
								}
							}>
								<input type="hidden" name="id" value={form.id} />
								<button
									type="button"
									class="icon-btn icon-btn-danger"
									title="Excluir formulário"
									on:click|preventDefault={(e) => {
										pendingDeleteForm = e.currentTarget.closest('form') as HTMLFormElement;
										openDeleteModal(form.id, form.title);
									}}
								>
									<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
										<polyline points="3 6 5 6 21 6"/>
										<path d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
									</svg>
								</button>
							</form>
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</main>
</div>

<!-- Delete Confirmation Modal -->
<Modal 
	isOpen={deleteModalOpen} 
	onClose={closeDeleteModal}
	title="Excluir formulário{deleteModalFormCount > 1 ? 's' : ''}?"
	size="sm"
>
	<div>
		{#if deleteModalFormCount === 1}
			<p>Tem certeza que deseja excluir "<strong>{deleteModalFormTitle}</strong>"? Esta ação não pode ser desfeita.</p>
		{:else}
			<p>Tem certeza que deseja excluir <strong>{deleteModalFormCount} formulários</strong>? Esta ação não pode ser desfeita.</p>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<button class="btn-ghost" on:click={closeDeleteModal}>Cancelar</button>
		<button class="btn-danger" on:click={confirmDelete}>Excluir</button>
	</svelte:fragment>
</Modal>

<!-- Share Modal -->
<Modal 
	isOpen={shareModalOpen} 
	onClose={closeShareModal}
	title="Compartilhar Formulário"
	size="md"
>
	<div class="share-modal-content">
		<p class="share-subtitle">Compartilhe "<strong>{shareModalFormTitle}</strong>" selecionando a opção desejada abaixo.</p>
		
		<div class="share-tabs">
			<button 
				class="share-tab {shareTab === 'link' ? 'is-active' : ''}" 
				on:click={() => shareTab = 'link'}
			>
				Link Público
			</button>
			<button 
				class="share-tab {shareTab === 'email' ? 'is-active' : ''}" 
				on:click={() => shareTab = 'email'}
			>
				E-mail Externo
			</button>
			<button 
				class="share-tab {shareTab === 'participants' ? 'is-active' : ''}" 
				on:click={() => shareTab = 'participants'}
			>
				Participantes
			</button>
		</div>

		<div class="share-tab-content">
			{#if shareTab === 'link'}
				<div class="tab-pane">
					<p class="tab-pane-title">Link direto para o formulário</p>
					{#if !shareModalFormIsPublic}
						<div class="privacy-warning">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
								<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
							</svg>
							Este formulário é privado. Os respondentes precisarão fazer login para acessar.
						</div>
					{/if}
					<div class="link-box">
						<input 
							type="text" 
							readonly 
							class="modal-input link-input" 
							value={shareModalPublicUrl}
							on:focus={(e) => e.currentTarget.select()}
						/>
						<button class="btn-ghost" disabled={!shareModalFormAccessCode} on:click={() => copyPublicLink({publicToken: shareModalFormAccessCode})}>
							Copiar
						</button>
					</div>
				</div>
			{:else if shareTab === 'email'}
				<div class="tab-pane">
					<p class="tab-pane-title">Enviar para uma pessoa específica</p>
					<input 
						type="email" 
						placeholder="exemplo@email.com"
						bind:value={shareEmail}
						class="modal-input"
					/>
				</div>
			{:else if shareTab === 'participants'}
				<div class="tab-pane">
					<p class="tab-pane-title">Enviar para participantes da organização</p>
					
					<div class="participants-list-wrap">
						<div class="participants-header">
							<label class="select-all-label">
								<input 
									type="checkbox" 
									checked={selectedParticipants.length === (data.participants?.length || 0) && (data.participants?.length || 0) > 0}
									indeterminate={selectedParticipants.length > 0 && selectedParticipants.length < (data.participants?.length || 0)}
									on:change={toggleAllParticipants}
								/>
								<span>Selecionar Todos ({data.participants?.length || 0})</span>
							</label>
							<span class="selected-count">{selectedParticipants.length} selecionado(s)</span>
						</div>
						
						<ul class="participants-list">
							{#each data.participants || [] as p}
								<li>
									<label class="participant-row">
										<input 
											type="checkbox" 
											checked={selectedParticipants.includes(p.id)}
											on:change={() => toggleParticipant(p.id)}
										/>
										<div class="participant-info">
											<span class="p-name">{p.name}</span>
											<span class="p-email">{p.email}</span>
										</div>
									</label>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			{/if}
		</div>
	</div>

	<svelte:fragment slot="footer">
		<button class="btn-ghost" on:click={closeShareModal} disabled={shareLoading}>Cancelar</button>
		{#if shareTab !== 'link'}
			<button 
				class="btn-primary" 
				on:click={confirmShare} 
				disabled={shareLoading || (shareTab === 'email' && !shareEmail) || (shareTab === 'participants' && selectedParticipants.length === 0)}
			>
				{shareLoading ? 'Enviando...' : 'Enviar'}
			</button>
		{:else}
			<button class="btn-primary" on:click={closeShareModal}>Concluir</button>
		{/if}
	</svelte:fragment>
</Modal>

<style>
	@import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');

	.page {
		font-family: 'DM Sans', system-ui, sans-serif;
		min-height: 100vh;
		background: var(--bg-secondary, #f8fafc);
		color: var(--text-primary, #111827);
	}

	/* ── Header ── */
	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 2rem 2.5rem 1.5rem;
		background: var(--bg-primary, #fff);
		border-bottom: 1px solid var(--border, #e5e7eb);
		gap: 1rem;
	}

	h1 {
		font-size: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.025em;
		margin: 0 0 0.2rem;
	}

	.subtitle {
		font-size: 0.875rem;
		color: var(--text-secondary, #6b7280);
		margin: 0;
	}

	/* ── Buttons ── */
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--primary, #6366f1);
		color: white;
		border: none;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.15s, transform 0.1s;
		white-space: nowrap;
	}

	.btn-primary:hover {
		background: var(--primary-hover, color-mix(in srgb, var(--primary, #6366f1) 85%, black));
		transform: translateY(-1px);
	}

	.btn-ghost {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		color: var(--text-secondary, #6b7280);
		border: 1px solid var(--border, #e5e7eb);
		padding: 0.5rem 1rem;
		border-radius: 7px;
		font-size: 0.875rem;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.12s, color 0.12s;
	}

	.btn-ghost:hover {
		background: var(--bg-hover, #f3f4f6);
		color: var(--text-primary, #111827);
	}

	.btn-ghost-sm {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		background: transparent;
		color: var(--text-secondary, #6b7280);
		border: 1px solid var(--border, #e5e7eb);
		padding: 0.375rem 0.75rem;
		border-radius: 7px;
		font-size: 0.8125rem;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.12s, color 0.12s;
	}

	.btn-ghost-sm:hover {
		background: var(--bg-hover, #f3f4f6);
		color: var(--text-primary, #111827);
	}

	.btn-ghost-sm {
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		background: transparent;
		color: var(--text-secondary, #6b7280);
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 7px;
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.12s;
	}

	.btn-ghost-sm:hover {
		background: var(--bg-hover, #f3f4f6);
	}

	.btn-danger-sm {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.375rem 0.75rem;
		font-size: 0.8125rem;
		font-family: inherit;
		background: color-mix(in srgb, var(--error, #ef4444) 8%, transparent);
		color: var(--error, #dc2626);
		border: 1px solid color-mix(in srgb, var(--error, #ef4444) 25%, transparent);
		border-radius: 7px;
		cursor: pointer;
		transition: background-color 0.12s;
	}

	.btn-danger-sm:hover {
		background: color-mix(in srgb, var(--error, #ef4444) 15%, transparent);
	}

	.btn-danger {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background: var(--error, #ef4444);
		color: white;
		border: none;
		padding: 0.625rem 1.25rem;
		border-radius: 8px;
		font-size: 0.875rem;
		font-weight: 500;
		font-family: inherit;
		cursor: pointer;
		transition: background-color 0.15s, transform 0.1s;
		white-space: nowrap;
	}

	.btn-danger:hover {
		background: var(--error-hover, color-mix(in srgb, var(--error, #ef4444) 85%, black));
		transform: translateY(-1px);
	}

	.modal-input {
		width: 100%;
		padding: 0.75rem;
		margin-top: 1rem;
		border: 1px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.875rem;
		font-family: inherit;
		color: var(--text-primary, #111827);
	}

	.modal-input:focus {
		outline: none;
		border-color: var(--primary, #6366f1);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
	}

	.modal-input::placeholder {
		color: var(--text-tertiary, #9ca3af);
	}

	/* ── Toolbar ── */
	.toolbar {
		display: flex;
		align-items: center;
		gap: 1rem;
		padding: 1rem 2.5rem;
		background: var(--bg-primary, #fff);
		border-bottom: 1px solid var(--border, #e5e7eb);
		flex-wrap: wrap;
	}

	.search-wrap {
		position: relative;
		flex: 1;
		min-width: 200px;
		max-width: 360px;
	}

	.search-icon {
		position: absolute;
		left: 0.75rem;
		top: 50%;
		transform: translateY(-50%);
		color: var(--text-secondary, #9ca3af);
		pointer-events: none;
	}

	.search-wrap input {
		width: 100%;
		padding: 0.5rem 0.875rem 0.5rem 2.25rem;
		border: 1.5px solid var(--border, #e5e7eb);
		border-radius: 8px;
		font-size: 0.875rem;
		font-family: inherit;
		background: var(--bg-secondary, #f8fafc);
		color: var(--text-primary, #111827);
		outline: none;
		transition: border-color 0.15s;
	}

	.search-wrap input:focus {
		border-color: var(--primary, #6366f1);
		background: var(--bg-primary, #fff);
	}

	.bulk-bar {
		display: flex;
		align-items: center;
		gap: 0.625rem;
		padding: 0.375rem 0.875rem;
		background: color-mix(in srgb, var(--primary, #6366f1) 8%, transparent);
		border: 1px solid color-mix(in srgb, var(--primary, #6366f1) 20%, transparent);
		border-radius: 8px;
	}

	.bulk-count {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--primary, #6366f1);
		white-space: nowrap;
	}

	.forms-kpis {
		display: flex;
		gap: 0.5rem;
		padding: 0.75rem 2.5rem 0;
		flex-wrap: wrap;
	}

	.kpi-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		padding: 0.3rem 0.7rem;
		border-radius: 999px;
		font-size: 0.78rem;
		background: var(--bg-primary, #fff);
		border: 1px solid var(--border, #e5e7eb);
		color: var(--text-secondary, #6b7280);
	}

	/* ── Content area ── */
	.content {
		padding: 1.5rem 2.5rem 3rem;
		max-width: 1200px;
	}

	/* ── List header ── */
	.list-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 0.75rem;
		padding: 0 0.5rem;
	}

	.select-all-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-secondary, #6b7280);
		cursor: pointer;
		user-select: none;
	}

	.select-all-label input {
		accent-color: var(--primary, #6366f1);
		cursor: pointer;
	}

	.results-count {
		font-size: 0.8125rem;
		color: var(--text-secondary, #9ca3af);
	}

	/* ── Form list rows ── */
	.form-list {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
	}

	.form-row {
		display: flex;
		align-items: center;
		gap: 0.875rem;
		background: var(--bg-primary, #fff);
		border: 1.5px solid var(--border, #e5e7eb);
		border-radius: 10px;
		padding: 0.875rem 1.125rem;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.form-row:hover {
		border-color: color-mix(in srgb, var(--primary, #6366f1) 40%, transparent);
		box-shadow: 0 2px 8px rgba(0,0,0,.06);
	}

	.form-row.is-selected {
		border-color: var(--primary, #6366f1);
		background: color-mix(in srgb, var(--primary, #6366f1) 3%, var(--bg-primary, #fff));
	}

	.row-check {
		flex-shrink: 0;
		width: 15px;
		height: 15px;
		accent-color: var(--primary, #6366f1);
		cursor: pointer;
	}

	.row-icon {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 36px;
		background: color-mix(in srgb, var(--primary, #6366f1) 10%, transparent);
		border-radius: 8px;
		color: var(--primary, #6366f1);
	}

	.row-body {
		flex: 1;
		min-width: 0;
		text-align: left;
		background: transparent;
		border: none;
		cursor: pointer;
		padding: 0;
		font-family: inherit;
	}

	.row-title {
		display: block;
		font-size: 0.9375rem;
		font-weight: 500;
		color: var(--text-primary, #111827);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		letter-spacing: -0.01em;
	}

	.row-body:hover .row-title {
		color: var(--primary, #6366f1);
	}

	.row-desc {
		display: block;
		font-size: 0.8125rem;
		color: var(--text-secondary, #9ca3af);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		margin-top: 0.125rem;
	}

	.row-meta {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		flex-shrink: 0;
	}

	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.25rem;
		padding: 0.2rem 0.625rem;
		border-radius: 99px;
		font-size: 0.75rem;
		font-weight: 500;
		white-space: nowrap;
	}

	.chip-green { background: #dcfce7; color: #166534; }
	.chip-gray  { background: #f3f4f6; color: #6b7280; }
	.chip-yellow { background: #fef9c3; color: #854d0e; }
	.chip-neutral { background: #f1f5f9; color: #475569; }

	.row-date {
		font-size: 0.75rem;
		color: var(--text-secondary, #9ca3af);
		white-space: nowrap;
	}

	/* ── Row action buttons ── */
	.row-actions {
		display: flex;
		align-items: center;
		gap: 0.125rem;
		flex-shrink: 0;
	}

	.row-actions form {
		display: contents;
	}

	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 30px;
		height: 30px;
		border: none;
		background: transparent;
		border-radius: 6px;
		cursor: pointer;
		color: var(--text-secondary, #9ca3af);
		transition: background-color 0.12s, color 0.12s;
	}

	.icon-btn:hover {
		background: var(--bg-hover, #f3f4f6);
		color: var(--text-primary, #374151);
	}

	.icon-btn-danger:hover {
		background: color-mix(in srgb, var(--error, #ef4444) 10%, transparent);
		color: var(--error, #dc2626);
	}

	/* ── Empty state ── */
	.empty-state {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 5rem 2rem;
		text-align: center;
		background: var(--bg-primary, #fff);
		border: 1.5px dashed var(--border, #e5e7eb);
		border-radius: 14px;
		gap: 0.75rem;
	}

	.empty-icon {
		font-size: 3rem;
		opacity: 0.55;
	}

	.empty-state h2 {
		font-size: 1.25rem;
		font-weight: 600;
		letter-spacing: -0.02em;
		margin: 0;
	}

	.empty-state p {
		color: var(--text-secondary, #6b7280);
		font-size: 0.9375rem;
		margin: 0;
		max-width: 380px;
	}

	/* ── Modals ── */
	.share-modal-content {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.share-subtitle {
		margin: 0;
		font-size: 0.875rem;
		color: var(--text-secondary, #6b7280);
	}

	.share-tabs {
		display: flex;
		gap: 0.5rem;
		border-bottom: 1px solid var(--border-color-default, #e5e7eb);
		padding-bottom: 0;
	}

	.share-tab {
		background: transparent;
		border: none;
		padding: 0.5rem 1rem;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-secondary, #6b7280);
		cursor: pointer;
		border-bottom: 2px solid transparent;
		transition: all 0.2s;
	}

	.share-tab:hover {
		color: var(--text-primary, #111827);
	}

	.share-tab.is-active {
		color: var(--primary, #6366f1);
		border-bottom-color: var(--primary, #6366f1);
	}

	.tab-pane {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		min-height: 250px;
	}

	.tab-pane-title {
		font-weight: 500;
		font-size: 0.875rem;
		margin: 0;
	}

	.privacy-warning {
		background: #fffbeb;
		color: #92400e;
		border: 1px solid #fde68a;
		padding: 0.5rem 0.75rem;
		border-radius: 6px;
		font-size: 0.8125rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.25rem;
	}

	.link-box {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.link-input {
		flex: 1;
		margin-top: 0 !important;
		background: var(--bg-secondary, #f8fafc);
	}

	.participants-list-wrap {
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		height: 250px;
	}

	.participants-header {
		padding: 0.75rem 1rem;
		background: var(--bg-secondary, #f8fafc);
		border-bottom: 1px solid var(--border-color-default, #e5e7eb);
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 0.8125rem;
	}

	.select-all-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		font-weight: 500;
		color: var(--text-primary, #111827);
	}

	.selected-count {
		color: var(--text-secondary, #6b7280);
		font-weight: 500;
	}

	.participants-list {
		list-style: none;
		margin: 0;
		padding: 0;
		overflow-y: auto;
		flex: 1;
	}

	.participant-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem 1rem;
		cursor: pointer;
		border-bottom: 1px solid var(--border-color-subtle, #f3f4f6);
		transition: background-color 0.15s;
		width: 100%;
	}

	.participant-row:hover {
		background: var(--bg-secondary, #f8fafc);
	}

	.participant-info {
		display: flex;
		flex-direction: column;
		gap: 0.125rem;
	}

	.p-name {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary, #111827);
	}

	.p-email {
		font-size: 0.8125rem;
		color: var(--text-secondary, #6b7280);
	}

	.modal-input {
		width: 100%;
		padding: 0.625rem 0.875rem;
		border: 1px solid var(--border, #d1d5db);
		border-radius: 8px;
		font-size: 0.9375rem;
		font-family: inherit;
		outline: none;
		transition: border-color 0.15s, box-shadow 0.15s;
	}

	.modal-input:focus {
		border-color: var(--primary, #6366f1);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary, #6366f1) 20%, transparent);
	}

	/* ── Responsive ── */
	@media (max-width: 768px) {
		.page-header, .toolbar, .content, .forms-kpis { padding-left: 1.25rem; padding-right: 1.25rem; }
		.row-meta, .row-date { display: none; }
		.row-actions { gap: 0; }
	}
</style>