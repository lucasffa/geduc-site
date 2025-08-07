// src/lib/constants/ui.ts

// Constantes de interface e configurações de UI

// Configurações de paginação
export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 12,
  TEAM_PAGE_SIZE: 8,
  INITIATIVES_PAGE_SIZE: 9,
  TESTIMONIALS_PAGE_SIZE: 6,
  FAQ_PAGE_SIZE: 10
} as const;

// Configurações de carrossel
export const CAROUSEL_CONFIG = {
  AUTO_PLAY_INTERVAL: 5000,
  ANIMATION_DURATION: 300,
  SLIDES_TO_SHOW: {
    MOBILE: 1,
    TABLET: 2,
    DESKTOP: 3
  },
  INFINITE_SCROLL: true,
  SHOW_DOTS: true,
  SHOW_ARROWS: true
} as const;

// Configurações de pesquisa
export const SEARCH_CONFIG = {
  MIN_SEARCH_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  MAX_RESULTS: 50,
  HIGHLIGHT_MATCHES: true
} as const;

// Configurações de notificação/toast
export const NOTIFICATION_CONFIG = {
  DEFAULT_DURATION: 5000,
  SUCCESS_DURATION: 3000,
  ERROR_DURATION: 7000,
  WARNING_DURATION: 5000,
  INFO_DURATION: 4000,
  MAX_NOTIFICATIONS: 3,
  POSITION: 'top-right' as const
} as const;

// Configurações de modal
export const MODAL_CONFIG = {
  CLOSE_ON_OVERLAY: true,
  CLOSE_ON_ESCAPE: true,
  FOCUS_TRAP: true,
  ANIMATION_DURATION: 200,
  BACKDROP_BLUR: true
} as const;

// Configurações de formulário
export const FORM_CONFIG = {
  VALIDATION_DELAY: 500,
  AUTO_SAVE_DELAY: 2000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword', 'text/plain']
} as const;

// Configurações de scroll
export const SCROLL_CONFIG = {
  SMOOTH_SCROLL: true,
  SCROLL_THRESHOLD: 100,
  BACK_TO_TOP_THRESHOLD: 300,
  HEADER_HIDE_THRESHOLD: 200,
  INTERSECTION_THRESHOLD: 0.1
} as const;

// Configurações de breakpoints (devem coincidir com CSS)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
} as const;

// Configurações de animação
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 150,
    NORMAL: 250,
    SLOW: 350
  },
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    IN: 'cubic-bezier(0.4, 0, 1, 1)',
    OUT: 'cubic-bezier(0, 0, 0.2, 1)',
    IN_OUT: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  STAGGER_DELAY: 100,
  PARALLAX_SPEED: 0.5
} as const;

// Textos padrão da aplicação
export const DEFAULT_TEXTS = {
  LOADING: 'Carregando...',
  ERROR: 'Ops! Algo deu errado.',
  EMPTY_STATE: 'Nenhum item encontrado.',
  RETRY: 'Tentar novamente',
  LOAD_MORE: 'Carregar mais',
  SEE_ALL: 'Ver todos',
  READ_MORE: 'Leia mais',
  LEARN_MORE: 'Saiba mais',
  CONTACT_US: 'Fale conosco',
  BACK_TO_TOP: 'Voltar ao topo',
  CLOSE: 'Fechar',
  OPEN: 'Abrir',
  SEARCH_PLACEHOLDER: 'Pesquisar...',
  NO_RESULTS: 'Nenhum resultado encontrado.',
  FILTER_BY: 'Filtrar por',
  SORT_BY: 'Ordenar por',
  CLEAR_FILTERS: 'Limpar filtros',
  NEWSLETTER_PLACEHOLDER: 'Seu e-mail...',
  NEWSLETTER_BUTTON: 'Inscrever-se',
  REQUIRED_FIELD: 'Campo obrigatório',
  INVALID_EMAIL: 'E-mail inválido',
  SUCCESS_MESSAGE: 'Operação realizada com sucesso!',
  ERROR_MESSAGE: 'Erro ao realizar operação. Tente novamente.',
  COPYRIGHT: `© ${new Date().getFullYear()} GEDUC. Todos os direitos reservados.`,
  MADE_WITH_LOVE: 'Feito com ❤️ em São Paulo'
} as const;

// Labels para acessibilidade
export const A11Y_LABELS = {
  SKIP_TO_CONTENT: 'Pular para o conteúdo',
  OPEN_MENU: 'Abrir menu',
  CLOSE_MENU: 'Fechar menu',
  OPEN_SEARCH: 'Abrir busca',
  CLOSE_SEARCH: 'Fechar busca',
  PREVIOUS_SLIDE: 'Slide anterior',
  NEXT_SLIDE: 'Próximo slide',
  PLAY_CAROUSEL: 'Reproduzir carrossel',
  PAUSE_CAROUSEL: 'Pausar carrossel',
  EXPAND_ACCORDION: 'Expandir item',
  COLLAPSE_ACCORDION: 'Recolher item',
  EXTERNAL_LINK: 'Abre em nova aba',
  SOCIAL_LINK: (platform: string) => `Seguir no ${platform}`,
  DOWNLOAD_FILE: 'Baixar arquivo',
  SHARE_CONTENT: 'Compartilhar conteúdo',
  LOADING_CONTENT: 'Carregando conteúdo',
  LOGO_ALT: 'GEDUC - Logotipo',
  AVATAR_ALT: (name: string) => `Foto de ${name}`,
  DECORATIVE_IMAGE: 'Imagem decorativa'
} as const;

// Configurações de SEO padrão
export const SEO_DEFAULTS = {
  TITLE_TEMPLATE: '%s | GEDUC',
  DEFAULT_TITLE: 'GEDUC - Transformando a Educação no Brasil',
  DEFAULT_DESCRIPTION: 'Educação inclusiva e humanizada.',
  DEFAULT_KEYWORDS: ['educação', 'tecnologia', 'inovação', 'ensino', 'aprendizado', 'digital'],
  SITE_NAME: 'GEDUC',
  LOCALE: 'pt_BR',
  TYPE: 'website',
  TWITTER_HANDLE: '@geduc',
  OG_IMAGE_WIDTH: 1200,
  OG_IMAGE_HEIGHT: 630
} as const;

// Configurações de tema
export const THEME_CONFIG = {
  DEFAULT_THEME: 'light' as const,
  STORAGE_KEY: 'geduc-theme',
  SYSTEM_PREFERENCE_MEDIA: '(prefers-color-scheme: dark)',
  TRANSITION_DURATION: 200
} as const;

// Configurações de cookies e privacidade
export const PRIVACY_CONFIG = {
  COOKIE_CONSENT_KEY: 'geduc-cookie-consent',
  NEWSLETTER_CONSENT_KEY: 'geduc-newsletter-consent',
  ANALYTICS_CONSENT_KEY: 'geduc-analytics-consent',
  CONSENT_EXPIRY_DAYS: 365,
  PRIVACY_POLICY_VERSION: '1.0.0',
  TERMS_VERSION: '1.0.0'
} as const;