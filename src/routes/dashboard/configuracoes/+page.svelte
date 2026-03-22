<script>
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import OrgSettingsForm from '$lib/components/organisms/dashboard/OrgSettingsForm.svelte';
	import ApiKeyForm from '$lib/components/organisms/dashboard/ApiKeyForm.svelte';
	import { addToast } from '$lib/stores/dashboard';

	export let data;

	let savingOrg = false;
	let savingKey = false;

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
</div>

<style>
	.config-page {
		max-width: 800px;
	}
</style>
