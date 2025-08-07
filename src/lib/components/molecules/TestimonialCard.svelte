<!-- src/lib/components/molecules/TestimonialCard.svelte -->
<script lang="ts">
	import type { TestimonialCardProps } from '$lib/types/components';
	import Text from '../atoms/Text.svelte';
	import Avatar from '../atoms/Avatar.svelte';
	import Icon from '../atoms/Icon.svelte';

	export let quote: TestimonialCardProps['quote'];
	export let author: TestimonialCardProps['author'];
	export let rating: TestimonialCardProps['rating'] = undefined;
	export let featured: TestimonialCardProps['featured'] = false;
	export let variant: TestimonialCardProps['variant'] = 'card';
	export let date: TestimonialCardProps['date'] = undefined;

	// Classes adicionais
	let className = '';
	export { className as class };

	// Classes CSS baseadas nas props
	$: classes = [
		'testimonial-card',
		`testimonial-card-variant-${variant}`,
		featured && 'testimonial-card-featured',
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
	<!-- Aspas decorativas -->
	<div class="testimonial-card-quote-icon">
		<svg viewBox="0 0 24 24" fill="currentColor">
			<path
				d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-10zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"
			/>
		</svg>
	</div>

	<!-- Rating -->
	{#if rating}
		<div class="testimonial-card-rating">
			{#each stars as filled, index}
				<Icon
					name="star"
					size="sm"
					color={filled ? 'warning' : 'neutral'}
					class="testimonial-card-star"
				/>
			{/each}
		</div>
	{/if}

	<!-- Quote -->
	<div class="testimonial-card-content">
		<Text as="blockquote" size="md" weight="normal" class="testimonial-card-quote">
			"{quote}"
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
			<Text as="cite" size="md" weight="semibold" class="testimonial-card-author-name">
				{author.name}
			</Text>

			<Text as="span" size="sm" color="subtle" class="testimonial-card-author-title">
				{author.title}
				{#if author.company}
					<span class="testimonial-card-author-company">
						· {author.company}
					</span>
				{/if}
			</Text>
		</div>

		{#if formattedDate}
			<Text as="time" size="xs" color="subtle" class="testimonial-card-date">
				{formattedDate}
			</Text>
		{/if}
	</div>
</div>

<style>
	.testimonial-card {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		padding: var(--spacing-lg);
		background-color: var(--background-color-card);
		border-radius: var(--border-radius-lg);
		transition: all var(--transition-normal) var(--transition-timing-default);
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

	/* Featured */
	.testimonial-card-featured {
		background: linear-gradient(135deg, var(--color-primary-50) 0%, var(--color-accent-50) 100%);
		border-color: var(--color-primary-200);
		position: relative;
	}

	.testimonial-card-featured::before {
		content: 'Em Destaque';
		position: absolute;
		top: -1px;
		right: var(--spacing-lg);
		background-color: var(--color-primary-500);
		color: var(--color-neutral-0);
		padding: var(--spacing-xs) var(--spacing-sm);
		border-radius: 0 0 var(--border-radius-sm) var(--border-radius-sm);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Quote icon */
	.testimonial-card-quote-icon {
		width: 32px;
		height: 32px;
		color: var(--color-primary-300);
		opacity: 0.6;
	}

	.testimonial-card-quote-icon svg {
		width: 100%;
		height: 100%;
	}

	/* Rating */
	.testimonial-card-rating {
		display: flex;
		gap: var(--spacing-xs);
		margin-bottom: var(--spacing-sm);
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
		font-style: italic;
		line-height: var(--line-height-relaxed);
		color: var(--text-color-primary);
		position: relative;
	}

	.testimonial-card-quote::before {
		content: '';
		position: absolute;
		left: -var(--spacing-md);
		top: 0;
		bottom: 0;
		width: 3px;
		background: linear-gradient(to bottom, var(--color-primary-500), var(--color-secondary-500));
		border-radius: var(--border-radius-sm);
	}

	/* Author */
	.testimonial-card-author {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		margin-top: var(--spacing-md);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--border-color-default);
	}

	.testimonial-card-avatar {
		flex-shrink: 0;
	}

	.testimonial-card-author-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.testimonial-card-author-name {
		margin: 0;
		color: var(--text-color-primary);
	}

	.testimonial-card-author-title {
		margin: 0;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.testimonial-card-author-company {
		color: var(--color-primary-600);
		font-weight: var(--font-weight-medium);
	}

	.testimonial-card-date {
		flex-shrink: 0;
		margin-left: auto;
		font-size: var(--font-size-xs);
	}

	/* Responsividade */
	@media (max-width: 768px) {
		.testimonial-card {
			padding: var(--spacing-md);
		}

		.testimonial-card-author {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--spacing-sm);
		}

		.testimonial-card-date {
			margin-left: 0;
			align-self: flex-end;
		}
	}

	/* Dark theme */
	[data-theme='dark'] .testimonial-card-featured {
		background: linear-gradient(135deg, var(--color-primary-900) 0%, var(--color-accent-900) 100%);
		border-color: var(--color-primary-700);
	}

	[data-theme='dark'] .testimonial-card-quote-icon {
		color: var(--color-primary-600);
	}

	[data-theme='dark'] .testimonial-card-author-company {
		color: var(--color-primary-400);
	}

	[data-theme='dark'] .testimonial-card-variant-bordered:hover {
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
	.testimonial-card:hover .testimonial-card-quote-icon {
		color: var(--color-primary-500);
		transform: scale(1.1);
		transition: all var(--transition-fast) var(--transition-timing-default);
	}

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
