<!-- src/lib/components/molecules/TeamMemberCard.svelte -->
<script lang="ts">
	import type { TeamMember } from '$lib/types/data';
	import Icon from '../atoms/Icon.svelte';
	import Anchor from '../atoms/Anchor.svelte';

	export let member: TeamMember;

	// Encontra o link do LinkedIn nos socialLinks do membro
	$: linkedinLink = member.socialLinks?.find((link) => link.platform === 'linkedin');
</script>

<div class="team-member-card">
	<!-- Foto com efeito duotone azul -->
	<div class="card-image-wrapper">
		<div class="card-image-duotone">
			<img src={member.avatar} alt={member.name} class="card-image" loading="lazy" />
		</div>

		<!-- Badge LinkedIn -->
		{#if linkedinLink}
			<Anchor
				href={linkedinLink.url}
				target="_blank"
				rel="noopener noreferrer"
				variant="minimal"
				class="linkedin-badge"
			>
				<Icon name="linkedin" size="sm" color="white" />
			</Anchor>
		{/if}
	</div>

	<!-- Info do membro -->
	<div class="card-info">
		<span class="card-name">{member.name}</span>
		<span class="card-position">{member.position}</span>
	</div>
</div>

<style>
	.team-member-card {
		display: flex;
		flex-direction: column;
		background: var(--color-neutral-0, #fff);
		border-radius: var(--border-radius-xl, 16px);
		overflow: hidden;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
		transition:
			transform var(--transition-normal, 0.3s) var(--transition-timing-default, ease),
			box-shadow var(--transition-normal, 0.3s) var(--transition-timing-default, ease);
	}

	.team-member-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	/* Wrapper da imagem */
	.card-image-wrapper {
		position: relative;
		aspect-ratio: 1 / 1;
		overflow: hidden;
	}

	/* Duotone azul via background + blend */
	.card-image-duotone {
		width: 100%;
		height: 100%;
		position: relative;
		background-color: var(--color-primary-600, #2b4acb);
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
		filter: grayscale(100%) contrast(1.1);
		mix-blend-mode: screen;
	}

	/* Badge LinkedIn */
	.team-member-card :global(.linkedin-badge) {
		position: absolute;
		top: var(--spacing-md, 12px);
		right: var(--spacing-md, 12px);
		width: 32px;
		height: 32px;
		border-radius: var(--border-radius-md, 8px);
		background-color: var(--color-primary-600, #2b4acb);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2;
		transition:
			background-color var(--transition-fast, 0.15s) var(--transition-timing-default, ease),
			transform var(--transition-fast, 0.15s) var(--transition-timing-default, ease);
		text-decoration: none;
	}

	.team-member-card :global(.linkedin-badge:hover) {
		background-color: var(--color-primary-700, #1e3aac);
		transform: scale(1.1);
	}

	/* Info do membro */
	.card-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: var(--spacing-md, 12px) var(--spacing-sm, 8px);
		background: linear-gradient(
			180deg,
			var(--color-neutral-100, #f0f0f0) 0%,
			var(--color-neutral-0, #fff) 100%
		);
	}

	.card-name {
		font-family: var(--font-family-heading, inherit);
		font-size: var(--font-size-sm, 0.875rem);
		font-weight: var(--font-weight-bold, 700);
		color: var(--color-primary-700, #1e3aac);
		line-height: 1.3;
	}

	.card-position {
		font-size: var(--font-size-xs, 0.75rem);
		color: var(--text-color-subtle, #666);
		line-height: 1.3;
		margin-top: 2px;
	}

	/* Responsividade */
	@media (max-width: 480px) {
		.card-info {
			padding: var(--spacing-sm, 8px) var(--spacing-xs, 4px);
		}
	}
</style>
