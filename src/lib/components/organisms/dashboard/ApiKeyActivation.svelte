<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/atoms/Button.svelte';
	import FormField from '$lib/components/molecules/FormField.svelte';
	import { addToast } from '$lib/stores/dashboard';

	let registered = false;
	let active = false;
	let hashDigestPrefix: string | null = null;
	let password = '';
	let busy = false;
	let loaded = false;

	onMount(loadStatus);

	export function refresh() {
		loadStatus();
	}

	async function loadStatus() {
		try {
			const res = await fetch('/dashboard/api/api-keys/status');
			if (res.ok) {
				const j = await res.json();
				registered = j.registered;
				active = j.active;
				hashDigestPrefix = j.hashDigestPrefix;
			}
		} catch {}
		loaded = true;
	}

	async function activate() {
		if (!password) return;
		busy = true;
		try {
			const res = await fetch('/dashboard/api/api-keys/activate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});
			const j = await res.json();
			if (!res.ok) throw new Error(j.error || 'Erro ao ativar');
			password = '';
			await loadStatus();
			addToast('Chave ativada — disponível para a organização', 'success');
		} catch (err: any) {
			addToast(err.message, 'error');
		} finally {
			busy = false;
		}
	}

	async function deactivate() {
		busy = true;
		try {
			const res = await fetch('/dashboard/api/api-keys/deactivate', { method: 'POST' });
			if (!res.ok) throw new Error('Erro ao desativar');
			await loadStatus();
			addToast('Chave desativada (removida da RAM)', 'success');
		} catch (err: any) {
			addToast(err.message, 'error');
		} finally {
			busy = false;
		}
	}
</script>

<section class="config-section">
	<h2>Ativação da Chave API da Organização</h2>

	{#if !loaded}
		<p class="muted">Carregando...</p>
	{:else if !registered}
		<p class="muted">Nenhuma chave registrada ainda. Use o formulário acima para registrar.</p>
	{:else}
		<div class="status-row">
			<div>
				<span class="status-label">Status:</span>
				{#if active}
					<span class="badge badge-active">Ativa em RAM</span>
				{:else}
					<span class="badge badge-inactive">Inativa</span>
				{/if}
				{#if hashDigestPrefix}
					<span class="muted small">digest: {hashDigestPrefix}…</span>
				{/if}
			</div>
		</div>

		<p class="config-desc">
			Quando ativa, a chave fica decriptada em memória e <strong>todos os membros da organização</strong>
			(staff e admins) podem usá-la para envio de e-mails. Ao desativar, ela é removida da RAM e
			ninguém consegue mais usá-la até a próxima ativação.
		</p>

		{#if !active}
			<form on:submit|preventDefault={activate}>
				<FormField label="Sua senha" id="activate-password">
					<input
						id="activate-password"
						type="password"
						bind:value={password}
						placeholder="••••••••"
						autocomplete="current-password"
					/>
				</FormField>
				<Button type="submit" variant="primary" size="sm" loading={busy}>Ativar chave</Button>
			</form>
		{:else}
			<Button variant="ghost" size="sm" loading={busy} on:click={deactivate}>Desativar chave</Button>
		{/if}
	{/if}
</section>

<style>
	.config-section {
		background: var(--color-neutral-0);
		border: 1px solid var(--color-neutral-200);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-lg);
		margin-bottom: var(--spacing-lg);
	}
	.config-section h2 {
		font-size: var(--font-size-base);
		font-weight: var(--font-weight-medium);
		margin: 0 0 var(--spacing-md);
	}
	.config-desc {
		font-size: var(--font-size-sm);
		color: var(--color-neutral-500);
		margin: var(--spacing-sm) 0 var(--spacing-md);
	}
	.muted { color: var(--color-neutral-500); font-size: var(--font-size-sm); }
	.small { font-size: var(--font-size-xs); margin-left: var(--spacing-sm); }
	.status-row { display: flex; align-items: center; gap: var(--spacing-sm); margin-bottom: var(--spacing-sm); }
	.status-label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-right: var(--spacing-xs); }
	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: var(--border-radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
	}
	.badge-active {
		background: var(--color-success-light);
		color: var(--color-success-dark);
	}
	.badge-inactive { background: var(--color-neutral-100); color: var(--color-neutral-600); }
	.config-section input {
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		border: 1px solid var(--color-neutral-300);
		border-radius: var(--border-radius-md);
		font-family: var(--font-family-sans);
		box-sizing: border-box;
	}
</style>
