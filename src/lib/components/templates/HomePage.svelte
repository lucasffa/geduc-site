<!-- src/lib/components/templates/HomePage.svelte -->
<script lang="ts">
  import type { BaseComponentProps } from '$lib/types/components';
  import { createEventDispatcher } from 'svelte';

  export let showNavigation = true;
  export let showFooter = true;
  export let padding = true;
  export let maxWidth: 'sm' | 'md' | 'lg' | 'xl' | 'full' = 'xl';
  export let gradientBackground = false;
  export let animated = true;
  export let className: string = '';
  export let id: string = '';

  const dispatch = createEventDispatcher<{
    navigationClick: { href: string; label: string };
    heroAction: { action: string; href?: string };
    initiativeClick: { id: string; title: string };
    testimonialClick: { id: string; author: string };
    footerAction: { action: string; href?: string };
  }>();

  // Classes dinâmicas
  $: containerClasses = [
    'home-page',
    padding ? 'home-page-padded' : '',
    gradientBackground ? 'home-page-gradient' : '',
    animated ? 'home-page-animated' : '',
    className
  ].filter(Boolean).join(' ');

  $: containerMaxWidth = maxWidth === 'full' ? '100%' : `var(-container-max-width-${maxWidth})`;
</script>

<svelte:head>
  <slot name="head" />
</svelte:head>

<!-- Navegação -->
{#if showNavigation}
  <slot name="navigation" {dispatch} />
{/if}

<!-- Conteúdo principal -->
<main 
  class={containerClasses}
  {id}
  role="article"
  aria-label="Conteúdo principal da página"
>
  <!-- Hero Section -->
  <section class="home-page-hero" aria-label="Seção principal">
    <slot name="hero" {dispatch} />
  </section>

  <!-- Our Impact Section -->
  <section class="home-page-our-impact" aria-label="Nosso impacto">
    <slot name="ourImpact" {dispatch} />
  </section>

  <!-- Stats Section -->
  <section class="home-page-stats" aria-label="Estatísticas">
    <slot name="stats" {dispatch} />
  </section>

  <!-- About Section -->
  <section class="home-page-about" aria-label="Sobre nós">
    <slot name="about" {dispatch} />
  </section>

  <!-- Initiatives Section -->
  <section class="home-page-initiatives" aria-label="Nossas iniciativas">
    <slot name="initiatives" {dispatch} />
  </section>

  <!-- Testimonials Section -->
  <section class="home-page-testimonials" aria-label="Depoimentos">
    <slot name="testimonials" {dispatch} />
  </section>

  <!-- Conteúdo customizado -->
  <slot name="custom" {dispatch} />
</main>

<!-- Footer -->
{#if showFooter}
  <slot name="footer" {dispatch} />
{/if}

<style>
  .home-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: v-bind(containerMaxWidth);
    margin: 0 auto;
  }

  .home-page-padded {
    padding: 0 var(-spacing-lg);
  }

  .home-page-gradient {
    background: linear-gradient(
      135deg,
      var(-color-primary-50) 0%,
      var(-color-secondary-50) 50%,
      var(-color-accent-50) 100%
    );
  }

  .home-page-animated {}

  .home-page-animated :global(*) {
    transition: opacity var(-transition-normal) var(-transition-timing-default),
                transform var(-transition-normal) var(-transition-timing-default);
  }

  /* Seções */
  .home-page-hero {
    position: relative;
    z-index: 1;
  }

  .home-page-our-impact {
    position: relative;
    z-index: 2;
  }

  .home-page-stats {
    position: relative;
    z-index: 3;
  }

  .home-page-about {
    position: relative;
    z-index: 4;
  }

  .home-page-initiatives {
    position: relative;
    z-index: 5;
  }

  .home-page-testimonials {
    position: relative;
    z-index: 6;
  }

  /* Responsividade */
  @media (max-width: 768px) {
    .home-page-padded {
      padding: 0 var(-spacing-md);
    }
  }

  @media (max-width: 480px) {
    .home-page-padded {
      padding: 0 var(-spacing-sm);
    }
  }

  /* Dark theme */
  [data-theme="dark"] .home-page-gradient {
    background: linear-gradient(
      135deg,
      var(-color-primary-900) 0%,
      var(-color-secondary-900) 50%,
      var(-color-accent-900) 100%
    );
  }

  /* Acessibilidade */
  @media (prefers-reduced-motion: reduce) {
    .home-page-animated :global(*) {
      transition: none;
      animation: none;
    }
  }

  /* Focus visible para navegação por teclado */
  .home-page :global(:focus-visible) {
    outline: 2px solid var(-color-primary-500);
    outline-offset: 2px;
  }

  /* Loading states */
  .home-page.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  .home-page.loading::after {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent 25%,
      rgba(255, 255, 255, 0.1) 50%,
      transparent 75%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite;
    z-index: 9999;
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Utilitários para slots */
  .home-page :global(.section-container) {
    max-width: v-bind(containerMaxWidth);
    margin: 0 auto;
    width: 100%;
  }

  .home-page :global(.section-padding) {
    padding: var(-spacing-4xl) 0;
  }

  .home-page :global(.section-padding-sm) {
    padding: var(-spacing-2xl) 0;
  }

  .home-page :global(.section-padding-lg) {
    padding: var(-spacing-6xl) 0;
  }
</style>
