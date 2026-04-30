<!-- src/routes/dashboard/forms/create/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FormBuilder from '$lib/components/organisms/dashboard/FormBuilder.svelte';
	import type { ActionData } from './$types';

	export let form: ActionData;
</script>

<FormBuilder
	mode="create"
	action="?/create"
	pageTitle="Criar formulário"
	submitLabel="Salvar formulário"
	serverError={form?.error}
	on:cancel={() => goto('/dashboard/forms')}
/>
