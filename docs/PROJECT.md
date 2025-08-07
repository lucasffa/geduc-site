# Documentação do Projeto GEDUC

## Visão Geral

O **GEDUC** é uma plataforma web moderna desenvolvida com SvelteKit que visa transformar a educação através da tecnologia e inovação. O projeto implementa uma arquitetura robusta com foco em acessibilidade, performance e escalabilidade.

## Tecnologias Principais

### Frontend Framework
- **SvelteKit 2.22.0**: Framework full-stack baseado em Svelte 5.0
- **TypeScript 5.0**: Tipagem estática para maior segurança e produtividade
- **Vite 7.0.4**: Build tool e dev server de alta performance

### Banco de Dados e ORM
- **PostgreSQL**: Banco de dados relacional robusto
- **Drizzle ORM 0.40.0**: ORM type-safe com excelente performance
- **Drizzle Kit**: Ferramentas de migração e gerenciamento de schema

### Internacionalização
- **Paraglide JS 2.0.0**: Sistema de i18n moderno e performático
- **Inlang**: Configuração centralizada de traduções
- **Suporte a 3 idiomas**: Português (pt-br), Inglês (en), Espanhol (es)

### Validação e Tipagem
- **Zod 4.0.4**: Validação de schemas type-safe
- **TypeScript**: Sistema de tipos avançado

### Testes
- **Vitest 3.2.3**: Framework de testes unitários
- **Playwright 1.49.1**: Testes end-to-end
- **Vitest Browser**: Testes em ambiente de browser real

### Qualidade de Código
- **ESLint 9.18.0**: Linting avançado com configuração customizada
- **Prettier 3.4.2**: Formatação automática de código
- **Svelte Check 4.0.0**: Verificação de tipos para Svelte

## Arquitetura do Projeto

### Estrutura de Pastas

```
src/
├── app.css                    # Sistema de design completo
├── app.d.ts                   # Tipos globais do SvelteKit
├── app.html                   # Template HTML base
├── hooks.server.ts            # Middleware server-side
├── hooks.ts                   # Middleware client-side
├── lib/
│   ├── config/               # Configurações da aplicação
│   ├── constants/            # Constantes e dados estáticos
│   ├── icons/                # Sistema de ícones
│   ├── server/
│   │   └── db/              # Configuração do banco de dados
│   ├── stores/               # Gerenciamento de estado
│   ├── types/                # Definições de tipos TypeScript
│   ├── utils/                # Utilitários e helpers
│   └── validations/          # Schemas de validação
├── routes/                   # Páginas e rotas da aplicação
└── static/                   # Assets estáticos
```

## Sistema de Design

### Design System Completo (`src/app.css`)

O projeto implementa um sistema de design robusto baseado em variáveis CSS com:

#### Paleta de Cores
- **Primárias**: Tons de azul (#2196f3)
- **Secundárias**: Tons de verde (#4caf50)
- **Acento**: Tons de amarelo (#ffeb3b)
- **Neutras**: Escala de cinzas (#fafafa a #212121)
- **Funcionais**: Vermelho, Verde, Azul, Amarelo para feedback

#### Tipografia
- **Font Family**: Inter como fonte principal
- **Escala Tipográfica**: xs (12px) a 4xl (48px)
- **Font Weights**: Light (300) a Bold (700)
- **Line Heights**: Tight (1.25), Normal (1.5), Relaxed (1.75)

#### Espaçamento
- **Sistema Base**: 4px como unidade fundamental
- **Escala**: xs (4px) a 4xl (96px)
- **Containers**: Responsivos (640px a 1280px)

#### Componentes Visuais
- **Border Radius**: sm (2px) a full (9999px)
- **Shadows**: sm a xl com variações
- **Transições**: Fast (150ms) a Slow (350ms)

### Utilitários CSS

Sistema completo de classes utilitárias para:
- **Flexbox**: Layout flexível
- **Grid**: Layout em grade
- **Espaçamento**: Margins e paddings
- **Tipografia**: Tamanhos, pesos e alinhamentos
- **Cores**: Texto e backgrounds
- **Bordas**: Radius e shadows
- **Display**: Visibilidade e posicionamento

## Gerenciamento de Estado

### Stores Svelte (`src/lib/stores/`)

#### API Store (`api.ts`)
- **Estado Centralizado**: Gerenciamento unificado de dados da API
- **Loading States**: Controle de estados de carregamento
- **Error Handling**: Tratamento robusto de erros
- **Cache Management**: Sistema de cache inteligente
- **Mock Data**: Geração de dados para desenvolvimento

#### Stores Derivados
- `teamMembers`: Membros da equipe
- `initiatives`: Iniciativas da organização
- `testimonials`: Depoimentos
- `faqItems`: Perguntas frequentes
- `featuredMedia`: Mídia em destaque
- `partners`: Parceiros

#### Filtros e UI (`teamFilters.ts`, `ui.ts`)
- **Filtros Dinâmicos**: Sistema de filtros reativo
- **UI State**: Estados de interface (modais, notificações, etc.)

## Sistema de Tipos

### Tipos de Dados (`src/lib/types/`)

#### Enums (`enums.ts`)
```typescript
enum TeamDepartment {
  MARKETING = 'marketing',
  JURIDICO = 'juridico',
  EDUCACAO = 'educacao',
  TECNOLOGIA = 'tecnologia',
  ADMINISTRATIVO = 'administrativo'
}

enum InitiativeCategory {
  EDUCACAO = 'educacao',
  TECNOLOGIA = 'tecnologia',
  SUSTENTABILIDADE = 'sustentabilidade',
  COMUNIDADE = 'comunidade',
  INOVACAO = 'inovacao'
}
```

#### Interfaces de Dados (`data.ts`)
- `TeamMember`: Membros da equipe
- `Initiative`: Iniciativas da organização
- `Testimonial`: Depoimentos
- `FaqItem`: Perguntas frequentes
- `FeaturedMedia`: Mídia em destaque
- `Partner`: Parceiros

#### Tipos de Componentes (`components.ts`)
- Interfaces para props de componentes
- Tipos de eventos e callbacks

## Validação e Schemas

### Zod Schemas (`src/lib/validations/forms.ts`)

#### Formulários
- `contactFormSchema`: Formulário de contato
- `newsletterFormSchema`: Newsletter
- `searchFormSchema`: Busca
- `feedbackFormSchema`: Feedback

#### Filtros
- `teamFiltersSchema`: Filtros da equipe
- `initiativeFiltersSchema`: Filtros de iniciativas
- `faqFiltersSchema`: Filtros de FAQ

#### Validações Específicas
- Validação de e-mail
- Validação de telefone
- Validação de URLs
- Sanitização de strings

## Constantes e Configurações

### API Constants (`src/lib/constants/api.ts`)

#### Endpoints
```typescript
export const API_ENDPOINTS = {
  TEAM_MEMBERS: '/team-members',
  INITIATIVES: '/initiatives',
  TESTIMONIALS: '/testimonials',
  FAQ: '/faq',
  // ... outros endpoints
}
```

#### Configurações HTTP
- **Timeout**: 10 segundos
- **Retries**: 3 tentativas
- **Cache TTL**: 5 minutos
- **Rate Limiting**: 60 req/min

### UI Constants (`src/lib/constants/ui.ts`)

#### Configurações de Interface
- **Paginação**: Tamanhos padrão por seção
- **Carrossel**: Intervalos e animações
- **Pesquisa**: Debounce e limites
- **Notificações**: Durações e posições
- **Modais**: Comportamentos e animações

### Data Constants (`src/lib/constants/data.ts`)

#### Dados Estáticos
- **Departamentos**: Lista de departamentos da equipe
- **Categorias**: Categorias de iniciativas e FAQ
- **Estados Brasileiros**: Lista completa de estados
- **Links Sociais**: Plataformas suportadas
- **Navegação**: Estrutura de menu

## Utilitários

### API Utils (`src/lib/utils/api.ts`)

#### Sistema de Cache
```typescript
class MemoryCache {
  set(key: string, data: any, ttl: number): void
  get(key: string): any | null
  delete(key: string): void
  clear(): void
}
```

#### Funções de Requisição
- `apiRequest()`: Requisição HTTP com retry
- `api.get/post/put/patch/delete()`: Métodos HTTP
- `generateMockData()`: Geração de dados mock

### Logger (`src/lib/utils/logger.ts`)

#### Sistema de Logging Avançado
- **Níveis**: DEBUG, INFO, WARN, ERROR, CRITICAL
- **Performance**: Medição automática de performance
- **Storage**: Armazenamento em memória
- **Remote**: Envio para servidor remoto
- **Interceptação**: Erros globais não capturados

#### Wrappers Especializados
- `apiLogger`: Logging de chamadas de API
- `componentLogger`: Logging de componentes
- `navigationLogger`: Logging de navegação

### Helpers (`src/lib/utils/helpers.ts`)
- `generateId()`: Geração de IDs únicos
- `sleep()`: Delay assíncrono
- `retry()`: Retry com backoff
- `debounce()`: Debounce de funções

## Banco de Dados

### Configuração (`src/lib/server/db/`)

#### Schema (`schema.ts`)
```typescript
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  age: integer('age')
});
```

#### Conexão (`index.ts`)
```typescript
const client = postgres(env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

### Configuração Drizzle (`drizzle.config.ts`)
- **Dialect**: PostgreSQL
- **Schema**: `./src/lib/server/db/schema.ts`
- **Credentials**: `DATABASE_URL` environment variable

## Internacionalização

### Configuração Paraglide (`project.inlang/settings.json`)
```json
{
  "baseLocale": "en",
  "locales": ["en", "es", "pt-br"],
  "modules": [
    "@inlang/plugin-message-format",
    "@inlang/plugin-m-function-matcher"
  ]
}
```

### Middleware (`src/hooks.server.ts`)
```typescript
const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request;
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%paraglide.lang%', locale)
    });
  });
```

## Testes

### Configuração Vitest (`vite.config.ts`)
```typescript
test: {
  projects: [
    {
      name: 'client',
      environment: 'browser',
      browser: { enabled: true, provider: 'playwright' }
    },
    {
      name: 'server',
      environment: 'node'
    }
  ]
}
```

### Estrutura de Testes
- **Unit Tests**: `src/**/*.test.ts`
- **Component Tests**: `src/**/*.svelte.test.ts`
- **E2E Tests**: `e2e/demo.test.ts`
- **Setup**: `vitest-setup-client.ts`

## Qualidade de Código

### ESLint (`eslint.config.js`)
- **Configuração**: Baseada em `@eslint/js`
- **Plugins**: `eslint-plugin-svelte`
- **Compatibilidade**: `@eslint/compat`

### Prettier
- **Configuração**: Integração com ESLint
- **Plugin Svelte**: `prettier-plugin-svelte`

## Scripts NPM

### Desenvolvimento
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run preview      # Preview do build
```

### Qualidade
```bash
npm run check        # Verificação de tipos
npm run format       # Formatação de código
npm run lint         # Linting
```

### Testes
```bash
npm run test:unit    # Testes unitários
npm run test:e2e     # Testes end-to-end
npm run test         # Todos os testes
```

### Banco de Dados
```bash
npm run db:push      # Push do schema
npm run db:migrate   # Executar migrações
npm run db:studio    # Abrir Drizzle Studio
```

## Decisões Arquiteturais

### 1. SvelteKit como Framework Principal
**Decisão**: Escolha do SvelteKit para desenvolvimento full-stack
**Justificativa**:
- Performance superior com SSR/SSG
- Developer experience excelente
- TypeScript nativo
- Sistema de roteamento file-based
- Suporte a adaptadores para diferentes ambientes

### 2. Drizzle ORM
**Decisão**: Uso do Drizzle ORM em vez de Prisma ou TypeORM
**Justificativa**:
- Type-safety superior
- Performance excelente
- Bundle size menor
- Sintaxe SQL-like
- Migrations automáticas

### 3. Paraglide JS para i18n
**Decisão**: Paraglide JS em vez de react-i18next ou similar
**Justificativa**:
- Zero runtime overhead
- Type-safe
- Compile-time optimizations
- Integração nativa com SvelteKit

### 4. Sistema de Design CSS Variables
**Decisão**: CSS custom properties em vez de Tailwind ou styled-components
**Justificativa**:
- Controle total sobre o design system
- Performance superior
- Bundle size menor
- Flexibilidade máxima
- Suporte nativo a temas

### 5. Stores Svelte para Estado
**Decisão**: Stores nativos do Svelte em vez de Redux ou Zustand
**Justificativa**:
- Integração nativa com Svelte
- Reatividade automática
- Simplicidade de uso
- Performance otimizada

### 6. Zod para Validação
**Decisão**: Zod para validação de schemas
**Justificativa**:
- Type-safety superior
- Inferência automática de tipos
- Sintaxe declarativa
- Excelente integração com TypeScript

### 7. Vitest + Playwright para Testes
**Decisão**: Stack de testes moderna
**Justificativa**:
- Vitest: Performance superior ao Jest
- Playwright: Suporte multi-browser
- Integração nativa com Vite
- TypeScript nativo

## Padrões de Projeto

### 1. Atomic Design
- **Atoms**: Componentes básicos (Button, Input, etc.)
- **Molecules**: Combinações de atoms (FeatureCard, etc.)
- **Organisms**: Seções complexas (HeroSection, etc.)
- **Templates**: Layouts de página
- **Pages**: Páginas completas

### 2. Feature-First Architecture
- Organização por funcionalidade
- Coesão alta, acoplamento baixo
- Reutilização máxima de código

### 3. Type-Safe Development
- TypeScript em todo o projeto
- Interfaces bem definidas
- Validação de runtime com Zod

### 4. Progressive Enhancement
- Funcionalidade básica sem JavaScript
- Melhorias progressivas
- Acessibilidade como prioridade

### 5. Performance-First
- Lazy loading de componentes
- Code splitting automático
- Otimização de imagens
- Cache inteligente

## Configurações de Ambiente

### Variáveis de Ambiente
```bash
DATABASE_URL=postgresql://user:password@localhost:5432/geduc
NODE_ENV=development
```

### Configurações de Build
- **Adapter**: `@sveltejs/adapter-node`
- **Preprocessor**: `vitePreprocess`
- **TypeScript**: Strict mode habilitado

## Estrutura de Dados

### Entidades Principais

#### TeamMember
```typescript
interface TeamMember {
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
```

#### Initiative
```typescript
interface Initiative {
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
```
