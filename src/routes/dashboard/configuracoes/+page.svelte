<script>
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import OrgSettingsForm from '$lib/components/organisms/dashboard/OrgSettingsForm.svelte';
	import ApiKeyForm from '$lib/components/organisms/dashboard/ApiKeyForm.svelte';
	import FontManager from '$lib/components/organisms/dashboard/FontManager.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { ROLE_CATEGORY_LABELS } from '$lib/constants/participant-status';

	export let data;

	// ── Fontes de certificado ──
	let fonts = [];
	let uploadingFont = false;
	let fontManagerRef;

	onMount(async () => {
		if (data.permissions?.canManageCertificates) await loadFonts();
	});

	async function loadFonts() {
		try {
			const res = await fetch('/dashboard/api/certificates/fonts');
			if (res.ok) fonts = (await res.json()).fonts;
		} catch {}
	}

	async function handleFontUpload(e) {
		const { file, name } = e.detail;
		if (!file) return;
		uploadingFont = true;
		try {
			const fd = new FormData();
			fd.append('file', file);
			if (name) fd.append('name', name);
			const res = await fetch('/dashboard/api/certificates/fonts', { method: 'POST', body: fd });
			const result = await res.json();
			if (res.ok) {
				addToast(`Fonte "${result.name}" salva!`, 'success');
				fontManagerRef?.onUploadSuccess();
				await loadFonts();
			} else {
				addToast(result.error || 'Erro ao salvar fonte', 'error');
			}
		} catch { addToast('Erro ao enviar fonte', 'error'); }
		finally { uploadingFont = false; }
	}

	async function handleFontDelete(e) {
		try {
			const res = await fetch('/dashboard/api/certificates/fonts', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ fontId: e.detail.fontId })
			});
			if (res.ok) { addToast('Fonte removida', 'success'); await loadFonts(); }
			else { const r = await res.json(); addToast(r.error || 'Erro ao remover fonte', 'error'); }
		} catch { addToast('Erro ao remover fonte', 'error'); }
	}

	let savingOrg = false;
	let savingKey = false;
	let enforceTransitions = data.enforceStatusTransitions;

	// Email config
	let emailDomain = data.emailDomain || '';
	let emailFrom = data.emailFrom || '';
	let savingEmail = false;

	$: emailPreview = emailFrom || (emailDomain ? `contato@${emailDomain}` : '');

	async function saveEmailSetting(key, value) {
		const res = await fetch('/dashboard/api/settings', {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ key, value })
		});
		if (!res.ok) throw new Error('Erro ao salvar');
	}

	async function saveEmailConfig() {
		savingEmail = true;
		try {
			await saveEmailSetting('email_domain', emailDomain.trim());
			await saveEmailSetting('email_from', emailFrom.trim());
			addToast('Configurações de e-mail salvas', 'success');
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			savingEmail = false;
		}
	}

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

	{#if data.permissions?.canManageCertificates}
		<FontManager
			{fonts}
			uploading={uploadingFont}
			bind:this={fontManagerRef}
			on:upload={handleFontUpload}
			on:delete={handleFontDelete}
		/>
	{/if}

	<OrgSettingsForm
		brandName={data.organization?.brandName || ''}
		logoUrl={data.organization?.logoUrl || ''}
		primaryColor={data.organization?.primaryColor || '#324acb'}
		saving={savingOrg}
		on:save={handleSaveOrg}
	/>

	<ApiKeyForm saving={savingKey} on:save={handleSaveKey} />

	<section class="settings-section">
		<h3 class="section-title">Configurações de E-mail</h3>
		<p class="section-subtitle">
			Configure o domínio e endereço remetente dos e-mails de certificado.
			O padrão é <code>contato@seu-domínio</code>, mas pode ser personalizado.
		</p>

		<div class="email-config-form">
			<div class="form-group">
				<label class="form-label" for="email-domain">Domínio de e-mail</label>
				<input
					id="email-domain"
					class="form-input"
					type="text"
					bind:value={emailDomain}
					placeholder="ex: suaong.org.br"
				/>
				<span class="form-hint">Domínio verificado no Resend para envio de e-mails</span>
			</div>

			<div class="form-group">
				<label class="form-label" for="email-from">Remetente personalizado (opcional)</label>
				<input
					id="email-from"
					class="form-input"
					type="text"
					bind:value={emailFrom}
					placeholder="ex: certificados@suaong.org.br"
				/>
				<span class="form-hint">Se vazio, será usado <strong>{emailDomain ? `contato@${emailDomain}` : 'o padrão do sistema'}</strong></span>
			</div>

			{#if emailPreview}
				<p class="email-preview">
					Remetente atual: <strong>{emailPreview}</strong>
				</p>
			{/if}

			<Button variant="primary" size="sm" disabled={savingEmail} on:click={saveEmailConfig}>
				{savingEmail ? 'Salvando...' : 'Salvar configurações de e-mail'}
			</Button>
		</div>
	</section>

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

	.email-config-form {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.form-label {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-700);
	}

	.form-input {
		padding: var(--spacing-xs) var(--spacing-sm);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-primary-500);
	}

	.form-hint {
		font-size: var(--font-size-xs);
		color: var(--color-neutral-500);
	}

	.email-preview {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-600);
		padding: var(--spacing-xs) var(--spacing-sm);
		background: var(--color-neutral-50);
		border-radius: var(--border-radius-md);
		margin: 0;
	}
</style>
