<!-- src/lib/components/organisms/sysadmin/AuditLogTable.svelte -->
<script>
	import Badge from '$lib/components/atoms/Badge.svelte';

	/** @type {any[]} */
	export let entries = [];
	/** @type {number} */
	export let page = 1;
	/** @type {number} */
	export let totalPages = 1;
	/** @type {number} */
	export let total = 0;

	function howVariant(how) {
		switch (how) {
			case 'CREATE': return 'success';
			case 'UPDATE': return 'warning';
			case 'DELETE': return 'error';
			case 'READ': return 'info';
			default: return 'neutral';
		}
	}
</script>

<div class="table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				<th>Quando</th>
				<th>Quem</th>
				<th>Ação</th>
				<th>Tabela</th>
				<th>Motivo</th>
				<th>IP</th>
				<th>Organização</th>
				<th>Qtd</th>
			</tr>
		</thead>
		<tbody>
			{#each entries as entry}
				<tr>
					<td class="td-when">{new Date(entry.when).toLocaleString('pt-BR')}</td>
					<td>{entry.userName || entry.who}</td>
					<td><Badge variant={howVariant(entry.how)} text={entry.how} size="sm" /></td>
					<td><code>{entry.whatTable}</code>{#if entry.whatRecordId}<br/><small>{entry.whatRecordId}</small>{/if}</td>
					<td class="td-why">{entry.why}</td>
					<td class="td-ip">{entry.whereIp || '—'}</td>
					<td class="td-org">{entry.whereOrganization || '—'}</td>
					<td>{entry.howManyAffected}</td>
				</tr>
			{:else}
				<tr><td colspan="8" class="empty">Nenhuma entrada de auditoria</td></tr>
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

<style>
	.table-wrapper {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		padding: var(--spacing-sm) var(--spacing-md);
		text-align: left;
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.data-table td {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-sm);
		border-bottom: 1px solid var(--color-neutral-100);
		vertical-align: top;
	}

	.td-when {
		white-space: nowrap;
		font-size: var(--font-size-xs);
	}

	.td-why {
		max-width: 300px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.td-ip {
		font-family: monospace;
		font-size: var(--font-size-xs);
	}

	.td-org {
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	code {
		background: var(--color-neutral-100);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: var(--font-size-xs);
	}

	small {
		color: var(--text-color-subtle);
		font-size: var(--font-size-xs);
	}

	.empty {
		text-align: center;
		color: var(--text-color-subtle);
		padding: var(--spacing-2xl) !important;
	}

	.pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
		margin-top: var(--spacing-lg);
	}

	.page-info {
		font-size: var(--font-size-sm);
		color: var(--text-color-subtle);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border: none;
		text-decoration: none;
		transition: all var(--transition-fast);
	}

	.btn-sm {
		padding: 4px 8px;
		font-size: var(--font-size-xs);
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-neutral-300);
		color: var(--text-color-default);
	}

	.btn-outline:hover {
		background: var(--color-neutral-100);
	}
</style>
