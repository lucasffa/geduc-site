<script>
	import DashboardTemplate from '$lib/components/templates/DashboardTemplate.svelte';
	import './dashboard.css';

	export let data;
</script>

<DashboardTemplate
	brandName={data.brandName}
	logoUrl={data.logoUrl}
	userName={data.user?.name || ''}
	userRole={data.roleName}
	permissions={data.permissions}
	isSysadmin={data.user?.role === 'sysadmin'}
	primaryColor={data.organization?.primaryColor || '#324acb'}
>
	<slot />
</DashboardTemplate>
