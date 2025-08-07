// src/lib/stores/teamFilters.ts


import { writable, derived, type Readable } from 'svelte/store';
import type { TeamFiltersState } from '$lib/types/stores';
import type { TeamMember } from '$lib/types/data';
import { uiState } from '$lib/utils/local-storage';
import { logger } from '$lib/utils/logger';
import { removeAccents, includesIgnoreCase } from '$lib/utils/helpers';
import type { TeamDepartment } from '$lib/types';

// Estado inicial dos filtros
const initialState: TeamFiltersState = {
  searchTerm: '',
  selectedDepartment: 'all' as const,
  showFeaturedOnly: false
};

// Função para validar filtros carregados do localStorage
function validateTeamFilters(filters: unknown): TeamFiltersState {
  // Se não há filtros ou não é um objeto, retorna estado inicial
  if (!filters || typeof filters !== 'object') {
    return initialState;
  }

  const f = filters as Record<string, unknown>;
  
  // Validar cada propriedade
  const searchTerm = typeof f.searchTerm === 'string' ? f.searchTerm : '';
  const showFeaturedOnly = typeof f.showFeaturedOnly === 'boolean' ? f.showFeaturedOnly : false;
  
  // Validar selectedDepartment com type guard
  let selectedDepartment: TeamDepartment | 'all' = 'all';
  if (typeof f.selectedDepartment === 'string') {
    // Aqui você pode adicionar validação específica dos departamentos válidos
    // Por exemplo, se você tem uma lista de departamentos válidos:
    const validDepartments = ['all', 'engineering', 'design', 'marketing', 'sales', 'hr'] as const;
    if (validDepartments.includes(f.selectedDepartment as any)) {
      selectedDepartment = f.selectedDepartment as TeamDepartment | 'all';
    }
  }

  return {
    searchTerm,
    selectedDepartment,
    showFeaturedOnly
  };
}

// Criar store writable para os filtros
function createTeamFiltersStore() {
  // Tentar carregar estado salvo com validação
  const savedState = validateTeamFilters(uiState.getTeamFilters());
  const { subscribe, set, update } = writable<TeamFiltersState>(savedState);

  return {
    subscribe,
    
    // Definir termo de busca
    setSearchTerm: (term: string) => {
      logger.debug('Team filters: Setting search term', { term }, 'TeamFilters');
      update(state => {
        const newState = { ...state, searchTerm: term.trim() };
        uiState.setTeamFilters(newState);
        return newState;
      });
    },

    // Definir departamento selecionado
    setSelectedDepartment: (department: TeamDepartment | 'all') => {
      logger.debug('Team filters: Setting department', { department }, 'TeamFilters');
      update(state => {
        const newState = { ...state, selectedDepartment: department };
        uiState.setTeamFilters(newState);
        return newState;
      });
    },

    // Alternar filtro de destaque
    toggleFeaturedOnly: () => {
      logger.debug('Team filters: Toggling featured only', undefined, 'TeamFilters');
      update(state => {
        const newState = { ...state, showFeaturedOnly: !state.showFeaturedOnly };
        uiState.setTeamFilters(newState);
        return newState;
      });
    },

    // Definir se mostra apenas destacados
    setShowFeaturedOnly: (show: boolean) => {
      logger.debug('Team filters: Setting show featured only', { show }, 'TeamFilters');
      update(state => {
        const newState = { ...state, showFeaturedOnly: show };
        uiState.setTeamFilters(newState);
        return newState;
      });
    },

    // Resetar todos os filtros
    reset: () => {
      logger.debug('Team filters: Resetting filters', undefined, 'TeamFilters');
      set(initialState);
      uiState.setTeamFilters(initialState);
    },

    // Atualizar múltiplos filtros de uma vez
    updateFilters: (updates: Partial<TeamFiltersState>) => {
      logger.debug('Team filters: Updating multiple filters', updates, 'TeamFilters');
      update(state => {
        const newState = { ...state, ...updates };
        uiState.setTeamFilters(newState);
        return newState;
      });
    }
  };
}

// Instância do store
export const teamFilters = createTeamFiltersStore();

// Store derivado para verificar se há filtros ativos
export const hasActiveTeamFilters = derived(
  teamFilters,
  ($filters) => {
    return (
      $filters.searchTerm.length > 0 ||
      $filters.selectedDepartment !== 'all' ||
      $filters.showFeaturedOnly
    );
  }
);

// Store derivado para filtrar membros da equipe
export function createFilteredTeamMembersStore(teamMembersStore: Readable<TeamMember[]>) {
  return derived(
    [teamMembersStore, teamFilters],
    ([$teamMembers, $filters]) => {
      // Garantir que sempre temos um array
      if (!Array.isArray($teamMembers) || $teamMembers.length === 0) {
        return [];
      }

      logger.debug('Filtering team members', {
        totalMembers: $teamMembers.length,
        filters: $filters
      }, 'TeamFilters');

      let filtered = [...$teamMembers];

      // Filtrar por departamento
      if ($filters.selectedDepartment !== 'all') {
        filtered = filtered.filter(member => 
          member.department === $filters.selectedDepartment
        );
      }

      // Filtrar por destacados
      if ($filters.showFeaturedOnly) {
        filtered = filtered.filter(member => member.featured === true);
      }

      // Filtrar por termo de busca
      if ($filters.searchTerm.length > 0) {
        const searchTerm = removeAccents($filters.searchTerm.toLowerCase());
        
        filtered = filtered.filter(member => {
          const name = removeAccents(member.name.toLowerCase());
          const position = removeAccents(member.position.toLowerCase());
          const department = removeAccents(member.department.toLowerCase());
          const bio = member.bio ? removeAccents(member.bio.toLowerCase()) : '';

          return (
            name.includes(searchTerm) ||
            position.includes(searchTerm) ||
            department.includes(searchTerm) ||
            bio.includes(searchTerm)
          );
        });
      }

      logger.debug('Team members filtered', {
        originalCount: $teamMembers.length,
        filteredCount: filtered.length,
        filters: $filters
      }, 'TeamFilters');

      return filtered;
    }
  );
}

// Store derivado para estatísticas dos filtros
export const teamFilterStats = derived(
  teamFilters,
  ($filters) => {
    const activeFiltersCount = [
      $filters.searchTerm.length > 0,
      $filters.selectedDepartment !== 'all',
      $filters.showFeaturedOnly
    ].filter(Boolean).length;

    return {
      activeFiltersCount,
      hasActiveFilters: activeFiltersCount > 0,
      searchTermLength: $filters.searchTerm.length,
      isSearching: $filters.searchTerm.length >= 2, // Mínimo para busca
      selectedDepartment: $filters.selectedDepartment,
      showingFeaturedOnly: $filters.showFeaturedOnly
    };
  }
);

// Funções utilitárias para trabalhar com filtros de equipe
export const teamFilterUtils = {
  // Aplicar filtros a uma lista de membros
  applyFilters: (members: TeamMember[], filters: TeamFiltersState): TeamMember[] => {
    if (!Array.isArray(members)) {
      return [];
    }

    let filtered = [...members];

    if (filters.selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === filters.selectedDepartment);
    }

    if (filters.showFeaturedOnly) {
      filtered = filtered.filter(member => member.featured === true);
    }

    if (filters.searchTerm.length > 0) {
      const searchTerm = removeAccents(filters.searchTerm.toLowerCase());
      filtered = filtered.filter(member => {
        const searchableText = [
          member.name,
          member.position,
          member.department,
          member.bio || ''
        ].join(' ').toLowerCase();
        
        return includesIgnoreCase(removeAccents(searchableText), searchTerm);
      });
    }

    return filtered;
  },

  // Obter contagem por departamento
  getDepartmentCounts: (members: TeamMember[]): Record<string, number> => {
    if (!Array.isArray(members)) {
      return { all: 0 };
    }

    const counts: Record<string, number> = { all: members.length };
    
    members.forEach(member => {
      counts[member.department] = (counts[member.department] || 0) + 1;
    });

    return counts;
  },

  // Obter sugestões de busca baseadas nos membros
  getSearchSuggestions: (members: TeamMember[], currentTerm: string): string[] => {
    if (!Array.isArray(members) || currentTerm.length < 2) {
      return [];
    }

    const suggestions = new Set<string>();
    const term = currentTerm.toLowerCase();

    members.forEach(member => {
      // Adicionar nomes que começam com o termo
      if (member.name.toLowerCase().startsWith(term)) {
        suggestions.add(member.name);
      }

      // Adicionar posições que contêm o termo
      if (member.position.toLowerCase().includes(term)) {
        suggestions.add(member.position);
      }

      // Adicionar palavras-chave da bio
      if (member.bio) {
        const words = member.bio.toLowerCase().split(/\s+/);
        words.forEach(word => {
          if (word.startsWith(term) && word.length > 3) {
            suggestions.add(word);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, 5); // Limitar a 5 sugestões
  },

  // Verificar se um filtro produziria resultados
  wouldFilterHaveResults: (members: TeamMember[], filters: Partial<TeamFiltersState>): boolean => {
    if (!Array.isArray(members)) {
      return false;
    }

    const testFilters: TeamFiltersState = {
      searchTerm: '',
      selectedDepartment: 'all',
      showFeaturedOnly: false,
      ...filters
    };

    return teamFilterUtils.applyFilters(members, testFilters).length > 0;
  },

  // Validar se um departamento é válido
  isValidDepartment: (department: string): department is TeamDepartment | 'all' => {
    // Aqui você pode definir os departamentos válidos
    const validDepartments = ['all', 'engineering', 'design', 'marketing', 'sales', 'hr'] as const;
    return validDepartments.includes(department as any);
  },

  // Obter lista de departamentos únicos dos membros
  getUniqueDepartments: (members: TeamMember[]): TeamDepartment[] => {
    if (!Array.isArray(members)) {
      return [];
    }

    const departments = new Set<TeamDepartment>();
    members.forEach(member => {
      departments.add(member.department);
    });

    return Array.from(departments).sort();
  },

  // Criar filtros seguros a partir de dados não tipados
  createSafeFilters: (data: unknown): TeamFiltersState => {
    return validateTeamFilters(data);
  }
};