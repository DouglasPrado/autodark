# Estrategia de Testes

Define a piramide de testes, ferramentas, cobertura minima e cenarios obrigatorios para o backend.

---

## Piramide de Testes

> Qual proporcao de testes por tipo?

| Tipo | Proporcao | Objetivo | Velocidade |
| --- | --- | --- | --- |
| {{Unitario}} | {{70%}} | {{Regras de negocio isoladas (entities, services)}} | {{< 1s por teste}} |
| {{Integracao}} | {{20%}} | {{Contratos com banco, cache, filas}} | {{< 5s por teste}} |
| {{E2E}} | {{10%}} | {{Fluxos criticos ponta a ponta}} | {{< 30s por teste}} |

---

## Ferramentas

> Quais ferramentas sao usadas para cada tipo de teste?

| Tipo | Ferramenta | Funcao |
| --- | --- | --- |
| {{Framework}} | {{Vitest / Jest / PyTest / Go test}} | {{Runner e assertions}} |
| {{Integracao}} | {{Testcontainers}} | {{Banco e Redis reais em Docker}} |
| {{HTTP}} | {{Supertest / httpx}} | {{Testes de endpoint}} |
| {{Carga}} | {{k6 / Artillery}} | {{Stress e performance}} |
| {{E2E}} | {{Playwright / Cypress}} | {{Fluxos completos com frontend}} |
| {{Mocking}} | {{Vitest mocks / Jest mocks / unittest.mock}} | {{Isolar dependencias}} |
| {{Cobertura}} | {{c8 / istanbul / coverage.py}} | {{Metricas de cobertura}} |

---

## Cobertura Minima

> Quais sao os thresholds de cobertura?

| Escopo | Cobertura Minima | Justificativa |
| --- | --- | --- |
| {{Geral}} | {{80%}} | {{Baseline de qualidade}} |
| {{Domain (entities, regras)}} | {{95%}} | {{Core do negocio, zero margem para bug}} |
| {{Services}} | {{90%}} | {{Logica de orquestracao critica}} |
| {{Controllers}} | {{70%}} | {{Delegam para services, menos logica}} |
| {{Fluxos criticos}} | {{100%}} | {{Nenhum fluxo critico sem teste}} |

---

## Cenarios Obrigatorios

> Quais cenarios DEVEM ter teste antes de ir para producao?

| Cenario | Tipo | Prioridade |
| --- | --- | --- |
| {{Happy path de cada fluxo critico}} | {{E2E}} | {{Must}} |
| {{Validacao de todos os campos de entrada}} | {{Unitario}} | {{Must}} |
| {{Regras de negocio (invariantes)}} | {{Unitario}} | {{Must}} |
| {{Transicoes de maquina de estado}} | {{Unitario}} | {{Must}} |
| {{Autenticacao (token valido, expirado, ausente)}} | {{Integracao}} | {{Must}} |
| {{Autorizacao (role correto, errado, owner)}} | {{Integracao}} | {{Must}} |
| {{Timeout de servico externo}} | {{Integracao}} | {{Should}} |
| {{Retry e dead letter queue}} | {{Integracao}} | {{Should}} |
| {{Concorrencia / race condition}} | {{Integracao}} | {{Should}} |
| {{Dados invalidos / edge cases}} | {{Unitario}} | {{Must}} |
| {{Idempotencia}} | {{Integracao}} | {{Should}} |
| {{Performance sob carga}} | {{Carga}} | {{Should}} |

<!-- APPEND:cenarios -->

---

## Organizacao de Testes

> Como os testes sao organizados no filesystem?

```
tests/
├── unit/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── {{User.test.ts}}
│   │   └── value-objects/
│   │       └── {{Email.test.ts}}
│   └── application/
│       └── services/
│           └── {{UserService.test.ts}}
├── integration/
│   ├── repositories/
│   │   └── {{UserRepository.test.ts}}
│   ├── controllers/
│   │   └── {{UserController.test.ts}}
│   └── workers/
│       └── {{EmailWorker.test.ts}}
└── e2e/
    ├── {{auth.e2e.test.ts}}
    └── {{orders.e2e.test.ts}}
```

---

## Ambientes de Teste

> Quais ambientes sao usados para testes?

| Ambiente | Banco | Cache | Filas | Servicos Externos |
| --- | --- | --- | --- | --- |
| {{Unit}} | {{Mock}} | {{Mock}} | {{Mock}} | {{Mock}} |
| {{Integration}} | {{Testcontainers (PostgreSQL real)}} | {{Testcontainers (Redis real)}} | {{In-memory}} | {{Mock / WireMock}} |
| {{E2E}} | {{Staging DB}} | {{Staging Redis}} | {{Staging queue}} | {{Sandbox real}} |
| {{Load}} | {{Staging DB}} | {{Staging Redis}} | {{Staging queue}} | {{Mock}} |

---

## CI Pipeline de Testes

> Quando cada tipo de teste roda no CI?

| Etapa | Trigger | Testes | Timeout | Bloqueia Merge |
| --- | --- | --- | --- | --- |
| {{Pre-commit}} | {{git push}} | {{Lint + unit}} | {{2 min}} | {{Sim}} |
| {{PR Check}} | {{Pull request}} | {{Unit + integration}} | {{5 min}} | {{Sim}} |
| {{Merge to main}} | {{Merge}} | {{Unit + integration + e2e}} | {{10 min}} | {{Sim}} |
| {{Nightly}} | {{Cron 02:00}} | {{Load + stress}} | {{30 min}} | {{Nao (alerta)}} |

<!-- APPEND:ci -->
