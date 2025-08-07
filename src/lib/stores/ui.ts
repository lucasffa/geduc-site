// src/lib/stores/ui.ts

import { writable, derived, readable } from 'svelte/store';
import { ThemeMode } from '$lib/types/enums';
import type { UIState, Notification, CarouselState } from '$lib/types/stores';
import { userPreferences } from '$lib/utils/local-storage';
import { logger } from '$lib/utils/logger';
import { generateId, debounce, throttle } from '$lib/utils/helpers';
import { SCROLL_CONFIG, NOTIFICATION_CONFIG, THEME_CONFIG } from '$lib/constants/ui';

// Estado inicial da UI
const initialUIState: UIState = {
  isMobileMenuOpen: false,
  scrollY: 0,
  isScrollingUp: false,
  hasScrolled: false,
  theme: (userPreferences.getTheme() as ThemeMode),
  activeModal: null,
  isLoading: false,
  notifications: [],
  globalSearchTerm: '',
  isSearchActive: false,
  carouselStates: {}
};

// Store principal da UI
function createUIStore() {
  const { subscribe, set, update } = writable<UIState>(initialUIState);

  return {
    subscribe,

    // Navegação mobile
    toggleMobileMenu: () => {
      logger.debug('UI: Toggling mobile menu', undefined, 'UI');
      update(state => ({
        ...state,
        isMobileMenuOpen: !state.isMobileMenuOpen
      }));
    },

    closeMobileMenu: () => {
      logger.debug('UI: Closing mobile menu', undefined, 'UI');
      update(state => ({
        ...state,
        isMobileMenuOpen: false
      }));
    },

    openMobileMenu: () => {
      logger.debug('UI: Opening mobile menu', undefined, 'UI');
      update(state => ({
        ...state,
        isMobileMenuOpen: true
      }));
    },

    // Scroll
    updateScroll: (y: number) => {
      update(state => {
        const isScrollingUp = y < state.scrollY;
        const hasScrolled = y > SCROLL_CONFIG.SCROLL_THRESHOLD;

        return {
          ...state,
          scrollY: y,
          isScrollingUp,
          hasScrolled
        };
      });
    },

    // Tema
    setTheme: (theme: ThemeMode) => {
      logger.debug('UI: Setting theme', { theme }, 'UI');
      userPreferences.setTheme(theme);
      update(state => ({
        ...state,
        theme: theme
      }));
      
      // Aplicar tema no documento
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', theme);
      }
    },

    toggleTheme: () => {
      update(state => {
        const newTheme = state.theme === ThemeMode.LIGHT ? ThemeMode.DARK : ThemeMode.LIGHT;
        logger.debug('UI: Toggling theme', { from: state.theme, to: newTheme }, 'UI');
        userPreferences.setTheme(newTheme);
        
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', newTheme);
        }

        return {
          ...state,
          theme: newTheme
        };
      });
    },

    // Modal
    openModal: (modalId: string) => {
      logger.debug('UI: Opening modal', { modalId }, 'UI');
      update(state => ({
        ...state,
        activeModal: modalId
      }));
    },

    closeModal: () => {
      logger.debug('UI: Closing modal', undefined, 'UI');
      update(state => ({
        ...state,
        activeModal: null
      }));
    },

    // Loading
    setLoading: (loading: boolean, message?: string) => {
      logger.debug('UI: Setting loading state', { loading, message }, 'UI');
      update(state => ({
        ...state,
        isLoading: loading,
        loadingMessage: message
      }));
    },

    // Notificações
    addNotification: (notification: Omit<Notification, 'id'>) => {
      const id = generateId('notification');
      const fullNotification: Notification = {
        id,
        duration: NOTIFICATION_CONFIG.DEFAULT_DURATION,
        ...notification
      };

      logger.debug('UI: Adding notification', fullNotification, 'UI');

      update(state => {
        const notifications = [...state.notifications, fullNotification];
        
        // Limitar número máximo de notificações
        if (notifications.length > NOTIFICATION_CONFIG.MAX_NOTIFICATIONS) {
          notifications.shift();
        }

        return {
          ...state,
          notifications
        };
      });

      // Auto-remover notificação após duração especificada
      if (!fullNotification.persistent && fullNotification.duration && fullNotification.duration > 0) {
        setTimeout(() => {
          uiStore.removeNotification(id);
        }, fullNotification.duration);
      }

      return id;
    },

    removeNotification: (id: string) => {
      logger.debug('UI: Removing notification', { id }, 'UI');
      update(state => ({
        ...state,
        notifications: state.notifications.filter(n => n.id !== id)
      }));
    },

    clearNotifications: () => {
      logger.debug('UI: Clearing all notifications', undefined, 'UI');
      update(state => ({
        ...state,
        notifications: []
      }));
    },

    // Busca global
    setGlobalSearchTerm: (term: string) => {
      update(state => ({
        ...state,
        globalSearchTerm: term.trim()
      }));
    },

    toggleSearch: () => {
      update(state => ({
        ...state,
        isSearchActive: !state.isSearchActive,
        globalSearchTerm: state.isSearchActive ? '' : state.globalSearchTerm
      }));
    },

    activateSearch: () => {
      update(state => ({
        ...state,
        isSearchActive: true
      }));
    },

    deactivateSearch: () => {
      update(state => ({
        ...state,
        isSearchActive: false,
        globalSearchTerm: ''
      }));
    },

    // Carrossel
    setCarouselState: (carouselId: string, carouselState: Partial<CarouselState>) => {
      logger.debug('UI: Setting carousel state', { carouselId, carouselState }, 'UI');
      update(state => {
        const currentState = state.carouselStates[carouselId] || {
          currentSlide: 0,
          isPlaying: true,
          direction: 'next' as const
        };

        return {
          ...state,
          carouselStates: {
            ...state.carouselStates,
            [carouselId]: {
              ...currentState,
              ...carouselState
            }
          }
        };
      });
    },

    getCarouselState: (carouselId: string): CarouselState => {
      let state: UIState | undefined;
      const unsubscribe = subscribe(s => state = s);
      unsubscribe();
      
      if (!state) {
        return {
          currentSlide: 0,
          isPlaying: true,
          direction: 'next'
        };
      }

      return state.carouselStates[carouselId] || {
        currentSlide: 0,
        isPlaying: true,
        direction: 'next'
      };
    },

    // Reset completo do estado
    reset: () => {
      logger.debug('UI: Resetting state', undefined, 'UI');
      set(initialUIState);
    }
  };
}

// Instância do store
export const uiStore = createUIStore();

// Stores derivados úteis
export const isScrolled = derived(
  uiStore,
  $ui => $ui.hasScrolled
);

export const shouldShowBackToTop = derived(
  uiStore,
  $ui => $ui.scrollY > SCROLL_CONFIG.BACK_TO_TOP_THRESHOLD
);

export const shouldHideHeader = derived(
  uiStore,
  $ui => $ui.hasScrolled && !$ui.isScrollingUp && $ui.scrollY > SCROLL_CONFIG.HEADER_HIDE_THRESHOLD
);

export const isDarkTheme = derived(
  uiStore,
  $ui => $ui.theme === 'dark'
);

export const hasActiveModal = derived(
  uiStore,
  $ui => $ui.activeModal !== null
);

export const notificationCount = derived(
  uiStore,
  $ui => $ui.notifications.length
);

export const hasNotifications = derived(
  uiStore,
  $ui => $ui.notifications.length > 0
);

// Funções de conveniência para notificações
export const notifications = {
  success: (message: string, title = 'Sucesso') => {
    return uiStore.addNotification({
      type: 'success',
      title,
      message,
      duration: NOTIFICATION_CONFIG.SUCCESS_DURATION
    });
  },

  error: (message: string, title = 'Erro') => {
    return uiStore.addNotification({
      type: 'error',
      title,
      message,
      duration: NOTIFICATION_CONFIG.ERROR_DURATION
    });
  },

  warning: (message: string, title = 'Atenção') => {
    return uiStore.addNotification({
      type: 'warning',
      title,
      message,
      duration: NOTIFICATION_CONFIG.WARNING_DURATION
    });
  },

  info: (message: string, title = 'Informação') => {
    return uiStore.addNotification({
      type: 'info',
      title,
      message,
      duration: NOTIFICATION_CONFIG.INFO_DURATION
    });
  }
};

// Store para detectar se o usuário prefere movimento reduzido
export const prefersReducedMotion = readable(false, set => {
  if (typeof window === 'undefined') return;

  const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  
  const updatePreference = () => {
    const reduced = mediaQuery.matches || userPreferences.getReducedMotion();
    set(reduced);
  };

  updatePreference();
  mediaQuery.addEventListener('change', updatePreference);

  return () => {
    mediaQuery.removeEventListener('change', updatePreference);
  };
});

// Store para detectar tamanho da tela
export const screenSize = readable({ width: 0, height: 0 }, set => {
  if (typeof window === 'undefined') return;

  const updateSize = throttle(() => {
    set({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }, 100);

  updateSize();
  window.addEventListener('resize', updateSize);

  return () => {
    window.removeEventListener('resize', updateSize);
  };
});

// Store derivado para breakpoints
export const breakpoint = derived(
  screenSize,
  $screen => {
    if ($screen.width >= 1280) return 'xl';
    if ($screen.width >= 1024) return 'lg';
    if ($screen.width >= 768) return 'md';
    if ($screen.width >= 640) return 'sm';
    return 'xs';
  }
);

export const isMobile = derived(
  breakpoint,
  $breakpoint => $breakpoint === 'xs' || $breakpoint === 'sm'
);

export const isTablet = derived(
  breakpoint,
  $breakpoint => $breakpoint === 'md'
);

export const isDesktop = derived(
  breakpoint,
  $breakpoint => $breakpoint === 'lg' || $breakpoint === 'xl'
);

// Configurar scroll listener
if (typeof window !== 'undefined') {
  const handleScroll = throttle(() => {
    uiStore.updateScroll(window.scrollY);
  }, 16); // ~60fps

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Configurar tema inicial
  const savedTheme = userPreferences.getTheme();
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  }

  // Detectar preferência de tema do sistema
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  
  const updateSystemTheme = () => {
    const currentTheme = userPreferences.getTheme();
    if (currentTheme === 'system') {
      const systemTheme = darkModeMediaQuery.matches ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', systemTheme);
    }
  };

  updateSystemTheme();
  darkModeMediaQuery.addEventListener('change', updateSystemTheme);
}

// Utilitários para trabalhar com o store de UI
export const uiUtils = {
  // Scroll suave para elemento
  scrollToElement: (elementId: string, offset = 0) => {
    const element = document.getElementById(elementId);
    if (element) {
      const top = element.offsetTop - offset;
      window.scrollTo({
        top,
        behavior: 'smooth'
      });
    }
  },

  // Scroll para o topo
  scrollToTop: () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  },

  // Bloquear scroll (para modais)
  blockScroll: () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = 'hidden';
    }
  },

  // Desbloquear scroll
  unblockScroll: () => {
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
    }
  },

  // Copiar texto para clipboard
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        notifications.success('Texto copiado!');
        return true;
      } else {
        // Fallback para navegadores mais antigos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        notifications.success('Texto copiado!');
        return true;
      }
    } catch (error) {
      notifications.error('Erro ao copiar texto');
      logger.error('Failed to copy text to clipboard', error, 'UI');
      return false;
    }
  }
};