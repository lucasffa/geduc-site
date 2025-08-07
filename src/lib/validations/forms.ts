// src/lib/validations/forms.ts

import { z } from 'zod';

// Schema para formulário de contato
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres'),
  
  phone: z
    .string()
    .optional()
    .refine(
      (val) => !val || /^[\+]?[1-9][\d]{0,15}$/.test(val.replace(/[\s\-\(\)]/g, '')),
      'Telefone inválido'
    ),
  
  subject: z
    .string()
    .min(5, 'Assunto deve ter pelo menos 5 caracteres')
    .max(200, 'Assunto deve ter no máximo 200 caracteres'),
  
  message: z
    .string()
    .min(10, 'Mensagem deve ter pelo menos 10 caracteres')
    .max(2000, 'Mensagem deve ter no máximo 2000 caracteres'),
  
  organization: z
    .string()
    .max(200, 'Organização deve ter no máximo 200 caracteres')
    .optional(),
  
  // Checkbox de consentimento
  consent: z
    .boolean()
    .refine(val => val === true, 'É necessário aceitar os termos de uso')
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

// Schema para newsletter
export const newsletterFormSchema = z.object({
  email: z
    .string()
    .email('E-mail inválido')
    .max(255, 'E-mail deve ter no máximo 255 caracteres'),
  
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  
  interests: z
    .array(z.string())
    .max(10, 'Selecione no máximo 10 interesses')
    .optional(),
  
  consent: z
    .boolean()
    .refine(val => val === true, 'É necessário aceitar o recebimento de e-mails')
});

export type NewsletterFormData = z.infer<typeof newsletterFormSchema>;

// Schema para busca
export const searchFormSchema = z.object({
  query: z
    .string()
    .min(2, 'Busca deve ter pelo menos 2 caracteres')
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .transform(val => val.trim()),
  
  category: z
    .enum(['all', 'team', 'initiatives', 'faq', 'media'])
    .default('all'),
  
  filters: z
    .array(z.string())
    .max(5, 'Selecione no máximo 5 filtros')
    .optional()
});

export type SearchFormData = z.infer<typeof searchFormSchema>;

// Schema para filtros da equipe
export const teamFiltersSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .default(''),
  
  selectedDepartment: z
    .enum(['all', 'marketing', 'juridico', 'educacao', 'tecnologia', 'administrativo'])
    .default('all'),
  
  showFeaturedOnly: z
    .boolean()
    .default(false)
});

export type TeamFiltersData = z.infer<typeof teamFiltersSchema>;

// Schema para filtros de iniciativas
export const initiativeFiltersSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .default(''),
  
  selectedCategory: z
    .enum(['all', 'educacao', 'tecnologia', 'sustentabilidade', 'comunidade', 'inovacao'])
    .default('all'),
  
  selectedStatus: z
    .enum(['all', 'active', 'completed', 'planned'])
    .default('all'),
  
  showFeaturedOnly: z
    .boolean()
    .default(false)
});

export type InitiativeFiltersData = z.infer<typeof initiativeFiltersSchema>;

// Schema para filtros de FAQ
export const faqFiltersSchema = z.object({
  searchTerm: z
    .string()
    .max(100, 'Busca deve ter no máximo 100 caracteres')
    .default(''),
  
  selectedCategory: z
    .enum(['all', 'geral', 'iniciativas', 'equipe', 'contato', 'tecnologia'])
    .default('all'),
  
  showFeaturedOnly: z
    .boolean()
    .default(false)
});

export type FaqFiltersData = z.infer<typeof faqFiltersSchema>;

// Schema para feedback/avaliação
export const feedbackFormSchema = z.object({
  rating: z
    .number()
    .min(1, 'Avaliação deve ser entre 1 e 5')
    .max(5, 'Avaliação deve ser entre 1 e 5'),
  
  comment: z
    .string()
    .min(10, 'Comentário deve ter pelo menos 10 caracteres')
    .max(1000, 'Comentário deve ter no máximo 1000 caracteres')
    .optional(),
  
  category: z
    .enum(['website', 'content', 'functionality', 'suggestion', 'bug'])
    .default('website'),
  
  email: z
    .string()
    .email('E-mail inválido')
    .optional(),
  
  anonymous: z
    .boolean()
    .default(false)
});

export type FeedbackFormData = z.infer<typeof feedbackFormSchema>;

// Schema para configurações do usuário
export const userPreferencesSchema = z.object({
  theme: z
    .enum(['light', 'dark', 'system'])
    .default('system'),
  
  language: z
    .enum(['pt', 'en', 'es'])
    .default('pt'),
  
  reducedMotion: z
    .boolean()
    .default(false),
  
  newsletterOptIn: z
    .boolean()
    .default(false),
  
  analyticsOptIn: z
    .boolean()
    .default(false),
  
  cookiesAccepted: z
    .boolean()
    .default(false),
  
  consentGiven: z
    .boolean()
    .default(false)
});

export type UserPreferencesData = z.infer<typeof userPreferencesSchema>;

// Schema para dados de membros da equipe (validação de entrada)
export const teamMemberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  position: z.string().min(2).max(200),
  department: z.enum(['marketing', 'juridico', 'educacao', 'tecnologia', 'administrativo']),
  avatar: z.string().url(),
  bio: z.string().max(500).optional(),
  socialLinks: z.array(z.object({
    platform: z.enum(['linkedin', 'instagram', 'facebook', 'twitter', 'youtube', 'whatsapp']),
    url: z.string().url(),
    label: z.string()
  })).max(6),
  featured: z.boolean(),
  joinDate: z.string().datetime()
});

export type TeamMemberValidated = z.infer<typeof teamMemberSchema>;

// Schema para dados de iniciativas (validação de entrada)
export const initiativeSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(1000),
  category: z.enum(['educacao', 'tecnologia', 'sustentabilidade', 'comunidade', 'inovacao']),
  icon: z.string(),
  imageUrl: z.string().url().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  status: z.enum(['active', 'completed', 'planned']),
  featured: z.boolean(),
  participants: z.number().min(0).optional(),
  location: z.string().max(200).optional()
});

export type InitiativeValidated = z.infer<typeof initiativeSchema>;

// Schema para depoimentos (validação de entrada)
export const testimonialSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(2).max(100),
  position: z.string().min(2).max(200),
  company: z.string().max(200).optional(),
  avatar: z.string().url(),
  content: z.string().min(10).max(1000),
  rating: z.number().min(1).max(5).optional(),
  date: z.string().datetime(),
  featured: z.boolean()
});

export type TestimonialValidated = z.infer<typeof testimonialSchema>;

// Funções auxiliares de validação
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateURL = (url: string): boolean => {
  return z.string().url().safeParse(url).success;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  return /^[\+]?[1-9][\d]{0,15}$/.test(cleanPhone);
};

export const sanitizeString = (str: string): string => {
  return str.trim().replace(/\s+/g, ' ');
};

export const validateRequired = (value: any): boolean => {
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined;
};