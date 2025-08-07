// src/lib/types/stores.ts
// Tipos de stores utilizados na aplicação

import type {
  TeamDepartment,
  InitiativeCategory,
  FaqCategory,
  ThemeMode
} from './enums';

// Estado dos filtros da equipe
export interface TeamFiltersState {
  searchTerm: string;
  selectedDepartment: TeamDepartment | 'all';
  showFeaturedOnly: boolean;
}

// Estado dos filtros de iniciativas
export interface InitiativeFiltersState {
  searchTerm: string;
  selectedCategory: InitiativeCategory | 'all';
  selectedStatus: 'all' | 'active' | 'completed' | 'planned';
  showFeaturedOnly: boolean;
}

// Estado dos filtros de FAQ
export interface FaqFiltersState {
  searchTerm: string;
  selectedCategory: FaqCategory | 'all';
  showFeaturedOnly: boolean;
}

// Estado global da UI
export interface UIState {
  // Navegação mobile
  isMobileMenuOpen: boolean;
  
  // Scroll
  scrollY: number;
  isScrollingUp: boolean;
  hasScrolled: boolean;
  
  // Tema
  theme: ThemeMode;
  
  // Modal/Overlay
  activeModal: string | null;
  
  // Loading states
  isLoading: boolean;
  loadingMessage?: string;
  
  // Toast/Notifications
  notifications: Notification[];
  
  // Search
  globalSearchTerm: string;
  isSearchActive: boolean;
  
  // Carousel states
  carouselStates: Record<string, CarouselState>;
}

// Estado do carrossel
export interface CarouselState {
  currentSlide: number;
  isPlaying: boolean;
  direction: 'next' | 'prev';
}

// Notificação
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  variant?: 'primary' | 'secondary';
}

// Estado do formulário de contato
export interface ContactFormState {
  isSubmitting: boolean;
  hasSubmitted: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Estado do formulário de newsletter
export interface NewsletterFormState {
  isSubmitting: boolean;
  hasSubmitted: boolean;
  error?: string;
}

// Estado dos dados da API (cache em memória)
export interface APIState {
  teamMembers: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
  
  initiatives: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
  
  testimonials: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
  
  faqItems: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
  
  featuredMedia: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
  
  partners: {
    data: any[];
    loading: boolean;
    error?: string;
    lastFetch?: number;
  };
}

// Estado das preferências do usuário
export interface UserPreferencesState {
  theme: ThemeMode;
  reducedMotion: boolean;
  language: string;
  consentGiven: boolean;
  newsletterOptIn: boolean;
  cookiesAccepted: boolean;
}

// Estado da navegação
export interface NavigationState {
  currentPath: string;
  previousPath: string;
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}