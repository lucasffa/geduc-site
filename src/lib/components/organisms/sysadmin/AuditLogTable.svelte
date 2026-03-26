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

	const TRUNCATE_AT = 15;
	const sensitiveColumns = ['whatRecordId', 'whereIp'];

	/** Track which cells are expanded (key = `rowIndex-colKey`) */
	let expanded = {};
	/** Track which sensitive columns are revealed per row */
	let revealed = {};

	function toggleExpand(key) {
		expanded = { ...expanded, [key]: !expanded[key] };
	}

	function toggleReveal(key) {
		revealed = { ...revealed, [key]: !revealed[key] };
	}

	function howVariant(how) {
		switch (how) {
			case 'CREATE': return 'success';
			case 'UPDATE': return 'warning';
			case 'DELETE': return 'error';
			case 'READ': return 'info';
			default: return 'neutral';
		}
	}

	/** Anonimiza nomes no texto: "Ana Rita Vasconcelos" → "A* R*" */
	function anonymizeNames(text) {
		if (!text) return '—';
		return text.replace(/"([^"]+)"/g, (_, name) => {
			const parts = name.trim().split(/\s+/);
			const anon = parts.slice(0, 2).map(p => p[0].toUpperCase() + '*').join(' ');
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
	}

	.td-ip {
		font-family: monospace;
		font-size: var(--font-size-xs);
	}

	.td-org {
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	.td-object {
		font-size: var(--font-size-xs);
	}

	.record-id {
		word-break: break-all;
	}

	code {
		background: var(--color-neutral-100);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: var(--font-size-xs);
	}

	/* Truncate / Expand */
	.cell-truncated,
	.cell-full {
		display: inline;
		word-break: break-all;
	}

	.toggle-btn {
		display: inline;
		background: none;
		border: none;
		color: var(--color-primary-500);
		cursor: pointer;
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-bold);
		padding: 0 2px;
		line-height: 1;
		vertical-align: baseline;
	}

	.toggle-btn:hover {
		color: var(--color-primary-700);
	}

	/* Eye reveal for sensitive columns */
	.eye-btn {
		background: none;
		border: none;
		cursor: pointer;
		font-size: var(--font-size-sm);
		padding: 0;
		line-height: 1;
		opacity: 0.6;
	}

	.eye-btn:hover {
		opacity: 1;
	}

	.eye-open {
		opacity: 0.8;
	}

	.sensitive-revealed {
		display: inline-flex;
		align-items: baseline;
		gap: 4px;
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
