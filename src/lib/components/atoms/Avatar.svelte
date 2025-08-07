<!-- src/lib/components/atoms/Avatar.svelte -->
<script lang="ts">
	import type { AvatarProps } from '$lib/types/components';

	export let src: AvatarProps['src'] = undefined;
	export let alt: AvatarProps['alt'];
	export let size: AvatarProps['size'] = 'md';
	export let fallback: AvatarProps['fallback'] = undefined;
	export let shape: AvatarProps['shape'] = 'circle';
	export let border: AvatarProps['border'] = false;
	export let status: AvatarProps['status'] = undefined;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Estado interno
	let imageError = false;

	// Gera fallback automaticamente baseado no alt se não fornecido
	$: computedFallback = fallback || generateFallback(alt);

	function generateFallback(alt: string): string {
		return alt
			.split(' ')
			.slice(0, 2)
			.map((word) => word.charAt(0).toUpperCase())
			.join('');
	}

	// Classes CSS baseadas nas props
	$: classes = [
		'avatar',
		`avatar-size-${size}`,
		`avatar-shape-${shape}`,
		border && 'avatar-border',
		status && `avatar-status-${status}`,
		className
	]
		.filter(Boolean)
		.join(' ');

	function handleImageError() {
		imageError = true;
	}
</script>

<div class={classes}>
	<div class="avatar-content">
		{#if src && !imageError}
			<img {src} {alt} class="avatar-image" on:error={handleImageError} {...$$restProps} />
		{:else}
			<div class="avatar-fallback">
				{computedFallback}
			</div>
		{/if}
	</div>

	{#if status}
		<div class="avatar-status-indicator"></div>
	{/if}
</div>

<style>
	.avatar {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		background-color: var(--color-neutral-200);
		color: var(--text-color-primary);
		overflow: hidden;
	}

	.avatar-content {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.avatar-image {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.avatar-fallback {
		font-weight: var(--font-weight-medium);
		user-select: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, var(--color-primary-400), var(--color-secondary-400));
		color: var(--color-neutral-0);
		width: 100%;
		height: 100%;
	}

	/* Tamanhos */
	.avatar-size-xs {
		width: 24px;
		height: 24px;
	}

	.avatar-size-xs .avatar-fallback {
		font-size: var(--font-size-xs);
	}

	.avatar-size-sm {
		width: 32px;
		height: 32px;
	}

	.avatar-size-sm .avatar-fallback {
		font-size: var(--font-size-sm);
	}

	.avatar-size-md {
		width: 40px;
		height: 40px;
	}

	.avatar-size-md .avatar-fallback {
		font-size: var(--font-size-base);
	}

	.avatar-size-lg {
		width: 56px;
		height: 56px;
	}

	.avatar-size-lg .avatar-fallback {
		font-size: var(--font-size-lg);
	}

	.avatar-size-xl {
		width: 72px;
		height: 72px;
	}

	.avatar-size-xl .avatar-fallback {
		font-size: var(--font-size-xl);
	}

	.avatar-size-2xl {
		width: 96px;
		height: 96px;
	}

	.avatar-size-2xl .avatar-fallback {
		font-size: var(--font-size-2xl);
	}

	/* Formas */
	.avatar-shape-circle {
		border-radius: var(--border-radius-full);
	}

	.avatar-shape-square {
		border-radius: 0;
	}

	.avatar-shape-rounded {
		border-radius: var(--border-radius-lg);
	}

	/* Borda */
	.avatar-border {
		border: 2px solid var(--color-neutral-0);
		box-shadow: 0 0 0 1px var(--border-color-default);
	}

	/* Status indicator */
	.avatar-status-indicator {
		position: absolute;
		border: 2px solid var(--color-neutral-0);
		border-radius: var(--border-radius-full);
	}

	/* Posicionamento do status baseado no tamanho */
	.avatar-size-xs .avatar-status-indicator {
		width: 8px;
		height: 8px;
		bottom: -1px;
		right: -1px;
	}

	.avatar-size-sm .avatar-status-indicator {
		width: 10px;
		height: 10px;
		bottom: 0;
		right: 0;
	}

	.avatar-size-md .avatar-status-indicator {
		width: 12px;
		height: 12px;
		bottom: 2px;
		right: 2px;
	}

	.avatar-size-lg .avatar-status-indicator {
		width: 16px;
		height: 16px;
		bottom: 2px;
		right: 2px;
	}

	.avatar-size-xl .avatar-status-indicator {
		width: 20px;
		height: 20px;
		bottom: 4px;
		right: 4px;
	}

	.avatar-size-2xl .avatar-status-indicator {
		width: 24px;
		height: 24px;
		bottom: 6px;
		right: 6px;
	}

	/* Cores do status */
	.avatar-status-online .avatar-status-indicator {
		background-color: var(--color-success);
	}

	.avatar-status-offline .avatar-status-indicator {
		background-color: var(--color-neutral-400);
	}

	.avatar-status-away .avatar-status-indicator {
		background-color: var(--color-warning);
	}

	.avatar-status-busy .avatar-status-indicator {
		background-color: var(--color-error);
	}

	/* Hover effects */
	.avatar:hover {
		transform: scale(1.05);
		transition: transform var(--transition-fast) var(--transition-timing-default);
	}

	/* Dark theme */
	[data-theme='dark'] .avatar {
		background-color: var(--color-neutral-700);
	}

	[data-theme='dark'] .avatar-border {
		border-color: var(--color-neutral-800);
		box-shadow: 0 0 0 1px var(--color-neutral-600);
	}

	[data-theme='dark'] .avatar-status-indicator {
		border-color: var(--color-neutral-800);
	}

	/* Grupos de avatares */
	.avatar-group .avatar {
		margin-left: -8px;
		border: 2px solid var(--color-neutral-0);
		position: relative;
		z-index: 1;
	}

	.avatar-group .avatar:first-child {
		margin-left: 0;
	}

	.avatar-group .avatar:hover {
		z-index: 2;
		transform: scale(1.1);
	}

	/* Animação para fallback com gradiente */
	.avatar-fallback {
		background-size: 200% 200%;
		animation: gradientRotate 4s ease-in-out infinite;
	}

	@keyframes gradientRotate {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}
</style>
