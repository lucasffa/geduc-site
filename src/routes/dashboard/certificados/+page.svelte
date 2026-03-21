<script lang="ts">
	import { onMount } from 'svelte';
	import { STATUS_LABELS } from '$lib/constants/participant-status';
	import type { ParticipantStatus } from '$lib/constants/participant-status';
	import type { Participant, Certificate, ToastData, TemplateInfo } from '$lib/types/dashboard';

	// State
	let participants: Participant[] = $state([]);
	let selectedIds: Set<number> = $state(new Set());
	let loading = $state(true);
	let generating = $state(false);
	let sending = $state(false);

	// Config
	let workloadHours = $state('');
	let periodStart = $state('');
	let periodEnd = $state('');
	let templateName = $state('default');
	let templates: TemplateInfo[] = $state([]);

	// Upload template
	let showUploadModal = $state(false);
	let uploadFile: File | null = $state(null);
	let uploadName = $state('');
	let uploading = $state(false);

	// Preview
	let showPreviewModal = $state(false);
	let previewParticipants: Participant[] = $state([]);

	// Generated certificates
	let generatedCerts: Certificate[] = $state([]);
	let showSendModal = $state(false);

	// Test email
	let testEmail = $state('');
	let testCertId: number | null = $state(null);
	let showTestModal = $state(false);
	let sendingTest = $state(false);

	// Toast
	let toast: ToastData | null = $state(null);
	let toastTimeout: ReturnType<typeof setTimeout> | undefined;

	function showToast(message: string, type = 'success') {
		if (toastTimeout) clearTimeout(toastTimeout);
		toast = { message, type };
		toastTimeout = setTimeout(() => { toast = null; }, 4000);
	}

	onMount(async () => {
		await Promise.all([loadParticipants(), loadTemplates()]);
	});

	async function loadParticipants() {
		loading = true;
		try {
			const res = await fetch('/dashboard/api/participants?limit=500');
			if (res.ok) {
				const data = await res.json();
				participants = data.data;
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
				const data = await res.json();
				templates = data.templates;
			}
		} catch (e) {
			console.error(e);
		}
	}

	function toggleSelect(id: number) {
		const next = new Set(selectedIds);
		if (next.has(id)) next.delete(id);
		else next.add(id);
		selectedIds = next;
	}

	function toggleAll() {
		if (selectedIds.size === eligibleParticipants.length) {
			selectedIds = new Set();
		} else {
			selectedIds = new Set(eligibleParticipants.map((p) => p.id));
		}
	}

	let eligibleParticipants = $derived(
		participants.filter((p) =>
			['ativo', 'aprovado_sem_bolsa', 'aprovado_com_bolsa', 'certificado_processando'].includes(p.status)
		)
	);

	function openPreview() {
		if (selectedIds.size === 0) { showToast('Selecione ao menos um participante', 'error'); return; }
		if (!workloadHours || !periodStart || !periodEnd) { showToast('Preencha carga horária e período', 'error'); return; }
		previewParticipants = participants.filter((p) => selectedIds.has(p.id));
		showPreviewModal = true;
	}

	async function generateCertificates() {
		generating = true;
		try {
			const res = await fetch('/dashboard/api/certificates/generate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ participantIds: Array.from(selectedIds), workloadHours: parseInt(workloadHours), periodStart, periodEnd, templateName })
			});
			const data = await res.json();
			if (res.ok) {
				generatedCerts = data.generated;
				showPreviewModal = false;
				showToast(`${data.count} certificados gerados com sucesso!`);
				selectedIds = new Set();
				loadParticipants();
			} else { showToast(data.error || 'Erro ao gerar', 'error'); }
		} catch (_e) { showToast('Erro ao gerar certificados', 'error'); }
		finally { generating = false; }
	}

	async function sendBatch() {
		if (generatedCerts.length === 0) { showToast('Nenhum certificado para enviar', 'error'); return; }
		sending = true;
		try {
			const res = await fetch('/dashboard/api/certificates/send-batch', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateIds: generatedCerts.map((c) => c.id) })
			});
			const data = await res.json();
			if (res.ok) {
				showToast(`${data.success} certificados enviados! ${data.failed > 0 ? `${data.failed} falharam.` : ''}`);
				generatedCerts = []; loadParticipants();
			} else { showToast(data.error || 'Erro no envio', 'error'); }
		} catch (_e) { showToast('Erro no envio em lote', 'error'); }
		finally { sending = false; }
	}

	async function sendSingle(certId: number) {
		try {
			const res = await fetch('/dashboard/api/certificates/send', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateId: certId })
			});
			if (res.ok) { showToast('Certificado enviado!'); generatedCerts = generatedCerts.filter((c) => c.id !== certId); loadParticipants(); }
			else { const data = await res.json(); showToast(data.error || 'Erro no envio', 'error'); }
		} catch (_e) { showToast('Erro ao enviar', 'error'); }
	}

	function openTestEmail(certId: number) { testCertId = certId; testEmail = ''; showTestModal = true; }

	async function sendTestEmailAction() {
		if (!testEmail || !testCertId) return;
		sendingTest = true;
		try {
			const res = await fetch('/dashboard/api/certificates/test-email', {
				method: 'POST', headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ certificateId: testCertId, testEmail })
			});
			const data = await res.json();
			if (res.ok) { showToast(`E-mail de teste enviado para ${testEmail}`); showTestModal = false; }
			else { showToast(data.error || 'Erro ao enviar teste', 'error'); }
		} catch (_e) { showToast('Erro ao enviar e-mail de teste', 'error'); }
		finally { sendingTest = false; }
	}

	async function uploadTemplate() {
		if (!uploadFile) return;
		uploading = true;
		try {
			const fd = new FormData();
			fd.append('file', uploadFile);
			if (uploadName) fd.append('name', uploadName);
			const res = await fetch('/dashboard/api/certificates/upload-template', { method: 'POST', body: fd });
			const data = await res.json();
			if (res.ok) { showToast(`Template "${data.templateName}" salvo!`); showUploadModal = false; uploadFile = null; uploadName = ''; loadTemplates(); }
			else { showToast(data.error || 'Erro ao salvar', 'error'); }
		} catch (_e) { showToast('Erro ao carregar template', 'error'); }
		finally { uploading = false; }
	}
</script>

<svelte:head>
	<title>Certificados | Dashboard GEDUC</title>
</svelte:head>

<div class="dashboard-header">
	<h1>Certificados</h1>
	<button class="btn btn-secondary" onclick={() => { showUploadModal = true; uploadFile = null; uploadName = ''; }}>
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
		Upload Template PDF
	</button>
</div>

<!-- Config Section -->
<div class="data-table-wrapper" style="margin-bottom: var(--spacing-xl);">
	<div class="table-toolbar"><h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-primary-900);">Configuração do Certificado</h3></div>
	<div style="padding: var(--spacing-lg);">
		<div class="form-row">
			<div class="form-group"><label for="workload">Carga Horária (horas) *</label><input id="workload" class="form-control" type="number" bind:value={workloadHours} placeholder="Ex: 120" /></div>
			<div class="form-group"><label for="template">Template</label><select id="template" class="form-control" bind:value={templateName}><option value="default">Modelo padrão GEDUC</option>{#each templates as t}<option value={t.name}>{t.name}</option>{/each}</select></div>
		</div>
		<div class="form-row">
			<div class="form-group"><label for="period-start">Período — Início *</label><input id="period-start" class="form-control" type="date" bind:value={periodStart} /></div>
			<div class="form-group"><label for="period-end">Período — Fim *</label><input id="period-end" class="form-control" type="date" bind:value={periodEnd} /></div>
		</div>
	</div>
</div>

<!-- Participant Selection -->
<div class="data-table-wrapper" style="margin-bottom: var(--spacing-xl);">
	<div class="table-toolbar">
		<div class="table-toolbar-left">
			<h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-primary-900);">Selecionar Participantes</h3>
			<span style="font-size: var(--font-size-xs); color: var(--text-color-subtle);">{selectedIds.size} selecionado{selectedIds.size !== 1 ? 's' : ''} de {eligibleParticipants.length} elegível(eis)</span>
		</div>
		<button class="btn btn-primary" onclick={openPreview} disabled={selectedIds.size === 0}>Revisar e Gerar ({selectedIds.size})</button>
	</div>

	{#if loading}
		<div class="loading-overlay"><div class="loading-spinner"></div></div>
	{:else if eligibleParticipants.length === 0}
		<div class="empty-state"><h3>Nenhum participante elegível</h3><p>Apenas participantes com status "Ativo", "Aprovado" ou "Certificado em processamento" podem receber certificados.</p></div>
	{:else}
		<div style="overflow-x: auto;">
			<table class="data-table">
				<thead><tr><th class="checkbox-cell"><input type="checkbox" checked={selectedIds.size === eligibleParticipants.length && eligibleParticipants.length > 0} onchange={toggleAll} /></th><th>Nome</th><th>Cargo</th><th>Status</th><th>Período</th></tr></thead>
				<tbody>
					{#each eligibleParticipants as p}
						<tr>
							<td class="checkbox-cell"><input type="checkbox" checked={selectedIds.has(p.id)} onchange={() => toggleSelect(p.id)} /></td>
							<td><div class="participant-name">{p.name}</div><div class="participant-email">{p.email}</div></td>
							<td style="text-transform: capitalize;">{p.role}</td>
							<td><span class="status-badge status-badge--{p.status}">{STATUS_LABELS[p.status as ParticipantStatus] || p.status}</span></td>
							<td>{p.enrollmentDate ? new Date(p.enrollmentDate + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}{p.cycleEndDate ? ` — ${new Date(p.cycleEndDate + 'T00:00:00').toLocaleDateString('pt-BR')}` : ''}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>

<!-- Generated Certificates Queue -->
{#if generatedCerts.length > 0}
	<div class="data-table-wrapper">
		<div class="table-toolbar">
			<h3 style="font-size: var(--font-size-md); font-weight: var(--font-weight-semibold); color: var(--color-primary-900);">Certificados Gerados ({generatedCerts.length})</h3>
			<button class="btn btn-success" onclick={sendBatch} disabled={sending}>{#if sending}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Enviar Todos por E-mail</button>
		</div>
		<div style="overflow-x: auto;">
			<table class="data-table">
				<thead><tr><th>ID</th><th>Participante</th><th>Carga Horária</th><th>Período</th><th>Ações</th></tr></thead>
				<tbody>
					{#each generatedCerts as cert}
						{@const participant = participants.find((p) => p.id === cert.participantId)}
						<tr>
							<td>#{cert.id}</td>
							<td>{participant?.name || `ID ${cert.participantId}`}</td>
							<td>{cert.workloadHours}h</td>
							<td>{cert.periodStart && cert.periodEnd ? `${new Date(cert.periodStart + 'T00:00:00').toLocaleDateString('pt-BR')} — ${new Date(cert.periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}` : '—'}</td>
							<td>
								<div class="actions-cell">
									<a href={cert.pdfPath} target="_blank" class="btn btn-sm btn-outline">Ver PDF</a>
									<button class="btn btn-sm btn-success" onclick={() => sendSingle(cert.id)}>Enviar</button>
									<button class="btn btn-sm btn-outline" onclick={() => openTestEmail(cert.id)}>Teste</button>
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
{/if}

<!-- Preview Modal -->
{#if showPreviewModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showPreviewModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showPreviewModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" style="max-width: 700px;" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Revisão antes da geração</h3><button class="modal-close" onclick={() => { showPreviewModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div style="background: var(--color-neutral-50); padding: var(--spacing-md); border-radius: var(--border-radius-lg); margin-bottom: var(--spacing-lg);">
					<p style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);"><strong>Carga horária:</strong> {workloadHours}h</p>
					<p style="font-size: var(--font-size-sm); margin-bottom: var(--spacing-xs);"><strong>Período:</strong> {new Date(periodStart + 'T00:00:00').toLocaleDateString('pt-BR')} a {new Date(periodEnd + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
					<p style="font-size: var(--font-size-sm);"><strong>Template:</strong> {templateName === 'default' ? 'Modelo padrão' : templateName}</p>
				</div>
				<p style="font-size: var(--font-size-sm); font-weight: var(--font-weight-semibold); margin-bottom: var(--spacing-md);">{previewParticipants.length} certificado{previewParticipants.length !== 1 ? 's' : ''} será(ão) gerado(s):</p>
				<div style="max-height: 300px; overflow-y: auto;">
					{#each previewParticipants as p}
						<div class="cert-preview" style="margin-bottom: var(--spacing-md); padding: var(--spacing-md);">
							<div class="cert-title" style="font-size: var(--font-size-sm);">CERTIFICADO GEDUC</div>
							<div class="cert-name" style="font-size: var(--font-size-lg);">{p.name}</div>
							<div class="cert-detail">{p.role} · {p.email}</div>
							<div class="cert-detail">{workloadHours} horas · {periodStart} a {periodEnd}</div>
						</div>
					{/each}
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showPreviewModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={generating} onclick={generateCertificates}>{#if generating}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Confirmar e Gerar</button>
			</div>
		</div>
	</div>
{/if}

<!-- Upload Template Modal -->
{#if showUploadModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showUploadModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showUploadModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Upload de Template PDF</h3><button class="modal-close" onclick={() => { showUploadModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-group"><label for="template-name">Nome do Template</label><input id="template-name" class="form-control" bind:value={uploadName} placeholder="Ex: modelo_2024" /></div>
				<div class="form-group"><label for="template-file">Arquivo PDF</label><input id="template-file" class="form-control" type="file" accept=".pdf" onchange={(e) => { uploadFile = (e.target as HTMLInputElement).files?.[0] || null; }} /></div>
				<div style="font-size: var(--font-size-xs); color: var(--text-color-subtle); padding: var(--spacing-sm); background: var(--color-neutral-50); border-radius: var(--border-radius-lg);">
					O sistema escreverá nome, cargo, carga horária e período sobre o PDF. Posicione o layout do template de forma que haja espaço na região central.
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showUploadModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={!uploadFile || uploading} onclick={uploadTemplate}>{#if uploading}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Salvar Template</button>
			</div>
		</div>
	</div>
{/if}

<!-- Test Email Modal -->
{#if showTestModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => { showTestModal = false; }} onkeydown={(e) => { if (e.key === 'Escape') showTestModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()} onkeydown={() => {}}>
			<div class="modal-header"><h3>Enviar E-mail de Teste</h3><button class="modal-close" onclick={() => { showTestModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-group"><label for="test-email">E-mail de destino (para teste)</label><input id="test-email" class="form-control" type="email" bind:value={testEmail} placeholder="seu@email.com" /></div>
				<p style="font-size: var(--font-size-xs); color: var(--text-color-subtle);">O certificado será enviado para este e-mail, permitindo revisar antes do disparo oficial.</p>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" onclick={() => { showTestModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={!testEmail || sendingTest} onclick={sendTestEmailAction}>{#if sendingTest}<span class="loading-spinner" style="width: 14px; height: 14px;"></span>{/if} Enviar Teste</button>
			</div>
		</div>
	</div>
{/if}

<!-- Toast -->
{#if toast}
	<div class="toast toast--{toast.type}">{toast.message}</div>
{/if}
