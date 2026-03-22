<!-- src/lib/components/organisms/dashboard/PendingInvites.svelte -->
<script>
	import Badge from '$lib/components/atoms/Badge.svelte';

	export let invitations = [];
	export let roleLabels = {};
</script>

{#if invitations.length > 0}
	<div class="pending-section">
		<h3>Convites Pendentes ({invitations.length})</h3>
		<div class="invites-list">
			{#each invitations as inv}
				<div class="invite-item">
					<span>{inv.email}</span>
					<Badge text={roleLabels[inv.role] || inv.role} variant="role" />
					<span class="invite-expires">
						Expira: {new Date(inv.expiresAt).toLocaleDateString('pt-BR')}
					</span>
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
</style>
