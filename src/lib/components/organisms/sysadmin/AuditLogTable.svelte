<!-- src/lib/components/organisms/sysadmin/AuditLogTable.svelte -->
<script lang="ts">
import Badge from '$lib/components/atoms/Badge.svelte';

/** @type {any[]} */
export let entries: any[] = [];
/** @type {number} */
export let page = 1;
/** @type {number} */
export let totalPages = 1;
export const total = 0;

const TRUNCATE_AT = 15;
const sensitiveColumns = ['whatRecordId', 'whereIp'];

/** Track which cells are expanded (key = `rowIndex-colKey`) */
let expanded: Record<string, boolean> = {};
/** Track which sensitive columns are revealed per row */
let revealed: Record<string, boolean> = {};

function toggleExpand(key: string) {
	expanded = { ...expanded, [key]: !expanded[key] };
}

function toggleReveal(key: string) {
	revealed = { ...revealed, [key]: !revealed[key] };
}

function howVariant(how: string) {
	switch (how) {
		case 'CREATE': return 'success';
		case 'UPDATE': return 'warning';
		case 'DELETE': return 'error';
		case 'READ': return 'info';
		default: return 'neutral';
	}
}

function anonymizeNames(text: string) {
	if (!text) return '—';
	return text.replace(/"([^"]+)"/g, (_: string, name: string) => {
		const parts = name.trim().split(/\s+/);
		const anon = parts.slice(0, 2).map((p: string) => p[0].toUpperCase() + '*').join(' ');
		return anon;
	});
}
</script>

<div class="table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				<th>Quando</th>
				<th>Quem (autor)</th>
				<th>Ação</th>
				<th>Tabela</th>
				<th>Objeto</th>
				<th>Motivo</th>
				<th>IP</th>
				<th>Organização</th>
				<th>Qtd</th>
			</tr>
		</thead>
		<tbody>
			{#each entries as entry, i}
				{@const cols = {
					when: entry.when ? new Date(entry.when).toLocaleString('pt-BR') : '—',
					userName: entry.userName || entry.who || '—',
					how: entry.how,
					whatTable: entry.whatTable || '—',
					whatRecordId: entry.whatRecordId || '',
					why: anonymizeNames(entry.why),
					whereIp: entry.whereIp || '',
					whereOrganization: entry.whereOrganization || '—',
					howManyAffected: String(entry.howManyAffected ?? '—')
				}}
				<tr>
					<!-- Quando -->
					<td class="td-when">{cols.when}</td>

					<!-- Quem -->
					<td>
						{#if true}
							{@const key = `${i}-userName`}
							{@const val = cols.userName}
							{#if val.length > TRUNCATE_AT}
								{#if expanded[key]}
									<span class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Comprimir">−</button></span>
								{:else}
									<span class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Expandir">…</button></span>
								{/if}
							{:else}
								{val}
							{/if}
						{/if}
					</td>

					<!-- Ação -->
					<td><Badge variant={howVariant(entry.how)} text={entry.how} size="sm" /></td>

					<!-- Tabela -->
					<td>
						{#if true}
							{@const key = `${i}-whatTable`}
							{@const val = cols.whatTable}
							{#if val.length > TRUNCATE_AT}
								{#if expanded[key]}
									<code class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Comprimir">−</button></code>
								{:else}
									<code class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Expandir">…</button></code>
								{/if}
							{:else}
								<code>{val}</code>
							{/if}
						{/if}
					</td>

					<!-- Objeto (sensível) -->
					<td class="td-object">
						{#if true}
							{@const rKey = `${i}-whatRecordId`}
							{#if !cols.whatRecordId}
								—
							{:else if !revealed[rKey]}
								<button class="eye-btn" on:click={() => toggleReveal(rKey)} title="Mostrar">👁️‍🗨️</button>
							{:else}
								{@const val = cols.whatRecordId}
								<span class="sensitive-revealed">
									<button class="eye-btn eye-open" on:click={() => toggleReveal(rKey)} title="Esconder">👁️</button>
									{#if val.length > TRUNCATE_AT}
										{@const eKey = `${i}-whatRecordId-exp`}
										{#if expanded[eKey]}
											<code class="record-id cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Comprimir">−</button></code>
										{:else}
											<code class="record-id cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Expandir">…</button></code>
										{/if}
									{:else}
										<code class="record-id">{val}</code>
									{/if}
								</span>
							{/if}
						{/if}
					</td>

					<!-- Motivo -->
					<td class="td-why">
						{#if true}
							{@const key = `${i}-why`}
							{@const val = cols.why}
							{#if val.length > TRUNCATE_AT}
								{#if expanded[key]}
									<span class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Comprimir">−</button></span>
								{:else}
									<span class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Expandir">…</button></span>
								{/if}
							{:else}
								{val}
							{/if}
						{/if}
					</td>

					<!-- IP (sensível) -->
					<td class="td-ip">
						{#if true}
							{@const rKey = `${i}-whereIp`}
							{#if !cols.whereIp}
								—
							{:else if !revealed[rKey]}
								<button class="eye-btn" on:click={() => toggleReveal(rKey)} title="Mostrar">👁️‍🗨️</button>
							{:else}
								{@const val = cols.whereIp}
								<span class="sensitive-revealed">
									<button class="eye-btn eye-open" on:click={() => toggleReveal(rKey)} title="Esconder">👁️</button>
									{#if val.length > TRUNCATE_AT}
										{@const eKey = `${i}-whereIp-exp`}
										{#if expanded[eKey]}
											<span class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Comprimir">−</button></span>
										{:else}
											<span class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Expandir">…</button></span>
										{/if}
									{:else}
										{val}
									{/if}
								</span>
							{/if}
						{/if}
					</td>

					<!-- Organização -->
					<td class="td-org">
						{#if true}
							{@const key = `${i}-whereOrganization`}
							{@const val = cols.whereOrganization}
							{#if val.length > TRUNCATE_AT}
								{#if expanded[key]}
									<span class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Comprimir">−</button></span>
								{:else}
									<span class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Expandir">…</button></span>
								{/if}
							{:else}
								{val}
							{/if}
						{/if}
					</td>

					<!-- Qtd -->
					<td>{entry.howManyAffected ?? '—'}</td>
				</tr>
			{:else}
				<tr><td colspan="9" class="empty">Nenhuma entrada de auditoria</td></tr>
			{/each}
		</tbody>
	</table>
</div>

{#if totalPages > 1}
	<div class="pagination">
		{#if page > 1}
			<a href="?page={page - 1}" class="btn btn-sm btn-outline">Anterior</a>
		{/if}
		<span class="page-info">Página {page} de {totalPages}</span>
		{#if page < totalPages}
			<a href="?page={page + 1}" class="btn btn-sm btn-outline">Próxima</a>
		{/if}
	</div>
{/if}

