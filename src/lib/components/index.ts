// src/lib/components/index.ts

// ================================
// ÁTOMOS (ATOMS)
// ================================
import Icon from './atoms/Icon.svelte';
import Button from './atoms/Button.svelte';
import Logo from './atoms/Logo.svelte';
import Heading from './atoms/Heading.svelte';
import Text from './atoms/Text.svelte';
import Image from './atoms/Image.svelte';
import Avatar from './atoms/Avatar.svelte';
import Anchor from './atoms/Anchor.svelte';

// ================================
// MOLÉCULAS (MOLECULES)
// ================================
import NavItem from './molecules/NavItem.svelte';
import StatCard from './molecules/StatCard.svelte';
import FeatureCard from './molecules/FeatureCard.svelte';
import TestimonialCard from './molecules/TestimonialCard.svelte';
import SectionHeader from './molecules/SectionHeader.svelte';
import SocialLinks from './molecules/SocialLinks.svelte';

// ================================
// ORGANISMOS (ORGANISMS)
// ================================
import Navigation from './organisms/Navigation.svelte';
import HeroSection from './organisms/HeroSection.svelte';
import StatsSection from './organisms/StatsSection.svelte';
import InitiativesSection from './organisms/InitiativesSection.svelte';
import TestimonialsSection from './organisms/TestimonialsSection.svelte';
import Footer from './organisms/Footer.svelte';

// ================================
// EXPORTAÇÕES INDIVIDUAIS
// ================================
export { default as Icon } from './atoms/Icon.svelte';
export { default as Button } from './atoms/Button.svelte';
export { default as Logo } from './atoms/Logo.svelte';
export { default as Heading } from './atoms/Heading.svelte';
export { default as Text } from './atoms/Text.svelte';
export { default as Image } from './atoms/Image.svelte';
export { default as Avatar } from './atoms/Avatar.svelte';
export { default as Anchor } from './atoms/Anchor.svelte';

export { default as NavItem } from './molecules/NavItem.svelte';
export { default as StatCard } from './molecules/StatCard.svelte';
export { default as FeatureCard } from './molecules/FeatureCard.svelte';
export { default as TestimonialCard } from './molecules/TestimonialCard.svelte';
export { default as SectionHeader } from './molecules/SectionHeader.svelte';
export { default as SocialLinks } from './molecules/SocialLinks.svelte';

export { default as Navigation } from './organisms/Navigation.svelte';
export { default as HeroSection } from './organisms/HeroSection.svelte';
export { default as StatsSection } from './organisms/StatsSection.svelte';
export { default as InitiativesSection } from './organisms/InitiativesSection.svelte';
export { default as TestimonialsSection } from './organisms/TestimonialsSection.svelte';
export { default as Footer } from './organisms/Footer.svelte';

// ================================
// TIPOS DE DADOS
// ================================
export type * from '../types/components';

// ================================
// EXPORTAÇÕES AGRUPADAS COM NAMESPACES
// ================================

// Átomos
export const Atoms = {
  Icon,
  Button,
  Logo,
  Heading,
  Text,
  Image,
  Avatar,
  Anchor
} as const;

// Moléculas
export const Molecules = {
  NavItem,
  StatCard,
  FeatureCard,
  TestimonialCard,
  SectionHeader,
  SocialLinks
} as const;

// Organismos
export const Organisms = {
  Navigation,
  HeroSection,
  StatsSection,
  InitiativesSection,
  TestimonialsSection,
  Footer
} as const;

// Namespace principal Components
// 
// USO RECOMENDADO - Abordagem Namespaced (Clean Code):
// ```typescript
// import { Components } from '$lib/components';
// 
// // Usando namespaces organizados
// const { Text, Button, Icon } = Components.Atoms;
// const { NavItem, StatCard } = Components.Molecules;
// const { Navigation, Footer } = Components.Organisms;
// 
// // Ou usando destructuring direto
// const { Atoms, Molecules, Organisms } = Components;
// const { Text } = Atoms;
// const { NavItem } = Molecules;
// ```
//
// USO ALTERNATIVO - Importações individuais (Compatibilidade):
// ```typescript
// import { Text, Button, Icon } from '$lib/components';
// ```
export const Components = {
  Atoms,
  Molecules,
  Organisms,
  // Também disponível diretamente para compatibilidade
  ...Atoms,
  ...Molecules,
  ...Organisms
} as const;

// ================================
// UTILITÁRIOS DE IMPORTAÇÃO
// ================================

/**
 * Importa múltiplos componentes de uma só vez
 * @example
 * ```typescript
 * import { importComponents } from '$lib/components';
 * const { Button, Heading, Text } = importComponents(['Button', 'Heading', 'Text']);
 * ```
 */
export function importComponents<T extends keyof typeof Components>(
  componentNames: T[]
): Pick<typeof Components, T> {
  const result = {} as Pick<typeof Components, T>;
  
  for (const name of componentNames) {
    result[name] = Components[name];
  }
  
  return result;
}

/**
 * Importa todos os átomos
 */
export function importAtoms() {
  return Atoms;
}

/**
 * Importa todas as moléculas
 */
export function importMolecules() {
  return Molecules;
}

/**
 * Importa todos os organismos
 */
export function importOrganisms() {
  return Organisms;
}

// ================================
// METADADOS DOS COMPONENTES
// ================================

export const ComponentMetadata = {
  atoms: {
    Icon: {
      description: 'Componente para renderizar ícones vetoriais (SVG)',
      usage: 'Ícones de redes sociais, setas, indicadores visuais',
      examples: ['facebook', 'linkedin', 'instagram', 'arrow-up']
    },
    Button: {
      description: 'Elemento interativo para ações primárias e secundárias',
      usage: 'CTAs, navegação, formulários',
      variants: ['primary', 'secondary', 'outline', 'ghost', 'danger']
    },
    Logo: {
      description: 'Logo da organização Guardiões da Educação',
      usage: 'Cabeçalho, rodapé, branding',
      variants: ['full', 'icon-only', 'text-only']
    },
    Heading: {
      description: 'Títulos e cabeçalhos textuais com hierarquia semântica',
      usage: 'Títulos de seções, cards, páginas',
      levels: [1, 2, 3, 4, 5, 6]
    },
    Text: {
      description: 'Corpos de texto, parágrafos e descrições',
      usage: 'Conteúdo textual, descrições, labels',
      elements: ['p', 'span', 'div', 'small', 'strong', 'em', 'mark']
    },
    Image: {
      description: 'Componente para renderizar imagens com efeito halftone',
      usage: 'Ilustrações, fotos, gráficos',
      features: ['lazy loading', 'aspectRatio', 'objectFit', 'placeholder']
    },
    Avatar: {
      description: 'Imagem de perfil para representar usuários',
      usage: 'Depoimentos, perfis, autores',
      shapes: ['circle', 'square', 'rounded']
    }
  },
  molecules: {
    NavItem: {
      description: 'Item clicável na barra de navegação',
      usage: 'Navegação principal, menus',
      features: ['active state', 'external links', 'badges']
    },
    StatCard: {
      description: 'Exibe métrica de impacto com ícone e valor',
      usage: 'Estatísticas, KPIs, métricas de impacto',
      variants: ['default', 'minimal', 'highlighted']
    },
    FeatureCard: {
      description: 'Card que detalha uma iniciativa ou funcionalidade',
      usage: 'Programas, serviços, features',
      orientations: ['vertical', 'horizontal']
    },
    TestimonialCard: {
      description: 'Apresenta depoimento de cliente ou usuário',
      usage: 'Prova social, feedback, casos de sucesso',
      variants: ['card', 'minimal', 'bordered']
    },
    SectionHeader: {
      description: 'Título padronizado para seções de conteúdo',
      usage: 'Início de seções, organizador de conteúdo',
      alignments: ['left', 'center', 'right']
    },
    SocialLinks: {
      description: 'Agrupamento de ícones de redes sociais',
      usage: 'Rodapé, contato, compartilhamento',
      platforms: ['facebook', 'linkedin', 'instagram', 'twitter']
    }
  },
  organisms: {
    Navigation: {
      description: 'Cabeçalho principal da página',
      usage: 'Navegação principal, branding, CTAs',
      variants: ['default', 'transparent', 'minimal']
    },
    HeroSection: {
      description: 'Primeira seção visível para capturar atenção',
      usage: 'Página inicial, landing pages',
      layouts: ['centered', 'left', 'right', 'split']
    },
    StatsSection: {
      description: 'Seção que exibe métricas de impacto',
      usage: 'Números da empresa, resultados, conquistas',
      layouts: ['grid', 'horizontal', 'carousel']
    },
    InitiativesSection: {
      description: 'Apresenta principais iniciativas da organização',
      usage: 'Programas, serviços, produtos',
      features: ['filtros', 'categorias', 'destaque']
    },
    TestimonialsSection: {
      description: 'Exibe depoimentos para prova social',
      usage: 'Credibilidade, casos de sucesso',
      layouts: ['grid', 'carousel', 'masonry']
    },
    Footer: {
      description: 'Rodapé com informações e links',
      usage: 'Fim de página, links secundários, contato',
      variants: ['simple', 'detailed', 'minimal']
    }
  }
} as const;

// ================================
// CONFIGURAÇÕES E CONSTANTES
// ================================

export const DESIGN_TOKENS = {
  colors: {
    primary: 'var(--color-primary-500)',
    secondary: 'var(--color-secondary-500)',
    accent: 'var(--color-accent-500)',
    neutral: 'var(--color-neutral-500)'
  },
  spacing: {
    xs: 'var(--spacing-xs)',
    sm: 'var(--spacing-sm)',
    md: 'var(--spacing-md)',
    lg: 'var(--spacing-lg)',
    xl: 'var(--spacing-xl)'
  },
  typography: {
    fontFamily: 'var(--font-family-sans)',
    fontSize: {
      xs: 'var(--font-size-xs)',
      sm: 'var(--font-size-sm)',
      md: 'var(--font-size-md)',
      lg: 'var(--font-size-lg)',
      xl: 'var(--font-size-xl)'
    }
  },
  borderRadius: {
    sm: 'var(--border-radius-sm)',
    md: 'var(--border-radius-md)',
    lg: 'var(--border-radius-lg)',
    xl: 'var(--border-radius-xl)',
    full: 'var(--border-radius-full)'
  },
  shadows: {
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)'
  }
} as const;

export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px'
} as const;

// ================================
// VALIDAÇÕES E HELPERS
// ================================

/**
 * Verifica se um componente existe
 */
export function componentExists(name: string): name is keyof typeof Components {
  return name in Components;
}

/**
 * Lista todos os nomes de componentes disponíveis
 */
export function getComponentNames(): Array<keyof typeof Components> {
  return Object.keys(Components) as Array<keyof typeof Components>;
}

/**
 * Obtém metadados de um componente
 */
export function getComponentMetadata(name: keyof typeof Components) {
  // Busca em atoms, molecules, organisms
  for (const [category, components] of Object.entries(ComponentMetadata)) {
    if (name in components) {
      const componentData = components[name as keyof typeof components] as Record<string, unknown>;
      return {
        category,
        ...componentData
      };
    }
  }
  return null;
}