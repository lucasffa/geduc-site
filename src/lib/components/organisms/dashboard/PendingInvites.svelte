<!-- src/lib/components/organisms/dashboard/PendingInvites.svelte -->
<script>
	import { onMount } from 'svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { addToast } from '$lib/stores/dashboard';

	export let invitations = [];
	export let roleLabels = {};

	async function revokeInvitation(id) {
		if (!confirm('Revogar este convite?')) return;
		try {
			const res = await fetch(`/dashboard/api/users/invite/${id}`, { method: 'DELETE' });
			const payload = await res.json();
			if (!res.ok) {
				addToast(payload.error || 'Erro ao revogar convite', 'error');
				return;
			}
			invitations = invitations.filter((inv) => inv.id !== id);
			addToast('Convite revogado', 'success');
		} catch (error) {
			addToast(error?.message || 'Erro de rede ao revogar convite', 'error');
		}
	}

	let origin = '';
	onMount(() => {
		origin = window.location.origin;
	});

	async function copyInviteLink(token) {
		const link = `${origin}/auth/invite/${token}`;
		try {
			await navigator.clipboard.writeText(link);
			addToast('Link de convite copiado para a área de transferência', 'success');
		} catch {
			addToast(`Não foi possível copiar automaticamente. Use: ${link}`, 'error');
		}
	}
</script>

{#if invitations.length > 0}
	<div class="pending-section">
		<h3>Convites Pendentes ({invitations.length})</h3>
		<div class="invites-list">
			{#each invitations as inv}
				<div class="invite-item">
					<span>{inv.email || 'Sem e-mail'}</span>
					<Badge text={roleLabels[inv.role] || inv.role} variant="role" />
					<span class="invite-expires">
						Expira: {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
					</span>
					<button class="link-btn" on:click={() => copyInviteLink(inv.token)} title="Copiar link de convite">
						🔗
					</button>
					<button class="link-btn" on:click={() => revokeInvitation(inv.id)} title="Revogar convite">
						✖
					</button>
				</div>
			{/each}
		</div>
	</div>
{/if}

<style>
	.pending-section {
		background: var(--color-yellow-100);
		border-radius: var(--border-radius-lg);
		padding: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.pending-section h3 {
		margin: 0 0 var(--spacing-sm);
		font-size: var(--font-size-sm);
		color: var(--color-yellow-900);
	}

	.invites-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.invite-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		font-size: var(--font-size-sm);
	}

	.invite-expires {
		color: var(--color-neutral-500);
		font-size: var(--font-size-xs);
	}

	.link-btn {
		background: none;
		border: none;
		cursor: pointer;
		padding: 0 6px;
		font-size: 0.95rem;
	}

	.link-btn:hover {
		color: var(--color-primary-700);
	}
</style>
