<script>
	import DataTable from '$lib/components/organisms/DataTable.svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';

	export let data;

	$: entries = data.entries;

	const columns = [
		{ key: 'when', label: 'Quando', width: '160px' },
		{ key: 'whoName', label: 'Quem' },
		{ key: 'how', label: 'Ação', width: '100px' },
		{ key: 'whatTable', label: 'Tabela', width: '130px' },
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
			{:else}
				{value ?? '—'}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>

<style>
	.audit-page { max-width: 1400px; }
</style>
