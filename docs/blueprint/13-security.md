# 13. Segurança

> Segurança não é uma feature — é uma propriedade do sistema. Documente como o sistema se protege.

---

## 13.1 Modelo de Ameaças

> Quais são as principais ameaças ao sistema? Considere: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.

Utilizamos uma abordagem simplificada baseada no modelo **STRIDE** para identificar e mitigar ameaças.

| Ameaça | Categoria (STRIDE) | Impacto | Mitigação |
|--------|---------------------|---------|-----------|
| Vazamento de API keys | I (Information Disclosure) | Alto | Keys em variáveis de ambiente, nunca no código |
| Acesso não autorizado ao YouTube | E (Elevation of Privilege) | Alto | OAuth2 com escopo mínimo |
| Adulteração de estado do pipeline | T (Tampering) | Médio | PipelineContext imutável, persistência validada |
| Uso indevido de credenciais | S (Spoofing) | Alto | Validação de presença de env vars ao iniciar |
| Exposição de dados de métricas | I (Information Disclosure) | Baixo | Dados são públicos (YouTube) |
| DoS por rate limit | D (Denial of Service) | Médio | Retry com backoff, rate limiting nas APIs |
| Execução de comandos maliciosos | E (Elevation of Privilege) | Alto | Sem exec de input externo; apenas CLI local |

<!-- APPEND:threats -->

**Legenda STRIDE:**

- **S** — Spoofing (falsificação de identidade)
- **T** — Tampering (adulteração de dados)
- **R** — Repudiation (negação de autoria)
- **I** — Information Disclosure (vazamento de informações)
- **D** — Denial of Service (negação de serviço)
- **E** — Elevation of Privilege (escalação de privilégios)

---

## 13.2 Autenticação

> Como os usuários provam quem são? OAuth, JWT, API keys, SSO?

Sistema de uso interno via CLI. Autenticação é primariamente com serviços externos.

- **Método:** API Keys para serviços externos; OAuth2 para YouTube
- **Provedor:** YouTube (OAuth2), OpenRouter (API Key), ElevenLabs (API Key), Pexels (API Key)
- **Fluxo:** Client Credentials para APIs; OAuth2 Authorization Code para YouTube

### Fluxo de Autenticação

```
Operador (CLI)
      │
      ▼
Variáveis de ambiente validadas
      │
      ├── API Keys presentes? ──► Iniciar
      │
      └── API Keys ausentes? ──► Falhar com erro claro
      
YouTube OAuth2:
      │
      ▼
Browser abre auth URL
      │
      ▼
Usuário aprova acesso
      │
      ▼
Token retornado (access + refresh)
      │
      ▼
Armazenar token (arquivo local encriptado)
```

### Políticas de Credenciais

- **Armazenamento:** Variáveis de ambiente (`.env` não versionado)
- **Validação:** Ao iniciar, verificar se todas as Required vars estão presentes
- **OAuth2 YouTube:** Refresh token automático
- **MFA:** Não aplicável (ferramenta interna, operador único)

---

## 13.3 Autorização

> Como o sistema decide o que cada usuário pode fazer? RBAC, ABAC, ACL?

Sistema de operador único. Não há múltiplos usuários.

- **Modelo:** Operador único (não há separação de roles)
- **Controle de acesso:** Apenas quem tem acesso ao servidor/ambiente pode executar

### Roles e Permissões

| Role | Descrição | Permissões |
|------|-----------|------------|
| Operador | Usuário único do sistema | Todas: executar pipeline, ver status, configurar |

### Regras de Acesso

- **Princípio do menor privilégio:** Aplicado às APIs externas (apenas escopos necessários)
- **Segregação de funções:** Não aplicável (operador único)
- **Acesso ao servidor:** Controle via sistema operacional

---

## 13.4 Proteção de Dados

> Quais dados são sensíveis e como são protegidos?

### Dados em Trânsito

- **Protocolo:** HTTPS para todas as APIs externas
- **Certificate Pinning:** Não implementado (APIs públicas)
- **TLS:** 1.2+ para todas as conexões

### Dados em Repouso

- **Criptografia:** PostgreSQL com criptografia nativa (se disponível no provider)
- **Gerenciamento de chaves:** Variáveis de ambiente
- **Backups criptografados:** Configuração do provedor PostgreSQL
- **Arquivos locais:** Vídeos/thumbnails em disco local (não sensíveis)

### Dados Sensíveis (PII)

| Dado | Classificação | Proteção | Retenção |
|------|---------------|----------|----------|
| API Keys | Secreto | Variáveis de ambiente, nunca versionado | Durante uso |
| OAuth Tokens | Secreto | Arquivo local com permissões restritas | Durante uso |
| Logs de execução | Interno | Arquivos locais | 30 dias |
| Métricas de vídeo | Público | YouTube Analytics (já público) | Ilimitado |

### Dados do Sistema

- **PipelineContext:** Armazenado em banco SQLite/PostgreSQL
- **LearningState:** Armazenado em banco
- **VideoMetrics:** Armazenado em banco

---

## 13.5 Checklist de Segurança

Checklist inspirado no **OWASP Top 10** para validação contínua da postura de segurança do sistema.

- [x] **Prevenção de Injection** — Queries via Prisma ORM (parametrizadas)
- [x] **Autenticação e Gerenciamento de Sessão** — API keys, OAuth2 para YouTube
- [x] **Exposição de Dados Sensíveis** — API keys em variáveis de ambiente
- [x] **Controle de Acesso** — Operador único, validação de env vars
- [x] **Configuração de Segurança** — Headers não aplicáveis (CLI sem HTTP server)
- [x] **Cross-Site Scripting (XSS)** — Não aplicável (sem UI)
- [x] **Cross-Site Request Forgery (CSRF)** — Não aplicável (sem UI)
- [x] **Vulnerabilidades em Dependências** — Dependabot enabled, npm audit

### Status Atual

| Item | Status | Responsável | Observações |
|------|--------|-------------|-------------|
| API Keys em env vars | Concluído | Douglas | Nunca versionar .env |
| OAuth2 YouTube | Concluído | Douglas | Refresh automático |
| Dependabot | Concluído | Douglas | Ativo no repositório |
| Logs sem dados sensíveis | Concluído | Douglas | Verificar antes de log |
| Validação de env vars ao iniciar | Concluído | Douglas | Fail fast |

---

## 13.6 Auditoria e Compliance

> Quais regulamentações o sistema precisa atender? LGPD, SOC2, PCI-DSS?

### Regulamentações Aplicáveis

- **LGPD:** Não aplicável — ferramenta interna, dados são do operador (YouTube)
- **SOC2:** Não aplicável — não é SaaS
- **PCI-DSS:** Não aplicável — sem dados de pagamento

### Logging de Auditoria

- **Eventos auditados:**
  - Início e fim de cada pipeline
  - Falhas de step
  - Tentativas de upload
  - Execuções de learning loop
- **Formato do log:** JSON estruturado (conforme RFC 5424)
- **Destino:** Arquivo local (`logs/`) + stdout

### Retenção

| Tipo de Log | Período de Retenção | Armazenamento | Justificativa |
|-------------|---------------------|---------------|---------------|
| Execuções de pipeline | 30 dias | Arquivo local | Debugging |
| Erros e exceções | 30 dias | Arquivo local | Análise de incidentes |
| Métricas de vídeo | Ilimitado | Banco | Histórico de performance |

### Resposta a Incidentes

- **Plano de resposta:** Investigação via logs locais
- **Equipe responsável:** Operador (único usuário)
- **SLA de notificação:** Não aplicável
- **Runbook:** Docs em README.md

---

## Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [STRIDE Threat Model](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [Prisma Security](https://www.prisma.io/docs/guides/security)
- [YouTube Data API - Authentication](https://developers.google.com/youtube/v3/guides/auth)
