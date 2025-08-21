// src/lib/types/components.ts
import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { InitiativeCategory } from './enums';

// ================================
// TIPOS BASE E UTILITÁRIOS
// ================================

/**
 * Tamanhos padrão utilizados em toda a aplicação
 */
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl';

/**
 * Variantes de cores semânticas
 */
export type ColorVariant = 
  | 'primary' 
  | 'secondary' 
  | 'accent' 
  | 'neutral' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

/**
 * Pesos de fonte disponíveis
 */
export type FontWeight = 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

/**
 * Alinhamentos de texto
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * Níveis de heading HTML
 */
export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Temas de cor disponíveis
 */
export type Theme = 'light' | 'dark' | 'auto';

/**
 * Direções de orientação
 */
export type Orientation = 'horizontal' | 'vertical';

/**
 * Posições de elementos
 */
export type Position = 'top' | 'bottom' | 'left' | 'right';

/**
 * Proporções de aspecto para mídia
 */
export type AspectRatio = 'square' | '16/9' | '4/3' | '3/2' | 'auto';

// ================================
// PROPS BASE APRIMORADO
// ================================

/**
 * Props base compartilhado por todos os componentes da aplicação
 * Inclui atributos HTML padrão, acessibilidade e funcionalidades comuns
 */
export interface BaseComponentProps extends HTMLAttributes<HTMLElement> {
  /** Classes CSS customizadas */
  class?: string;
  
  /** ID único do elemento */
  id?: string;
  
  /** Atributo para testes automatizados */
  'data-testid'?: string;
  
  /** Atributo customizado para tracking/analytics */
  'data-tracking'?: string;
  
  /** Se o componente deve ser renderizado condicionalmente */
  visible?: boolean;
  
  /** Label para acessibilidade */
  'aria-label'?: string;
  
  /** Descrição para acessibilidade */
  'aria-describedby'?: string;
  
  /** Se o elemento deve ser ignorado por screen readers */
  'aria-hidden'?: boolean;
}

/**
 * Props para componentes que podem atuar como links
 */
export interface LinkableProps {
  /** URL de destino */
  href?: string;
  
  /** Se deve abrir em nova aba */
  target?: '_blank' | '_self' | '_parent' | '_top';
  
  /** Relação do link (security) */
  rel?: string;
  
  /** Se é um link externo */
  external?: boolean;
  
  /** Se deve fazer download do recurso */
  download?: boolean | string;
}

/**
 * Props para componentes com conteúdo de mídia
 */
export interface MediaProps {
  /** URL da mídia */
  src: string;
  
  /** Texto alternativo */
  alt: string;
  
  /** Largura */
  width?: number | string;
  
  /** Altura */
  height?: number | string;
  
  /** Proporção de aspecto */
  aspectRatio?: AspectRatio;
  
  /** Como ajustar a imagem */
  objectFit?: 'cover' | 'contain' | 'fill' | 'scale-down' | 'none';
  
  /** Estratégia de carregamento */
  loading?: 'lazy' | 'eager';
  
  /** Se é uma imagem prioritária (LCP) */
  priority?: boolean;
  
  /** Placeholder durante carregamento */
  placeholder?: string;
}

// ================================
// ÁTOMOS
// ================================

export interface IconProps extends BaseComponentProps {
  /** Nome do ícone */
  name: string;
  
  /** Tamanho do ícone */
  size?: Size | number;
  
  /** Cor do ícone */
  color?: ColorVariant | string;
  
  /** Título para acessibilidade */
  title?: string;
  
  /** Se é apenas decorativo */
  decorative?: boolean;
  
  /** Rotação em graus */
  rotation?: number;
  
  /** Se deve ter animação */
  animated?: boolean;
}

export interface ButtonProps extends BaseComponentProps, Partial<LinkableProps> {
  /** Variante visual do botão */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  
  /** Tamanho do botão */
  size?: Size;
  
  /** Se está desabilitado */
  disabled?: boolean;
  
  /** Se está em estado de carregamento */
  loading?: boolean;
  
  /** Tipo do botão (quando usado como button) */
  type?: 'button' | 'submit' | 'reset';
  
  /** Ícone do botão */
  icon?: string;
  
  /** Posição do ícone */
  iconPosition?: 'left' | 'right';
  
  /** Se deve ocupar toda a largura disponível */
  fullWidth?: boolean;
  
  /** Conteúdo do botão */
  children: Snippet;
}

export interface LogoProps extends BaseComponentProps, Partial<LinkableProps> {
  /** Variante do logo */
  variant?: 'full' | 'icon-only' | 'text-only';
  
  /** Tema de cor */
  theme?: Theme;
  
  /** Tamanho do logo */
  size?: Size;
  
  /** Se é interativo (clicável) */
  interactive?: boolean;
}

export interface HeadingProps extends BaseComponentProps {
  /** Nível semântico do heading */
  level: HeadingLevel;
  
  /** Tamanho visual (pode diferir do nível semântico) */
  size?: Size;
  
  /** Peso da fonte */
  weight?: FontWeight;
  
  /** Cor do texto */
  color?: ColorVariant | string;
  
  /** Alinhamento do texto */
  align?: TextAlign;
  
  /** Se deve ter efeito gradient */
  gradient?: boolean;
  
  /** Conteúdo do heading */
  children: Snippet;
}

export interface TextProps extends BaseComponentProps {
  /** Tag HTML a ser renderizada */
  as?: 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'mark' | 'blockquote' | 'cite' | 'time';
  
  /** Tamanho do texto */
  size?: Size;
  
  /** Peso da fonte */
  weight?: FontWeight;
  
  /** Cor do texto */
  color?: ColorVariant | string;
  
  /** Alinhamento do texto */
  align?: TextAlign;
  
  /** Altura da linha */
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
  
  /** Se deve truncar o texto */
  truncate?: boolean;
  
  /** Número máximo de linhas */
  maxLines?: number;
  
  /** Conteúdo do texto */
  children: Snippet;
}

export interface AnchorProps extends BaseComponentProps, LinkableProps {
  /** Tamanho do texto */
  size?: Size;
  
  /** Peso da fonte */
  weight?: FontWeight;
  
  /** Cor do texto */
  color?: ColorVariant | string;
  
  /** Alinhamento do texto */
  align?: TextAlign;
  
  /** Altura da linha */
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
  
  /** Se deve truncar o texto */
  truncate?: boolean;
  
  /** Número máximo de linhas */
  maxLines?: number;
  
  /** Variante visual do link */
  variant?: 'default' | 'underline' | 'button' | 'minimal';
  
  /** Se deve mostrar ícone de link externo */
  showExternalIcon?: boolean;
  
  /** Conteúdo do link */
  children: Snippet;
}

export interface ImageProps extends MediaProps {
  /** Callback quando a imagem carrega */
  onload?: () => void;
  
  /** Callback quando há erro no carregamento */
  onerror?: () => void;
}

export interface AvatarProps extends BaseComponentProps {
  /** URL da imagem */
  src?: string;
  
  /** Texto alternativo */
  alt: string;
  
  /** Tamanho do avatar */
  size?: Size;
  
  /** Texto de fallback (iniciais) */
  fallback?: string;
  
  /** Formato do avatar */
  shape?: 'circle' | 'square' | 'rounded';
  
  /** Se deve ter borda */
  border?: boolean;
  
  /** Status indicator */
  status?: 'online' | 'offline' | 'away' | 'busy';
}

// ================================
// MOLÉCULAS
// ================================

export interface NavItemProps extends BaseComponentProps, LinkableProps {
  /** Se o item está ativo */
  active?: boolean;
  
  /** Se está desabilitado */
  disabled?: boolean;
  
  /** Badge/contador */
  badge?: string | number;
  
  /** Ícone do item */
  icon?: string;
  
  /** Conteúdo do item */
  children: Snippet;
}

export interface StatCardProps extends BaseComponentProps {
  /** Valor principal da estatística */
  value: string | number;
  
  /** Label da estatística */
  label: string;
  
  /** Descrição adicional */
  description?: string;
  
  /** Ícone da estatística */
  icon?: {
    name: string;
    color?: ColorVariant;
  };
  
  /** Tendência (para mostrar crescimento/queda) */
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'neutral';
    label?: string;
  };
  
  /** Cor tema do card */
  color?: ColorVariant;
  
  /** Tamanho do card */
  size?: Size;
  
  /** Variante visual */
  variant?: 'default' | 'minimal' | 'highlighted';
}

export interface FeatureCardProps extends BaseComponentProps, Partial<LinkableProps> {
  /** Título do feature */
  title: string;
  
  /** Descrição do feature */
  description: string;
  
  /** Ilustração/imagem */
  illustration?: MediaProps;
  
  /** Variante visual */
  variant?: 'default' | 'highlighted' | 'minimal';
  
  /** Orientação do layout */
  orientation?: Orientation;
  
  /** Se é interativo (hover effects) */
  interactive?: boolean;
}

export interface TestimonialCardProps extends BaseComponentProps {
  /** Texto do depoimento */
  quote: string;
  
  /** Dados do autor */
  author: {
    name: string;
    title: string;
    avatar?: string;
    company?: string;
  };
  
  /** Avaliação em estrelas */
  rating?: 1 | 2 | 3 | 4 | 5;
  
  /** Se é um depoimento em destaque */
  featured?: boolean;
  
  /** Variante visual */
  variant?: 'card' | 'minimal' | 'bordered';
  
  /** Data do depoimento */
  date?: string;
}

export interface SectionHeaderProps extends BaseComponentProps {
  /** Título principal */
  title: string;
  
  /** Subtítulo */
  subtitle?: string;
  
  /** Descrição expandida */
  description?: string;
  
  /** Alinhamento do conteúdo */
  align?: TextAlign;
  
  /** Espaçamento interno */
  spacing?: 'tight' | 'normal' | 'loose';
  
  /** Se deve ter elementos decorativos */
  decorative?: boolean;
  
  /** Ações adicionais (botões, links) */
  actions?: Snippet;
}

export interface SocialLinksProps extends BaseComponentProps {
  /** Lista de links sociais */
  links: Array<{
    platform: 'facebook' | 'linkedin' | 'instagram' | 'twitter' | 'youtube' | 'tiktok' | 'whatsapp';
    url: string;
    label?: string;
  }>;
  
  /** Tamanho dos ícones */
  size?: Size;
  
  /** Variante visual */
  variant?: 'icons' | 'buttons' | 'minimal';
  
  /** Orientação */
  orientation?: Orientation;
  
  /** Se deve mostrar labels */
  showLabels?: boolean;
}

export interface TextBlockProps extends BaseComponentProps {
  /** Conteúdo do texto com quebras de linha */
  content: string;
  
  /** Variante de renderização */
  variant?: 'paragraphs' | 'list' | 'cards';
  
  /** Espaçamento entre elementos */
  spacing?: 'tight' | 'normal' | 'loose';
  
  /** Alinhamento do texto */
  align?: TextAlign;
  
  /** Tamanho do texto */
  size?: Size;
  
  /** Cor do texto */
  color?: ColorVariant | string;
  
  /** Peso da fonte */
  weight?: FontWeight;
  
  /** Altura da linha */
  leading?: 'tight' | 'normal' | 'relaxed' | 'loose';
}

// ================================
// ORGANISMOS
// ================================

export interface NavigationProps extends BaseComponentProps {
  /** Items de navegação */
  items: Array<{
    label: string;
    href: string;
    external?: boolean;
    active?: boolean;
    children?: Array<{
      label: string;
      href: string;
      external?: boolean;
    }>;
  }>;
  
  /** Configuração do logo */
  logo?: {
    src: string;
    alt: string;
    href: string;
  };
  
  /** Call-to-action principal */
  cta?: {
    label: string;
    href: string;
    variant?: ButtonProps['variant'];
  };
  
  /** Variante visual */
  variant?: 'default' | 'transparent' | 'minimal';
  
  /** Se deve ser sticky */
  sticky?: boolean;
  
  /** Se deve mostrar menu mobile */
  mobileMenu?: boolean;
}

export interface HeroSectionProps extends BaseComponentProps {
  /** Título principal */
  title: string;
  
  /** Subtítulo */
  subtitle?: string;
  
  /** Descrição */
  description?: string;
  
  /** Botões de ação */
  actions?: Array<{
    label: string;
    href?: string;
    variant?: ButtonProps['variant'];
    onclick?: () => void;
  }>;
  
  /** Mídia do hero */
  media?: {
    type: 'image' | 'video' | 'illustration';
    src: string;
    alt?: string;
    poster?: string;
  };
  
  /** Background do hero */
  background?: {
    type: 'color' | 'gradient' | 'image';
    value: string;
  };
  
  /** Layout do hero */
  layout?: 'centered' | 'left' | 'right' | 'split';
  
  /** Tamanho do hero */
  size?: Size;
  
  /** Elementos decorativos */
  decorative?: boolean;
}

export interface StatsSectionProps extends BaseComponentProps {
  /** Lista de estatísticas */
  stats: Array<{
    value: string | number;
    label: string;
    description?: string;
    icon?: { name: string; color?: ColorVariant; };
    color?: ColorVariant;
  }>;
  
  /** Layout das estatísticas */
  layout?: 'grid' | 'horizontal' | 'carousel';
  
  /** Número de colunas no grid */
  columns?: 2 | 3 | 4 | 5 | 6;
  
  /** Background da seção */
  background?: 'none' | 'muted' | 'primary' | 'gradient';
  
  /** Se deve ter animação de contador */
  animated?: boolean;
}

export interface OurImpactProps extends BaseComponentProps {
  /** Título da seção */
  title?: string;
  
  /** Descrição da seção */
  description?: string;
  
  /** Texto específico sobre o impacto */
  impactText?: string;
  
  /** Background da seção */
  background?: 'none' | 'muted' | 'primary' | 'gradient';
  
  /** Layout da seção */
  layout?: 'default' | 'split';
  
  /** Se o componente deve ser renderizado condicionalmente */
  visible?: boolean;
}

export interface InitiativesSectionProps extends BaseComponentProps {
  /** Título da seção */
  title?: string;
  
  /** Descrição da seção */
  description?: string;
  
  /** Lista de iniciativas */
  initiatives: Array<{
    id: string;
    title: string;
    description: string;
    category?: InitiativeCategory | string;
    illustration?: MediaProps;
    href?: string;
    featured?: boolean;
  }>;
  
  /** Layout das iniciativas */
  layout?: 'grid' | 'carousel' | 'masonry';
  
  /** Número de colunas */
  columns?: 2 | 3 | 4;
  
  /** Se deve ter filtros */
  filterable?: boolean;
  
  /** Categorias para filtro */
  categories?: Array<{
    id: string;
    label: string;
  }>;
}

export interface TestimonialsSectionProps extends BaseComponentProps {
  /** Título da seção */
  title?: string;
  
  /** Descrição da seção */
  description?: string;
  
  /** Lista de depoimentos */
  testimonials: Array<{
    id: string;
    quote: string;
    author: {
      name: string;
      title: string;
      avatar?: string;
      company?: string;
    };
    rating?: number;
    featured?: boolean;
    date?: string;
  }>;
  
  /** Layout dos depoimentos */
  layout: 'grid' | 'carousel' | 'masonry';
  
  /** Número de colunas */
  columns: 1 | 2 | 3;
  
  /** Se deve reproduzir automaticamente (carousel) */
  autoplay: boolean;
  
  /** Intervalo do autoplay em ms */
  autoplayInterval: number;
  
  /** Se deve mostrar navegação */
  navigation?: boolean;
  
  /** Se deve mostrar indicadores */
  indicators?: boolean;
}

export interface FooterProps extends BaseComponentProps {
  /** Configuração do logo */
  logo?: {
    src: string;
    alt: string;
    href: string;
  };
  
  /** Descrição da organização */
  description?: string;
  
  /** Informações de contato */
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  
  /** Links de redes sociais */
  social?: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
  
  /** Grupos de links */
  links?: Array<{
    title: string;
    items: Array<{
      label: string;
      href: string;
      external?: boolean;
    }>;
  }>;
  
  /** Newsletter signup */
  newsletter?: {
    title: string;
    description?: string;
    placeholder?: string;
    onSubmit?: (email: string) => void;
  };
  
  /** Texto de copyright */
  copyright?: string;
  
  /** Se deve ter botão "voltar ao topo" */
  backToTop?: boolean;
  
  /** Variante visual */
  variant?: 'simple' | 'detailed' | 'minimal';
}

// ================================
// UTILITÁRIOS E FORMULÁRIOS
// ================================

export interface InputProps extends BaseComponentProps {
  /** Tipo do input */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number';
  
  /** Placeholder */
  placeholder?: string;
  
  /** Valor atual */
  value?: string;
  
  /** Se está desabilitado */
  disabled?: boolean;
  
  /** Se é readonly */
  readonly?: boolean;
  
  /** Se é obrigatório */
  required?: boolean;
  
  /** Mensagem de erro */
  error?: string;
  
  /** Label do campo */
  label?: string;
  
  /** Texto de ajuda */
  helpText?: string;
  
  /** Ícone do campo */
  icon?: string;
  
  /** Posição do ícone */
  iconPosition?: 'left' | 'right';
  
  /** Tamanho do campo */
  size?: Size;
  
  /** Callbacks customizados */
  onInputChange?: (value: string) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps extends BaseComponentProps {
  /** Opções do select */
  options: SelectOption[];
  
  /** Valor selecionado */
  value?: string | string[];
  
  /** Placeholder */
  placeholder?: string;
  
  /** Se está desabilitado */
  disabled?: boolean;
  
  /** Se é obrigatório */
  required?: boolean;
  
  /** Mensagem de erro */
  error?: string;
  
  /** Label do campo */
  label?: string;
  
  /** Texto de ajuda */
  helpText?: string;
  
  /** Se permite seleção múltipla */
  multiple?: boolean;
  
  /** Se é pesquisável */
  searchable?: boolean;
  
  /** Tamanho do campo */
  size?: Size;
  
  /** Callback de mudança customizado */
  onSelectChange?: (value: string | string[]) => void;
}

export interface ModalProps extends BaseComponentProps {
  /** Se está aberto */
  open: boolean;
  
  /** Callback para fechar */
  onClose: () => void;
  
  /** Título do modal */
  title?: string;
  
  /** Tamanho do modal */
  size?: Size | 'auto';
  
  /** Se deve fechar ao clicar no overlay */
  closeOnOverlay?: boolean;
  
  /** Se deve fechar ao pressionar ESC */
  closeOnEscape?: boolean;
  
  /** Se deve ter backdrop blur */
  blur?: boolean;
  
  /** Conteúdo do modal */
  children: Snippet;
  
  /** Ações do modal (footer) */
  actions?: Snippet<[{ close: () => void }]>;
}

export interface CarouselItem {
  id: string;
  [key: string]: unknown;
}

export interface CarouselProps extends BaseComponentProps {
  /** Items do carousel */
  items: CarouselItem[];
  
  /** Se deve reproduzir automaticamente */
  autoplay?: boolean;
  
  /** Intervalo do autoplay */
  autoplayInterval?: number;
  
  /** Se deve mostrar indicadores */
  showIndicators?: boolean;
  
  /** Se deve mostrar setas de navegação */
  showArrows?: boolean;
  
  /** Número de slides visíveis */
  slidesToShow?: number;
  
  /** Número de slides a rolar */
  slidesToScroll?: number;
  
  /** Se é infinito */
  infinite?: boolean;
  
  /** Breakpoints responsivos */
  responsive?: Array<{
    breakpoint: number;
    settings: Partial<CarouselProps>;
  }>;
  
  /** Template para renderizar cada item */
  itemTemplate: Snippet<[{ item: CarouselItem; index: number }]>;
}

// ================================
// TEMPLATES E LAYOUTS
// ================================

export interface PageLayoutProps extends BaseComponentProps {
  /** Configurações de meta tags */
  meta?: {
    title?: string;
    description?: string;
    keywords?: string[];
    image?: string;
    canonical?: string;
  };
  
  /** Se deve mostrar header */
  showHeader?: boolean;
  
  /** Se deve mostrar footer */
  showFooter?: boolean;
  
  /** Configuração do container */
  container?: {
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    padding?: Size;
  };
  
  /** Conteúdo da página */
  children: Snippet;
}

export interface HomePageProps {
  /** Dados do hero */
  hero: HeroSectionProps;
  
  /** Dados das estatísticas */
  stats: StatsSectionProps;
  
  /** Dados da seção sobre */
  about: {
    title: string;
    description: string;
    media?: MediaProps;
    actions?: Array<{ label: string; href: string; }>;
  };
  
  /** Dados das iniciativas */
  initiatives: InitiativesSectionProps;
  
  /** Dados dos depoimentos */
  testimonials: TestimonialsSectionProps;
  
  /** Meta dados da página */
  meta: {
    title: string;
    description: string;
    keywords?: string[];
    image?: string;
  };
}