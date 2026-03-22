<!-- src/lib/components/molecules/TeamMemberCard.svelte -->
<script lang="ts">
	import type { TeamMember } from '$lib/types/data';

	export let member: TeamMember;
</script>

<div class="team-member-card">
	<img src={member.avatar} alt={member.name} class="card-image" loading="lazy" />
</div>

<style>
	.team-member-card {
		border-radius: var(--border-radius-xl, 16px);
		overflow: hidden;
		transition:
			transform var(--transition-normal, 0.3s) var(--transition-timing-default, ease),
			box-shadow var(--transition-normal, 0.3s) var(--transition-timing-default, ease);
	}

	.team-member-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
	}

	.card-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
</style>
