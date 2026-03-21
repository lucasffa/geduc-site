<!-- src/lib/components/molecules/PermissionGate.svelte -->
<script lang="ts">
	export let allowed: boolean = false;
</script>

{#if allowed}
	<slot />
{/if}
