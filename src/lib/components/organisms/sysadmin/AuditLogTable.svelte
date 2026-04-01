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
<td class="td-when">{cols.when}</td>
<td>
{#if cols.userName.length > TRUNCATE_AT}
{#if expanded[`${i}-userName`]}
<span class="cell-full">{cols.userName}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-userName`)} title="Comprimir">−</button></span>
{:else}
<span class="cell-truncated">{cols.userName.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-userName`)} title="Expandir">…</button></span>
{/if}
{:else}
{cols.userName}
{/if}
</td>
<td><Badge variant={howVariant(entry.how)} text={entry.how} size="sm" /></td>
<td>
{#if cols.whatTable.length > TRUNCATE_AT}
{#if expanded[`${i}-whatTable`]}
<code class="cell-full">{cols.whatTable}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whatTable`)} title="Comprimir">−</button></code>
{:else}
<code class="cell-truncated">{cols.whatTable.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whatTable`)} title="Expandir">…</button></code>
{/if}
{:else}
<code>{cols.whatTable}</code>
{/if}
</td>
<td class="td-object">
{#if !cols.whatRecordId}
—
{:else if !revealed[`${i}-whatRecordId`]}
<button class="eye-btn" on:click={() => toggleReveal(`${i}-whatRecordId`)} title="Mostrar">👁️‍🗨️</button>
{:else}
<span class="sensitive-revealed">
<button class="eye-btn eye-open" on:click={() => toggleReveal(`${i}-whatRecordId`)} title="Esconder">👁️</button>
{#if cols.whatRecordId.length > TRUNCATE_AT}
{#if expanded[`${i}-whatRecordId-exp`]}
<code class="record-id cell-full">{cols.whatRecordId}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whatRecordId-exp`)} title="Comprimir">−</button></code>
{:else}
<code class="record-id cell-truncated">{cols.whatRecordId.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whatRecordId-exp`)} title="Expandir">…</button></code>
{/if}
{:else}
<code class="record-id">{cols.whatRecordId}</code>
{/if}
</span>
{/if}
</td>
<td class="td-why">
{#if cols.why.length > TRUNCATE_AT}
{#if expanded[`${i}-why`]}
<span class="cell-full">{cols.why}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-why`)} title="Comprimir">−</button></span>
{:else}
<span class="cell-truncated">{cols.why.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-why`)} title="Expandir">…</button></span>
{/if}
{:else}
{cols.why}
{/if}
</td>
<td class="td-ip">
{#if !cols.whereIp}
—
{:else if !revealed[`${i}-whereIp`]}
<button class="eye-btn" on:click={() => toggleReveal(`${i}-whereIp`)} title="Mostrar">👁️‍🗨️</button>
{:else}
<span class="sensitive-revealed">
<button class="eye-btn eye-open" on:click={() => toggleReveal(`${i}-whereIp`)} title="Esconder">👁️</button>
{#if cols.whereIp.length > TRUNCATE_AT}
{#if expanded[`${i}-whereIp-exp`]}
<span class="cell-full">{cols.whereIp}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whereIp-exp`)} title="Comprimir">−</button></span>
{:else}
<span class="cell-truncated">{cols.whereIp.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whereIp-exp`)} title="Expandir">…</button></span>
{/if}
{:else}
{cols.whereIp}
{/if}
</span>
{/if}
</td>
<td class="td-org">
{#if cols.whereOrganization.length > TRUNCATE_AT}
{#if expanded[`${i}-whereOrganization`]}
<span class="cell-full">{cols.whereOrganization}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whereOrganization`)} title="Comprimir">−</button></span>
{:else}
<span class="cell-truncated">{cols.whereOrganization.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(`${i}-whereOrganization`)} title="Expandir">…</button></span>
{/if}
{:else}
{cols.whereOrganization}
{/if}
</td>
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

