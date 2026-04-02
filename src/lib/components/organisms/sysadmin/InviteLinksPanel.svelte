<!-- src/lib/components/organisms/sysadmin/InviteLinksPanel.svelte -->
<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { createEventDispatcher } from 'svelte';

	type InviteType = 'email' | 'link';

	interface SysadminInvite {
		id: string;
		token: string;
		email?: string | null;
		role: 'admin' | 'volunteer' | 'mentee' | 'dumb';
		expiresAt: string;
		type: InviteType;
		isPublic?: boolean;
	}

	export let invites: SysadminInvite[] = [];
	export let roleLabels: Record<string, string> = {};

	const dispatch = createEventDispatcher();

	function copyLink(token: string) {
		const link = `${window.location.origin}/auth/invite/${token}`;
		navigator.clipboard.writeText(link).then(() => {
			alert(`Link copiado: ${link}`);
		}, () => {
			alert(`Não foi possível copiar automaticamente. Use: ${link}`);
		});
	}

	async function revokeInvite(inviteId: string) {
		if (!confirm('Revogar este convite?')) return;
		const res = await fetch(`/sysadmin/api/users/invite/${inviteId}`, { method: 'DELETE' });
		if (res.ok) {
			alert('Convite revogado');
			dispatch('refresh');
		} else {
			const payload = await res.json();
			alert(payload.error || 'Erro ao revogar convite');
		}
	}
</script>

{#if invites.length > 0}
	<div class="invite-links-panel">
		<h3>Convites pendentes ({invites.length})</h3>
		<div class="invite-table">
			{#each invites as inv}
				<div class="invite-row">
					<div class="invite-main">
						<span class="invite-type">{inv.type === 'link' ? 'Link' : 'E-mail'}</span>
						<span>{inv.email || 'Sem e-mail'}</span>
						<Badge text={roleLabels[inv.role] || inv.role} variant="role" />
						{#if inv.type === 'link' && inv.isPublic}
							<Badge text="Público" variant="success" />
						{/if}
					</div>
					<div class="invite-meta">
						<small>Expira: {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}</small>
						<button type="button" class="link-btn" on:click={() => copyLink(inv.token)}>Copiar</button>
						<button type="button" class="danger-btn" on:click={() => revokeInvite(inv.id)}>Revogar</button>
					</div>
				</div>
			{/each}
		</div>
	</div>
{:else}
	<p>Nenhum convite pendente.</p>
{/if}

<style>
	.invite-links-panel {
		background: var(--color-neutral-50);
		border: 1px solid var(--color-neutral-200);
		padding: var(--spacing-md);
		border-radius: var(--border-radius-lg);
		margin-bottom: var(--spacing-lg);
	}

	.invite-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-sm) 0;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.invite-row:last-child { border-bottom: none; }

	.invite-main {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.invite-meta {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.link-btn,
	.danger-btn {
		padding: 0.25rem 0.5rem;
		border: none;
		border-radius: var(--border-radius-sm);
		font-size: var(--font-size-xs);
		cursor: pointer;
	}

	.link-btn { background: var(--color-primary-100); color: var(--color-primary-700); }
	.danger-btn { background: var(--color-red-100); color: var(--color-red-700); }
</style>
