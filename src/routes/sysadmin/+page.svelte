<script>
	import SysadminOverview from '$lib/components/organisms/sysadmin/SysadminOverview.svelte';
	export let data;
</script>

<svelte:head>
	<title>Sysadmin | GEDUC</title>
</svelte:head>

<SysadminOverview stats={data.stats} />
