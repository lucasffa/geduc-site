<script>
	import Button from '$lib/components/atoms/Button.svelte';
	import { addToast } from '$lib/stores/dashboard';

	export let data;

	let org = data.organization ? { ...data.organization } : { brandName: '', logoUrl: '', primaryColor: '#324acb' };
	let saving = false;

	// API Key management
	let newApiKey = '';
	let savingKey = false;

	async function saveOrgSettings() {
		saving = true;
		try {
			const res = await fetch('/dashboard/api/organization', {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					brandName: org.brandName,
					logoUrl: org.logoUrl,
					primaryColor: org.primaryColor
				})
			});
			if (!res.ok) throw new Error('Erro ao salvar');
			addToast('Configurações salvas', 'success');
		} catch (err) {
			addToast(err.message, 'error');
		} finally {
			saving = false;
		}
	}

	async function saveApiKey() {
		if (!newApiKey.trim()) return;
		savingKey = true;
		try {
			const res = await fetch('/dashboard/api/api-keys', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					key: newApiKey,
					ownerType: 'organization',
					label: 'Resend Key da Organização'
				})
			});
			if (!res.ok) throw new Error((await res.json()).error || 'Erro');
			addToast('Chave API salva com sucesso', 'success');
			newApiKey = '';
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
	<h1 class="page-title">Configurações da Organização</h1>

	<section class="config-section">
		<h2>White-Label / Marca</h2>
		<form on:submit|preventDefault={saveOrgSettings}>
			<div class="form-group">
				<label for="brand-name">Nome da Marca</label>
				<input id="brand-name" bind:value={org.brandName} placeholder="Nome exibido no sistema" />
			</div>
			<div class="form-group">
				<label for="logo-url">URL do Logo</label>
				<input id="logo-url" bind:value={org.logoUrl} placeholder="https://..." />
			</div>
			<div class="form-group">
				<label for="primary-color">Cor Principal</label>
				<div class="color-row">
					<input id="primary-color" type="color" bind:value={org.primaryColor} />
					<span>{org.primaryColor}</span>
				</div>
			</div>
			<Button type="submit" variant="primary" loading={saving}>Salvar</Button>
		</form>
	</section>

	<section class="config-section">
		<h2>Chave API Resend (Organização)</h2>
		<p class="config-desc">Esta chave será usada para envios de email da organização. Criptografada com a senha do admin.</p>
		<form on:submit|preventDefault={saveApiKey}>
			<div class="form-group">
				<label for="api-key">Chave Resend</label>
				<input id="api-key" type="password" bind:value={newApiKey} placeholder="re_..." />
			</div>
			<Button type="submit" variant="primary" size="sm" loading={savingKey}>Salvar Chave</Button>
		</form>
	</section>
</div>

<style>
	.config-page { max-width: 800px; }
	.page-title { font-size: var(--font-size-xl); font-weight: var(--font-weight-bold); color: var(--color-neutral-900); margin: 0 0 var(--spacing-xl); }
	.config-section { background: var(--color-neutral-0); border: 1px solid var(--color-neutral-200); border-radius: var(--border-radius-lg); padding: var(--spacing-lg); margin-bottom: var(--spacing-lg); }
	.config-section h2 { font-size: var(--font-size-base); font-weight: var(--font-weight-medium); margin: 0 0 var(--spacing-md); }
	.config-desc { font-size: var(--font-size-sm); color: var(--color-neutral-500); margin: 0 0 var(--spacing-md); }
	.form-group { margin-bottom: var(--spacing-md); }
	.form-group label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xs); }
	.form-group input { width: 100%; padding: var(--spacing-sm) var(--spacing-md); border: 1px solid var(--color-neutral-300); border-radius: var(--border-radius-md); font-family: var(--font-family-sans); box-sizing: border-box; }
	.form-group input[type="color"] { width: 48px; height: 36px; padding: 2px; cursor: pointer; }
	.color-row { display: flex; align-items: center; gap: var(--spacing-sm); }
	.color-row span { font-size: var(--font-size-sm); color: var(--color-neutral-600); }
</style>
