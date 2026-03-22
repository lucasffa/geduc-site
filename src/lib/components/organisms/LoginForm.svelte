<!-- src/lib/components/organisms/LoginForm.svelte -->
<script lang="ts">
	import { enhance } from '$app/forms';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import Input from '$lib/components/atoms/Input.svelte';
	import Button from '$lib/components/atoms/Button.svelte';

	export let error = '';
	export let email = '';
</script>

<form method="POST" use:enhance class="login-form">
	{#if error}
		<div class="login-error">{error}</div>
	{/if}

	<FormField label="E-mail" id="email" required>
		<Input type="email" name="email" id="email" value={email} placeholder="seu@email.com" autocomplete="email" />
	</FormField>

	<FormField label="Senha" id="password" required>
		<Input type="password" name="password" id="password" placeholder="Sua senha" autocomplete="current-password" />
	</FormField>

	<Button type="submit" variant="primary" fullWidth>Entrar</Button>
</form>

<style>
	.login-form {
		width: 100%;
	}

	.login-error {
		background: var(--color-red-100);
		color: var(--color-error);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-md);
		text-align: center;
	}
</style>
