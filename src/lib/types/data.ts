// src/lib/types/data.ts
// Tipos de dados utilizados na aplicação

import type {
  TeamDepartment,
  InitiativeCategory,
  SocialPlatform,
  FaqCategory,
  MediaType,
  LocationState
} from './enums';

// Tipos base para links sociais
export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label: string;
}

// Tipos para membros da equipe
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  department: TeamDepartment;
  avatar: string;
  bio?: string;
  socialLinks: SocialLink[];
  featured: boolean;
  joinDate: string;
}

// Tipos para iniciativas
export interface Initiative {
  id: string;
  title: string;
  description: string;
  category: InitiativeCategory;
  icon: string;
  imageUrl?: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'planned';
  featured: boolean;
  participants?: number;
  location?: string;
}

// Tipos para depoimentos
export interface Testimonial {
  id: string;
  name: string;
  position: string;
  company?: string;
  avatar: string;
  content: string;
  rating?: number;
  date: string;
  featured: boolean;
}

// Tipos para FAQ
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  order: number;
  featured: boolean;
  lastUpdated: string;
}

// Tipos para mídia em destaque
export interface FeaturedMedia {
  id: string;
  title: string;
  description: string;
  content: string;
  author: string;
  authorPosition: string;
  mediaType: MediaType;
  imageUrl: string;
  externalUrl?: string;
  publishDate: string;
  tags: string[];
}

// Tipos para localizações/estados
export interface LocationInfo {
  state: LocationState;
  name: string;
  isActive: boolean;
  participantCount?: number;
  initiatives?: string[];
}

// Tipos para parceiros
export interface Partner {
  id: string;
  name: string;
  logo: string;
  website?: string;
  description?: string;
  category: 'sponsor' | 'educational' | 'government' | 'nonprofit';
  featured: boolean;
}

// Tipos para navegação
export interface NavigationItem {
  label: string;
  href: string;
  external?: boolean;
  children?: NavigationItem[];
}

// Tipos para seções da página
export interface HeroSectionData {
  title: string;
  subtitle: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundImage?: string;
}

export interface AboutPreviewData {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  highlights: string[];
}

// Tipos para formulários
export interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
  organization?: string;
}

export interface NewsletterForm {
  email: string;
  name?: string;
  interests?: string[];
}

// Tipos para metadados SEO
export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
}

// Tipos para Timeline / Nossa História
export interface TimelineItemData {
	title: string;
	description: string;
	year: string | number;
}