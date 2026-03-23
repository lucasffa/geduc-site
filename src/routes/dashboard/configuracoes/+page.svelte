<script>
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import OrgSettingsForm from '$lib/components/organisms/dashboard/OrgSettingsForm.svelte';
	import ApiKeyForm from '$lib/components/organisms/dashboard/ApiKeyForm.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { ROLE_CATEGORY_LABELS } from '$lib/constants/participant-status';

	export let data;

	let savingOrg = false;
	let savingKey = false;
	let enforceTransitions = data.enforceStatusTransitions;

	// Custom roles
	let customRoles = { ...data.customRoles };
	let newRole = { voluntario: '', mentorado: '' };

	async function toggleEnforceTransitions() {
		const newValue = !enforceTransitions;
		try {
			const res = await fetch('/dashboard/api/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key: 'enforce_status_transitions', value: String(newValue) })
			});
			if (!res.ok) throw new Error('Erro ao salvar');
			enforceTransitions = newValue;
			addToast(`Transições de status ${newValue ? 'ativadas' : 'desativadas'}`, 'success');
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	async function saveCustomRoles() {
		try {
			const res = await fetch('/dashboard/api/settings', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ key: 'custom_roles', value: JSON.stringify(customRoles) })
			});
			if (!res.ok) throw new Error('Erro ao salvar');
			addToast('Cargos atualizados', 'success');
		} catch (err) {
			addToast(err.message, 'error');
		}
	}

	function addRole(category) {
		const value = newRole[category].trim();
		if (!value) return;
		if (customRoles[category].includes(value)) {
			addToast('Cargo já existe', 'error');
			return;
		}
		customRoles[category] = [...customRoles[category], value];
		newRole[category] = '';
		saveCustomRoles();
	}

	function removeRole(category, index) {
		customRoles[category] = customRoles[category].filter((_, i) => i !== index);
		saveCustomRoles();
	}

	async function handleSaveOrg(e) {
		savingOrg = true;
		try {
			const res = await fetch('/dashboard/api/organization', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(e.detail)
			});
			if (!res.ok) throw new Error('Erro ao salvar');
			addToast('Configurações salvas', 'success');
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			savingOrg = false;
		}
	}

	async function handleSaveKey(e) {
		savingKey = true;
		try {
			const res = await fetch('/dashboard/api/api-keys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: e.detail.key,
					ownerType: 'organization',
					label: 'Resend Key da Organização'
				})
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Chave API salva com sucesso', 'success');
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			savingKey = false;
		}
	}
</script>

<svelte:head>
	<title>Configurações — {data.brandName}</title>
</svelte:head>

<div class="config-page">
	<PageHeader title="Configurações da Organização" />

	<OrgSettingsForm
		brandName={data.organization?.brandName || ''}
		logoUrl={data.organization?.logoUrl || ''}
		primaryColor={data.organization?.primaryColor || '#324acb'}
		saving={savingOrg}
		on:save={handleSaveOrg}
	/>

	<ApiKeyForm saving={savingKey} on:save={handleSaveKey} />

	<section class="settings-section">
		<h3 class="section-title">Participantes</h3>

		<div class="setting-row">
			<div class="setting-info">
				<span class="setting-label">Transições de status válidas</span>
				<span class="setting-description">
					Quando ativado, só permite transições de status pré-definidas (ex: Inscrito → Entrevistando).
					Desativado permite mudar para qualquer status.
				</span>
			</div>
			<label class="toggle">
				<input type="checkbox" checked={enforceTransitions} on:change={toggleEnforceTransitions} />
				<span class="toggle-slider"></span>
			</label>
		</div>
	</section>

	<section class="settings-section">
		<h3 class="section-title">Cargos de Participantes</h3>
		<p class="section-subtitle">
			Defina os cargos disponíveis para cada categoria. Esses cargos aparecerão nos formulários e importações.
		</p>

		{#each ['voluntario', 'mentorado'] as category}
			<div class="role-category">
				<h4 class="category-title">{ROLE_CATEGORY_LABELS[category]}</h4>
				<div class="role-tags">
					{#each customRoles[category] as role, i}
						<span class="role-tag">
							{role}
							<button class="role-remove" on:click={() => removeRole(category, i)} title="Remover">&times;</button>
						</span>
					{/each}
				</div>
				<form class="role-add" on:submit|preventDefault={() => addRole(category)}>
					<input
						class="role-input"
						bind:value={newRole[category]}
						placeholder="Novo cargo..."
					/>
					<Button variant="ghost" size="sm" on:click={() => addRole(category)}>Adicionar</Button>
				</form>
			</div>
		{/each}
	</section>
</div>

<style>
	.config-page {
		max-width: 800px;
	}

	.settings-section {
		margin-top: var(--spacing-xl);
		background: var(--color-neutral-0);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
	}

	.section-title {
		margin: 0 0 var(--spacing-md);
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-800);
	}

	.section-subtitle {
		margin: 0 0 var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
	}

	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--spacing-md);
	}

	.setting-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.setting-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-700);
	}

	.setting-description {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
		max-width: 500px;
	}

	.toggle {
		position: relative;
		display: inline-block;
		width: 44px;
		height: 24px;
		flex-shrink: 0;
	}

	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}

	.toggle-slider {
		position: absolute;
		cursor: pointer;
		inset: 0;
		background-color: var(--color-neutral-300);
		border-radius: 24px;
		transition: 0.2s;
	}

	.toggle-slider::before {
		content: '';
		position: absolute;
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		border-radius: 50%;
		transition: 0.2s;
	}

	.toggle input:checked + .toggle-slider {
		background-color: var(--color-primary-500);
	}

	.toggle input:checked + .toggle-slider::before {
		transform: translateX(20px);
	}

	.role-category {
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-neutral-100);
	}

	.role-category:first-of-type {
		margin-top: 0;
		padding-top: 0;
		border-top: none;
	}

	.category-title {
		margin: 0 0 var(--spacing-sm);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		color: var(--color-neutral-700);
	}

	.role-tags {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
	}

	.role-tag {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		padding: 4px 8px;
		background: var(--color-primary-50, rgba(50, 74, 203, 0.08));
		color: var(--color-primary-700);
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}

	.role-remove {
		background: none;
		border: none;
		cursor: pointer;
		color: var(--color-neutral-400);
		font-size: var(--font-size-sm);
		padding: 0;
		line-height: 1;
	}

	.role-remove:hover {
		color: var(--color-error);
	}

	.role-add {
		display: flex;
		gap: var(--spacing-xs);
		align-items: center;
	}

	.role-input {
		flex: 1;
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
	}

	.role-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
	}
</style>
