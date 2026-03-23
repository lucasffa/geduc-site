<script>
	import SysadminTemplate from '$lib/components/templates/SysadminTemplate.svelte';
	export let data;
</script>

<SysadminTemplate userName={data.user?.name || ''}>
	<slot />
</SysadminTemplate>
