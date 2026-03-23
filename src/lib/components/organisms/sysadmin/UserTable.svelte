<!-- src/lib/components/organisms/sysadmin/UserTable.svelte -->
<script>
	import { createEventDispatcher } from 'svelte';
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { ROLE_LABELS } from '$lib/constants/roles';

	export let users = [];

	const dispatch = createEventDispatcher();
</script>

<div class="table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				<th>Nome</th>
				<th>E-mail</th>
				<th>Cargo</th>
				<th>Organização</th>
				<th>Status</th>
				<th>Último Login</th>
				<th>Ações</th>
			</tr>
		</thead>
		<tbody>
			{#each users as user}
				<tr>
					<td class="td-name">{user.name}</td>
					<td>{user.email}</td>
					<td><Badge variant="role" text={ROLE_LABELS[user.role] || user.role} size="sm" /></td>
					<td>{user.orgName || '—'}</td>
					<td>
						<Badge
							variant={user.isActive ? 'success' : 'error'}
							text={user.isActive ? 'Ativo' : 'Inativo'}
							size="sm"
						/>
					</td>
					<td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString('pt-BR') : 'Nunca'}</td>
					<td>
						<div class="actions">
							<button class="btn btn-sm btn-outline" on:click={() => dispatch('edit', user)}>Editar</button>
							<button class="btn btn-sm btn-outline" on:click={() => dispatch('toggle', user)}>
								{user.isActive ? 'Desativar' : 'Ativar'}
							</button>
							<button class="btn btn-sm btn-danger" on:click={() => dispatch('delete', user)}>Excluir</button>
						</div>
					</td>
				</tr>
			{:else}
				<tr><td colspan="7" class="empty">Nenhum usuário encontrado</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.table-wrapper {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		overflow-x: auto;
	}

	.data-table {
		width: 100%;
		border-collapse: collapse;
	}

	.data-table th {
		padding: var(--spacing-sm) var(--spacing-md);
		text-align: left;
		font-size: var(--font-size-xs);
		color: var(--text-color-subtle);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		border-bottom: 1px solid var(--color-neutral-200);
	}

	.data-table td {
		padding: var(--spacing-sm) var(--spacing-md);
		font-size: var(--font-size-sm);
		border-bottom: 1px solid var(--color-neutral-100);
	}

	.td-name {
		font-weight: var(--font-weight-medium);
	}

	.empty {
		text-align: center;
		color: var(--text-color-subtle);
		padding: var(--spacing-2xl) !important;
	}

	.actions {
		display: flex;
		gap: var(--spacing-xs);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		padding: var(--spacing-xs) var(--spacing-md);
		border-radius: var(--border-radius-md);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		cursor: pointer;
		border: none;
		transition: all var(--transition-fast);
	}

	.btn-sm {
		padding: 4px 8px;
		font-size: var(--font-size-xs);
	}

	.btn-outline {
		background: transparent;
		border: 1px solid var(--color-neutral-300);
		color: var(--text-color-default);
	}

	.btn-outline:hover {
		background: var(--color-neutral-100);
	}

	.btn-danger {
		background: var(--color-error);
		color: #fff;
	}

	.btn-danger:hover {
		opacity: 0.9;
	}
</style>
