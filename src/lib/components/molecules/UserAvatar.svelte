<!-- src/lib/components/molecules/UserAvatar.svelte -->
<script lang="ts">
	import Badge from '$lib/components/atoms/Badge.svelte';

	export let name: string = '';
	export let role: string = '';
	export let size: 'sm' | 'md' = 'md';

	$: initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
</script>

<div class="user-avatar user-avatar-{size}">
	<span class="avatar-circle avatar-{size}">{initials}</span>
	<div class="avatar-info">
		<span class="avatar-name">{name}</span>
		{#if role}
			<Badge text={role} variant="role" size="sm" />
		{/if}
	</div>
</div>

<style>
	.user-avatar {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.avatar-circle {
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 50%;
		background: var(--color-primary-100);
		color: var(--color-primary-700);
		font-weight: var(--font-weight-bold);
		flex-shrink: 0;
	}

	.avatar-sm {
		width: 28px;
		height: 28px;
		font-size: var(--font-size-xs);
	}

	.avatar-md {
		width: 36px;
		height: 36px;
		font-size: var(--font-size-sm);
	}

	.avatar-info {
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-width: 0;
	}

	.avatar-name {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--color-neutral-800);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.user-avatar-sm .avatar-name {
		font-size: var(--font-size-xs);
	}
</style>
