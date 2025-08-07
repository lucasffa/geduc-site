import { browser } from '$app/environment';
import { PRIVACY_CONFIG, THEME_CONFIG } from '$lib/constants/ui';

// Tipos para valores serializáveis
type SerializableValue = string | number | boolean | object | null;

// Tipo para retorno de getItem com type safety
type StorageResult<T> = T extends string ? string | null : T | null;

// Classe principal para localStorage
class LocalStorage {
  private isAvailable(): boolean {
    return browser && typeof window !== 'undefined' && 'localStorage' in window;
  }

  private handleError(operation: string, key: string, error: unknown): void {
    console.warn(`LocalStorage ${operation} failed for key "${key}":`, error);
  }

  getItem<T = string>(key: string): StorageResult<T>;
  getItem<T = string>(key: string, defaultValue: T): T;
  getItem<T = string>(key: string, defaultValue?: T): StorageResult<T> | T {
    if (!this.isAvailable()) {
      if (defaultValue !== undefined) return defaultValue;
      return null as StorageResult<T>; // only allowed by overload
    }

    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        if (defaultValue !== undefined) return defaultValue;
        return null as StorageResult<T>;
      }

      // Se T é string, retornar diretamente
      if (typeof defaultValue === 'string') {
        return item as T;
      }

      // Tentar fazer parse do JSON
      try {
        return JSON.parse(item) as T;
      } catch {
        // Se falhar o parse, retornar como string se não há defaultValue
        if (defaultValue !== undefined) return defaultValue;
        return item as StorageResult<T>;
      }
    } catch (error) {
      this.handleError('getItem', key, error);
      if (defaultValue !== undefined) return defaultValue;
      return null as StorageResult<T>;
    }
  }

  setItem(key: string, value: SerializableValue): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      this.handleError('setItem', key, error);
      return false;
    }
  }

  removeItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      this.handleError('removeItem', key, error);
      return false;
    }
  }

  clear(): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      localStorage.clear();
      return true;
    } catch (error) {
      this.handleError('clear', 'all', error);
      return false;
    }
  }

  hasItem(key: string): boolean {
    if (!this.isAvailable()) {
      return false;
    }

    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  getAllKeys(): string[] {
    if (!this.isAvailable()) {
      return [];
    }

    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) keys.push(key);
      }
      return keys;
    } catch (error) {
      this.handleError('getAllKeys', 'all', error);
      return [];
    }
  }

  getSize(): number {
    if (!this.isAvailable()) {
      return 0;
    }

    try {
      let size = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const value = localStorage.getItem(key);
          size += key.length + (value?.length ?? 0);
        }
      }
      return size;
    } catch (error) {
      this.handleError('getSize', 'all', error);
      return 0;
    }
  }
}

// Instância única do storage
export const storage = new LocalStorage();

// Tipos específicos para preferências
interface ThemePreference {
  theme: string;
  lastChanged: string;
}

interface ConsentData {
  granted: boolean;
  timestamp: string;
  expiry?: string;
}

interface TeamFilters {
  searchTerm: string;
  selectedDepartment: string;
  showFeaturedOnly: boolean;
}

interface InitiativeFilters {
  searchTerm: string;
  selectedCategory: string;
  selectedStatus: string;
  showFeaturedOnly: boolean;
}

interface FaqFilters {
  searchTerm: string;
  selectedCategory: string;
  showFeaturedOnly: boolean;
}

interface CarouselState {
  currentSlide: number;
  isPlaying: boolean;
  direction: 'next' | 'prev';
}

interface FormData {
  data: Record<string, unknown>;
  timestamp: string;
}

// Utilitários específicos para preferências do usuário
export const userPreferences = {
  getTheme(): string {
    const themeData = storage.getItem<ThemePreference>('theme-preference');
    return themeData?.theme ?? THEME_CONFIG.DEFAULT_THEME;
  },

  setTheme(theme: string): boolean {
    const themeData: ThemePreference = {
      theme,
      lastChanged: new Date().toISOString()
    };
    return storage.setItem('theme-preference', themeData);
  },

  getCookieConsent(): ConsentData | null {
    const consent = storage.getItem<ConsentData>('cookie-consent');
    
    // Verificar se expirou
    if (consent?.expiry && new Date(consent.expiry) < new Date()) {
      storage.removeItem('cookie-consent');
      return null;
    }
    
    return consent;
  },

  setCookieConsent(granted: boolean): boolean {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + PRIVACY_CONFIG.CONSENT_EXPIRY_DAYS);
    
    const consentData: ConsentData = {
      granted,
      timestamp: new Date().toISOString(),
      expiry: expiryDate.toISOString()
    };
    
    return storage.setItem('cookie-consent', consentData);
  },

  isCookieConsentValid(): boolean {
    const consent = this.getCookieConsent();
    return consent?.granted === true;
  },

  getNewsletterConsent(): boolean {
    const consent = storage.getItem<ConsentData>('newsletter-consent');
    return consent?.granted ?? false;
  },

  setNewsletterConsent(granted: boolean): boolean {
    const consentData: ConsentData = {
      granted,
      timestamp: new Date().toISOString()
    };
    return storage.setItem('newsletter-consent', consentData);
  },

  getAnalyticsConsent(): boolean {
    const consent = storage.getItem<ConsentData>('analytics-consent');
    return consent?.granted ?? false;
  },

  setAnalyticsConsent(granted: boolean): boolean {
    const consentData: ConsentData = {
      granted,
      timestamp: new Date().toISOString()
    };
    return storage.setItem('analytics-consent', consentData);
  },

  getReducedMotion(): boolean {
    // Verificar preferência do sistema primeiro
    if (browser && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) return true;
    }
    
    return storage.getItem<boolean>('reduced-motion', false);
  },

  setReducedMotion(reduced: boolean): boolean {
    return storage.setItem('reduced-motion', reduced);
  },

  getLanguage(): string {
    return storage.getItem<string>('language', 'pt');
  },

  setLanguage(language: string): boolean {
    return storage.setItem('language', language);
  }
};

// Utilitários para filtros e estado da UI
export const uiState = {
  getTeamFilters(): TeamFilters {
    return storage.getItem<TeamFilters>('team-filters', {
      searchTerm: '',
      selectedDepartment: 'all',
      showFeaturedOnly: false
    });
  },

  setTeamFilters(filters: TeamFilters): boolean {
    return storage.setItem('team-filters', filters);
  },

  getInitiativeFilters(): InitiativeFilters {
    return storage.getItem<InitiativeFilters>('initiative-filters', {
      searchTerm: '',
      selectedCategory: 'all',
      selectedStatus: 'all',
      showFeaturedOnly: false
    });
  },

  setInitiativeFilters(filters: InitiativeFilters): boolean {
    return storage.setItem('initiative-filters', filters);
  },

  getFaqFilters(): FaqFilters {
    return storage.getItem<FaqFilters>('faq-filters', {
      searchTerm: '',
      selectedCategory: 'all',
      showFeaturedOnly: false
    });
  },

  setFaqFilters(filters: FaqFilters): boolean {
    return storage.setItem('faq-filters', filters);
  },

  getCarouselState(carouselId: string): CarouselState {
    return storage.getItem<CarouselState>(`carousel-${carouselId}`, {
      currentSlide: 0,
      isPlaying: true,
      direction: 'next'
    });
  },

  setCarouselState(carouselId: string, state: CarouselState): boolean {
    return storage.setItem(`carousel-${carouselId}`, state);
  },

  getRecentSearches(): string[] {
    return storage.getItem<string[]>('recent-searches', []);
  },

  addRecentSearch(search: string): boolean {
    if (!search.trim()) return false;
    
    const searches = this.getRecentSearches();
    const filtered = searches.filter(s => s !== search);
    const updated = [search, ...filtered].slice(0, 10);
    
    return storage.setItem('recent-searches', updated);
  },

  clearRecentSearches(): boolean {
    return storage.removeItem('recent-searches');
  }
};

// Utilitários para dados temporários/cache
export const tempData = {
  getFormData<T = Record<string, unknown>>(formId: string): T | null {
    const data = storage.getItem<FormData>(`form-${formId}`);
    return data ? (data.data as T) : null;
  },

  setFormData<T = Record<string, unknown>>(formId: string, data: T): boolean {
    const formData: FormData = {
      data: data as Record<string, unknown>,
      timestamp: new Date().toISOString()
    };
    return storage.setItem(`form-${formId}`, formData);
  },

  clearFormData(formId: string): boolean {
    return storage.removeItem(`form-${formId}`);
  },

  getLastVisit(pageId: string): Date | null {
    const timestamp = storage.getItem<string>(`last-visit-${pageId}`);
    return timestamp ? new Date(timestamp) : null;
  },

  setLastVisit(pageId: string, date: Date = new Date()): boolean {
    return storage.setItem(`last-visit-${pageId}`, date.toISOString());
  },

  getViewCount(itemId: string): number {
    return storage.getItem<number>(`view-count-${itemId}`, 0);
  },

  incrementViewCount(itemId: string): boolean {
    const count = this.getViewCount(itemId) + 1;
    return storage.setItem(`view-count-${itemId}`, count);
  }
};

// Utilitários para migração e manutenção
export const storageUtils = {
  migrate(): void {
    const currentVersion = '2.0.0';
    const storedVersion = storage.getItem<string>('storage-version', '1.0.0');
    
    if (storedVersion !== currentVersion) {
      console.log(`Migrating storage from ${storedVersion} to ${currentVersion}`);
      
      // Implementar migrações específicas aqui
      if (storedVersion === '1.0.0') {
        // Migração exemplo: converter dados antigos
        this.migrateFromV1();
      }
      
      storage.setItem('storage-version', currentVersion);
    }
  },

  migrateFromV1(): void {
    // Exemplo de migração de dados antigos
    const oldTheme = storage.getItem<string>('theme');
    if (oldTheme) {
      userPreferences.setTheme(oldTheme);
      storage.removeItem('theme');
    }
  },

  cleanup(): void {
    const keys = storage.getAllKeys();
    const now = new Date();
    const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 dias em millisegundos
    
    keys.forEach(key => {
      // Limpar dados temporários antigos
      if (key.startsWith('temp-') || key.startsWith('form-')) {
        try {
          const data = storage.getItem<FormData>(key);
          if (data?.timestamp) {
            const itemDate = new Date(data.timestamp);
            if (now.getTime() - itemDate.getTime() > maxAge) {
              storage.removeItem(key);
            }
          }
        } catch {
          // Se não conseguir verificar, remover item problemático
          storage.removeItem(key);
        }
      }
    });
  },

  exportUserData(): string {
    const userData: Record<string, unknown> = {};
    const keys = storage.getAllKeys();
    
    // Filtrar apenas dados relevantes do usuário
    const userDataKeys = keys.filter(key => 
      key.includes('preference') || 
      key.includes('consent') || 
      key.includes('filters') ||
      key.includes('language') ||
      key.includes('theme')
    );
    
    userDataKeys.forEach(key => {
      userData[key] = storage.getItem(key);
    });
    
    return JSON.stringify(userData, null, 2);
  },

  importUserData(jsonData: string): boolean {
    try {
      const userData = JSON.parse(jsonData) as Record<string, unknown>;
      
      // Validar estrutura básica antes de importar
      if (typeof userData !== 'object' || userData === null) {
        throw new Error('Invalid data format');
      }
      
      function isSerializableValue(val: unknown): val is SerializableValue {
        const t = typeof val;
        return (
          t === 'string' ||
          t === 'number' ||
          t === 'boolean' ||
          val === null ||
          (t === 'object' && !Array.isArray(val) && val !== null) ||
          Array.isArray(val)
        );
      }
      
      Object.entries(userData).forEach(([key, value]) => {
        if (typeof key === 'string' && key.trim() && isSerializableValue(value)) {
          storage.setItem(key, value);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error importing user data:', error);
      return false;
    }
  },

  getStorageInfo(): {
    available: boolean;
    size: number;
    keyCount: number;
    sizeFormatted: string;
  } {
    const size = storage.getSize();
    const keyCount = storage.getAllKeys().length;
    
    const formatSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };
    
    return {
      available: browser && 'localStorage' in window,
      size,
      keyCount,
      sizeFormatted: formatSize(size)
    };
  },

  // Utilitário para debug
  debugStorage(): void {
    if (!browser) {
      console.log('Storage not available (not in browser)');
      return;
    }
    
    const info = this.getStorageInfo();
    const keys = storage.getAllKeys();
    
    console.group('🗄️ LocalStorage Debug');
    console.log('Info:', info);
    console.log('Keys:', keys);
    console.log('Data:', keys.reduce((acc, key) => {
      acc[key] = storage.getItem(key);
      return acc;
    }, {} as Record<string, unknown>));
    console.groupEnd();
  }
};