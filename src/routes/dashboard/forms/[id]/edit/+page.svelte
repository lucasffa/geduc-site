<!-- src/routes/dashboard/forms/[id]/edit/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FormBuilder from '$lib/components/organisms/dashboard/FormBuilder.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;
</script>

<FormBuilder
	mode="edit"
	action="?/update"
	pageTitle="Editar formulário"
	submitLabel="Salvar formulário"
	serverError={form?.error}
	initialData={data.form}
	on:cancel={() => goto('/dashboard/forms')}
/>
