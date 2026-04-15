<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { ActionData } from './$types';

	export let form: ActionData;

	let title = '';
	let description = '';
	let isPublic = false;
	let requiresAuth = false;
	let definition = {
		fields: [
			{
				id: 'name',
				name: 'name',
				type: 'text',
				label: 'Nome',
				required: true
			},
			{
				id: 'email',
				name: 'email',
				type: 'email',
				label: 'E-mail',
				required: true
			}
		]
	};

	function addField() {
		definition.fields.push({
			id: `field_${Date.now()}`,
			name: `field_${Date.now()}`,
			type: 'text',
			label: 'Novo Campo',
			required: false
		});
		definition = { ...definition };
	}

	function removeField(index: number) {
		definition.fields.splice(index, 1);
		definition = { ...definition };
	}

	function handleSubmit() {
		// Validation
		if (!title.trim()) {
			return;
		}
	}
</script>

<svelte:head>
	<title>Criar Formulário - Dashboard</title>
</svelte:head>

<div class="create-form">
	<header class="form-header">
		<h1>Criar Novo Formulário</h1>
		<p>Configure seu formulário dinâmico</p>
	</header>

	<form method="POST" action="?/create" use:enhance={handleSubmit}>
		<div class="form-section">
			<h2>Informações Básicas</h2>

			<div class="field-group">
				<label for="title">Título do Formulário *</label>
				<input
					type="text"
					id="title"
					bind:value={title}
					placeholder="Ex: Inscrição no Programa"
					required
				/>
			</div>

			<div class="field-group">
				<label for="description">Descrição</label>
				<textarea
					id="description"
					bind:value={description}
					placeholder="Descreva o propósito do formulário"
					rows="3"
				></textarea>
			</div>

			<div class="field-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={isPublic} />
					<span>Formulário Público</span>
				</label>
				<p class="field-help">Permite acesso sem autenticação</p>
			</div>

			<div class="field-group">
				<label class="checkbox-label">
					<input type="checkbox" bind:checked={requiresAuth} />
					<span>Exigir Login</span>
				</label>
				<p class="field-help">Usuários devem estar logados para responder</p>
			</div>
		</div>

		<div class="form-section">
			<div class="section-header">
				<h2>Campos do Formulário</h2>
				<button type="button" class="add-field-button" on:click={addField}>
					+ Adicionar Campo
				</button>
			</div>

			<div class="fields-list">
				{#each definition.fields as field, index}
					<div class="field-item">
						<div class="field-config">
							<div class="field-input">
								<label for="field_label_{index}">Rótulo</label>
								<input
									type="text"
									id="field_label_{index}"
									bind:value={field.label}
									placeholder="Ex: Nome Completo"
								/>
							</div>

							<div class="field-input">
								<label for="field_type_{index}">Tipo</label>
								<select id="field_type_{index}" bind:value={field.type}>
									<option value="text">Texto</option>
									<option value="email">E-mail</option>
									<option value="number">Número</option>
									<option value="date">Data</option>
									<option value="textarea">Texto Longo</option>
									<option value="select">Seleção</option>
									<option value="radio">Múltipla Escolha</option>
									<option value="checkbox">Caixas de Seleção</option>
									<option value="button">Botão</option>
								</select>
							</div>

							<div class="field-input">
								<label class="checkbox-label">
									<input type="checkbox" bind:checked={field.required} />
									<span>Obrigatório</span>
								</label>
							</div>
						</div>

						<button
							type="button"
							class="remove-field"
							disabled={definition.fields.length <= 1}
							on:click={() => removeField(index)}
						>
							Remover
						</button>
					</div>
				{/each}
			</div>
		</div>

		<div class="form-actions">
			<button type="button" class="cancel-button" on:click={() => goto('/dashboard/forms')}>
				Cancelar
			</button>
			<button type="submit" class="create-button">
				Criar Formulário
			</button>
		</div>

		{#if form?.error}
			<div class="error-message">
				{form.error}
			</div>
		{/if}
	</form>
</div>

<style>
	.create-form {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	.form-header {
		text-align: center;
		margin-bottom: 3rem;
	}

	.form-header h1 {
		font-size: 2.5rem;
		font-weight: 700;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.form-header p {
		color: var(--text-secondary);
		font-size: 1.1rem;
	}

	.form-section {
		background: var(--bg-primary);
		border-radius: 12px;
		padding: 2rem;
		margin-bottom: 2rem;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.form-section h2 {
		font-size: 1.5rem;
		font-weight: 600;
		color: var(--text-primary);
		margin-bottom: 1.5rem;
	}

	.section-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1.5rem;
	}

	.add-field-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.add-field-button:hover {
		background: var(--primary-hover);
	}

	.field-group {
		margin-bottom: 1.5rem;
	}

	.field-group label {
		display: block;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.5rem;
	}

	.field-group input[type="text"],
	.field-group textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--border);
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s ease;
	}

	.field-input input:focus,
	.field-input select:focus {
		outline: none;
		border-color: var(--primary);
	}

	.field-group textarea {
		resize: vertical;
		min-height: 80px;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 500 !important;
		cursor: pointer;
	}

	.checkbox-label input[type="checkbox"] {
		width: auto;
		margin: 0;
	}

	.field-help {
		font-size: 0.875rem;
		color: var(--text-secondary);
		margin-top: 0.25rem;
		margin-left: 1.5rem;
	}

	.fields-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.field-item {
		display: flex;
		gap: 1rem;
		align-items: flex-start;
		padding: 1rem;
		background: var(--bg-secondary);
		border-radius: 8px;
		border: 1px solid var(--border);
	}

	.field-config {
		flex: 1;
		display: grid;
		grid-template-columns: 1fr 1fr auto;
		gap: 1rem;
		align-items: start;
	}

	.field-input {
		display: flex;
		flex-direction: column;
	}

	.field-input label {
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--text-primary);
		margin-bottom: 0.25rem;
	}

	.field-input input,
	.field-input select {
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		font-size: 0.875rem;
	}

	.field-input input:focus,
	.field-input select:focus {
		outline: none;
		border-color: var(--primary);
	}

	.remove-field {
		background: var(--error);
		color: white;
		border: none;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		align-self: flex-start;
	}

	.remove-field:hover:not(:disabled) {
		background: var(--error-hover);
		transform: translateY(-1px);
	}

	.remove-field:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.form-actions {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-top: 2rem;
	}

	.cancel-button {
		background: transparent;
		color: var(--text-secondary);
		border: 1px solid var(--border);
		padding: 1rem 2rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.cancel-button:hover {
		background: var(--bg-hover);
	}

	.create-button {
		background: var(--primary);
		color: white;
		border: none;
		padding: 1rem 2rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.create-button:hover {
		background: var(--primary-hover);
		transform: translateY(-1px);
	}

	.error-message {
		margin-top: 1rem;
		padding: 1rem;
		background: var(--error-bg);
		color: var(--error-text);
		border-radius: 8px;
		text-align: center;
	}
</style>