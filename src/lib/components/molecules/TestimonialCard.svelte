<!-- src/lib/components/molecules/TestimonialCard.svelte -->
<script lang="ts">
	import type { TestimonialCardProps } from '$lib/types/components';
	import Text from '$lib/components/atoms/Text.svelte';
	import Avatar from '$lib/components/atoms/Avatar.svelte';
	import Icon from '$lib/components/atoms/Icon.svelte';

	export let quote: TestimonialCardProps['quote'];
	export let author: TestimonialCardProps['author'];
	export let rating: TestimonialCardProps['rating'] = undefined;
	export let featured: TestimonialCardProps['featured'] = false;
	export let variant: TestimonialCardProps['variant'] = 'card';
	export let date: TestimonialCardProps['date'] = undefined;
	export let borderRadius: TestimonialCardProps['borderRadius'] = '2xl';
	export let size: TestimonialCardProps['size'] = undefined;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'testimonial-card',
		`testimonial-card-variant-${variant}`,
		`testimonial-card-border-radius-${borderRadius}`,
		featured && 'testimonial-card-featured',
		size && `testimonial-card-size-${size}`,
		className
	]
		.filter(Boolean)
		.join(' ');

	// Gera array de estrelas para rating
	$: stars = rating ? Array.from({ length: 5 }, (_, i) => i < rating) : [];

	// Formata a data se fornecida
	$: formattedDate = date ? formatDate(date) : undefined;

	function formatDate(dateString: string): string {
		const date = new Date(dateString);
		return date.toLocaleDateString('pt-BR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>

<div class={classes}>
	<!-- Just a simple quote character -->
	<div class="testimonial-card-quote-character">
		<Text
			as="cite"
			size="3xl"
			color="neutral"
			fontStyle="italic"
			class="testimonial-card-quote-character-text"
		>
			"
		</Text>
	</div>

	<!-- Featured Badge -->
	{#if featured}
		<div class="testimonial-card-featured-badge">
			<Icon
				name="star"
				size="xs"
				color="white"
				decorative={true}
				class="testimonial-card-featured-icon"
			/>
		</div>
	{/if}

	<!-- Rating (se houver, mostrar no topo) -->
	{#if rating}
		<div class="testimonial-card-rating">
			{#each stars as filled, index}
				<Icon
					name="star"
					size="xs"
					color={filled ? 'warning' : 'neutral'}
					class="testimonial-card-star"
				/>
			{/each}
		</div>
	{/if}

	<!-- Quote -->
	<div class="testimonial-card-content">
		<Text as="blockquote" size="xs" weight="normal" class="testimonial-card-quote" color="neutral">
			{quote}
		</Text>
	</div>

	<!-- Author -->
	<div class="testimonial-card-author">
		<Avatar
			src={author.avatar}
			alt={`Foto de ${author.name}`}
			size="md"
			shape="circle"
			class="testimonial-card-avatar"
		/>

		<div class="testimonial-card-author-info">
			<Text as="cite" size="xs" weight="semibold" class="testimonial-card-author-name">
				{author.name}
			</Text>

			{#if author.title || author.company}
				<Text as="span" size="xs" color="subtle" class="testimonial-card-author-meta">
					{author.title}
				</Text>
				{#if author.company}
					<Text as="span" size="xs" color="subtle" class="testimonial-card-author-meta">
						{author.company}
					</Text>
				{/if}
			{/if}

			{#if formattedDate}
				<Text as="time" size="xs" color="subtle" class="testimonial-card-date">
					{formattedDate}
				</Text>
			{/if}
		</div>

		<!-- Closing quote character -->
		<div class="testimonial-card-quote-character-closing">
			<Text
				as="cite"
				size="3xl"
				color="neutral"
				fontStyle="italic"
				class="testimonial-card-quote-character-text"
			>
				"
			</Text>
		</div>
	</div>
</div>

<style>
	.testimonial-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-normal) var(--transition-timing-default);
	}

	/* Sistema de tamanhos - Extra Small */
	.testimonial-card-size-xs {
		width: var(--card-width-landscape-xs);
		height: var(--card-height-landscape-xs);
		min-width: var(--card-width-landscape-xs);
		max-width: var(--card-width-landscape-xs);
		min-height: var(--card-height-landscape-xs);
		max-height: var(--card-height-landscape-xs);
		overflow: hidden;
		padding: var(--spacing-xs);
		gap: var(--spacing-xxs);
	}

	.testimonial-card-size-xs .testimonial-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
	}

	/* Sistema de tamanhos - Small */
	.testimonial-card-size-sm {
		width: var(--card-width-landscape-sm);
		height: var(--card-height-landscape-sm);
		min-width: var(--card-width-landscape-sm);
		max-width: var(--card-width-landscape-sm);
		min-height: var(--card-height-landscape-sm);
		max-height: var(--card-height-landscape-sm);
		overflow: hidden;
		padding: var(--spacing-sm);
		gap: var(--spacing-xs);
	}

	.testimonial-card-size-sm .testimonial-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
	}

	/* Sistema de tamanhos - Medium (padrão 400x240) */
	.testimonial-card-size-md {
		width: var(--card-width-landscape-md);
		height: var(--card-height-landscape-md);
		min-width: var(--card-width-landscape-md);
		max-width: var(--card-width-landscape-md);
		min-height: var(--card-height-landscape-md);
		max-height: var(--card-height-landscape-md);
		overflow: hidden;
		padding: var(--spacing-md);
		gap: var(--spacing-xs);
	}

	.testimonial-card-size-md .testimonial-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 4;
		line-clamp: 4;
		-webkit-box-orient: vertical;
		padding: var(--spacing-lg);
	}

	/* Sistema de tamanhos - Large */
	.testimonial-card-size-lg {
		width: var(--card-width-landscape-lg);
		height: var(--card-height-landscape-lg);
		min-width: var(--card-width-landscape-lg);
		max-width: var(--card-width-landscape-lg);
		min-height: var(--card-height-landscape-lg);
		max-height: var(--card-height-landscape-lg);
		overflow: hidden;
		padding: var(--spacing-lg);
		gap: var(--spacing-sm);
	}

	.testimonial-card-size-lg .testimonial-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 5;
		line-clamp: 5;
		-webkit-box-orient: vertical;
	}

	/* Sistema de tamanhos - Extra Large */
	.testimonial-card-size-xl {
		width: var(--card-width-landscape-xl);
		height: var(--card-height-landscape-xl);
		min-width: var(--card-width-landscape-xl);
		max-width: var(--card-width-landscape-xl);
		min-height: var(--card-height-landscape-xl);
		max-height: var(--card-height-landscape-xl);
		overflow: hidden;
		padding: var(--spacing-xl);
		gap: var(--spacing-md);
	}

	.testimonial-card-size-xl .testimonial-card-content {
		overflow: hidden;
		display: -webkit-box;
		-webkit-line-clamp: 8;
		line-clamp: 8;
		-webkit-box-orient: vertical;
	}

	/* Raio da borda */
	.testimonial-card-border-radius-sm {
		border-radius: var(--border-radius-sm);
	}

	.testimonial-card-border-radius-md {
		border-radius: var(--border-radius-md);
	}

	.testimonial-card-border-radius-lg {
		border-radius: var(--border-radius-lg);
	}

	.testimonial-card-border-radius-xl {
		border-radius: var(--border-radius-xl);
	}

	.testimonial-card-border-radius-2xl {
		border-radius: var(--border-radius-2xl);
	}

	.testimonial-card-border-radius-3xl {
		border-radius: var(--border-radius-3xl);
	}

	.testimonial-card-border-radius-4xl {
		border-radius: var(--border-radius-4xl);
	}

	.testimonial-card-border-radius-none {
		border-radius: var(--border-radius-none);
	}

	/* Variantes */
	.testimonial-card-variant-card {
		border: 1px solid var(--border-color-default);
		box-shadow: var(--shadow-sm);
	}

	.testimonial-card-variant-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.testimonial-card-variant-minimal {
		background-color: transparent;
		border: none;
		box-shadow: none;
		padding: var(--spacing-md);
	}

	.testimonial-card-variant-bordered {
		background-color: transparent;
		border: 2px solid var(--border-color-default);
		box-shadow: none;
	}

	.testimonial-card-variant-bordered:hover {
		border-color: var(--color-primary-300);
	}

	/* Quote Character Decorativo */
	.testimonial-card-quote-character {
		position: absolute;
		top: var(--spacing-md);
		left: var(--spacing-md);
		z-index: 1;
		opacity: 1;
		pointer-events: none;
		line-height: 1;
	}

	.testimonial-card-quote-character-text {
		line-height: 0.8;
		user-select: none;
	}

	.testimonial-card-quote-character-closing {
		position: absolute;
		bottom: var(--spacing-3xl);
		right: var(--spacing-md);
		z-index: 1;
		opacity: 1;
		pointer-events: none;
		line-height: 1;
	}

	/* Featured */
	.testimonial-card-featured {
		background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%);
		border-color: var(--color-primary-200);
		position: relative;
	}

	.testimonial-card-featured-badge {
		position: absolute;
		top: var(--spacing-xs);
		right: var(--spacing-xs);
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 24px;
		height: 24px;
		background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
		border-radius: var(--border-radius-full);
		box-shadow: var(--shadow-sm);
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

	.testimonial-card-featured-badge:hover {
		transform: scale(1.15) rotate(15deg);
		box-shadow: var(--shadow-md);
	}

	.testimonial-card-featured-icon {
		filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
	}

	/* Rating */
	.testimonial-card-rating {
		display: flex;
		gap: var(--spacing-xs);
		margin-bottom: 0;
	}

	.testimonial-card-star {
		color: var(--color-warning);
	}

	/* Content */
	.testimonial-card-content {
		flex: 1;
	}

	.testimonial-card-quote {
		margin: 0;
		line-height: var(--line-height-tight);
		color: var(--text-color-primary);
		position: relative;
	}

	/* Author */
	.testimonial-card-author {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		margin-top: auto;
		padding-top: var(--spacing-xs);
		border-top: 1px solid var(--border-color-default);
	}

	.testimonial-card-avatar {
		flex-shrink: 0;
	}

	.testimonial-card-author-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0;
		min-width: 0;
	}

	.testimonial-card-author-name {
		margin: 0;
		color: var(--text-color-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.testimonial-card-author-meta {
		margin: 0;
		display: block;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.testimonial-card-date {
		flex-shrink: 0;
		margin-left: var(--spacing-xs);
		align-self: flex-start;
		font-size: var(--font-size-xs);
		white-space: nowrap;
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.testimonial-card-author {
			flex-wrap: wrap;
			gap: var(--spacing-xxs);
		}

		.testimonial-card-date {
			margin-left: 0;
			width: 100%;
			text-align: right;
		}

		/* Remover dimensões fixas em mobile para melhor responsividade */
		.testimonial-card-size-xs,
		.testimonial-card-size-sm,
		.testimonial-card-size-md,
		.testimonial-card-size-lg,
		.testimonial-card-size-xl {
			width: 100%;
			min-width: unset;
			max-width: 100%;
			height: auto;
			min-height: var(--card-min-height);
			max-height: unset;
		}
	}

	/* Dark theme */
	:global([data-theme='dark']) .testimonial-card-featured {
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-accent-900) 100%);
		border-color: var(--color-primary-700);
	}

	:global([data-theme='dark']) .testimonial-card-featured-badge {
		background: linear-gradient(135deg, var(--color-primary-600) 0%, var(--color-primary-700) 100%);
	}

	:global([data-theme='dark']) .testimonial-card-variant-bordered:hover {
		border-color: var(--color-primary-600);
	}

	/* Animações */
	.testimonial-card {
		animation: fadeInUp 0.6s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Hover effects */
	.testimonial-card:hover .testimonial-card-avatar {
		transform: scale(1.05);
		transition: transform var(--transition-fast) var(--transition-timing-default);
	}

	/* Estados especiais */
	.testimonial-card-loading {
		opacity: 0.7;
		pointer-events: none;
	}

	/* Variações de layout para mobile */
	@media (max-width: 480px) {
		.testimonial-card-quote::before {
			display: none;
		}

		.testimonial-card-quote {
			padding-left: 0;
		}

		.testimonial-card-featured::before {
			right: var(--spacing-md);
			font-size: 10px;
			padding: 2px var(--spacing-xs);
		}
	}
</style>
