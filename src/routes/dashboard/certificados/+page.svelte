<script>
	import { onMount } from 'svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { DEFAULT_CERT_FIELDS } from '$lib/constants/cert-fields';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import CertificateConfig from '$lib/components/organisms/dashboard/CertificateConfig.svelte';
	import CertificateFieldEditor from '$lib/components/organisms/dashboard/CertificateFieldEditor.svelte';
	import ParticipantSelection from '$lib/components/organisms/dashboard/ParticipantSelection.svelte';
	import CertificateQueue from '$lib/components/organisms/dashboard/CertificateQueue.svelte';
	import CertPreviewModal from '$lib/components/organisms/dashboard/CertPreviewModal.svelte';
	import TemplateUploadModal from '$lib/components/organisms/dashboard/TemplateUploadModal.svelte';
	import TestEmailModal from '$lib/components/organisms/dashboard/TestEmailModal.svelte';

	export let data;

	// ── Participantes ──
	let participants = [];
	let selectedIds = new Set();
	let loading = true;

	// ── Geração ──
	let generating = false;

	// ── Config certificado ──
	let workloadHours = '';
	let periodStart = '';
	let periodEnd = '';
	let templateId = null;
	let templates = [];

	// ── Fontes (apenas para passar ao editor de campos) ──
	let fonts = [];

	// ── Campos configuráveis ──
	let certFields = DEFAULT_CERT_FIELDS.map((f) => ({ ...f }));
	let certQueue; // bind:this para chamar reload() após geração

	// Chave localStorage por template: preserva preset por template
	function fieldsKey(tId) {
		return `geduc_cert_fields:${tId ?? 'default'}`;
	}

	function loadFieldsForTemplate(tId) {
		if (typeof window === 'undefined') return;
		const saved = localStorage.getItem(fieldsKey(tId));
		if (saved) {
			try { certFields = JSON.parse(saved); return; } catch {}
		}
		certFields = DEFAULT_CERT_FIELDS.map((f) => ({ ...f }));
	}

	function saveFields(tId, fields) {
		if (typeof window === 'undefined') return;
		localStorage.setItem(fieldsKey(tId), JSON.stringify(fields));
	}

	// Carrega preset ao trocar de template
	let _prevTemplateId = undefined;
	$: if (_prevTemplateId !== templateId) {
		_prevTemplateId = templateId;
		loadFieldsForTemplate(templateId);
	}

	// Salva ao alterar campos
	function handleFieldChange(e) {
		certFields = e.detail;
		saveFields(templateId, certFields);
	}

	$: templatePreviewUrl = templateId
		? `/dashboard/api/certificates/templates/${templateId}`
		: null;

	// ── Modais ──
	let showUploadModal = false;
	let uploading = false;
	let showPreviewModal = false;
	let previewParticipants = [];
	let testCertId = null;
	let showTestModal = false;
	let sendingTest = false;

	$: eligibleParticipants = participants.filter((p) =>
		['ativo', 'aprovado_sem_bolsa', 'aprovado_com_bolsa', 'certificado_processando'].includes(p.status)
	);

	onMount(async () => {
		loadFieldsForTemplate(templateId);
		await Promise.all([loadParticipants(), loadTemplates(), loadFonts()]);
	});

	async function loadParticipants() {
		loading = true;
		try {
			const res = await fetch('/dashboard/api/participants?limit=500');
			if (res.ok) participants = (await res.json()).data;
		} catch (e) { console.error(e); }
		finally { loading = false; }
	}

	async function loadTemplates() {
		try {
			const res = await fetch('/dashboard/api/certificates/upload-template');
			if (res.ok) templates = (await res.json()).templates;
		} catch (e) { console.error(e); }
	}

	async function loadFonts() {
		try {
			const res = await fetch('/dashboard/api/certificates/fonts');
			if (res.ok) fonts = (await res.json()).fonts;
		} catch (e) { console.error(e); }
	}

	// ── Seleção ──

	function handleToggleSelect(e) {
		const next = new Set(selectedIds);
		if (next.has(e.detail.id)) next.delete(e.detail.id);
		else next.add(e.detail.id);
		selectedIds = next;
	}

	function handleToggleAll() {
		selectedIds = selectedIds.size === eligibleParticipants.length
			? new Set()
			: new Set(eligibleParticipants.map((p) => p.id));
	}

	// ── Preview / Geração ──

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
					templateId,
					fields: certFields
				})
			});
			const result = await res.json();
			if (res.ok) {
				showPreviewModal = false;
				addToast(`${result.count} certificados gerados com sucesso!`, 'success');
				selectedIds = new Set();
				loadParticipants();
				certQueue?.reload(); // atualiza a fila persistente
			} else {
				addToast(result.error || 'Erro ao gerar', 'error');
			}
		} catch (_e) {
			addToast('Erro ao gerar certificados', 'error');
		} finally {
			generating = false;
		}
	}

	// ── Test email (modal) ──

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

	// ── Upload template ──

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

<!-- 1. Configuração básica -->
<CertificateConfig
	bind:workloadHours
	bind:periodStart
	bind:periodEnd
	bind:templateId
	{templates}
/>

<!-- 2. Seleção de participantes -->
<ParticipantSelection
	participants={eligibleParticipants}
	{selectedIds}
	{loading}
	on:toggle={handleToggleSelect}
	on:toggleAll={handleToggleAll}
	on:preview={handlePreview}
/>

<!-- 3. Fila de certificados (persiste entre reloads) -->
<CertificateQueue
	bind:this={certQueue}
	on:testEmail={handleOpenTestEmail}
	on:sent={loadParticipants}
/>

<!-- 4. Editor de campos (posicionamento visual) -->
<CertificateFieldEditor
	bind:fields={certFields}
	{fonts}
	{templatePreviewUrl}
	on:change={handleFieldChange}
/>

<!-- Modais -->
<CertPreviewModal
	isOpen={showPreviewModal}
	participants={previewParticipants}
	{workloadHours}
	{periodStart}
	{periodEnd}
	{templateId}
	{templates}
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
