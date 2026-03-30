# 13. Seguranca

> Seguranca nao e uma feature — e uma propriedade do sistema. Documente como o sistema se protege.

---

## 13.1 Modelo de Ameacas

> Quais sao as principais ameacas ao sistema? Considere: Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege.

Utilizamos uma abordagem simplificada baseada no modelo **STRIDE** para identificar e mitigar ameacas.

| Ameaca | Categoria (STRIDE) | Impacto | Mitigacao |
|--------|---------------------|---------|-----------|
| {{ameaca_1}} | {{categoria_stride}} | {{impacto_1}} | {{mitigacao_1}} |
| {{ameaca_2}} | {{categoria_stride}} | {{impacto_2}} | {{mitigacao_2}} |
| {{ameaca_3}} | {{categoria_stride}} | {{impacto_3}} | {{mitigacao_3}} |

<!-- APPEND:threats -->

**Legenda STRIDE:**

- **S** — Spoofing (falsificacao de identidade)
- **T** — Tampering (adulteracao de dados)
- **R** — Repudiation (negacao de autoria)
- **I** — Information Disclosure (vazamento de informacoes)
- **D** — Denial of Service (negacao de servico)
- **E** — Elevation of Privilege (escalacao de privilegios)

---

## 13.2 Autenticacao

> Como os usuarios provam quem sao? OAuth, JWT, API keys, SSO?

A autenticacao define como usuarios e sistemas comprovam sua identidade antes de acessar recursos protegidos.

- **Metodo:** {{metodo_autenticacao}} (ex.: OAuth 2.0, JWT, API Keys, SSO, MFA)
- **Provedor:** {{provedor_autenticacao}} (ex.: Auth0, Keycloak, Cognito, implementacao propria)
- **Fluxo:** {{fluxo_autenticacao}} (ex.: Authorization Code + PKCE, Client Credentials, Resource Owner Password)

### Fluxo de Autenticacao

```
{{diagrama_fluxo_autenticacao}}
```

### Politicas de Credenciais

- Complexidade de senha: {{politica_senha}}
- Expiracao de tokens: {{expiracao_token}}
- Refresh tokens: {{politica_refresh_token}}
- Tentativas de login: {{limite_tentativas_login}}
- MFA: {{politica_mfa}}

---

## 13.3 Autorizacao

> Como o sistema decide o que cada usuario pode fazer? RBAC, ABAC, ACL?

- **Modelo:** {{modelo_autorizacao}} (ex.: RBAC, ABAC, ACL, Policy-based)

### Roles e Permissoes

| Role | Descricao | Permissoes |
|------|-----------|------------|
| {{role_1}} | {{descricao_role_1}} | {{permissoes_role_1}} |
| {{role_2}} | {{descricao_role_2}} | {{permissoes_role_2}} |
| {{role_3}} | {{descricao_role_3}} | {{permissoes_role_3}} |

<!-- APPEND:roles -->

### Regras de Acesso

- Principio do menor privilegio: {{como_aplicado}}
- Segregacao de funcoes: {{segregacao}}
- Revisao periodica de acessos: {{frequencia_revisao}}

---

## 13.4 Protecao de Dados

> Quais dados sao sensiveis e como sao protegidos?

### Dados em Transito

- **Protocolo:** {{protocolo_transito}} (ex.: TLS 1.3, mTLS)
- **Certificate Pinning:** {{certificate_pinning}} (sim/nao, onde aplicado)
- **Cifras permitidas:** {{cifras_permitidas}}
- **HSTS:** {{hsts_configuracao}}

### Dados em Repouso

- **Criptografia:** {{criptografia_repouso}} (ex.: AES-256, algoritmo utilizado)
- **Gerenciamento de chaves:** {{gerenciamento_chaves}} (ex.: AWS KMS, HashiCorp Vault)
- **Backups criptografados:** {{backups_criptografados}} (sim/nao)

### Dados Sensiveis (PII)

| Dado | Classificacao | Protecao | Retencao |
|------|---------------|----------|----------|
| {{dado_sensivel_1}} | {{classificacao_1}} | {{protecao_1}} | {{retencao_1}} |
| {{dado_sensivel_2}} | {{classificacao_2}} | {{protecao_2}} | {{retencao_2}} |
| {{dado_sensivel_3}} | {{classificacao_3}} | {{protecao_3}} | {{retencao_3}} |

- **Mascaramento/Anonimizacao:** {{estrategia_mascaramento}}
- **Tokenizacao:** {{estrategia_tokenizacao}}
- **Politica de descarte:** {{politica_descarte}}

---

## 13.5 Checklist de Seguranca

Checklist inspirado no **OWASP Top 10** para validacao continua da postura de seguranca do sistema.

- [ ] **Prevencao de Injection** — queries parametrizadas, validacao de entrada, ORM seguro
- [ ] **Autenticacao e Gerenciamento de Sessao** — sessoes seguras, expiracao adequada, protecao contra brute force
- [ ] **Exposicao de Dados Sensiveis** — criptografia aplicada, headers de seguranca, sem dados sensiveis em logs
- [ ] **Controle de Acesso** — verificacao em cada endpoint, principio do menor privilegio, testes de autorizacao
- [ ] **Configuracao de Seguranca** — headers HTTP seguros, CORS configurado, ambientes hardened
- [ ] **Cross-Site Scripting (XSS)** — sanitizacao de saida, Content Security Policy (CSP), encoding contextual
- [ ] **Cross-Site Request Forgery (CSRF)** — tokens CSRF, SameSite cookies, validacao de origin
- [ ] **Vulnerabilidades em Dependencias** — scanning automatizado (Dependabot, Snyk), atualizacoes regulares, SBOM

<!-- APPEND:security-checklist -->

### Status Atual

| Item | Status | Responsavel | Observacoes |
|------|--------|-------------|-------------|
| {{item_checklist_1}} | {{status_1}} | {{responsavel_1}} | {{observacoes_1}} |
| {{item_checklist_2}} | {{status_2}} | {{responsavel_2}} | {{observacoes_2}} |

---

## 13.6 Auditoria e Compliance

> Quais regulamentacoes o sistema precisa atender? LGPD, SOC2, PCI-DSS?

### Regulamentacoes Aplicaveis

- {{regulamentacao_1}} (ex.: LGPD, GDPR, SOC2, PCI-DSS, HIPAA, ISO 27001)
- {{regulamentacao_2}}
- {{regulamentacao_3}}

### Logging de Auditoria

- **Eventos auditados:** {{eventos_auditados}} (ex.: login, alteracao de dados, acesso a PII, alteracoes de permissao)
- **Formato do log:** {{formato_log}} (ex.: JSON estruturado, CEF)
- **Destino:** {{destino_logs}} (ex.: SIEM, CloudWatch, ELK Stack)
- **Imutabilidade:** {{imutabilidade_logs}} (ex.: write-once storage, assinatura digital)

### Retencao

| Tipo de Log | Periodo de Retencao | Armazenamento | Justificativa |
|-------------|---------------------|---------------|---------------|
| {{tipo_log_1}} | {{retencao_1}} | {{armazenamento_1}} | {{justificativa_1}} |
| {{tipo_log_2}} | {{retencao_2}} | {{armazenamento_2}} | {{justificativa_2}} |

### Resposta a Incidentes

- **Plano de resposta:** {{plano_resposta_incidentes}}
- **Equipe responsavel:** {{equipe_seguranca}}
- **SLA de notificacao:** {{sla_notificacao}} (ex.: 72h para LGPD)
- **Runbook:** {{link_runbook}}

---

## Referencias

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [STRIDE Threat Model](https://learn.microsoft.com/en-us/azure/security/develop/threat-modeling-tool-threats)
- [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)
- {{referencia_adicional}}
