```md
# DASHBOARD_CERTIFICATES_SPECS.md

## 1. Overview

Sistema de gestão de voluntários/mentorados com geração e envio automatizado de certificados em PDF.

O sistema deve permitir:
- Importação de dados via planilha
- Gestão do ciclo de vida dos participantes
- Geração automática de certificados personalizados
- Envio individual e em lote por e-mail
- Visualização de métricas e histórico (timeline)

---

## 2. Core Features

### 2.1 Importação de Planilha

**Formato esperado:**
- CSV / XLSX

**Colunas mínimas:**
- nome (string)
- email (string)
- cargo (enum: mentor, mentorado, equipe, etc.)
- data_inscricao (date)
- data_admissao (date, opcional)
- data_fim_ciclo (date)

**Requisitos:**
- Permitir colunas adicionais customizadas
- Mapear colunas manualmente no upload (fallback)
- Validação de dados (email válido, datas coerentes)
- Preview antes de confirmar importação

---

### 2.2 Modelo de Dados

#### Entidade: Participant
```

id: UUID
nome: string
email: string
cargo: string
data_inscricao: date
data_admissao: date
data_fim_ciclo: date
status: enum
carga_horaria: number (opcional)
created_at: datetime
updated_at: datetime

```

#### Status (Flags)
```

* INSCRITO
* ENTREVISTANDO
* ADMITIDO
* ATIVO
* APROVADO_SEM_BOLSA
* APROVADO_COM_BOLSA
* DESATIVADO
* CERTIFICADO_EM_PROCESSAMENTO
* CERTIFICADO_ENVIADO

```

---

### 2.3 Ações do Sistema

Cada participante deve permitir:

- Admitir
- Editar dados
- Marcar aprovação
- Desativar
- Ativar
- Enviar certificado

**Regras:**
- Mudanças de status devem ser registradas em histórico
- Algumas ações dependem de status anterior (ex: só enviar certificado se aprovado)

---

### 2.4 Timeline / Histórico

Registrar eventos por participante:

```

* Data + ação realizada
* Usuário responsável
* Status anterior → novo status

```

Exemplo:
```

[2026-03-01] Status alterado: ENTREVISTANDO → ADMITIDO

```

---

## 3. Geração de Certificados

### 3.1 Templates

- Upload de PDF base (template)
- Sistema deve permitir mapear campos dinâmicos:
  - {{nome}}
  - {{cargo}}
  - {{carga_horaria}}
  - {{data_inicio}}
  - {{data_fim}}

- Suporte a múltiplos templates

---

### 3.2 Preenchimento Automático

- Gerar PDF individual por participante
- Preencher campos dinamicamente
- Basear período em:
  - data_admissao → data_fim_ciclo

---

### 3.3 Certificados Customizados

- Permitir envio de PDF já pronto (override)
- Upload manual por participante (opcional)

---

## 4. Envio de Emails

### 4.1 Funcionalidades

- Envio individual
- Envio em lote
- Preview antes do envio
- Reconfirmação visual dos dados

---

### 4.2 Email de Teste

- Enviar certificado para o próprio usuário antes do envio real
- Usado para validação de template e conteúdo

---

### 4.3 Conteúdo do Email

Campos dinâmicos:
- Nome
- Cargo
- Período
- Mensagem customizável

Anexo:
- PDF do certificado

---

## 5. Envio em Lote

### 5.1 Seleção

Filtros:
- Status
- Cargo
- Período
- Seleção manual

---

### 5.2 Fluxo de Envio

1. Selecionar participantes
2. Definir carga horária
3. Escolher template
4. Preview dos certificados
5. Confirmação
6. Envio

---

## 6. Dashboard

### 6.1 Métricas

- Total de participantes
- Quantidade por status
- Certificados enviados
- Certificados pendentes

---

### 6.2 Visualizações

- Tabela com busca e filtros
- Timeline por participante
- Indicadores visuais de status

---

## 7. Busca e Filtros

- Busca por nome/email
- Filtro por:
  - status
  - cargo
  - período
- Ordenação por datas

---

## 8. Permissões (Opcional - MVP+)

Perfis:
- Admin
- Operador

---

## 9. Requisitos Técnicos

### Backend
- API REST
- Suporte a processamento assíncrono (envios em lote)
- Geração de PDF (ex: PDF-lib, Puppeteer ou similar)

### Frontend
- Dashboard responsivo
- Upload de arquivos
- Preview de dados e PDFs

### Integrações
- Serviço de email (ex: SMTP, SendGrid, etc.)

---

## 10. Fluxo Principal (User Journey)

```

1. Upload da planilha
2. Revisão dos dados
3. Gestão do status dos participantes
4. Seleção de grupo
5. Definição de carga horária
6. Escolha de template
7. Preview dos certificados
8. Envio teste
9. Envio em lote
10. Atualização automática do status

```

---

## 11. Benefícios Esperados

- Automação do envio de certificados
- Redução de erros manuais
- Organização do ciclo de vida
- Rastreabilidade (timeline)
- Escalabilidade (envio em lote)
- Melhor controle e métricas
