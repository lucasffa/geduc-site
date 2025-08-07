// src/lib/utils/formatters.ts

// Funções de formatação de dados

// Formatação de datas
export function formatDate(date: string | Date, format = 'short'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Data inválida';
  }
  
  const options: Intl.DateTimeFormatOptions = (() => {
    switch (format) {
      case 'short':
        return { day: '2-digit', month: '2-digit', year: 'numeric' };
      case 'medium':
        return { day: '2-digit', month: 'short', year: 'numeric' };
      case 'long':
        return { day: '2-digit', month: 'long', year: 'numeric' };
      case 'full':
        return { 
          weekday: 'long', 
          day: '2-digit', 
          month: 'long', 
          year: 'numeric' 
        };
      case 'time':
        return { hour: '2-digit', minute: '2-digit' };
      case 'datetime':
        return { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit', 
          minute: '2-digit' 
        };
      default:
        return { day: '2-digit', month: '2-digit', year: 'numeric' };
    }
  })();
  
  return dateObj.toLocaleDateString('pt-BR', options);
}

// Formatação de data relativa (há 2 dias, 1 semana atrás, etc.)
export function formatRelativeDate(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Agora';
  if (diffMinutes < 60) return `Há ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
  if (diffHours < 24) return `Há ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `Há ${diffDays} dias`;
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `Há ${weeks} semana${weeks !== 1 ? 's' : ''}`;
  }
  if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `Há ${months} mês${months !== 1 ? 'es' : ''}`;
  }
  
  const years = Math.floor(diffDays / 365);
  return `Há ${years} ano${years !== 1 ? 's' : ''}`;
}

// Formatação de números
export function formatNumber(num: number, options: Intl.NumberFormatOptions = {}): string {
  return new Intl.NumberFormat('pt-BR', options).format(num);
}

// Formatação de moeda
export function formatCurrency(amount: number, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

// Formatação de porcentagem
export function formatPercentage(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value / 100);
}

// Formatação de números com sufixos (1K, 1M, etc.)
export function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  const magnitude = Math.floor(Math.log10(num) / 3);
  const scaledNum = num / Math.pow(1000, magnitude);
  
  return `${scaledNum.toFixed(1).replace(/\.0$/, '')}${suffixes[magnitude]}`;
}

// Formatação de telefone brasileiro
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length === 10) {
    // Telefone fixo: (xx) xxxx-xxxx
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else if (cleaned.length === 11) {
    // Celular: (xx) xxxxx-xxxx
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  
  return phone; // Retorna original se não conseguir formatar
}

// Formatação de CPF
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }
  
  return cpf;
}

// Formatação de CNPJ
export function formatCNPJ(cnpj: string): string {
  const cleaned = cnpj.replace(/\D/g, '');
  
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  }
  
  return cnpj;
}

// Formatação de CEP
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
  
  return cep;
}

// Formatação de tamanho de arquivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Formatação de duração em segundos
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Formatação de URL amigável
export function formatURL(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

// Formatação de nome próprio (primeira letra maiúscula)
export function formatProperName(name: string): string {
  return name
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Não capitalizar preposições e artigos
      const smallWords = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'na', 'no', 'para'];
      return smallWords.includes(word) ? word : word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

// Formatação de texto para exibição (truncar com ellipsis)
export function formatDisplayText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Truncar na última palavra completa se possível
  if (lastSpace > maxLength * 0.8) {
    return truncated.slice(0, lastSpace) + '...';
  }
  
  return truncated + '...';
}

// Formatação de tags/categorias para URL
export function formatTagForURL(tag: string): string {
  return tag
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplicados
    .replace(/^-|-$/g, ''); // Remove hífens do início e fim
}

// Formatação de texto para busca (normalização)
export function formatSearchText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s]/g, '') // Remove pontuação
    .replace(/\s+/g, ' ') // Normaliza espaços
    .trim();
}

// Formatação de placeholder para loading
export function formatLoadingPlaceholder(type: 'text' | 'name' | 'email' | 'number' = 'text'): string {
  const placeholders = {
    text: '████████████',
    name: '██████ ████████',
    email: '██████@████.███',
    number: '████'
  };
  
  return placeholders[type];
}

// Formatação de iniciais do nome
export function formatInitials(name: string, maxInitials = 2): string {
  const words = name.trim().split(/\s+/);
  const initials = words
    .slice(0, maxInitials)
    .map(word => word.charAt(0).toUpperCase())
    .join('');
  
  return initials;
}

// Formatação de cor hexadecimal
export function formatHexColor(color: string): string {
  const hex = color.replace('#', '');
  
  if (hex.length === 3) {
    return `#${hex.split('').map(char => char + char).join('')}`;
  }
  
  if (hex.length === 6) {
    return `#${hex}`;
  }
  
  return color;
}

// Formatação de coordenadas geográficas
export function formatCoordinates(lat: number, lng: number, precision = 6): string {
  const latDirection = lat >= 0 ? 'N' : 'S';
  const lngDirection = lng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(lat).toFixed(precision)}°${latDirection}, ${Math.abs(lng).toFixed(precision)}°${lngDirection}`;
}

// Formatação de range de valores
export function formatRange(min: number, max: number, unit = ''): string {
  if (min === max) {
    return `${formatNumber(min)}${unit}`;
  }
  
  return `${formatNumber(min)} - ${formatNumber(max)}${unit}`;
}