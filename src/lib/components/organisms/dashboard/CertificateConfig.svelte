<!-- src/lib/components/organisms/dashboard/CertificateConfig.svelte -->
<script lang="ts">
	import type { TemplateInfo } from '$lib/types/dashboard';

	export let workloadHours: string = '';
	export let periodStart: string = '';
	export let periodEnd: string = '';
	export let templateId: string | null = null;
	export let templates: TemplateInfo[] = [];
</script>

<div class="data-table-wrapper cert-config">
	<div class="table-toolbar">
		<h3 class="section-heading">Configuração do Certificado</h3>
	</div>
	<div class="config-body">
		<div class="form-row">
			<div class="form-group">
				<label for="workload">Carga Horária (horas) *</label>
				<input id="workload" class="form-control" type="number" bind:value={workloadHours} placeholder="Ex: 120" />
			</div>
			<div class="form-group">
				<label for="template">Template</label>
				<select id="template" class="form-control" bind:value={templateId}>
					<option value={null}>Modelo padrão GEDUC</option>
					{#each templates as t}
						<option value={t.id}>{t.name}</option>
					{/each}
				</select>
			</div>
		</div>
		<div class="form-row">
			<div class="form-group">
				<label for="period-start">Período — Início *</label>
				<input id="period-start" class="form-control" type="date" bind:value={periodStart} />
			</div>
			<div class="form-group">
				<label for="period-end">Período — Fim *</label>
				<input id="period-end" class="form-control" type="date" bind:value={periodEnd} />
			</div>
		</div>
	</div>
</div>

<style>
	.cert-config {
		margin-bottom: var(--spacing-xl);
	}

	.section-heading {
		font-size: var(--font-size-md);
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary-900);
	}

	.config-body {
		padding: var(--spacing-lg);
	}
</style>
