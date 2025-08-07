// src/lib/constants/data.ts

import type {
  TeamDepartment,
  InitiativeCategory,
  FaqCategory,
  SocialPlatform,
  LocationState,
  NavigationItem,
  HeroSectionData,
  AboutPreviewData
} from '$lib/types';

// Lista de departamentos da equipe
export const TEAM_DEPARTMENTS = [
  { value: 'all' as const, label: 'Todos' },
  { value: 'marketing' as TeamDepartment, label: 'Marketing' },
  { value: 'juridico' as TeamDepartment, label: 'Jurídico' },
  { value: 'educacao' as TeamDepartment, label: 'Educação' },
  { value: 'tecnologia' as TeamDepartment, label: 'Tecnologia' },
  { value: 'administrativo' as TeamDepartment, label: 'Administrativo' }
] as const;

// Lista de categorias de iniciativas
export const INITIATIVE_CATEGORIES = [
  { value: 'all' as const, label: 'Todas' },
  { value: 'educacao' as InitiativeCategory, label: 'Educação' },
  { value: 'tecnologia' as InitiativeCategory, label: 'Tecnologia' },
  { value: 'sustentabilidade' as InitiativeCategory, label: 'Sustentabilidade' },
  { value: 'comunidade' as InitiativeCategory, label: 'Comunidade' },
  { value: 'inovacao' as InitiativeCategory, label: 'Inovação' }
] as const;

// Lista de categorias de FAQ
export const FAQ_CATEGORIES = [
  { value: 'all' as const, label: 'Todas' },
  { value: 'geral' as FaqCategory, label: 'Geral' },
  { value: 'iniciativas' as FaqCategory, label: 'Iniciativas' },
  { value: 'equipe' as FaqCategory, label: 'Equipe' },
  { value: 'contato' as FaqCategory, label: 'Contato' },
  { value: 'tecnologia' as FaqCategory, label: 'Tecnologia' }
] as const;

// Lista de plataformas sociais
export const SOCIAL_PLATFORMS = [
  { value: 'linkedin' as SocialPlatform, label: 'LinkedIn', icon: 'linkedin' },
  { value: 'instagram' as SocialPlatform, label: 'Instagram', icon: 'instagram' },
  { value: 'facebook' as SocialPlatform, label: 'Facebook', icon: 'facebook' },
  { value: 'twitter' as SocialPlatform, label: 'Twitter', icon: 'twitter' },
  { value: 'youtube' as SocialPlatform, label: 'YouTube', icon: 'youtube' },
  { value: 'whatsapp' as SocialPlatform, label: 'WhatsApp', icon: 'whatsapp' }
] as const;

// Estados brasileiros
export const BRAZILIAN_STATES = [
  { code: 'AC' as LocationState, name: 'Acre', region: 'Norte' },
  { code: 'AL' as LocationState, name: 'Alagoas', region: 'Nordeste' },
  { code: 'AP' as LocationState, name: 'Amapá', region: 'Norte' },
  { code: 'AM' as LocationState, name: 'Amazonas', region: 'Norte' },
  { code: 'BA' as LocationState, name: 'Bahia', region: 'Nordeste' },
  { code: 'CE' as LocationState, name: 'Ceará', region: 'Nordeste' },
  { code: 'DF' as LocationState, name: 'Distrito Federal', region: 'Centro-Oeste' },
  { code: 'ES' as LocationState, name: 'Espírito Santo', region: 'Sudeste' },
  { code: 'GO' as LocationState, name: 'Goiás', region: 'Centro-Oeste' },
  { code: 'MA' as LocationState, name: 'Maranhão', region: 'Nordeste' },
  { code: 'MT' as LocationState, name: 'Mato Grosso', region: 'Centro-Oeste' },
  { code: 'MS' as LocationState, name: 'Mato Grosso do Sul', region: 'Centro-Oeste' },
  { code: 'MG' as LocationState, name: 'Minas Gerais', region: 'Sudeste' },
  { code: 'PA' as LocationState, name: 'Pará', region: 'Norte' },
  { code: 'PB' as LocationState, name: 'Paraíba', region: 'Nordeste' },
  { code: 'PR' as LocationState, name: 'Paraná', region: 'Sul' },
  { code: 'PE' as LocationState, name: 'Pernambuco', region: 'Nordeste' },
  { code: 'PI' as LocationState, name: 'Piauí', region: 'Nordeste' },
  { code: 'RJ' as LocationState, name: 'Rio de Janeiro', region: 'Sudeste' },
  { code: 'RN' as LocationState, name: 'Rio Grande do Norte', region: 'Nordeste' },
  { code: 'RS' as LocationState, name: 'Rio Grande do Sul', region: 'Sul' },
  { code: 'RO' as LocationState, name: 'Rondônia', region: 'Norte' },
  { code: 'RR' as LocationState, name: 'Roraima', region: 'Norte' },
  { code: 'SC' as LocationState, name: 'Santa Catarina', region: 'Sul' },
  { code: 'SP' as LocationState, name: 'São Paulo', region: 'Sudeste' },
  { code: 'SE' as LocationState, name: 'Sergipe', region: 'Nordeste' },
  { code: 'TO' as LocationState, name: 'Tocantins', region: 'Norte' }
] as const;

// Itens de navegação
export const NAVIGATION_ITEMS: NavigationItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Sobre Nós', href: '/about-us' },
  { label: 'Iniciativas', href: '/initiatives' },
  { label: 'FAQ', href: '/faq' }
];

// Links do footer
export const FOOTER_LINKS = {
  pages: [
    { label: 'Home', href: '/' },
    { label: 'Sobre Nós', href: '/about-us' },
    { label: 'Iniciativas', href: '/initiatives' },
    { label: 'FAQ', href: '/faq' }
  ],
  legal: [
    { label: 'Política de Privacidade', href: '/privacy' },
    { label: 'Termos de Uso', href: '/terms' },
    { label: 'Cookies', href: '/cookies' }
  ],
  contact: [
    { label: 'Fale Conosco', href: '/contact' },
    { label: 'Imprensa', href: '/press' },
    { label: 'Parcerias', href: '/partnerships' }
  ]
};

// Links sociais da organização
export const ORGANIZATION_SOCIAL_LINKS = [
  { platform: 'linkedin' as SocialPlatform, url: 'https://linkedin.com/company/geduc', label: 'LinkedIn' },
  { platform: 'instagram' as SocialPlatform, url: 'https://instagram.com/geduc', label: 'Instagram' },
  { platform: 'facebook' as SocialPlatform, url: 'https://facebook.com/geduc', label: 'Facebook' },
  { platform: 'youtube' as SocialPlatform, url: 'https://youtube.com/@geduc', label: 'YouTube' }
];

// Dados da seção Hero
export const HERO_SECTION_DATA: HeroSectionData = {
  title: 'Transformando a Educação no Brasil',
  subtitle: 'Uma plataforma inovadora para conectar educadores e estudantes',
  description: 'Criamos soluções tecnológicas que revolucionam o ensino e aprendizado, promovendo uma educação mais acessível, inclusiva e eficaz para todos.',
  ctaText: 'Conheça nossas iniciativas',
  ctaHref: '/initiatives'
};

// Dados da seção About Preview
export const ABOUT_PREVIEW_DATA: AboutPreviewData = {
  title: 'Sobre a GEDUC',
  description: 'Somos uma organização dedicada a transformar a educação através da tecnologia e inovação. Nossa missão é criar pontes entre o conhecimento tradicional e as possibilidades do futuro.',
  ctaText: 'Saiba mais sobre nós',
  ctaHref: '/about-us',
  highlights: [
    'Mais de 10.000 estudantes impactados',
    'Parcerias com 50+ instituições de ensino',
    'Tecnologia de ponta aplicada à educação',
    'Equipe multidisciplinar especializada'
  ]
};

// Dados de contato da organização
export const CONTACT_INFO = {
  email: 'contato@geduc.org.br',
  phone: '+55 (11) 99999-9999',
  address: {
    street: 'Rua da Educação, 123',
    district: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01000-000'
  },
  businessHours: {
    weekdays: '09:00 - 18:00',
    saturday: '09:00 - 12:00',
    sunday: 'Fechado'
  }
};

// Informações sobre a organização
export const ORGANIZATION_INFO = {
  name: 'GEDUC - Grupo de Estudos em Educação Digital',
  shortName: 'GEDUC',
  description: 'Transformando a educação através da tecnologia e inovação.',
  foundedYear: 2020,
  location: 'São Paulo, Brasil',
  website: 'https://geduc.org.br',
  cnpj: '00.000.000/0001-00'
};