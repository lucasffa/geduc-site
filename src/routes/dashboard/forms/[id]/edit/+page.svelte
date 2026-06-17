<!-- src/routes/dashboard/forms/[id]/edit/+page.svelte -->
<script lang="ts">
	import { goto } from '$app/navigation';
	import FormBuilder from '$lib/components/organisms/dashboard/FormBuilder.svelte';
	import type { ActionData, PageData } from './$types';

	export let data: PageData;
	export let form: ActionData;

	$: actionForm = form as any;

	function formatDate(value?: string) {
		if (!value) return '-';
		return new Date(value).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	$: invitations = data.invitations ?? [];
	$: createdInvitations = actionForm?.createdInvitations ?? [];
	$: skippedInvitations = actionForm?.skippedInvitations ?? [];
</script>

<div class="edit-page">
	<FormBuilder
		mode="edit"
		action="?/update"
		pageTitle="Editar formulário"
		submitLabel="Salvar formulário"
		serverError={actionForm?.error}
		initialData={data.form}
		on:cancel={() => goto('/dashboard/forms')}
	/>

	<section class="invitation-panel" aria-labelledby="invitation-title">
		<div class="panel-header">
			<div>
				<h2 id="invitation-title">Convites por link</h2>
				<p>Gere um link único por email para identificar respostas sem exigir login.</p>
			</div>
			<span class="count-pill">{invitations.length} convite{invitations.length === 1 ? '' : 's'}</span>
		</div>

		<form method="POST" action="?/createInvitations" class="invite-form">
			<label for="emails">Emails</label>
			<textarea
				id="emails"
				name="emails"
				rows="4"
				placeholder="maria@email.com\njoao@email.com"
			></textarea>
			<div class="invite-actions">
				{#if actionForm?.invitationError}
					<p class="feedback error">{actionForm.invitationError}</p>
				{:else if actionForm?.invitationSuccess}
					<p class="feedback success">{actionForm.invitationSuccess}</p>
				{/if}
				<button type="submit">Gerar links</button>
			</div>
		</form>

		{#if createdInvitations.length > 0}
			<div class="generated-box">
				<h3>Links gerados agora</h3>
				{#each createdInvitations as invitation}
					<div class="link-row">
						<span>{invitation.email}</span>
						<a href={invitation.link} target="_blank" rel="noreferrer">{invitation.link}</a>
					</div>
				{/each}
			</div>
		{/if}

		{#if skippedInvitations.length > 0}
			<div class="existing-box">
				<h3>Emails com convite existente</h3>
				{#each skippedInvitations as invitation}
					<div class="link-row">
						<span>{invitation.email}</span>
						<a href={invitation.link} target="_blank" rel="noreferrer">{invitation.link}</a>
					</div>
				{/each}
			</div>
		{/if}

		{#if invitations.length > 0}
			<div class="invitation-list">
				{#each invitations as invitation}
					<div class="invitation-item">
						<div class="invitation-main">
							<strong>{invitation.email}</strong>
							<a href={invitation.link} target="_blank" rel="noreferrer">{invitation.link}</a>
						</div>
						<div class="invitation-meta">
							<span class:used={invitation.used}>{invitation.used ? 'Usado' : 'Pendente'}</span>
							<small>{invitation.used ? formatDate(invitation.usedAt) : formatDate(invitation.createdAt)}</small>
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<p class="empty">Nenhum convite gerado para este formulário.</p>
		{/if}
	</section>
</div>

<style>
	.edit-page {
		background: var(--background-color-page, #f8fafc);
		min-height: 100vh;
	}

	.invitation-panel {
		max-width: 1120px;
		margin: 1.5rem auto 3rem;
		padding: 1.5rem;
		background: var(--background-color-card, #ffffff);
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 1rem;
		margin-bottom: 1.25rem;
	}

	h2, h3, p {
		margin: 0;
	}

	h2 {
		font-size: 1.125rem;
		color: var(--text-color-primary, #111827);
	}

	.panel-header p, .empty {
		margin-top: 0.35rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.count-pill {
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 999px;
		padding: 0.35rem 0.65rem;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--text-color-secondary, #6b7280);
		white-space: nowrap;
	}

	.invite-form {
		display: grid;
		gap: 0.5rem;
	}

	label {
		font-weight: 700;
		font-size: 0.9rem;
	}

	textarea {
		width: 100%;
		resize: vertical;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
		padding: 0.75rem;
		font: inherit;
	}

	.invite-actions {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	button {
		border: 0;
		border-radius: 8px;
		background: var(--color-primary-500, #324acb);
		color: #ffffff;
		font-weight: 700;
		padding: 0.7rem 1rem;
		cursor: pointer;
	}

	.feedback {
		font-size: 0.9rem;
	}

	.feedback.error {
		color: #b91c1c;
	}

	.feedback.success {
		color: #15803d;
	}

	.generated-box, .existing-box {
		margin-top: 1rem;
		padding: 1rem;
		border: 1px solid #bbf7d0;
		border-radius: 8px;
		background: #f0fdf4;
	}

	.existing-box {
		border-color: #fde68a;
		background: #fffbeb;
	}

	.generated-box h3, .existing-box h3 {
		font-size: 0.95rem;
		margin-bottom: 0.75rem;
	}

	.invitation-list {
		display: grid;
		gap: 0.75rem;
		margin-top: 1.25rem;
	}

	.invitation-item, .link-row {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		gap: 1rem;
		align-items: center;
	}

	.invitation-item {
		padding: 0.85rem;
		border: 1px solid var(--border-color-default, #e5e7eb);
		border-radius: 8px;
	}

	.link-row {
		padding: 0.5rem 0;
	}

	.invitation-main {
		display: grid;
		gap: 0.25rem;
		min-width: 0;
	}

	a {
		color: var(--color-primary-600, #263ba3);
		overflow-wrap: anywhere;
		font-size: 0.9rem;
	}

	.invitation-meta {
		display: grid;
		justify-items: end;
		gap: 0.25rem;
		color: var(--text-color-secondary, #6b7280);
	}

	.invitation-meta span {
		border-radius: 999px;
		background: #fef3c7;
		color: #92400e;
		font-size: 0.75rem;
		font-weight: 800;
		padding: 0.25rem 0.55rem;
	}

	.invitation-meta span.used {
		background: #dcfce7;
		color: #166534;
	}

	@media (max-width: 720px) {
		.invitation-panel {
			margin: 1rem;
			padding: 1rem;
		}

		.panel-header, .invite-actions, .invitation-item, .link-row {
			grid-template-columns: 1fr;
			display: grid;
		}

		.invitation-meta {
			justify-items: start;
		}
	}
</style>
