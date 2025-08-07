// src/lib/types/enums.ts
// Enumerações para diferentes aspectos da aplicação

export enum ButtonVariant {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  TAG = 'tag',
  GHOST = 'ghost'
}

export enum ButtonSize {
  SMALL = 'sm',
  MEDIUM = 'md',
  LARGE = 'lg'
}

export enum HeadingLevel {
  H1 = 1,
  H2 = 2,
  H3 = 3,
  H4 = 4,
  H5 = 5,
  H6 = 6
}

export enum HeadingVariant {
  DISPLAY = 'display',
  TITLE = 'title',
  SUBTITLE = 'subtitle',
  BODY = 'body'
}

export enum TextSize {
  XS = 'xs',
  SM = 'sm',
  BASE = 'base',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
  XXL = '2xl'
}

export enum TextWeight {
  LIGHT = 'light',
  NORMAL = 'normal',
  MEDIUM = 'medium',
  SEMIBOLD = 'semibold',
  BOLD = 'bold'
}

export enum TeamDepartment {
  MARKETING = 'marketing',
  JURIDICO = 'juridico',
  EDUCACAO = 'educacao',
  TECNOLOGIA = 'tecnologia',
  ADMINISTRATIVO = 'administrativo'
}

export enum InitiativeCategory {
  EDUCACAO = 'educacao',
  TECNOLOGIA = 'tecnologia',
  SUSTENTABILIDADE = 'sustentabilidade',
  COMUNIDADE = 'comunidade',
  INOVACAO = 'inovacao'
}

export enum SocialPlatform {
  LINKEDIN = 'linkedin',
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
  WHATSAPP = 'whatsapp'
}

export enum FaqCategory {
  GERAL = 'geral',
  INICIATIVAS = 'iniciativas',
  EQUIPE = 'equipe',
  CONTATO = 'contato',
  TECNOLOGIA = 'tecnologia'
}

export enum MediaType {
  IMAGE = 'image',
  VIDEO = 'video',
  ARTICLE = 'article',
  INTERVIEW = 'interview'
}

export enum LocationState {
  ACRE = 'AC',
  ALAGOAS = 'AL',
  AMAPA = 'AP',
  AMAZONAS = 'AM',
  BAHIA = 'BA',
  CEARA = 'CE',
  DISTRITO_FEDERAL = 'DF',
  ESPIRITO_SANTO = 'ES',
  GOIAS = 'GO',
  MARANHAO = 'MA',
  MATO_GROSSO = 'MT',
  MATO_GROSSO_DO_SUL = 'MS',
  MINAS_GERAIS = 'MG',
  PARA = 'PA',
  PARAIBA = 'PB',
  PARANA = 'PR',
  PERNAMBUCO = 'PE',
  PIAUI = 'PI',
  RIO_DE_JANEIRO = 'RJ',
  RIO_GRANDE_DO_NORTE = 'RN',
  RIO_GRANDE_DO_SUL = 'RS',
  RONDONIA = 'RO',
  RORAIMA = 'RR',
  SANTA_CATARINA = 'SC',
  SAO_PAULO = 'SP',
  SERGIPE = 'SE',
  TOCANTINS = 'TO'
}

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}