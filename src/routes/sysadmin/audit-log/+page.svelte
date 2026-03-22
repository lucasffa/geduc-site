<script>
	import PageHeader from '$lib/components/molecules/PageHeader.svelte';
	import AuditLogTable from '$lib/components/organisms/sysadmin/AuditLogTable.svelte';
	export let data;
</script>

<svelte:head>
	<title>Auditoria Global | Sysadmin</title>
</svelte:head>

<PageHeader
	title="Log de Auditoria Global"
	subtitle="{data.total} entrada(s) no total — Página {data.page} de {data.totalPages || 1}"
/>

<AuditLogTable
	entries={data.entries}
	page={data.page}
	totalPages={data.totalPages}
	total={data.total}
/>
