<!-- src/lib/components/organisms/StatsSection.svelte -->
<script lang="ts">
    import type { StatsSectionProps } from '$lib/types/components';
    import SectionHeader from '../molecules/SectionHeader.svelte';
    import StatCard from '../molecules/StatCard.svelte';
    import Text from '../atoms/Text.svelte';
    import Image from '../atoms/Image.svelte';
    import { onMount } from 'svelte';
  
    export let title: StatsSectionProps['title'] = undefined;
    export let description: StatsSectionProps['description'] = undefined;
    export let stats: StatsSectionProps['stats'];
    export let layout: StatsSectionProps['layout'] = 'grid';
    export let columns: StatsSectionProps['columns'] = 4;
    export let background: StatsSectionProps['background'] = 'none';
    export let animated: StatsSectionProps['animated'] = false;
  
    // Classes adicionais
    let className = '';
    export { className as class };
  
    // Classes CSS baseadas nas props
    $: classes = [
      'stats-section',
      `stats-section-layout-${layout}`,
      `stats-section-columns-${columns}`,
      `stats-section-background-${background}`,
      animated && 'stats-section-animated',
      className
    ].filter(Boolean).join(' ');
  
    // Observa quando a seção está visível para animações
    let sectionElement: HTMLElement;
    let isVisible = false;
  
    function handleIntersection(entries: IntersectionObserverEntry[]) {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          isVisible = true;
        }
      });
    }
  
    // Configura o intersection observer para animações
    onMount(() => {
      if (typeof window !== 'undefined' && sectionElement && animated) {
        const observer = new IntersectionObserver(handleIntersection, {
          threshold: 0.3
        });
        observer.observe(sectionElement);
        
        return () => observer.disconnect();
      }
    });
  </script>
  
  <section bind:this={sectionElement} class={classes}>
    <div class="stats-section-container">
      {#if title || description}
        <SectionHeader
          title={title || ''}
          description={description}
          align="center"
          decorative
          class="stats-section-header"
        />
      {/if}
  
      <!-- Descrição específica da seção de impacto -->
      {#if description}
        <Text as="p" size="lg" color="secondary" align="center" class="stats-section-intro">
          {description}
        </Text>
      {/if}
  
      <!-- Mapa do Brasil como mencionado na hierarquia -->
      <div class="stats-section-map">
        <Image
          src="/images/illustrations/brazil-map.svg"
          alt="Mapa do Brasil mostrando alcance nacional"
          aspectRatio="auto"
          loading="lazy"
          class="stats-map-image image-halftone"
        />
      </div>
  
      <!-- Grid de estatísticas -->
      <div class="stats-section-grid" class:stats-grid-visible={isVisible}>
        {#each stats as stat, index}
          <StatCard
            value={stat.value}
            label={stat.label}
            description={stat.description}
            icon={stat.icon}
            color={stat.color || 'primary'}
            variant={index % 2 === 1 ? 'highlighted' : 'default'}
            class="stats-section-card"
            style={animated ? `animation-delay: ${index * 0.2}s` : ''}
          >
            <svelte:fragment slot="illustration">
              <!-- Slot para ilustrações específicas baseado no índice -->
              {#if index === 0}
                <Image
                  src="/images/illustrations/pin.svg"
                  alt="Ícone de localização"
                  class="stat-illustration image-halftone"
                />
              {:else if index === 1}
                <Image
                  src="/images/illustrations/people-group.svg"
                  alt="Ícone de grupo de pessoas"
                  class="stat-illustration image-halftone"
                />
              {:else if index === 2}
                <Image
                  src="/images/illustrations/mobile.svg"
                  alt="Ícone de dispositivo móvel"
                  class="stat-illustration image-halftone"
                />
              {:else if index === 3}
                <Image
                  src="/images/illustrations/target.svg"
                  alt="Ícone de alvo/objetivo"
                  class="stat-illustration image-halftone"
                />
              {/if}
            </svelte:fragment>
          </StatCard>
        {/each}
      </div>
  
      <!-- Slot para conteúdo adicional -->
      <slot />
    </div>
  </section>
  
  <style>
    .stats-section {
      position: relative;
      padding: var(--spacing-4xl) 0;
      overflow: hidden;
    }
  
    .stats-section-container {
      max-width: var(--container-max-width-xl);
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }
  
    /* Backgrounds */
    .stats-section-background-none {
      background: transparent;
    }
  
    .stats-section-background-muted {
      background-color: var(--color-neutral-50);
    }
  
    .stats-section-background-primary {
      background: linear-gradient(
        135deg,
        var(--color-primary-100) 0%,
        var(--color-primary-50) 100%
      );
    }
  
    .stats-section-background-gradient {
      background: linear-gradient(
        135deg,
        var(--color-primary-50) 0%,
        var(--color-secondary-50) 50%,
        var(--color-accent-50) 100%
      );
    }
  
    /* Introdução */
    .stats-section-intro {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
  
    /* Mapa */
    .stats-section-map {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: var(--spacing-xl) 0;
      position: relative;
    }
  
    .stats-map-image {
      max-width: 300px;
      height: auto;
      opacity: 0.7;
      filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      transition: all var(--transition-normal) var(--transition-timing-default);
    }
  
    .stats-map-image:hover {
      opacity: 1;
      transform: scale(1.05);
    }
  
    /* Grid de estatísticas */
    .stats-section-grid {
      display: grid;
      gap: var(--spacing-lg);
      align-items: start;
    }
  
    /* Layouts */
    .stats-section-layout-grid.stats-section-columns-2 .stats-section-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  
    .stats-section-layout-grid.stats-section-columns-3 .stats-section-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  
    .stats-section-layout-grid.stats-section-columns-4 .stats-section-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  
    .stats-section-layout-grid.stats-section-columns-5 .stats-section-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  
    .stats-section-layout-grid.stats-section-columns-6 .stats-section-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  
    .stats-section-layout-horizontal .stats-section-grid {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
    }
  
    .stats-section-layout-carousel .stats-section-grid {
      display: flex;
      gap: var(--spacing-lg);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: var(--spacing-md);
    }
  
    .stats-section-layout-carousel .stats-section-card {
      flex: 0 0 280px;
      scroll-snap-align: start;
    }
  
    /* Ilustrações nos cards */
    .stat-illustration {
      max-width: 60px;
      max-height: 60px;
      opacity: 0.8;
    }
  
    /* Animações */
    .stats-section-animated .stats-section-card {
      opacity: 0;
      transform: translateY(30px);
      transition: all 0.6s ease-out;
    }
  
    .stats-grid-visible .stats-section-card {
      opacity: 1;
      transform: translateY(0);
    }
  
    /* Responsividade */
    @media (max-width: 1024px) {
      .stats-section-layout-grid.stats-section-columns-4 .stats-section-grid,
      .stats-section-layout-grid.stats-section-columns-5 .stats-section-grid,
      .stats-section-layout-grid.stats-section-columns-6 .stats-section-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  
    @media (max-width: 768px) {
      .stats-section {
        padding: var(--spacing-3xl) 0;
      }
  
      .stats-section-container {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-xl);
      }
  
      .stats-section-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-md);
      }
  
      .stats-section-layout-horizontal .stats-section-grid {
        flex-direction: column;
        align-items: stretch;
      }
  
      .stats-map-image {
        max-width: 200px;
      }
    }
  
    @media (max-width: 480px) {
      .stats-section-container {
        padding: 0 var(--spacing-sm);
      }
  
      .stats-section-layout-carousel .stats-section-card {
        flex: 0 0 240px;
      }
    }
  
    /* Dark theme */
    [data-theme="dark"] .stats-section-background-muted {
      background-color: var(--color-neutral-800);
    }
  
    [data-theme="dark"] .stats-section-background-primary {
      background: linear-gradient(
        135deg,
        var(--color-primary-900) 0%,
        var(--color-primary-800) 100%
      );
    }
  
    [data-theme="dark"] .stats-section-background-gradient {
      background: linear-gradient(
        135deg,
        var(--color-primary-900) 0%,
        var(--color-secondary-900) 50%,
        var(--color-accent-900) 100%
      );
    }
  
    /* Efeitos decorativos */
    .stats-section::before {
      content: '';
      position: absolute;
      top: 10%;
      left: -5%;
      width: 200px;
      height: 200px;
      background: radial-gradient(
        circle,
        var(--color-primary-200) 0%,
        transparent 70%
      );
      border-radius: 50%;
      opacity: 0.5;
      z-index: -1;
      animation: float 8s ease-in-out infinite;
    }
  
    .stats-section::after {
      content: '';
      position: absolute;
      bottom: 10%;
      right: -5%;
      width: 150px;
      height: 150px;
      background: radial-gradient(
        circle,
        var(--color-secondary-200) 0%,
        transparent 70%
      );
      border-radius: 50%;
      opacity: 0.5;
      z-index: -1;
      animation: float 10s ease-in-out infinite reverse;
    }
  
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(10deg); }
    }
  
    /* Hover effects no grid */
    .stats-section-grid:hover .stats-section-card:not(:hover) {
      opacity: 0.7;
      transform: scale(0.98);
    }
  
    /* Loading state */
    .stats-section-loading .stats-section-card {
      opacity: 0.5;
      pointer-events: none;
    }
  
    .stats-section-loading .stats-section-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(
        90deg,
        transparent 25%,
        rgba(255, 255, 255, 0.2) 50%,
        transparent 75%
      );
      background-size: 200% 100%;
      animation: shimmer 2s infinite;
    }
  
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  
    /* Carousel scrollbar */
    .stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar {
      height: 6px;
    }
  
    .stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-track {
      background: var(--color-neutral-200);
      border-radius: 3px;
    }
  
    .stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-thumb {
      background: var(--color-primary-500);
      border-radius: 3px;
    }
  
    .stats-section-layout-carousel .stats-section-grid::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary-600);
    }
  </style>