// src/lib/constants/api.ts

// Constantes de API e configurações de requisições

// Base URLs
export const API_BASE_URL = 'http://localhost:5173/api';
export const EXTERNAL_API_BASE_URL = 'https://api.geduc.org.br/v1';

// Endpoints da API interna (mock)
export const API_ENDPOINTS = {
  // Dados principais
  TEAM_MEMBERS: '/team-members',
  INITIATIVES: '/initiatives',
  TESTIMONIALS: '/testimonials',
  FAQ: '/faq',
  FEATURED_MEDIA: '/featured-media',
  PARTNERS: '/partners',
  
  // Autenticação (se implementado futuramente)
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  
  // Formulários
  CONTACT: '/contact',
  NEWSLETTER: '/newsletter',
  FEEDBACK: '/feedback',
  
  // Busca
  SEARCH: '/search',
  SUGGESTIONS: '/search/suggestions',
  
  // Métricas (se implementado)
  ANALYTICS: '/analytics',
  EVENTS: '/events'
} as const;

// Configurações de requisição HTTP
export const HTTP_CONFIG = {
  TIMEOUT: 10000, // 10 segundos
  RETRIES: 3,
  RETRY_DELAY: 1000, // 1 segundo
  CACHE_TTL: 5 * 60 * 1000, // 5 minutos
  
  // Headers padrão
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  
  // Status codes de sucesso
  SUCCESS_CODES: [200, 201, 202, 204],
  
  // Status codes que devem ser retentados
  RETRY_CODES: [408, 429, 500, 502, 503, 504],
  
  // Status codes de erro do cliente
  CLIENT_ERROR_CODES: [400, 401, 403, 404, 422],
  
  // Status codes de erro do servidor
  SERVER_ERROR_CODES: [500, 501, 502, 503, 504]
} as const;

// Configurações de cache
export const CACHE_CONFIG = {
  // TTL para diferentes tipos de dados (em millisegundos)
  TTL: {
    TEAM_MEMBERS: 10 * 60 * 1000, // 10 minutos
    INITIATIVES: 5 * 60 * 1000,   // 5 minutos
    TESTIMONIALS: 15 * 60 * 1000, // 15 minutos
    FAQ: 30 * 60 * 1000,          // 30 minutos
    FEATURED_MEDIA: 5 * 60 * 1000, // 5 minutos
    PARTNERS: 60 * 60 * 1000,     // 1 hora
    STATIC_CONTENT: 24 * 60 * 60 * 1000, // 24 horas
    FAQ_ITEMS: 30 * 60 * 1000,    // 30 minutos
  },
  
  // Prefixos para chaves de cache
  KEYS: {
    TEAM_MEMBERS: 'team_members',
    INITIATIVES: 'initiatives',
    TESTIMONIALS: 'testimonials',
    FAQ: 'faq',
    FEATURED_MEDIA: 'featured_media',
    PARTNERS: 'partners',
    SEARCH: 'search',
    USER_PREFERENCES: 'user_prefs'
  },
  
  // Tamanho máximo do cache (número de entradas)
  MAX_SIZE: 100,
  
  // Estratégia de limpeza do cache
  CLEANUP_STRATEGY: 'lru' as const // Least Recently Used
} as const;

// Configurações de rate limiting (para APIs externas)
export const RATE_LIMIT_CONFIG = {
  // Requisições por minuto
  REQUESTS_PER_MINUTE: 60,
  
  // Burst size (requisições em rajada)
  BURST_SIZE: 10,
  
  // Janela de tempo para rate limiting (em millisegundos)
  WINDOW_SIZE: 60 * 1000, // 1 minuto
  
  // Headers de rate limit
  HEADERS: {
    LIMIT: 'X-RateLimit-Limit',
    REMAINING: 'X-RateLimit-Remaining',
    RESET: 'X-RateLimit-Reset',
    RETRY_AFTER: 'Retry-After'
  }
} as const;

// URLs para serviços externos
export const EXTERNAL_SERVICES = {
  // CDN para imagens
  IMAGE_CDN: 'https://cdn.geduc.org.br',
  
  // Analytics
  GOOGLE_ANALYTICS: 'https://www.googletagmanager.com/gtag/js',
  
  // Mapas
  GOOGLE_MAPS_API: 'https://maps.googleapis.com/maps/api/js',
  
  // Fontes
  GOOGLE_FONTS: 'https://fonts.googleapis.com/css2',
  
  // Redes sociais (para compartilhamento)
  SOCIAL_SHARE: {
    FACEBOOK: 'https://www.facebook.com/sharer/sharer.php',
    TWITTER: 'https://twitter.com/intent/tweet',
    LINKEDIN: 'https://www.linkedin.com/sharing/share-offsite',
    WHATSAPP: 'https://wa.me/'
  }
} as const;

// Configurações de webhook (para formulários)
export const WEBHOOK_CONFIG = {
  // Endpoints para processamento de formulários
  CONTACT_FORM: 'https://formspree.io/f/your-form-id',
  NEWSLETTER: 'https://api.mailchimp.com/3.0/lists/your-list-id/members',
  
  // Timeout para webhooks
  TIMEOUT: 5000,
  
  // Configuração de retry para webhooks
  RETRIES: 2,
  RETRY_DELAY: 2000
} as const;

// Mock data configuration (para desenvolvimento)
export const MOCK_CONFIG = {
  // Delay artificial para simular latência de rede
  NETWORK_DELAY: {
    MIN: 200,  // 200ms mínimo
    MAX: 800   // 800ms máximo
  },
  
  // Chance de erro simulado (0-1)
  ERROR_RATE: 0.05, // 5% de chance de erro
  
  // Tamanho de dados simulados
  DATA_SIZE: {
    TEAM_MEMBERS: 12,
    INITIATIVES: 15,
    TESTIMONIALS: 8,
    FAQ_ITEMS: 20,
    PARTNERS: 10
  },
  
  // Simular dados em tempo real
  REAL_TIME_UPDATES: false
} as const;