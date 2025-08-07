<!-- src/lib/components/organisms/InitiativesSection.svelte -->
<script lang="ts">
    import type { InitiativesSectionProps } from '$lib/types/components';
    import SectionHeader from '../molecules/SectionHeader.svelte';
    import FeatureCard from '../molecules/FeatureCard.svelte';
    import Button from '../atoms/Button.svelte';
    import Text from '../atoms/Text.svelte';
  
    export let title: InitiativesSectionProps['title'] = undefined;
    export let description: InitiativesSectionProps['description'] = undefined;
    export let initiatives: InitiativesSectionProps['initiatives'];
    export let layout: InitiativesSectionProps['layout'] = 'grid';
    export let columns: InitiativesSectionProps['columns'] = 4;
    export let filterable: InitiativesSectionProps['filterable'] = false;
    export let categories: InitiativesSectionProps['categories'] = [];
  
    // Classes adicionais
    let className = '';
    export { className as class };
  
    // Estado interno
    let selectedCategory = 'all';
    let visibleInitiatives = initiatives;
  
    // Classes CSS baseadas nas props
    $: classes = [
      'initiatives-section',
      `initiatives-section-layout-${layout}`,
      `initiatives-section-columns-${columns}`,
      filterable && 'initiatives-section-filterable',
      className
    ].filter(Boolean).join(' ');
  
    // Filtrar iniciativas baseado na categoria selecionada
    $: {
      if (selectedCategory === 'all') {
        visibleInitiatives = initiatives;
      } else {
        visibleInitiatives = initiatives.filter(initiative => 
          initiative.category && String(initiative.category) === selectedCategory
        );
      }
    }
  
    // Lidar com mudança de filtro
    function handleCategoryChange(categoryId: string) {
      selectedCategory = categoryId;
    }
  
    // Gera as ilustrações específicas baseadas no índice
    function getIllustrationSrc(index: number): string {
      const illustrations = [
        '/images/illustrations/globe.svg',
        '/images/illustrations/books.svg', 
        '/images/illustrations/monitor.svg',
        '/images/illustrations/gears.svg',
        '/images/illustrations/house.svg'
      ];
      return illustrations[index % illustrations.length];
    }
  
    function getIllustrationAlt(title: string): string {
      return `Ilustração representando ${title}`;
    }
  </script>
  
  <section class={classes}>
    <div class="initiatives-section-container">
      {#if title || description}
        <SectionHeader
          title={title || ''}
          description={description}
          align="center"
          decorative
          class="initiatives-section-header"
        />
      {/if}

      {#if filterable && categories && categories.length > 0}
        <div class="initiatives-section-filters">
          <Button
            variant={selectedCategory === 'all' ? 'primary' : 'ghost'}
            size="sm"
            on:click={() => handleCategoryChange('all')}
            class="filter-button"
          >
            Todas
          </Button>
          
          {#each categories as category}
            <Button
              variant={selectedCategory === category.id ? 'primary' : 'ghost'}
              size="sm"
              on:click={() => handleCategoryChange(category.id)}
              class="filter-button"
            >
              {category.label}
            </Button>
          {/each}
        </div>
      {/if}

      <div class="initiatives-section-grid">
        {#each visibleInitiatives as initiative, index}
          <FeatureCard
            title={initiative.title}
            description={initiative.description}
            href={initiative.href}
            interactive={!!initiative.href}
            featured={initiative.featured}
            illustration={{
              src: getIllustrationSrc(index),
              alt: getIllustrationAlt(initiative.title),
              aspectRatio: 'square',
              objectFit: 'contain'
            }}
            class="initiatives-section-card"
            style={`animation-delay: ${index * 0.1}s`}
          />
        {/each}
      </div>

      {#if visibleInitiatives.length === 0}
        <div class="initiatives-section-empty">
          <Text as="p" size="lg" color="subtle" align="center">
            Nenhuma iniciativa encontrada para esta categoria.
          </Text>
        </div>
      {/if}

      <!-- Slot para conteúdo adicional -->
      <slot />
    </div>
  </section>
  
  <style>
    .initiatives-section {
      position: relative;
      padding: var(--spacing-4xl) 0;
      background-color: var(--background-color-page);
    }
  
    .initiatives-section-container {
      max-width: var(--container-max-width-xl);
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }
  
    /* Filtros */
    .initiatives-section-filters {
      display: flex;
      justify-content: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      padding: var(--spacing-lg);
      background-color: var(--background-color-card);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-sm);
    }
  
    .filter-button {
      transition: all var(--transition-fast) var(--transition-timing-default);
    }
  
    /* Grid de iniciativas */
    .initiatives-section-grid {
      display: grid;
      gap: var(--spacing-lg);
      align-items: start;
    }
  
    /* Layouts */
    .initiatives-section-layout-grid.initiatives-section-columns-2 .initiatives-section-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  
    .initiatives-section-layout-grid.initiatives-section-columns-3 .initiatives-section-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  
    .initiatives-section-layout-grid.initiatives-section-columns-4 .initiatives-section-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  
    .initiatives-section-layout-carousel .initiatives-section-grid {
      display: flex;
      gap: var(--spacing-lg);
      overflow-x: auto;
      scroll-snap-type: x mandatory;
      padding-bottom: var(--spacing-md);
    }
  
    .initiatives-section-layout-carousel .initiatives-section-card {
      flex: 0 0 320px;
      scroll-snap-align: start;
    }
  
    .initiatives-section-layout-masonry .initiatives-section-grid {
      column-count: 3;
      column-gap: var(--spacing-lg);
    }
  
    .initiatives-section-layout-masonry .initiatives-section-card {
      break-inside: avoid;
      margin-bottom: var(--spacing-lg);
    }
  
    /* Cards */
    .initiatives-section-card {
      animation: fadeInUp 0.6s ease-out both;
    }
  
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  
    /* Estado vazio */
    .initiatives-section-empty {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 200px;
      background-color: var(--background-color-card);
      border-radius: var(--border-radius-lg);
      border: 2px dashed var(--border-color-default);
    }
  
    /* Responsividade */
    @media (max-width: 1024px) {
      .initiatives-section-layout-grid.initiatives-section-columns-4 .initiatives-section-grid {
        grid-template-columns: repeat(2, 1fr);
      }
  
      .initiatives-section-layout-grid.initiatives-section-columns-3 .initiatives-section-grid {
        grid-template-columns: repeat(2, 1fr);
      }
  
      .initiatives-section-layout-masonry .initiatives-section-grid {
        column-count: 2;
      }
    }
  
    @media (max-width: 768px) {
      .initiatives-section {
        padding: var(--spacing-3xl) 0;
      }
  
      .initiatives-section-container {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-xl);
      }
  
      .initiatives-section-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-md);
      }
  
      .initiatives-section-layout-masonry .initiatives-section-grid {
        column-count: 1;
      }
  
      .initiatives-section-filters {
        padding: var(--spacing-md);
        gap: var(--spacing-xs);
      }
  
      .filter-button {
        flex: 1;
        min-width: auto;
      }
    }
  
    @media (max-width: 480px) {
      .initiatives-section-container {
        padding: 0 var(--spacing-sm);
      }
  
      .initiatives-section-layout-carousel .initiatives-section-card {
        flex: 0 0 280px;
      }
  
      .initiatives-section-filters {
        flex-direction: column;
      }
    }
  
    /* Dark theme */
    [data-theme="dark"] .initiatives-section {
      background-color: var(--background-color-page);
    }
  
    [data-theme="dark"] .initiatives-section-filters {
      background-color: var(--background-color-card);
    }
  
    [data-theme="dark"] .initiatives-section-empty {
      background-color: var(--background-color-card);
      border-color: var(--border-color-default);
    }
  
    /* Efeitos decorativos */
    .initiatives-section::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      background: linear-gradient(
        90deg,
        var(--color-primary-500),
        var(--color-secondary-500),
        var(--color-accent-500)
      );
      background-size: 200% 100%;
      animation: gradientMove 4s ease-in-out infinite;
    }
  
    @keyframes gradientMove {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  
    /* Hover effects no grid */
    .initiatives-section-grid:hover .initiatives-section-card:not(:hover) {
      opacity: 0.8;
      transform: scale(0.98);
    }
  
    /* Transições suaves para filtros */
    .initiatives-section-card {
      transition: all var(--transition-normal) var(--transition-timing-default);
    }
  
    /* Loading state */
    .initiatives-section-loading .initiatives-section-card {
      opacity: 0.5;
      pointer-events: none;
    }
  
    .initiatives-section-loading .initiatives-section-card::after {
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
      border-radius: inherit;
    }
  
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
  
    /* Carousel scrollbar */
    .initiatives-section-layout-carousel .initiatives-section-grid::-webkit-scrollbar {
      height: 6px;
    }
  
    .initiatives-section-layout-carousel .initiatives-section-grid::-webkit-scrollbar-track {
      background: var(--color-neutral-200);
      border-radius: 3px;
    }
  
    .initiatives-section-layout-carousel .initiatives-section-grid::-webkit-scrollbar-thumb {
      background: var(--color-primary-500);
      border-radius: 3px;
    }
  
    .initiatives-section-layout-carousel .initiatives-section-grid::-webkit-scrollbar-thumb:hover {
      background: var(--color-primary-600);
    }
  
    /* Animações escalonadas */
    .initiatives-section-card:nth-child(1) { animation-delay: 0.1s; }
    .initiatives-section-card:nth-child(2) { animation-delay: 0.2s; }
    .initiatives-section-card:nth-child(3) { animation-delay: 0.3s; }
    .initiatives-section-card:nth-child(4) { animation-delay: 0.4s; }
    .initiatives-section-card:nth-child(5) { animation-delay: 0.5s; }
    .initiatives-section-card:nth-child(6) { animation-delay: 0.6s; }
  
    /* Estados especiais para cards em destaque */
    .initiatives-section-card:has([data-featured="true"]) {
      position: relative;
    }
  
    .initiatives-section-card:has([data-featured="true"])::before {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      background: linear-gradient(
        45deg,
        var(--color-primary-500),
        var(--color-secondary-500),
        var(--color-accent-500)
      );
      border-radius: inherit;
      z-index: -1;
      animation: rotate 3s linear infinite;
    }
  
    @keyframes rotate {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  </style>