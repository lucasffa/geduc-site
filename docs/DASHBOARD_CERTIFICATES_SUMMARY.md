# Dashboard & Certificados — Resumo da Implementação

## O que foi feito

### 1. Migração de Banco de Dados: PostgreSQL → SQLite

- **Antes**: PostgreSQL via driver `postgres`
- **Agora**: SQLite via `better-sqlite3` + Drizzle ORM
- **Multi-tenancy**: cada organização tem seu próprio arquivo `.db` em `data/orgs/{slug}.db`
- O banco do sistema fica em `data/system.db`
- Modo WAL + foreign keys habilitados em todas as instâncias

### 2. Schemas

**System DB** (`schema-system.ts`):
- `organizations` — nome, slug, brandName, logoUrl, primaryColor, soft delete
- `users` — email, senha (bcrypt), role (5 níveis), organizationId, soft delete
- `sessions` — token de sessão, expiresAt
- `invitations` — token, email, role, org, expiresAt, acceptedAt
- `api_keys` — ownerType (user/org), encryptedKey (AES-256-GCM), iv, salt, hashDigest (SHA-256), soft delete + anonimização
- `audit_log` — 5W2H (who, whatTable, whatRecordId, how, why, when, whereIp, howManyAffected) + hashDigest para integridade

**Org DB** (`schema-org.ts`):
- `participants` — id UUID, name, email, role, status, soft delete
- `status_history` — histórico de transições de status
- `certificates` — participantId, templateName, workloadHours, period, pdfPath, sentAt, status, soft delete
- `workgroups` + `user_workgroups` (junction)

### 3. Autenticação & Sessões

- Login por email/senha (bcrypt)
- Sessão baseada em cookie (`session_id`) — 7 dias TTL
- Cache in-memory (Map) para validação rápida — 5 min TTL
- Hooks (`hooks.server.ts`) carregam user, organization, permissions e orgDb em `event.locals`
- Guard de rota: `/dashboard` requer auth, `/sysadmin` requer role `sysadmin`

### 4. Sistema de Roles & Permissões

| Role       | Nível | Descrição                     |
|------------|-------|-------------------------------|
| `sysadmin` | 4     | Super user, acesso total      |
| `admin`    | 3     | Admin da organização          |
| `volunteer`| 2     | Operador / voluntário         |
| `mentee`   | 1     | Somente leitura               |
| `dumb`     | 0     | Sem acesso ao dashboard       |

14 feature flags granulares definidas em `constants/feature-flags.ts`, enforced no server e client via `requirePermission()` e `<PermissionGate>`.

### 5. Criptografia de API Keys

- **Encriptação**: AES-256-GCM + PBKDF2 (100k iterações, SHA-512)
- **Hash digest**: SHA-256 para fingerprint (mantido mesmo após anonimização)
- **Cache**: chave decriptada fica em memória (TTL=0 = até restart do servidor)
- **Anonimização**: ao revogar, encryptedKey/iv/salt são zerados, hashDigest permanece para auditoria

### 6. Resend Tri-mode

O envio de e-mails suporta 3 fontes de API key:

1. **System key** — variável de ambiente `RESEND_API_KEY` (para convites, auth)
2. **User key** — chave pessoal do usuário (decriptada no login, em cache)
3. **Org key** — chave da organização (decriptada pelo admin no login, em cache)

**Prioridade no envio de certificados**: user key > org key > system key

### 7. Audit Log (5W2H)

Toda operação de escrita (CRUD) gera uma entrada no audit_log:

- **Who**: ID do usuário
- **What**: tabela + recordId
- **How**: CREATE / READ / UPDATE / DELETE
- **Why**: descrição textual da ação
- **When**: timestamp ISO-8601
- **Where**: IP (x-forwarded-for ou getClientAddress)
- **How many**: registros afetados
- **Hash digest**: SHA-256 do JSON serializado dos campos acima — garante integridade

### 8. Componentes (Atomic Design)

Seguindo a hierarquia: Atoms → Molecules → Organisms → Templates

- **7 Atoms**: Input, Select, Checkbox, Badge, Spinner, Toast, Textarea
- **8 Molecules**: FormField, SearchBar, Pagination, UserAvatar, BrandHeader, PermissionGate, ToastContainer, FilterBar
- **5 Organisms**: DashboardSidebar, DashboardTopBar, DataTable, LoginForm, TimelineView
- **2 Templates**: DashboardTemplate, AuthTemplate

Todos em **Svelte 4 syntax** (`export let`, `$:`, `<slot>`, `on:click`).

### 9. Páginas do Dashboard

| Rota                         | Descrição                                        |
|------------------------------|--------------------------------------------------|
| `/dashboard`                 | Visão geral (stats, atividade recente)           |
| `/dashboard/participantes`   | CRUD de participantes, filtros, histórico         |
| `/dashboard/certificados`    | Gerar, enviar, testar e-mails, upload template   |
| `/dashboard/usuarios`        | Gerenciar usuários da org, enviar convites        |
| `/dashboard/workgroups`      | CRUD de grupos de trabalho                        |
| `/dashboard/configuracoes`   | Branding da org, gerenciamento de API keys        |
| `/dashboard/audit-log`       | Visualizar log de auditoria da organização        |

### 10. Painel Sysadmin

| Rota                          | Descrição                                      |
|-------------------------------|------------------------------------------------|
| `/sysadmin`                   | Overview (stats globais, ações rápidas)         |
| `/sysadmin/organizations`     | CRUD de organizações (cria slug + DB file)      |
| `/sysadmin/users`             | Gerenciar todos os usuários do sistema          |
| `/sysadmin/audit-log`         | Log de auditoria global (todas as orgs)         |

### 11. APIs Migradas e Novas

**Migradas (pg → SQLite + auth + audit + soft delete)**:
- `GET/POST /dashboard/api/participants`
- `PATCH/DELETE /dashboard/api/participants/[id]`
- `POST /dashboard/api/participants/[id]/status`
- `GET /dashboard/api/participants/[id]/history`
- `POST /dashboard/api/participants/import`
- `GET /dashboard/api/stats`
- `POST /dashboard/api/certificates/generate`
- `POST /dashboard/api/certificates/send`
- `POST /dashboard/api/certificates/send-batch`
- `POST /dashboard/api/certificates/test-email`
- `GET/POST /dashboard/api/certificates/upload-template`

**Novas**:
- `POST /dashboard/api/users/invite`
- `PATCH/DELETE /dashboard/api/users/[id]`
- `GET/POST /dashboard/api/workgroups`
- `DELETE /dashboard/api/workgroups/[id]`
- `PATCH /dashboard/api/organization`
- `GET/POST /dashboard/api/api-keys`
- `POST /dashboard/api/api-keys/[id]/revoke`
- `GET /dashboard/api/audit-log`
- `GET/POST /sysadmin/api/organizations`
- `PATCH/DELETE /sysadmin/api/organizations/[id]`
- `GET /sysadmin/api/users`
- `PATCH/DELETE /sysadmin/api/users/[id]`

### 12. White-label

- Cada organização define `brandName`, `logoUrl`, `primaryColor`
- CSS variable `--brand-color` injetada no layout do dashboard
- Sidebar e header exibem logo/nome da organização

---

## Login Sysadmin

O usuário sysadmin é criado pelo script de seed:

```bash
pnpm tsx src/lib/server/db/seed.ts
```

### Credenciais padrão

| Campo | Valor                           |
|-------|---------------------------------|
| Email | `admin@geduc.org`               |
| Senha | `admin123`                      |
| Nome  | `System Admin`                  |
| Role  | `sysadmin`                      |

Essas credenciais podem ser sobrescritas por variáveis de ambiente **antes** de rodar o seed:

```bash
SYSADMIN_EMAIL="seu@email.com" SYSADMIN_PASSWORD="senhaSegura" SYSADMIN_NAME="Seu Nome" pnpm tsx src/lib/server/db/seed.ts
```

### Como funciona o fluxo

1. **Seed**: Roda `seed.ts`, que chama `initSystemDb()` (cria tabelas no `data/system.db`) e insere o sysadmin se não existir
2. **Login**: Acesse `/auth/login`, entre com email/senha. O sistema verifica bcrypt, cria sessão no DB + cache, seta cookie `session_id`
3. **Dashboard**: Usuário é redirecionado para `/dashboard`. O hooks carrega user/org/permissions automaticamente
4. **Sysadmin**: Com role `sysadmin`, o sidebar exibe link "Painel Sysadmin" → `/sysadmin`
5. **Criar organização**: No painel sysadmin, crie uma org (define slug). Isso gera o arquivo `data/orgs/{slug}.db` com todas as tabelas da org
6. **Associar usuários**: Edite usuários no sysadmin para associá-los a uma organização e definir roles
7. **Convites**: Admins de org podem enviar convites (`/dashboard/usuarios`) → gera token → link `/auth/invite/[token]`
8. **Operações**: Todas as operações de escrita são auditadas automaticamente no audit_log com 5W2H + hash digest

### Comandos para iniciar

```bash
# Instalar dependências
pnpm install

# Criar banco e sysadmin
pnpm tsx src/lib/server/db/seed.ts

# Iniciar dev server
pnpm dev

# Acessar
# http://localhost:5173/auth/login
# Email: admin@geduc.org
# Senha: admin123
```
