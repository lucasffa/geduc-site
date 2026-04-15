<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import type { PageData } from './$types';

	export let data: PageData;

	function createForm() {
		goto('/dashboard/forms/create');
	}

	function editForm(formId: string) {
		goto(`/dashboard/forms/${formId}`);
	}

	function viewResponses(formId: string) {
		goto(`/dashboard/forms/${formId}/responses`);
	}

	function copyPublicLink(form: any) {
		if (form.publicToken) {
			const url = `${window.location.origin}/forms/${form.publicToken}`;
			navigator.clipboard.writeText(url);
			// TODO: Show toast notification
		}
	}
</script>

<svelte:head>
	<title>Formulários - Dashboard</title>
</svelte:head>

<div class="forms-dashboard">
	<header class="dashboard-header">
		<div class="header-content">
			<h1>Formulários</h1>
			<p>Gerencie seus formulários dinâmicos</p>
		</div>
		<button class="create-button" on:click={createForm}>
			<span class="icon">+</span>
			Novo Formulário
		</button>
	</header>

	<main class="forms-list">
		{#if data.forms.length === 0}
			<div class="empty-state">
				<div class="empty-icon">📝</div>
				<h2>Nenhum formulário criado ainda</h2>
				<p>Crie seu primeiro formulário para começar a coletar respostas.</p>
				<button class="create-button" on:click={createForm}>
					Criar Primeiro Formulário
				</button>
			</div>
		{:else}
			<div class="forms-grid">
				{#each data.forms as form}
					<div class="form-card">
						<div class="form-header">
							<h3>{form.title}</h3>
							<div class="form-status">
								{#if form.isActive}
									<span class="status active">Ativo</span>
								{:else}
									<span class="status inactive">Inativo</span>
								{/if}
								{#if form.isPublic}
									<span class="status public">Público</span>
								{:else}
									<span class="status private">Privado</span>
								{/if}
							</div>
						</div>

						{#if form.description}
							<p class="form-description">{form.description}</p>
						{/if}

						<div class="form-meta">
							{#if form.authorName}
								<span class="author">Por {form.authorName}</span>
							{/if}
							<span class="created">Criado em {new Date(form.createdAt).toLocaleDateString('pt-BR')}</span>
						</div>

						<div class="form-actions">
							<button class="action-button edit" on:click={() => editForm(form.id)}>
								Editar
							</button>
							<button class="action-button responses" on:click={() => viewResponses(form.id)}>
								Respostas
							</button>
							{#if form.isPublic && form.publicToken}
								<button class="action-button share" on:click={() => copyPublicLink(form)}>
									Copiar Link
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</main>
</div>

<style>
	.forms-dashboard {
		padding: 2rem;
		max-width: 1200px;
		margin: 0 auto;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.header-content h1 {
		font-size: 2rem;
		font-weight: 700;
		color: var(--text-primary);
		margin: 0;
	}

	.header-content p {
		color: var(--text-secondary);
		margin: 0.5rem 0 0 0;
	}

	.create-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 600;
		cursor: pointer;
		display: flex;
		align-items: center;
		gap: 0.5rem;
		transition: all 0.2s ease;
	}

	.create-button:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.icon {
		font-size: 1.2rem;
	}

	.forms-list {
		min-height: 400px;
	}

	.empty-state {
		text-align: center;
		padding: 4rem 2rem;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-state h2 {
		font-size: 1.5rem;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.empty-state p {
		color: var(--text-secondary);
		margin-bottom: 2rem;
	}

	.forms-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 1.5rem;
	}

	.form-card {
		background: var(--bg-primary);
		border-radius: 12px;
		padding: 1.5rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.form-card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
		transform: translateY(-2px);
	}

	.form-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.form-header h3 {
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-primary);
		margin: 0;
		flex: 1;
	}

	.form-status {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		align-items: flex-end;
	}

	.status {
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 500;
		text-transform: uppercase;
	}

	.status.active {
		background: var(--success-bg);
		color: var(--success-text);
	}

	.status.inactive {
		background: var(--warning-bg);
		color: var(--warning-text);
	}

	.status.public {
		background: var(--info-bg);
		color: var(--info-text);
	}

	.status.private {
		background: var(--neutral-bg);
		color: var(--neutral-text);
	}

	.form-description {
		color: var(--text-secondary);
		margin-bottom: 1rem;
		line-height: 1.5;
	}

	.form-meta {
		display: flex;
		justify-content: space-between;
		font-size: 0.875rem;
		color: var(--text-muted);
		margin-bottom: 1rem;
	}

	.form-actions {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.action-button {
		padding: 0.5rem 1rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		background: transparent;
		color: var(--text-primary);
		font-size: 0.875rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.action-button:hover {
		background: var(--bg-hover);
	}

	.action-button.edit {
		border-color: var(--primary);
		color: var(--primary);
	}

	.action-button.edit:hover {
		background: var(--primary);
		color: white;
	}

	.action-button.responses {
		border-color: var(--success);
		color: var(--success);
	}

	.action-button.responses:hover {
		background: var(--success);
		color: white;
	}

	.action-button.share {
		border-color: var(--info);
		color: var(--info);
	}

	.action-button.share:hover {
		background: var(--info);
		color: white;
	}
</style>