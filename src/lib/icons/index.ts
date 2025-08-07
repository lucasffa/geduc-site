// Export barrel para todos os ícones da aplicação

// Ícones de redes sociais
export * from './social';

// Ícones de interface
export * from './ui';

// Ícones de categorias
export * from './categories';

// Mapa de ícones para facilitar uso dinâmico
import * as socialIcons from './social';
import * as uiIcons from './ui';
import * as categoryIcons from './categories';

export const iconMap = {
  ...socialIcons,
  ...uiIcons,
  ...categoryIcons,
} as const;

export type IconName = keyof typeof iconMap;