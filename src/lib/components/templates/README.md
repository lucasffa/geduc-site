# HomePage Component

Um template flexível e reutilizável para páginas iniciais usando slots svelteanos idiomáticos.

## Características

- ✅ **Slots nomeados** para máxima flexibilidade
- ✅ **Event dispatching** para comunicação entre componentes
- ✅ **Acessibilidade** integrada
- ✅ **Responsivo** por padrão
- ✅ **Dark theme** suporte
- ✅ **Animações** opcionais
- ✅ **SEO** friendly com slot para meta tags

## Props

| Prop | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `showNavigation` | `boolean` | `true` | Se deve mostrar a navegação |
| `showFooter` | `boolean` | `true` | Se deve mostrar o footer |
| `padding` | `boolean` | `true` | Se deve ter espaçamento interno |
| `maxWidth` | `'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'` | `'xl'` | Largura máxima do container |
| `gradientBackground` | `boolean` | `false` | Se deve ter background gradiente |
| `animated` | `boolean` | `true` | Se deve ter animações |
| `className` | `string` | `''` | Classes CSS customizadas |
| `id` | `string` | `''` | ID do elemento |

## Slots

### `head`
Para meta tags e configurações de SEO.

```svelte
<svelte:fragment slot="head">
  <title>Guardiões da Educação</title>
  <meta name="description" content="Transformando vidas através da educação" />
  <meta property="og:title" content="Guardiões da Educação" />
</svelte:fragment>
```

### `navigation`
Para o componente de navegação.

```svelte
<svelte:fragment slot="navigation" let:dispatch>
  <Navigation 
    items={navigationItems}
    on:click={(e) => dispatch('navigationClick', { 
      href: e.detail.href, 
      label: e.detail.label 
    })}
  />
</svelte:fragment>
```

### `hero`
Para a seção hero principal.

```svelte
<svelte:fragment slot="hero" let:dispatch>
  <HeroSection 
    title="Guardiões da Educação"
    description="Transformando vidas através do conhecimento"
    on:action={(e) => dispatch('heroAction', { 
      action: e.detail.action, 
      href: e.detail.href 
    })}
  />
</svelte:fragment>
```

### `stats`
Para a seção de estatísticas.

```svelte
<svelte:fragment slot="stats" let:dispatch>
  <StatsSection stats={statsData} />
</svelte:fragment>
```

### `about`
Para a seção sobre nós.

```svelte
<svelte:fragment slot="about" let:dispatch>
  <div class="section-container section-padding">
    <SectionHeader title="Sobre Nós" description="Nossa missão" />
    <div class="about-content">
      <!-- Conteúdo da seção sobre -->
    </div>
  </div>
</svelte:fragment>
```

### `initiatives`
Para a seção de iniciativas.

```svelte
<svelte:fragment slot="initiatives" let:dispatch>
  <InitiativesSection 
    initiatives={initiativesData}
    on:click={(e) => dispatch('initiativeClick', { 
      id: e.detail.id, 
      title: e.detail.title 
    })}
  />
</svelte:fragment>
```

### `testimonials`
Para a seção de depoimentos.

```svelte
<svelte:fragment slot="testimonials" let:dispatch>
  <TestimonialsSection 
    testimonials={testimonialsData}
    on:click={(e) => dispatch('testimonialClick', { 
      id: e.detail.id, 
      author: e.detail.author 
    })}
  />
</svelte:fragment>
```

### `custom`
Para conteúdo customizado adicional.

```svelte
<svelte:fragment slot="custom" let:dispatch>
  <section class="section-container section-padding">
    <h2>Conteúdo Customizado</h2>
    <p>Esta seção pode conter qualquer conteúdo personalizado.</p>
  </section>
</svelte:fragment>
```

### `footer`
Para o componente de footer.

```svelte
<svelte:fragment slot="footer" let:dispatch>
  <Footer 
    links={footerLinks}
    on:action={(e) => dispatch('footerAction', { 
      action: e.detail.action, 
      href: e.detail.href 
    })}
  />
</svelte:fragment>
```

## Eventos

O componente dispara os seguintes eventos:

- `navigationClick`: Quando um item de navegação é clicado
- `heroAction`: Quando uma ação do hero é executada
- `initiativeClick`: Quando uma iniciativa é clicada
- `testimonialClick`: Quando um depoimento é clicado
- `footerAction`: Quando uma ação do footer é executada

## Exemplo Completo

```svelte
<script lang="ts">
  import HomePage from '$lib/components/templates/HomePage.svelte';
  import Navigation from '$lib/components/organisms/Navigation.svelte';
  import HeroSection from '$lib/components/organisms/HeroSection.svelte';
  import StatsSection from '$lib/components/organisms/StatsSection.svelte';
  import InitiativesSection from '$lib/components/organisms/InitiativesSection.svelte';
  import TestimonialsSection from '$lib/components/organisms/TestimonialsSection.svelte';
  import Footer from '$lib/components/organisms/Footer.svelte';
  import SectionHeader from '$lib/components/molecules/SectionHeader.svelte';

  // Dados dos componentes
  const navigationItems = [
    { label: 'Home', href: '/', active: true },
    { label: 'Sobre nós', href: '/sobre' },
    { label: 'Iniciativas', href: '/iniciativas' }
  ];

  const heroData = {
    title: 'Guardiões da Educação',
    description: 'Transformando vidas através do conhecimento',
    actions: [
      { label: 'Saiba Mais', href: '/sobre', variant: 'primary' },
      { label: 'Assista o Vídeo', href: '/video', variant: 'outline' }
    ]
  };

  const statsData = [
    { value: '100+', label: 'Cidades alcançadas' },
    { value: '30+', label: 'Voluntários' },
    { value: '750k+', label: 'Pessoas impactadas' }
  ];

  const initiativesData = [
    {
      id: 'mentoria',
      title: 'Mentoria de Oportunidades',
      description: 'Preparação para vestibulares e processos seletivos'
    }
  ];

  const testimonialsData = [
    {
      id: '1',
      quote: 'O programa mudou minha vida...',
      author: { name: 'Gabriela Saito', title: 'Estudante de Ciências Atuariais' }
    }
  ];

  const footerLinks = [
    { title: 'Programas', items: [{ label: 'Mentoria', href: '/mentoria' }] }
  ];

  // Handlers de eventos
  function handleNavigationClick(event: CustomEvent) {
    console.log('Navigation clicked:', event.detail);
  }

  function handleHeroAction(event: CustomEvent) {
    console.log('Hero action:', event.detail);
  }

  function handleInitiativeClick(event: CustomEvent) {
    console.log('Initiative clicked:', event.detail);
  }

  function handleTestimonialClick(event: CustomEvent) {
    console.log('Testimonial clicked:', event.detail);
  }

  function handleFooterAction(event: CustomEvent) {
    console.log('Footer action:', event.detail);
  }
</script>

<HomePage 
  showNavigation={true}
  showFooter={true}
  padding={true}
  maxWidth="xl"
  gradientBackground={false}
  animated={true}
  className="custom-home-page"
  on:navigationClick={handleNavigationClick}
  on:heroAction={handleHeroAction}
  on:initiativeClick={handleInitiativeClick}
  on:testimonialClick={handleTestimonialClick}
  on:footerAction={handleFooterAction}
>
  <!-- Meta tags -->
  <svelte:fragment slot="head">
    <title>Guardiões da Educação - Transformando Vidas Através do Conhecimento</title>
    <meta name="description" content="Projeto educacional dedicado a democratizar o acesso ao ensino superior de qualidade." />
    <meta property="og:title" content="Guardiões da Educação" />
    <meta property="og:description" content="Transformando vidas através do conhecimento." />
  </svelte:fragment>

  <!-- Navegação -->
  <svelte:fragment slot="navigation" let:dispatch>
    <Navigation 
      items={navigationItems}
      on:click={(e) => dispatch('navigationClick', { 
        href: e.detail.href, 
        label: e.detail.label 
      })}
    />
  </svelte:fragment>

  <!-- Hero Section -->
  <svelte:fragment slot="hero" let:dispatch>
    <HeroSection 
      title={heroData.title}
      description={heroData.description}
      actions={heroData.actions}
      on:action={(e) => dispatch('heroAction', { 
        action: e.detail.action, 
        href: e.detail.href 
      })}
    />
  </svelte:fragment>

  <!-- Stats Section -->
  <svelte:fragment slot="stats" let:dispatch>
    <StatsSection stats={statsData} />
  </svelte:fragment>

  <!-- About Section -->
  <svelte:fragment slot="about" let:dispatch>
    <div class="section-container section-padding">
      <SectionHeader 
        title="Sobre Nós" 
        description="Construindo pontes entre sonhos e realizações através da educação de qualidade." 
      />
      <div class="about-content">
        <p>
          O Guardiões da Educação nasceu da crença de que todo jovem brasileiro merece acesso 
          a oportunidades educacionais de excelência.
        </p>
      </div>
    </div>
  </svelte:fragment>

  <!-- Initiatives Section -->
  <svelte:fragment slot="initiatives" let:dispatch>
    <InitiativesSection 
      initiatives={initiativesData}
      on:click={(e) => dispatch('initiativeClick', { 
        id: e.detail.id, 
        title: e.detail.title 
      })}
    />
  </svelte:fragment>

  <!-- Testimonials Section -->
  <svelte:fragment slot="testimonials" let:dispatch>
    <TestimonialsSection 
      testimonials={testimonialsData}
      on:click={(e) => dispatch('testimonialClick', { 
        id: e.detail.id, 
        author: e.detail.author 
      })}
    />
  </svelte:fragment>

  <!-- Footer -->
  <svelte:fragment slot="footer" let:dispatch>
    <Footer 
      links={footerLinks}
      on:action={(e) => dispatch('footerAction', { 
        action: e.detail.action, 
        href: e.detail.href 
      })}
    />
  </svelte:fragment>
</HomePage>
```

## Utilitários CSS

O componente fornece algumas classes utilitárias para os slots:

- `.section-container`: Container com largura máxima e centralização
- `.section-padding`: Padding vertical padrão para seções
- `.section-padding--sm`: Padding vertical menor
- `.section-padding--lg`: Padding vertical maior

## Acessibilidade

- ✅ Roles ARIA apropriados
- ✅ Labels descritivos
- ✅ Suporte a navegação por teclado
- ✅ Respeita `prefers-reduced-motion`
- ✅ Focus visible para elementos interativos

## Performance

- ✅ Lazy loading de imagens
- ✅ Animações otimizadas
- ✅ Transições suaves
- ✅ Estados de loading 