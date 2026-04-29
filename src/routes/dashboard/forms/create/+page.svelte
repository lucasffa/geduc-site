<script lang="ts">
	import { goto } from '$app/navigation';
	import FormBuilder from '$lib/components/forms/FormBuilder.svelte';
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
