<!-- src/lib/components/organisms/TestimonialsSection.svelte -->
<script lang="ts">
	import type { TestimonialsSectionProps } from '$lib/types/components';
	import { Components } from '$lib/components';

	const { Button, Icon } = Components.Atoms;
	const { TestimonialCard, SectionHeader } = Components.Molecules;
  
    export let title: TestimonialsSectionProps['title'] = undefined;
    export let description: TestimonialsSectionProps['description'] = undefined;
    export let testimonials: TestimonialsSectionProps['testimonials'] = []; // Add default value
    export let layout: TestimonialsSectionProps['layout'] = 'grid';
    export let columns: TestimonialsSectionProps['columns'] = 2;
    export let autoplay: TestimonialsSectionProps['autoplay'] = false;
    export let autoplayInterval: TestimonialsSectionProps['autoplayInterval'] = 5000;
    export let navigation: TestimonialsSectionProps['navigation'] = false;
    export let indicators: TestimonialsSectionProps['indicators'] = false;
  
    // Classes adicionais
    let className = '';
    export { className as class };
  
    // Estado interno para carousel
    let currentSlide = 0;
    let carouselContainer: HTMLElement;
    let autoplayTimer: ReturnType<typeof setInterval> | undefined;
  
    // Classes CSS baseadas nas props
    $: classes = [
      'testimonials-section',
      `testimonials-section-layout-${layout}`,
      `testimonials-section-columns-${columns}`,
      autoplay && 'testimonials-section-autoplay',
      className
    ].filter(Boolean).join(' ');
  
    // Testimonials visíveis baseado no layout - with type safety
    $: visibleTestimonials = Array.isArray(testimonials) ? testimonials : [];
    $: totalSlides = visibleTestimonials.length > 0 
      ? Math.ceil(visibleTestimonials.length / (layout === 'carousel' ? 1 : columns))
      : 0;
  
    // Controles do carousel
    function nextSlide() {
      if (totalSlides === 0) return;
      currentSlide = (currentSlide + 1) % totalSlides;
      updateCarouselPosition();
    }
  
    function prevSlide() {
      if (totalSlides === 0) return;
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      updateCarouselPosition();
    }
  
    function goToSlide(index: number) {
      if (totalSlides === 0 || index < 0 || index >= totalSlides) return;
      currentSlide = index;
      updateCarouselPosition();
    }
  
    function updateCarouselPosition() {
      if (carouselContainer) {
        const slideWidth = carouselContainer.clientWidth;
        carouselContainer.scrollTo({
          left: currentSlide * slideWidth,
          behavior: 'smooth'
        });
      }
    }
  
    // Autoplay
    function startAutoplay() {
      if (autoplay && autoplayInterval > 0 && totalSlides > 1) {
        autoplayTimer = setInterval(nextSlide, autoplayInterval);
      }
    }
  
    function stopAutoplay() {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = undefined;
      }
    }
  
    // Lifecycle
    $: if (autoplay && totalSlides > 1) startAutoplay();
    else stopAutoplay();
  
    // Cleanup
    function cleanup() {
      stopAutoplay();
    }
</script>
  
<svelte:window on:beforeunload={cleanup} />
  
<section class={classes}>
  <div class="testimonials-section-container">
    {#if title || description}
      <SectionHeader
        title={title || ''}
        description={description || ''}
        align="center"
        decorative
        class="testimonials-section-header"
      />
    {/if}

    {#if visibleTestimonials.length > 0}
      <div class="testimonials-section-content">
        {#if layout === 'carousel'}
          <div class="testimonials-carousel">
            {#if navigation}
              <button
                class="carousel-nav carousel-nav-prev"
                on:click={prevSlide}
                disabled={totalSlides <= 1}
                aria-label="Depoimento anterior"
              >
                <Icon name="chevron-left" size="md" />
              </button>
            {/if}
  
            <div
              bind:this={carouselContainer}
              class="carousel-container"
              role="region"
              aria-label="Carrossel de depoimentos"
              on:mouseenter={stopAutoplay}
              on:mouseleave={startAutoplay}
            >
              <div class="carousel-track">
                {#each visibleTestimonials as testimonial, index}
                  <div class="carousel-slide">
                    <TestimonialCard
                      quote={testimonial.quote}
                      author={testimonial.author}
                      rating={testimonial.rating && testimonial.rating >= 1 && testimonial.rating <= 5 ? testimonial.rating as 1 | 2 | 3 | 4 | 5 : undefined}
                      featured={testimonial.featured}
                      variant="card"
                      date={testimonial.date}
                      class="testimonials-section-card"
                    />
                  </div>
                {/each}
              </div>
            </div>
  
            {#if navigation}
              <button
                class="carousel-nav carousel-nav-next"
                on:click={nextSlide}
                disabled={totalSlides <= 1}
                aria-label="Próximo depoimento"
              >
                <Icon name="chevron-right" size="md" />
              </button>
            {/if}
  
            {#if indicators && totalSlides > 1}
              <div class="carousel-indicators">
                {#each Array(totalSlides) as _, index}
                  <button
                    class="carousel-indicator"
                    class:carousel-indicator-active={index === currentSlide}
                    on:click={() => goToSlide(index)}
                    aria-label={`Ir para depoimento ${index + 1}`}
                  ></button>
                {/each}
              </div>
            {/if}
          </div>
        {:else}
          <div class="testimonials-section-grid">
            {#each visibleTestimonials as testimonial, index}
              <div class="testimonials-section-card-wrapper" style={`animation-delay: ${index * 0.2}s`}>
                <TestimonialCard
                  quote={testimonial.quote}
                  author={testimonial.author}
                  rating={testimonial.rating && testimonial.rating >= 1 && testimonial.rating <= 5 ? testimonial.rating as 1 | 2 | 3 | 4 | 5 : undefined}
                  featured={testimonial.featured}
                  variant="card"
                  date={testimonial.date}
                  class="testimonials-section-card"
                />
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {:else}
      <!-- Empty state -->
      <div class="testimonials-section-empty">
        <p>Nenhum depoimento disponível no momento.</p>
      </div>
    {/if}

    <!-- Slot para conteúdo adicional -->
    <slot />
  </div>
</section>
  
  <style>
    .testimonials-section {
      position: relative;
      padding: var(--spacing-4xl) 0;
      background: linear-gradient(
        135deg,
        var(--color-neutral-50) 0%,
        var(--color-primary-50) 50%,
        var(--color-secondary-50) 100%
      );
      overflow: hidden;
    }
  
    .testimonials-section-container {
      max-width: var(--container-max-width-xl);
      margin: 0 auto;
      padding: 0 var(--spacing-lg);
      display: flex;
      flex-direction: column;
      gap: var(--spacing-2xl);
    }
  
    /* Grid Layout */
    .testimonials-section-grid {
      display: grid;
      gap: var(--spacing-lg);
      align-items: start;
    }

    .testimonials-section-card-wrapper {
      animation: fadeInUp 0.6s ease-out both;
    }
  
    .testimonials-section-layout-grid.testimonials-section-columns-1 .testimonials-section-grid {
      grid-template-columns: 1fr;
      max-width: 800px;
      margin: 0 auto;
    }
  
    .testimonials-section-layout-grid.testimonials-section-columns-2 .testimonials-section-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  
    .testimonials-section-layout-grid.testimonials-section-columns-3 .testimonials-section-grid {
      grid-template-columns: repeat(3, 1fr);
    }
  
    /* Masonry Layout */
    .testimonials-section-layout-masonry .testimonials-section-grid {
      column-count: 2;
      column-gap: var(--spacing-lg);
    }
  
    .testimonials-section-layout-masonry .testimonials-section-card {
      break-inside: avoid;
      margin-bottom: var(--spacing-lg);
    }
  
    /* Carousel Layout */
    .testimonials-carousel {
      position: relative;
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
    }
  
    .carousel-container {
      flex: 1;
      overflow: hidden;
      border-radius: var(--border-radius-lg);
    }
  
    .carousel-track {
      display: flex;
      transition: transform var(--transition-normal) var(--transition-timing-default);
    }
  
    .carousel-slide {
      flex: 0 0 100%;
      padding: 0 var(--spacing-sm);
    }
  
    /* Navigation */
    .carousel-nav {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      background-color: var(--background-color-card);
      border: 1px solid var(--border-color-default);
      border-radius: var(--border-radius-full);
      color: var(--icon-color-default);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-timing-default);
      box-shadow: var(--shadow-sm);
    }
  
    .carousel-nav:hover {
      background-color: var(--color-primary-500);
      color: var(--color-neutral-0);
      transform: scale(1.05);
      box-shadow: var(--shadow-md);
    }
  
    .carousel-nav:focus-visible {
      outline: 2px solid var(--color-primary-500);
      outline-offset: 2px;
    }
  
    .carousel-nav:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }
  
    /* Indicators */
    .carousel-indicators {
      display: flex;
      justify-content: center;
      gap: var(--spacing-xs);
      margin-top: var(--spacing-lg);
    }
  
    .carousel-indicator {
      width: 12px;
      height: 12px;
      border-radius: var(--border-radius-full);
      border: none;
      background-color: var(--color-neutral-300);
      cursor: pointer;
      transition: all var(--transition-fast) var(--transition-timing-default);
    }
  
    .carousel-indicator:hover {
      background-color: var(--color-primary-400);
      transform: scale(1.2);
    }
  
    .carousel-indicator-active {
      background-color: var(--color-primary-500);
      transform: scale(1.3);
    }
  
    /* Cards */
    .testimonials-section-card {
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
  
    /* Responsividade */
    @media (max-width: 768px) {
      .testimonials-section {
        padding: var(--spacing-3xl) 0;
      }
  
      .testimonials-section-container {
        padding: 0 var(--spacing-md);
        gap: var(--spacing-xl);
      }
  
      .testimonials-section-grid {
        grid-template-columns: 1fr !important;
        gap: var(--spacing-md);
      }
  
      .testimonials-section-layout-masonry .testimonials-section-grid {
        column-count: 1;
      }
  
      .carousel-nav {
        width: 40px;
        height: 40px;
      }
  
      .testimonials-carousel {
        gap: var(--spacing-sm);
      }
    }
  
    @media (max-width: 480px) {
      .testimonials-section-container {
        padding: 0 var(--spacing-sm);
      }
  
      .carousel-nav {
        display: none;
      }
    }
  
    /* Dark theme */
    [data-theme="dark"] .testimonials-section {
      background: linear-gradient(
        135deg,
        var(--color-neutral-900) 0%,
        var(--color-primary-900) 50%,
        var(--color-secondary-900) 100%
      );
    }
  
    [data-theme="dark"] .carousel-nav {
      background-color: var(--background-color-card);
      border-color: var(--border-color-default);
      color: var(--icon-color-default);
    }
  
    [data-theme="dark"] .carousel-nav:hover {
      background-color: var(--color-primary-600);
    }
  
    [data-theme="dark"] .carousel-indicator {
      background-color: var(--color-neutral-600);
    }
  
    [data-theme="dark"] .carousel-indicator:hover {
      background-color: var(--color-primary-500);
    }
  
    [data-theme="dark"] .carousel-indicator-active {
      background-color: var(--color-primary-400);
    }
  
    /* Efeitos decorativos */
    .testimonials-section::before {
      content: '';
      position: absolute;
      top: -100px;
      left: -100px;
      width: 200px;
      height: 200px;
      background: radial-gradient(
        circle,
        var(--color-primary-200) 0%,
        transparent 70%
      );
      border-radius: 50%;
      opacity: 0.6;
      z-index: -1;
      animation: float 12s ease-in-out infinite;
    }
  
    .testimonials-section::after {
      content: '';
      position: absolute;
      bottom: -100px;
      right: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(
        circle,
        var(--color-secondary-200) 0%,
        transparent 70%
      );
      border-radius: 50%;
      opacity: 0.4;
      z-index: -1;
      animation: float 15s ease-in-out infinite reverse;
    }
  
    @keyframes float {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
      }
      50% { 
        transform: translateY(-30px) rotate(15deg); 
      }
    }
  
    /* Hover effects no grid */
    .testimonials-section-grid:hover .testimonials-section-card:not(:hover) {
      opacity: 0.8;
      transform: scale(0.98);
    }
  
    /* Loading state */
    .testimonials-section-loading .testimonials-section-card {
      opacity: 0.5;
      pointer-events: none;
    }
  
    .testimonials-section-loading .testimonials-section-card::after {
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
  
    /* Autoplay indicator */
    .testimonials-section-autoplay .carousel-indicator-active::after {
      content: '';
      position: absolute;
      top: -2px;
      left: -2px;
      right: -2px;
      bottom: -2px;
      border: 2px solid var(--color-primary-500);
      border-radius: inherit;
      animation: pulse 2s infinite;
    }
  
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
  
    /* Touch gestures para mobile */
    .carousel-container {
      touch-action: pan-x;
    }
  
    /* Swipe indicators */
    .carousel-container::before {
      content: '';
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 4px;
      background-color: var(--color-neutral-400);
      border-radius: 2px;
      opacity: 0.5;
      z-index: 1;
    }
  
    @media (max-width: 768px) {
      .carousel-container::before {
        display: block;
      }
    }
  </style>