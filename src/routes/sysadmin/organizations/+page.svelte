<script>
	import Badge from '$lib/components/atoms/Badge.svelte';
	import { addToast } from '$lib/stores/dashboard';
	import { invalidateAll } from '$app/navigation';

	export let data;

	let showCreateModal = false;
	let showEditModal = false;
	let creating = false;

	// Create form
	let newName = '';
	let newSlug = '';
	let newBrandName = '';
	let newLogoUrl = '';
	let newPrimaryColor = '#324acb';

	// Edit form
	let editOrg = null;
	let editName = '';
	let editBrandName = '';
	let editLogoUrl = '';
	let editPrimaryColor = '';

	$: autoSlug = newName
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	$: if (!newSlug || newSlug === autoSlug) {
		newSlug = autoSlug;
	}

	async function createOrg() {
		if (!newName || !newSlug) return;
		creating = true;
		try {
			const res = await fetch('/sysadmin/api/organizations', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: newName,
					slug: newSlug,
					brandName: newBrandName || newName,
					logoUrl: newLogoUrl || null,
					primaryColor: newPrimaryColor
				})
			});
			const result = await res.json();
			if (res.ok) {
				addToast(`Organização "${newName}" criada!`, 'success');
				showCreateModal = false;
				newName = ''; newSlug = ''; newBrandName = ''; newLogoUrl = ''; newPrimaryColor = '#324acb';
				invalidateAll();
			} else {
				addToast(result.error || 'Erro ao criar', 'error');
			}
		} catch {
			addToast('Erro ao criar organização', 'error');
		} finally {
			creating = false;
		}
	}

	function openEdit(org) {
		editOrg = org;
		editName = org.name;
		editBrandName = org.brandName || '';
		editLogoUrl = org.logoUrl || '';
		editPrimaryColor = org.primaryColor || '#324acb';
		showEditModal = true;
	}

	async function saveEdit() {
		if (!editOrg) return;
		try {
			const res = await fetch(`/sysadmin/api/organizations/${editOrg.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: editName,
					brandName: editBrandName,
					logoUrl: editLogoUrl,
					primaryColor: editPrimaryColor
				})
			});
			if (res.ok) {
				addToast('Organização atualizada!', 'success');
				showEditModal = false;
				invalidateAll();
			} else {
				const result = await res.json();
				addToast(result.error || 'Erro ao atualizar', 'error');
			}
		} catch {
			addToast('Erro ao atualizar', 'error');
		}
	}

	async function toggleActive(org) {
		try {
			const res = await fetch(`/sysadmin/api/organizations/${org.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ isActive: !org.isActive })
			});
			if (res.ok) {
				addToast(`Organização ${org.isActive ? 'desativada' : 'ativada'}`, 'success');
				invalidateAll();
			}
		} catch {
			addToast('Erro ao alterar status', 'error');
		}
	}

	async function deleteOrg(org) {
		if (!confirm(`Deseja realmente excluir "${org.name}"? Esta ação é um soft delete.`)) return;
		try {
			const res = await fetch(`/sysadmin/api/organizations/${org.id}`, { method: 'DELETE' });
			if (res.ok) {
				addToast(`"${org.name}" removida`, 'success');
				invalidateAll();
			}
		} catch {
			addToast('Erro ao excluir', 'error');
		}
	}
</script>

<svelte:head>
	<title>Organizações | Sysadmin</title>
</svelte:head>

<div class="page-header">
	<div>
		<h1>Organizações</h1>
		<p>{data.organizations.length} organização(ões) cadastrada(s)</p>
	</div>
	<button class="btn btn-primary" on:click={() => { showCreateModal = true; }}>Nova Organização</button>
</div>

<div class="table-wrapper">
	<table class="data-table">
		<thead>
			<tr>
				<th>Nome</th>
				<th>Slug</th>
				<th>Marca</th>
				<th>Usuários</th>
				<th>Status</th>
				<th>Criada em</th>
				<th>Ações</th>
			</tr>
		</thead>
		<tbody>
			{#each data.organizations as org}
				<tr>
					<td class="td-name">{org.name}</td>
					<td><code>{org.slug}</code></td>
					<td>{org.brandName || '—'}</td>
					<td>{org.userCount}</td>
					<td>
						<Badge
							variant={org.isActive ? 'success' : 'error'}
							text={org.isActive ? 'Ativa' : 'Inativa'}
							size="sm"
						/>
					</td>
					<td>{new Date(org.createdAt).toLocaleDateString('pt-BR')}</td>
					<td>
						<div class="actions">
							<button class="btn btn-sm btn-outline" on:click={() => openEdit(org)}>Editar</button>
							<button class="btn btn-sm btn-outline" on:click={() => toggleActive(org)}>
								{org.isActive ? 'Desativar' : 'Ativar'}
							</button>
							<button class="btn btn-sm btn-danger" on:click={() => deleteOrg(org)}>Excluir</button>
						</div>
					</td>
				</tr>
			{:else}
				<tr><td colspan="7" class="empty">Nenhuma organização cadastrada</td></tr>
			{/each}
		</tbody>
	</table>
</div>

<!-- Create Modal -->
{#if showCreateModal}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => { showCreateModal = false; }} on:keydown={(e) => { if (e.key === 'Escape') showCreateModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" on:click|stopPropagation on:keydown|stopPropagation>
			<div class="modal-header"><h3>Nova Organização</h3><button class="modal-close" on:click={() => { showCreateModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-group">
					<label for="org-name">Nome *</label>
					<input id="org-name" class="form-control" bind:value={newName} placeholder="Ex: GEDUC Campinas" />
				</div>
				<div class="form-group">
					<label for="org-slug">Slug *</label>
					<input id="org-slug" class="form-control" bind:value={newSlug} placeholder="geduc-campinas" />
					<small>Identificador único, usado no banco de dados</small>
				</div>
				<div class="form-group">
					<label for="org-brand">Nome da Marca</label>
					<input id="org-brand" class="form-control" bind:value={newBrandName} placeholder="Nome exibido no dashboard" />
				</div>
				<div class="form-group">
					<label for="org-logo">URL do Logo</label>
					<input id="org-logo" class="form-control" bind:value={newLogoUrl} placeholder="https://..." />
				</div>
				<div class="form-group">
					<label for="org-color">Cor Primária</label>
					<input id="org-color" type="color" bind:value={newPrimaryColor} />
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => { showCreateModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" disabled={!newName || !newSlug || creating} on:click={createOrg}>
					{creating ? 'Criando...' : 'Criar Organização'}
				</button>
			</div>
		</div>
	</div>
{/if}

<!-- Edit Modal -->
{#if showEditModal && editOrg}
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" on:click={() => { showEditModal = false; }} on:keydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}>
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" on:click|stopPropagation on:keydown|stopPropagation>
			<div class="modal-header"><h3>Editar "{editOrg.name}"</h3><button class="modal-close" on:click={() => { showEditModal = false; }}>✕</button></div>
			<div class="modal-body">
				<div class="form-group">
					<label for="edit-name">Nome</label>
					<input id="edit-name" class="form-control" bind:value={editName} />
				</div>
				<div class="form-group">
					<label for="edit-brand">Nome da Marca</label>
					<input id="edit-brand" class="form-control" bind:value={editBrandName} />
				</div>
				<div class="form-group">
					<label for="edit-logo">URL do Logo</label>
					<input id="edit-logo" class="form-control" bind:value={editLogoUrl} />
				</div>
				<div class="form-group">
					<label for="edit-color">Cor Primária</label>
					<input id="edit-color" type="color" bind:value={editPrimaryColor} />
				</div>
			</div>
			<div class="modal-footer">
				<button class="btn btn-secondary" on:click={() => { showEditModal = false; }}>Cancelar</button>
				<button class="btn btn-primary" on:click={saveEdit}>Salvar</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--spacing-xl); }
	.page-header h1 { font-size: var(--font-size-2xl); color: var(--color-primary-900); margin: 0; }
	.page-header p { color: var(--text-color-subtle); font-size: var(--font-size-sm); margin-top: var(--spacing-xxs); }

	.table-wrapper {
		background: var(--color-neutral-0);
		border-radius: var(--border-radius-lg);
		box-shadow: var(--shadow-sm);
		overflow-x: auto;
	}

	.data-table { width: 100%; border-collapse: collapse; }
	.data-table th { padding: var(--spacing-sm) var(--spacing-md); text-align: left; font-size: var(--font-size-xs); color: var(--text-color-subtle); font-weight: var(--font-weight-semibold); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--color-neutral-200); }
	.data-table td { padding: var(--spacing-sm) var(--spacing-md); font-size: var(--font-size-sm); border-bottom: 1px solid var(--color-neutral-100); }
	.td-name { font-weight: var(--font-weight-medium); }
	code { background: var(--color-neutral-100); padding: 2px 6px; border-radius: 4px; font-size: var(--font-size-xs); }
	.empty { text-align: center; color: var(--text-color-subtle); padding: var(--spacing-2xl) !important; }
	.actions { display: flex; gap: var(--spacing-xs); }

	.btn { display: inline-flex; align-items: center; gap: var(--spacing-xs); padding: var(--spacing-xs) var(--spacing-md); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); cursor: pointer; border: none; transition: all var(--transition-fast); }
	.btn-primary { background: var(--color-primary-600); color: #fff; }
	.btn-primary:hover { background: var(--color-primary-700); }
	.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-secondary { background: var(--color-neutral-200); color: var(--text-color-default); }
	.btn-sm { padding: 4px 8px; font-size: var(--font-size-xs); }
	.btn-outline { background: transparent; border: 1px solid var(--color-neutral-300); color: var(--text-color-default); }
	.btn-outline:hover { background: var(--color-neutral-100); }
	.btn-danger { background: var(--color-error); color: #fff; }
	.btn-danger:hover { opacity: 0.9; }

	.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
	.modal { background: var(--color-neutral-0); border-radius: var(--border-radius-xl); width: 90%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
	.modal-header { display: flex; justify-content: space-between; align-items: center; padding: var(--spacing-lg); border-bottom: 1px solid var(--color-neutral-200); }
	.modal-header h3 { margin: 0; font-size: var(--font-size-lg); }
	.modal-close { background: none; border: none; font-size: var(--font-size-lg); cursor: pointer; color: var(--text-color-subtle); }
	.modal-body { padding: var(--spacing-lg); }
	.modal-footer { padding: var(--spacing-md) var(--spacing-lg); border-top: 1px solid var(--color-neutral-200); display: flex; justify-content: flex-end; gap: var(--spacing-sm); }

	.form-group { margin-bottom: var(--spacing-md); }
	.form-group label { display: block; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); margin-bottom: var(--spacing-xxs); }
	.form-control { width: 100%; padding: var(--spacing-sm); border: 1px solid var(--color-neutral-300); border-radius: var(--border-radius-md); font-size: var(--font-size-sm); }
	.form-group small { font-size: var(--font-size-xs); color: var(--text-color-subtle); }
</style>
