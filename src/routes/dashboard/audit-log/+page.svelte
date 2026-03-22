<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';

	export let data;

	$: entries = data.entries;

	const TRUNCATE_AT = 15;

	let expanded = {};
	let revealed = {};

	function toggleExpand(key) {
		expanded = { ...expanded, [key]: !expanded[key] };
	}

	function toggleReveal(key) {
		revealed = { ...revealed, [key]: !revealed[key] };
	}

	const columns = [
		{ key: 'when', label: 'Quando', width: '160px' },
		{ key: 'whoName', label: 'Quem (autor)' },
		{ key: 'how', label: 'Ação', width: '100px' },
		{ key: 'whatTable', label: 'Tabela', width: '130px' },
		{ key: 'whatRecordId', label: 'Objeto', width: '140px' },
		{ key: 'why', label: 'Motivo' },
		{ key: 'whereIp', label: 'IP', width: '130px' },
		{ key: 'howManyAffected', label: 'Qtd', width: '60px' }
	];

	function howVariant(how) {
		switch (how) {
			case 'CREATE': return 'success';
			case 'UPDATE': return 'info';
			case 'DELETE': return 'error';
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

	function getRowIndex(row) {
		return entries.indexOf(row);
	}
</script>

<svelte:head>
	<title>Auditoria — {data.brandName}</title>
</svelte:head>

<div class="audit-page">
	<PageHeader title="Log de Auditoria" />

	<DataTable
		{columns}
		data={entries}
		searchable={false}
		emptyMessage="Nenhum registro de auditoria."
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{@const i = getRowIndex(row)}
			{#if column === 'when'}
				{value ? new Date(value).toLocaleString('pt-BR') : '—'}
			{:else if column === 'how'}
				<Badge text={value} variant={howVariant(value)} />
			{:else if column === 'whatRecordId'}
				{@const rKey = `${i}-obj`}
				{#if !value}
					—
				{:else if !revealed[rKey]}
					<button class="eye-btn" on:click={() => toggleReveal(rKey)} title="Mostrar">👁️‍🗨️</button>
				{:else}
					<span class="sensitive-revealed">
						<button class="eye-btn eye-open" on:click={() => toggleReveal(rKey)} title="Esconder">👁️</button>
						{#if value.length > TRUNCATE_AT}
							{@const eKey = `${i}-obj-exp`}
							{#if expanded[eKey]}
								<code class="record-id cell-full">{value}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Comprimir">−</button></code>
							{:else}
								<code class="record-id cell-truncated">{value.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Expandir">…</button></code>
							{/if}
						{:else}
							<code class="record-id">{value}</code>
						{/if}
					</span>
				{/if}
			{:else if column === 'whereIp'}
				{@const rKey = `${i}-ip`}
				{#if !value}
					—
				{:else if !revealed[rKey]}
					<button class="eye-btn" on:click={() => toggleReveal(rKey)} title="Mostrar">👁️‍🗨️</button>
				{:else}
					<span class="sensitive-revealed">
						<button class="eye-btn eye-open" on:click={() => toggleReveal(rKey)} title="Esconder">👁️</button>
						{#if value.length > TRUNCATE_AT}
							{@const eKey = `${i}-ip-exp`}
							{#if expanded[eKey]}
								<span class="cell-full">{value}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Comprimir">−</button></span>
							{:else}
								<span class="cell-truncated">{value.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(eKey)} title="Expandir">…</button></span>
							{/if}
						{:else}
							{value}
						{/if}
					</span>
				{/if}
			{:else if column === 'why'}
				{@const key = `${i}-why`}
				{@const val = anonymizeNames(value)}
				{#if val.length > TRUNCATE_AT}
					{#if expanded[key]}
						<span class="cell-full">{val}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Comprimir">−</button></span>
					{:else}
						<span class="cell-truncated">{val.slice(0, TRUNCATE_AT)}<button class="toggle-btn" on:click={() => toggleExpand(key)} title="Expandir">…</button></span>
					{/if}
				{:else}
					{val}
				{/if}
			{:else}
				{@const key = `${i}-${column}`}
				{@const val = String(value ?? '—')}
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
		</svelte:fragment>
	</DataTable>
</div>

<style>
	.audit-page { max-width: 1400px; }

	:global(code.record-id) {
		background: var(--color-neutral-100);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: var(--font-size-xs);
		word-break: break-all;
	}

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
</style>
