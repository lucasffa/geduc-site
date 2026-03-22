<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';

	export let data;

	$: entries = data.entries;

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
			{#if column === 'when'}
				{value ? new Date(value).toLocaleString('pt-BR') : '—'}
			{:else if column === 'how'}
				<Badge text={value} variant={howVariant(value)} />
			{:else if column === 'whatRecordId'}
				{#if value}
					<code class="record-id">{value}</code>
				{:else}
					—
				{/if}
			{:else if column === 'why'}
				{anonymizeNames(value)}
			{:else}
				{value ?? '—'}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>

<style>
	.audit-page { max-width: 1400px; }

	code.record-id {
		background: var(--color-neutral-100);
		padding: 2px 6px;
		border-radius: 4px;
		font-size: var(--font-size-xs);
		word-break: break-all;
	}
</style>
