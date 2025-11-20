# Sistema de Responsividade - SectionHeader & TextBlock

## Visão Geral

Os componentes `SectionHeader` e `TextBlock` agora possuem um sistema de responsividade automático que ajusta os tamanhos de fonte baseado em breakpoints específicos, utilizando um serviço externo através de blocos reativos.

## Breakpoints Definidos

Os breakpoints seguem as melhores práticas de design responsivo:

- **xs**: 0px - 639px (Mobile pequeno)
- **sm**: 640px - 767px (Mobile)
- **md**: 768px - 1023px (Tablet)
- **lg**: 1024px - 1279px (Desktop pequeno)
- **xl**: 1280px - 1535px (Desktop)
- **2xl**: 1536px - 1919px (Desktop grande)
- **3xl**: 1920px+ (Desktop extra grande)

## Mapeamento de Sizes Padrão

### Heading (Título)
```typescript
xs: 'xl'    // Mobile pequeno
sm: '2xl'   // Mobile
md: '3xl'   // Tablet
lg: '4xl'   // Desktop pequeno
xl: '5xl'   // Desktop
2xl: '6xl'  // Desktop grande
3xl: '7xl'  // Desktop extra grande
```

### Subtitle (Subtítulo)
```typescript
xs: 'sm'    // Mobile pequeno
sm: 'md'    // Mobile
md: 'lg'    // Tablet
lg: 'xl'    // Desktop pequeno
xl: 'xl'    // Desktop
2xl: '2xl'  // Desktop grande
3xl: '2xl'  // Desktop extra grande
```

### Description (Descrição)
```typescript
xs: 'xs'    // Mobile pequeno
sm: 'sm'    // Mobile
md: 'md'    // Tablet
lg: 'md'    // Desktop pequeno
xl: 'lg'    // Desktop
2xl: 'lg'   // Desktop grande
3xl: 'xl'   // Desktop extra grande
```

## Uso Básico

```svelte
<SectionHeader
  title="Nosso Impacto"
  subtitle="Transformando vidas através da educação"
  description="Conheça os resultados que alcançamos..."
  align="center"
/>
```

Os sizes serão ajustados automaticamente baseado no tamanho da tela.

## Uso com Customização

Você pode sobrescrever o mapeamento padrão de sizes:

```svelte
<script>
  const customSizes = {
    heading: {
      xs: 'lg',
      sm: 'xl',
      md: '2xl',
      lg: '3xl',
      xl: '4xl',
      '2xl': '5xl',
      '3xl': '6xl'
    },
    subtitle: {
      xs: 'xs',
      sm: 'sm',
      md: 'md',
      lg: 'lg',
      xl: 'xl',
      '2xl': 'xl',
      '3xl': '2xl'
    }
    // description usará o padrão
  };
</script>

<SectionHeader
  title="Título Customizado"
  subtitle="Subtítulo menor"
  customSizeMap={customSizes}
/>
```

## Arquitetura Técnica

### Serviço de Responsividade

O sistema utiliza o `ResponsiveService` (`src/lib/services/responsive.service.ts`) que:

1. **Monitora breakpoints** usando `window.matchMedia()` para performance otimizada
2. **Fornece store reativo** através de Svelte stores
3. **Mapeia sizes** baseado no breakpoint atual
4. **Suporta SSR** com fallback seguro

### Bloco Reativo no Componente

```svelte
<script>
  // Store reativo de breakpoint do serviço
  const breakpointStore = responsiveService.getBreakpointStore();

  // Sizes responsivos calculados reativamente
  $: responsiveSizes = responsiveService.getSectionHeaderSizes(
    $breakpointStore, 
    customSizeMap
  );

  // Sizes individuais para cada atom
  $: headingSize = responsiveSizes.heading;
  $: subtitleSize = responsiveSizes.subtitle;
  $: descriptionSize = responsiveSizes.description;
</script>
```

### Performance

- Utiliza `matchMedia` para detecção eficiente de breakpoints
- Listeners são registrados uma única vez por instância
- Cleanup automático de listeners quando o componente é destruído
- SSR-safe com fallback para `'lg'` no servidor

## Benefícios

✅ **Responsividade automática** - Ajustes sem CSS manual  
✅ **Performance otimizada** - matchMedia ao invés de resize listeners  
✅ **Type-safe** - TypeScript com tipos completos  
✅ **Customizável** - Sobrescreva sizes por componente  
✅ **Reutilizável** - Serviço pode ser usado em outros componentes  
✅ **SSR-friendly** - Funciona corretamente no servidor  

## TextBlock Responsivo

### Configuração de Sizes

O `TextBlock` **não é responsivo abaixo de 768px** para manter a legibilidade ideal de corpo de texto. A responsividade só é ativada a partir do breakpoint `md`:

```typescript
// Abaixo de 768px (xs, sm): usa o size padrão da prop (geralmente 'md')
md: 'md'    // 768px - 1023px (breakpoint mínimo)
lg: 'md'    // 1024px - 1279px
xl: 'lg'    // 1280px - 1535px
2xl: 'lg'   // 1536px - 1919px
3xl: 'xl'   // 1920px+
```

**Por quê?** Corpo de texto em telas pequenas deve manter tamanho consistente para legibilidade. Apenas títulos (Heading) devem reduzir em mobile.

### Uso Básico

```svelte
<TextBlock
  content="Parágrafo 1\n\nParágrafo 2\n\nParágrafo 3"
  variant="paragraphs"
  responsive={true}
/>
```

### Desabilitar Responsividade

```svelte
<TextBlock
  content="Texto fixo..."
  size="lg"
  responsive={false}
/>
```

## Integração com Design System

Os sizes mapeados seguem o padrão definido em `components.ts`:

```typescript
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';
```

Todos os atoms (Heading, Text) que aceitam a prop `size` são compatíveis com este sistema.

