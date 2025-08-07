// src/lib/utils/api.ts

// Utilitários para requisições de API

import { HTTP_CONFIG, CACHE_CONFIG, MOCK_CONFIG } from '$lib/constants/api';
import { generateId, sleep, retry } from './helpers';

// Interface para resposta da API
export interface APIResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    pageSize?: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}

// Interface para opções de requisição
export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  cache?: boolean;
  cacheTTL?: number;
}

// Cache em memória simples
class MemoryCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl = CACHE_CONFIG.TTL.STATIC_CONTENT): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Limpar cache se exceder tamanho máximo
    if (this.cache.size > CACHE_CONFIG.MAX_SIZE) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // Verificar se o item expirou
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;
    
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}

const apiCache = new MemoryCache();

// Função principal de requisição
export async function apiRequest<T = any>(
  url: string,
  options: RequestOptions = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    headers = {},
    body,
    timeout = HTTP_CONFIG.TIMEOUT,
    retries = HTTP_CONFIG.RETRIES,
    cache = true,
    cacheTTL
  } = options;

  // Gerar chave de cache
  const cacheKey = `${method}:${url}:${JSON.stringify(body || {})}`;

  // Verificar cache para requests GET
  if (method === 'GET' && cache && apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey);
  }

  // Preparar headers
  const requestHeaders = {
    ...HTTP_CONFIG.DEFAULT_HEADERS,
    ...headers
  };

  // Preparar corpo da requisição
  const requestBody = body && method !== 'GET' 
    ? JSON.stringify(body) 
    : undefined;

  // Função de requisição que será executada com retry
  const makeRequest = async (): Promise<APIResponse<T>> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: requestBody,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new APIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response
        );
      }

      const data = await response.json();
      const result: APIResponse<T> = {
        data,
        success: true
      };

      // Armazenar no cache
      if (method === 'GET' && cache) {
        apiCache.set(cacheKey, result, cacheTTL);
      }

      return result;

    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof APIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new APIError('Request timeout', 408);
      }

      throw new APIError(
        error instanceof Error ? error.message : 'Unknown error',
        0
      );
    }
  };

  // Executar com retry
  try {
    return await retry(makeRequest, retries + 1, HTTP_CONFIG.RETRY_DELAY);
  } catch (error) {
    if (error instanceof APIError) {
      return {
        data: null as T,
        success: false,
        error: error.message
      };
    }

    return {
      data: null as T,
      success: false,
      error: 'Network error'
    };
  }
}

// Classe de erro customizada para API
export class APIError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: Response
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Funções de conveniência para diferentes métodos HTTP
export const api = {
  get: <T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),

  post: <T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(url, { ...options, method: 'POST', body: data }),

  put: <T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(url, { ...options, method: 'PUT', body: data }),

  patch: <T = any>(url: string, data?: any, options: Omit<RequestOptions, 'method' | 'body'> = {}) =>
    apiRequest<T>(url, { ...options, method: 'PATCH', body: data }),

  delete: <T = any>(url: string, options: Omit<RequestOptions, 'method'> = {}) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' })
};

// Gerador de dados mock para desenvolvimento
export async function generateMockData<T>(
  generator: () => T,
  count: number,
  options: { delay?: boolean; errorRate?: number } = {}
): Promise<APIResponse<T[]>> {
  const { delay = true, errorRate = MOCK_CONFIG.ERROR_RATE } = options;

  // Simular latência de rede
  if (delay) {
    const delayMs = Math.random() * 
      (MOCK_CONFIG.NETWORK_DELAY.MAX - MOCK_CONFIG.NETWORK_DELAY.MIN) + 
      MOCK_CONFIG.NETWORK_DELAY.MIN;
    await sleep(delayMs);
  }

  // Simular erro ocasional
  if (Math.random() < errorRate) {
    return {
      data: [],
      success: false,
      error: 'Simulated network error'
    };
  }

  // Gerar dados
  const data = Array.from({ length: count }, generator);

  return {
    data,
    success: true,
    meta: {
      total: count,
      page: 1,
      pageSize: count,
      hasNext: false,
      hasPrev: false
    }
  };
}

// Mock de dados da equipe
export function generateMockTeamMember() {
  const firstNames = ['Ana', 'Carlos', 'Beatriz', 'João', 'Mariana', 'Pedro', 'Lucia', 'Rafael'];
  const lastNames = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Costa', 'Ferreira', 'Almeida', 'Pereira'];
  const departments = ['marketing', 'juridico', 'educacao', 'tecnologia', 'administrativo'];
  const positions = {
    marketing: ['Gerente de Marketing', 'Analista de Marketing', 'Especialista em Redes Sociais'],
    juridico: ['Advogado Senior', 'Analista Jurídico', 'Consultor Legal'],
    educacao: ['Coordenador Pedagógico', 'Designer Instrucional', 'Especialista em Educação'],
    tecnologia: ['Desenvolvedor Frontend', 'Desenvolvedor Backend', 'UX/UI Designer'],
    administrativo: ['Gerente Administrativo', 'Analista Financeiro', 'Assistente Administrativo']
  };

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const department = departments[Math.floor(Math.random() * departments.length)] as keyof typeof positions;
  const position = positions[department][Math.floor(Math.random() * positions[department].length)];

  return {
    id: generateId('member'),
    name: `${firstName} ${lastName}`,
    position,
    department,
    avatar: `https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random`,
    bio: `Profissional experiente em ${department} com foco em inovação e excelência.`,
    socialLinks: [
      {
        platform: 'linkedin',
        url: `https://linkedin.com/in/${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
        label: 'LinkedIn'
      }
    ],
    featured: Math.random() > 0.7,
    joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
  };
}

// Mock de dados de iniciativas
export function generateMockInitiative() {
  const titles = [
    'Educação Digital para Todos',
    'Tecnologia na Sala de Aula',
    'Capacitação de Professores',
    'Laboratório de Inovação',
    'Programa de Mentoria',
    'Sustentabilidade Educacional'
  ];
  const categories = ['educacao', 'tecnologia', 'sustentabilidade', 'comunidade', 'inovacao'];
  const statuses = ['active', 'completed', 'planned'];

  const title = titles[Math.floor(Math.random() * titles.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];

  return {
    id: generateId('initiative'),
    title,
    description: `Uma iniciativa inovadora focada em ${category} que visa transformar a experiência educacional através de tecnologia de ponta e metodologias modernas.`,
    category,
    icon: category,
    imageUrl: `https://picsum.photos/400/300?random=${Math.floor(Math.random() * 1000)}`,
    startDate: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
    endDate: status === 'completed' 
      ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
      : undefined,
    status,
    featured: Math.random() > 0.6,
    participants: Math.floor(Math.random() * 500) + 50,
    location: 'São Paulo, SP'
  };
}

// Mock de dados de depoimentos
export function generateMockTestimonial() {
  const names = ['Maria Eduarda', 'José Carlos', 'Ana Paula', 'Roberto Silva', 'Fernanda Costa'];
  const positions = ['Professora', 'Diretor Escolar', 'Coordenadora Pedagógica', 'Estudante', 'Educadora'];
  const companies = ['Escola Municipal', 'Instituto de Ensino', 'Universidade Federal', 'Colégio Particular', 'ONG Educacional'];

  const name = names[Math.floor(Math.random() * names.length)];
  const position = positions[Math.floor(Math.random() * positions.length)];
  const company = companies[Math.floor(Math.random() * companies.length)];

  const testimonials = [
    'A GEDUC transformou completamente nossa abordagem educacional. Os resultados são impressionantes!',
    'Nunca vi uma plataforma tão intuitiva e eficaz para o ensino. Recomendo a todos os educadores.',
    'As ferramentas da GEDUC revolucionaram minha sala de aula. Os alunos estão mais engajados que nunca.',
    'Excelente suporte e metodologia inovadora. A educação digital finalmente faz sentido.',
    'Uma experiência incrível! A tecnologia aplicada à educação de forma verdadeiramente eficiente.'
  ];

  return {
    id: generateId('testimonial'),
    name,
    position,
    company,
    avatar: `https://ui-avatars.com/api/?name=${name}&background=random`,
    content: testimonials[Math.floor(Math.random() * testimonials.length)],
    rating: Math.floor(Math.random() * 2) + 4, // 4 ou 5
    date: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
    featured: Math.random() > 0.5
  };
}

// Funções utilitárias para URLs
export function buildURL(base: string, path: string, params?: Record<string, any>): string {
  const url = new URL(path, base);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  return url.toString();
}

export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};
  
  for (const [key, value] of params) {
    result[key] = value;
  }
  
  return result;
}

// Utilitários para cache
export const cacheUtils = {
  clear: () => apiCache.clear(),
  delete: (key: string) => apiCache.delete(key),
  has: (key: string) => apiCache.has(key),
  invalidatePattern: (pattern: string) => {
    // Implementação simples para invalidar por padrão
    for (const [key] of apiCache['cache']) {
      if (key.includes(pattern)) {
        apiCache.delete(key);
      }
    }
  }
};