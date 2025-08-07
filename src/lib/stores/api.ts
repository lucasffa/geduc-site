import { writable, derived, get } from 'svelte/store';
import type { 
  TeamMember, 
  Initiative, 
  Testimonial, 
  FaqItem, 
  FeaturedMedia, 
  Partner 
} from '$lib/types/data';
import type { APIState } from '$lib/types/stores';
import { 
  generateMockData, 
  generateMockTeamMember, 
  generateMockInitiative, 
  generateMockTestimonial 
} from '$lib/utils/api';
import { logger } from '$lib/utils/logger';
import { MOCK_CONFIG, CACHE_CONFIG } from '$lib/constants/api';
import { generateId } from '$lib/utils/helpers';
import { FaqCategory, MediaType } from '$lib/types';

// Estado inicial da API
const initialAPIState: APIState = {
  teamMembers: { data: [], loading: false },
  initiatives: { data: [], loading: false },
  testimonials: { data: [], loading: false },
  faqItems: { data: [], loading: false },
  featuredMedia: { data: [], loading: false },
  partners: { data: [], loading: false }
};

// Store principal da API
function createAPIStore() {
  const { subscribe, set, update } = writable<APIState>(initialAPIState);

  return {
    subscribe,

    // Carregar membros da equipe
    loadTeamMembers: async () => {
      logger.info('API: Loading team members', undefined, 'API');
      
      update(state => ({
        ...state,
        teamMembers: { ...state.teamMembers, loading: true, error: undefined }
      }));

      try {
        const response = await generateMockData(
          generateMockTeamMember,
          MOCK_CONFIG.DATA_SIZE.TEAM_MEMBERS
        );

        if (response.success) {
          update(state => ({
            ...state,
            teamMembers: {
              data: response.data,
              loading: false,
              lastFetch: Date.now()
            }
          }));
          logger.info('API: Team members loaded successfully', { count: response.data.length }, 'API');
        } else {
          throw new Error(response.error || 'Failed to load team members');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load team members', error, 'API');
        
        update(state => ({
          ...state,
          teamMembers: {
            ...state.teamMembers,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar iniciativas
    loadInitiatives: async () => {
      logger.info('API: Loading initiatives', undefined, 'API');
      
      update(state => ({
        ...state,
        initiatives: { ...state.initiatives, loading: true, error: undefined }
      }));

      try {
        const response = await generateMockData(
          generateMockInitiative,
          MOCK_CONFIG.DATA_SIZE.INITIATIVES
        );

        if (response.success) {
          update(state => ({
            ...state,
            initiatives: {
              data: response.data,
              loading: false,
              lastFetch: Date.now()
            }
          }));
          logger.info('API: Initiatives loaded successfully', { count: response.data.length }, 'API');
        } else {
          throw new Error(response.error || 'Failed to load initiatives');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load initiatives', error, 'API');
        
        update(state => ({
          ...state,
          initiatives: {
            ...state.initiatives,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar depoimentos
    loadTestimonials: async () => {
      logger.info('API: Loading testimonials', undefined, 'API');
      
      update(state => ({
        ...state,
        testimonials: { ...state.testimonials, loading: true, error: undefined }
      }));

      try {
        const response = await generateMockData(
          generateMockTestimonial,
          MOCK_CONFIG.DATA_SIZE.TESTIMONIALS
        );

        if (response.success) {
          update(state => ({
            ...state,
            testimonials: {
              data: response.data,
              loading: false,
              lastFetch: Date.now()
            }
          }));
          logger.info('API: Testimonials loaded successfully', { count: response.data.length }, 'API');
        } else {
          throw new Error(response.error || 'Failed to load testimonials');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load testimonials', error, 'API');
        
        update(state => ({
          ...state,
          testimonials: {
            ...state.testimonials,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar FAQ
    loadFaqItems: async () => {
      logger.info('API: Loading FAQ items', undefined, 'API');
      
      update(state => ({
        ...state,
        faqItems: { ...state.faqItems, loading: true, error: undefined }
      }));

      try {
        // Gerar dados de FAQ mockados
        const faqData = generateMockFaqItems();
        
        const response = await generateMockData(
          () => faqData[Math.floor(Math.random() * faqData.length)],
          MOCK_CONFIG.DATA_SIZE.FAQ_ITEMS
        );

        if (response.success) {
          update(state => ({
            ...state,
            faqItems: {
              data: response.data,
              loading: false,
              lastFetch: Date.now()
            }
          }));
          logger.info('API: FAQ items loaded successfully', { count: response.data.length }, 'API');
        } else {
          throw new Error(response.error || 'Failed to load FAQ items');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load FAQ items', error, 'API');
        
        update(state => ({
          ...state,
          faqItems: {
            ...state.faqItems,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar mídia em destaque
    loadFeaturedMedia: async () => {
      logger.info('API: Loading featured media', undefined, 'API');
      
      update(state => ({
        ...state,
        featuredMedia: { ...state.featuredMedia, loading: true, error: undefined }
      }));

      try {
        // Gerar dados de mídia mockados
        const mediaData = generateMockFeaturedMedia();
        
        const response = {
          data: [mediaData], // Apenas um item em destaque para a home
          success: true
        };

        update(state => ({
          ...state,
          featuredMedia: {
            data: response.data,
            loading: false,
            lastFetch: Date.now()
          }
        }));
        logger.info('API: Featured media loaded successfully', { count: response.data.length }, 'API');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load featured media', error, 'API');
        
        update(state => ({
          ...state,
          featuredMedia: {
            ...state.featuredMedia,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar parceiros
    loadPartners: async () => {
      logger.info('API: Loading partners', undefined, 'API');
      
      update(state => ({
        ...state,
        partners: { ...state.partners, loading: true, error: undefined }
      }));

      try {
        const response = await generateMockData(
          generateMockPartner,
          MOCK_CONFIG.DATA_SIZE.PARTNERS
        );

        if (response.success) {
          update(state => ({
            ...state,
            partners: {
              data: response.data,
              loading: false,
              lastFetch: Date.now()
            }
          }));
          logger.info('API: Partners loaded successfully', { count: response.data.length }, 'API');
        } else {
          throw new Error(response.error || 'Failed to load partners');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('API: Failed to load partners', error, 'API');
        
        update(state => ({
          ...state,
          partners: {
            ...state.partners,
            loading: false,
            error: errorMessage
          }
        }));
      }
    },

    // Carregar todos os dados
    loadAll: async () => {
      logger.info('API: Loading all data', undefined, 'API');
      
      const promises = [
        apiStore.loadTeamMembers(),
        apiStore.loadInitiatives(),
        apiStore.loadTestimonials(),
        apiStore.loadFaqItems(),
        apiStore.loadFeaturedMedia(),
        apiStore.loadPartners()
      ];

      try {
        await Promise.all(promises);
        logger.info('API: All data loaded successfully', undefined, 'API');
      } catch (error) {
        logger.error('API: Failed to load some data', error, 'API');
      }
    },

    // Recarregar dados se estiverem desatualizados
    refreshIfNeeded: () => {
      const now = Date.now();
      const state = get(apiStore);
      const refreshPromises: Promise<void>[] = [];

      // Checagem explícita e tipada para cada seção do store
      if (state.teamMembers.lastFetch) {
        const age = now - state.teamMembers.lastFetch;
        const ttl = CACHE_CONFIG.TTL.TEAM_MEMBERS || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for teamMembers is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadTeamMembers());
        }
      }
      if (state.initiatives.lastFetch) {
        const age = now - state.initiatives.lastFetch;
        const ttl = CACHE_CONFIG.TTL.INITIATIVES || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for initiatives is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadInitiatives());
        }
      }
      if (state.testimonials.lastFetch) {
        const age = now - state.testimonials.lastFetch;
        const ttl = CACHE_CONFIG.TTL.TESTIMONIALS || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for testimonials is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadTestimonials());
        }
      }
      if (state.faqItems.lastFetch) {
        const age = now - state.faqItems.lastFetch;
        const ttl = CACHE_CONFIG.TTL.FAQ_ITEMS || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for faqItems is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadFaqItems());
        }
      }
      if (state.featuredMedia.lastFetch) {
        const age = now - state.featuredMedia.lastFetch;
        const ttl = CACHE_CONFIG.TTL.FEATURED_MEDIA || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for featuredMedia is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadFeaturedMedia());
        }
      }
      if (state.partners.lastFetch) {
        const age = now - state.partners.lastFetch;
        const ttl = CACHE_CONFIG.TTL.PARTNERS || CACHE_CONFIG.TTL.STATIC_CONTENT;
        if (age > ttl) {
          logger.debug('API: Data for partners is stale, refreshing', { age, ttl }, 'API');
          refreshPromises.push(apiStore.loadPartners());
        }
      }
      return Promise.all(refreshPromises);
    },

    // Limpar todos os dados
    clearAll: () => {
      logger.info('API: Clearing all data', undefined, 'API');
      set(initialAPIState);
    }
  };
}


function generateMockFeaturedMedia(): FeaturedMedia {
  return {
    id: generateId('media'),
    title: 'GEDUC revoluciona educação digital no Brasil',
    description: 'Nossa plataforma foi destaque na revista TechEdu como uma das principais inovações em educação digital.',
    content: 'A GEDUC tem se destacado no cenário educacional brasileiro com suas soluções inovadoras que integram tecnologia e pedagogia de forma única. Nossa abordagem holística tem transformado a experiência de ensino e aprendizado em centenas de instituições.',
    author: 'Maria Silva',
    authorPosition: 'Jornalista especializada em Educação',
    mediaType: MediaType.ARTICLE, // Changed from 'news' to a valid MediaType enum value
    imageUrl: 'https://picsum.photos/600/400?random=media',
    externalUrl: 'https://techedulagao.com.br/geduc-inovacao',
    publishDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    tags: ['educação', 'tecnologia', 'inovação', 'digital']
  };
}

function generateMockFaqItems(): FaqItem[] {
  const faqData = [
    {
      question: 'O que é a GEDUC?',
      answer: 'A GEDUC é uma organização dedicada a transformar a educação através da tecnologia e inovação, criando soluções que conectam educadores e estudantes.',
      category: FaqCategory.GERAL
    },
    {
      question: 'Como posso participar das iniciativas?',
      answer: 'Você pode se inscrever através do nosso site ou entrar em contato diretamente conosco. Temos programas para educadores, estudantes e instituições.',
      category: FaqCategory.INICIATIVAS
    },
    {
      question: 'As iniciativas são gratuitas?',
      answer: 'Sim, a maioria das nossas iniciativas são gratuitas. Nosso objetivo é democratizar o acesso à educação de qualidade.',
      category: FaqCategory.INICIATIVAS
    },
    {
      question: 'Como posso entrar em contato com a equipe?',
      answer: 'Você pode nos contatar através do formulário de contato no site, e-mail ou redes sociais. Nossa equipe está sempre disponível para ajudar.',
      category: FaqCategory.CONTATO
    },
    {
      question: 'Quais tecnologias vocês utilizam?',
      answer: 'Utilizamos uma variedade de tecnologias modernas, incluindo plataformas web, aplicativos móveis, realidade virtual e inteligência artificial aplicada à educação.',
      category: FaqCategory.TECNOLOGIA
    }
  ];

  return faqData.map((item, index) => ({
    id: generateId('faq'),
    question: item.question,
    answer: item.answer,
    category: item.category,
    order: index + 1,
    featured: Math.random() > 0.7,
    lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
  }));
}



// Gerar parceiros mock
function generateMockPartner(): Partner {
  const partners = [
    'Universidade Federal de São Paulo',
    'Instituto de Tecnologia Educacional',
    'Fundação Lemann',
    'Google for Education',
    'Microsoft Education',
    'Unesco Brasil'
  ];

  const categories = ['educational', 'government', 'nonprofit', 'sponsor'] as const;
  const name = partners[Math.floor(Math.random() * partners.length)];
  const category = categories[Math.floor(Math.random() * categories.length)];

  return {
    id: generateId('partner'),
    name,
    logo: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&format=svg`,
    website: `https://${name.toLowerCase().replace(/\s+/g, '')}.org.br`,
    description: `Parceiro estratégico da GEDUC na área de ${category === 'educational' ? 'educação' : category === 'government' ? 'políticas públicas' : category === 'nonprofit' ? 'impacto social' : 'investimento'}.`,
    category,
    featured: Math.random() > 0.6
  };
}

// Instância do store
export const apiStore = createAPIStore();

// Stores derivados para cada tipo de dados
export const teamMembers = derived(
  apiStore,
  $api => $api.teamMembers.data
);

export const featuredTeamMembers = derived(
  teamMembers,
  $members => $members.filter(member => member.featured)
);

export const initiatives = derived(
  apiStore,
  $api => $api.initiatives.data
);

export const featuredInitiatives = derived(
  initiatives,
  $initiatives => $initiatives.filter(initiative => initiative.featured)
);

export const testimonials = derived(
  apiStore,
  $api => $api.testimonials.data
);

export const featuredTestimonials = derived(
  testimonials,
  $testimonials => $testimonials.filter(testimonial => testimonial.featured)
);

export const faqItems = derived(
  apiStore,
  $api => $api.faqItems.data
);

export const featuredMedia = derived(
  apiStore,
  $api => $api.featuredMedia.data[0] || null
);

export const partners = derived(
  apiStore,
  $api => $api.partners.data
);

export const featuredPartners = derived(
  partners,
  $partners => $partners.filter(partner => partner.featured)
);

// Store derivado para status de loading geral
export const isLoading = derived(
  apiStore,
  $api => Object.values($api).some(section => section.loading)
);

// Store derivado para verificar se há erros
export const hasErrors = derived(
  apiStore,
  $api => Object.values($api).some(section => section.error)
);

// Store derivado para obter todos os erros
export const errors = derived(
  apiStore,
  $api =>
    Object.entries($api).flatMap(([section, data]) =>
      data.error ? [{ section, error: data.error }] : []
    )
);

// Inicializar dados quando o store for criado
if (typeof window !== 'undefined') {
  // Carregar dados iniciais após um pequeno delay
  setTimeout(() => {
    apiStore.loadAll();
  }, 100);
}