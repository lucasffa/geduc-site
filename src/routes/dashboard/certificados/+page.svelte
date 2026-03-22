<script>
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/dashboard';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import CertificateConfig from '$lib/components/organisms/dashboard/CertificateConfig.svelte';
	import ParticipantSelection from '$lib/components/organisms/dashboard/ParticipantSelection.svelte';
	import CertificateQueue from '$lib/components/organisms/dashboard/CertificateQueue.svelte';
	import CertPreviewModal from '$lib/components/organisms/dashboard/CertPreviewModal.svelte';
	import TemplateUploadModal from '$lib/components/organisms/dashboard/TemplateUploadModal.svelte';
	import TestEmailModal from '$lib/components/organisms/dashboard/TestEmailModal.svelte';

	export let data;

	// State
	let participants = [];
	let selectedIds = new Set();
	let loading = true;
	let generating = false;
	let sending = false;

	// Config (bound to CertificateConfig)
	let workloadHours = '';
	let periodStart = '';
	let periodEnd = '';
	let templateName = 'default';
	let templates = [];

	// Upload template
	let showUploadModal = false;
	let uploading = false;

	// Preview
	let showPreviewModal = false;
	let previewParticipants = [];

	// Generated certificates
	let generatedCerts = [];

	// Test email
	let testCertId = null;
	let showTestModal = false;
	let sendingTest = false;

	$: eligibleParticipants = participants.filter((p) =>
		['ativo', 'aprovado_sem_bolsa', 'aprovado_com_bolsa', 'certificado_processando'].includes(p.status)
	);

	onMount(async () => {
		await Promise.all([loadParticipants(), loadTemplates()]);
	});

	async function loadParticipants() {
		loading = true;
		try {
			const res = await fetch('/dashboard/api/participants?limit=500');
			if (res.ok) {
				const result = await res.json();
				participants = result.data;
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	async function loadTemplates() {
		try {
			const res = await fetch('/dashboard/api/certificates/upload-template');
			if (res.ok) {
				const result = await res.json();
				templates = result.templates;
			}
		} catch (e) {
			console.error(e);
		}
	}

	function handleToggleSelect(e) {
		const id = e.detail.id;
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
	}

	function handleToggleAll() {
		if (selectedIds.size === eligibleParticipants.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(eligibleParticipants.map((p) => p.id));
		}
	}

	function handlePreview() {
		if (selectedIds.size === 0) { addToast('Selecione ao menos um participante', 'error'); return; }
		if (!workloadHours || !periodStart || !periodEnd) { addToast('Preencha carga horária e período', 'error'); return; }
		previewParticipants = participants.filter((p) => selectedIds.has(p.id));
		showPreviewModal = true;
	}

	async function handleGenerate() {
		generating = true;
		try {
			const res = await fetch('/dashboard/api/certificates/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					participantIds: Array.from(selectedIds),
					workloadHours: parseInt(workloadHours),
					periodStart,
					periodEnd,
					templateName
				})
			});
			const result = await res.json();
			if (res.ok) {
				generatedCerts = result.generated;
				showPreviewModal = false;
				addToast(`${result.count} certificados gerados com sucesso!`, 'success');
				selectedIds = new Set();
				loadParticipants();
			} else {
				addToast(result.error || 'Erro ao gerar', 'error');
			}
		} catch (_e) {
			addToast('Erro ao gerar certificados', 'error');
		} finally {
			generating = false;
		}
	}

	async function handleSendBatch() {
		if (generatedCerts.length === 0) { addToast('Nenhum certificado para enviar', 'error'); return; }
		sending = true;
		try {
			const res = await fetch('/dashboard/api/certificates/send-batch', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateIds: generatedCerts.map((c) => c.id) })
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`${result.success} certificados enviados!${result.failed > 0 ? ` ${result.failed} falharam.` : ''}`, 'success');
				generatedCerts = [];
				loadParticipants();
			} else {
				addToast(result.error || 'Erro no envio', 'error');
			}
		} catch (_e) {
			addToast('Erro no envio em lote', 'error');
		} finally {
			sending = false;
		}
	}

	async function handleSendSingle(e) {
		const certId = e.detail.id;
		try {
			const res = await fetch('/dashboard/api/certificates/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateId: certId })
			});
			if (res.ok) {
				addToast('Certificado enviado!', 'success');
				generatedCerts = generatedCerts.filter((c) => c.id !== certId);
				loadParticipants();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro no envio', 'error');
			}
		} catch (_e) {
			addToast('Erro ao enviar', 'error');
		}
	}

	function handleOpenTestEmail(e) {
		testCertId = e.detail.id;
		showTestModal = true;
	}

	async function handleSendTest(e) {
		const testEmail = e.detail.email;
		if (!testEmail || !testCertId) return;
		sendingTest = true;
		try {
			const res = await fetch('/dashboard/api/certificates/test-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateId: testCertId, testEmail })
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`E-mail de teste enviado para ${testEmail}`, 'success');
				showTestModal = false;
			} else {
				addToast(result.error || 'Erro ao enviar teste', 'error');
			}
		} catch (_e) {
			addToast('Erro ao enviar e-mail de teste', 'error');
		} finally {
			sendingTest = false;
		}
	}

	async function handleUpload(e) {
		const { file, name } = e.detail;
		if (!file) return;
		uploading = true;
		try {
			const fd = new FormData();
			fd.append('file', file);
			if (name) fd.append('name', name);
			const res = await fetch('/dashboard/api/certificates/upload-template', { method: 'POST', body: fd });
			const result = await res.json();
			if (res.ok) {
				addToast(`Template "${result.templateName}" salvo!`, 'success');
				showUploadModal = false;
				loadTemplates();
			} else {
				addToast(result.error || 'Erro ao salvar', 'error');
			}
		} catch (_e) {
			addToast('Erro ao carregar template', 'error');
		} finally {
			uploading = false;
		}
	}
</script>

<svelte:head>
	<title>Certificados | Dashboard GEDUC</title>
</svelte:head>

<PageHeader title="Certificados">
	<Button variant="ghost" on:click={() => { showUploadModal = true; }}>
		Upload Template PDF
	</Button>
</PageHeader>

<CertificateConfig
	bind:workloadHours
	bind:periodStart
	bind:periodEnd
	bind:templateName
	{templates}
/>

<ParticipantSelection
	participants={eligibleParticipants}
	{selectedIds}
	{loading}
	on:toggle={handleToggleSelect}
	on:toggleAll={handleToggleAll}
	on:preview={handlePreview}
/>

<CertificateQueue
	certificates={generatedCerts}
	{participants}
	{sending}
	on:sendBatch={handleSendBatch}
	on:sendSingle={handleSendSingle}
	on:testEmail={handleOpenTestEmail}
/>

<CertPreviewModal
	isOpen={showPreviewModal}
	participants={previewParticipants}
	{workloadHours}
	{periodStart}
	{periodEnd}
	{templateName}
	{generating}
	on:close={() => { showPreviewModal = false; }}
	on:generate={handleGenerate}
/>

<TemplateUploadModal
	isOpen={showUploadModal}
	{uploading}
	on:close={() => { showUploadModal = false; }}
	on:upload={handleUpload}
/>

<TestEmailModal
	isOpen={showTestModal}
	sending={sendingTest}
	on:close={() => { showTestModal = false; }}
	on:send={handleSendTest}
/>
