# Estratégia de Testes

> Defina como o sistema será testado em cada camada para garantir qualidade e confiança nas entregas.

---

## Pirâmide de Testes

A estratégia de testes segue o modelo da pirâmide: a base é composta por um grande volume de **testes unitários** (rápidos e baratos), seguida por uma camada intermediária de **testes de integração**, e no topo uma quantidade reduzida de **testes end-to-end** (lentos e mais frágeis).

```
         /  E2E  \
        /----------\
       / Integração \
      /----------------\
     /    Unitários      \
    /______________________\
```

**Proposta:** 70% unitários, 20% integração, 10% E2E

---

## Categorias de Teste

### Unit Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar o comportamento correto de funções, métodos e classes de forma isolada, sem dependências externas. |
| **Escopo — O que testar** | Lógica de negócio (engines), validações de PipelineContext, transformações de dados, cálculos de scoring, tratamento de erros, parsing de templates. |
| **Ferramentas sugeridas** | Vitest (mais rápido para TypeScript) ou Jest |
| **Critérios de sucesso** | Cobertura mínima 70%; todos os testes passam no CI; tempo de execução total abaixo de 2 minutos. |

**Módulos prioritários:**
- SceneEngine (splitIntoScenes, estimateDurations)
- PacingEngine (enforceMaxSceneDuration)
- LearningEngine (calculateWeights, analyzeFailures)
- PerformanceEngine (scoreVideoPerformance)

---

### Integration Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar a comunicação e o contrato entre componentes internos e serviços externos. |
| **Escopo — O que testar** | Chamadas às APIs (OpenRouter, ElevenLabs, Pexels), queries ao banco (Prisma),CLI commands, parsing de responses. |
| **Ferramentas sugeridas** | Mock Service Worker (MSW) para APIs HTTP; Testcontainers para PostgreSQL |
| **Critérios de sucesso** | Contratos entre serviços validados; sem falhas de comunicação; tempo de execução abaixo de 5 minutos. |

**Integrações críticas a testar:**
- OpenRouter SDK (geração de roteiro)
- ElevenLabs SDK (TTS)
- Pexels API (busca de clips)
- YouTube Data API (upload)
- Prisma (persistência)

---

### End-to-End Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar fluxos completos do sistema via CLI. |
| **Escopo — O que testar** | Pipeline completo (happy path), retry de step, resume de pipeline, upload de vídeo. |
| **Ferramentas sugeridas** | Bun test ou Jest com mocks de APIs externas (gravação de vídeo é lenta para E2E) |
| **Critérios de sucesso** | Fluxos críticos cobertos; execução estável; tempo total abaixo de 15 minutos. |

**Fluxos críticos a cobrir:**
- UC-001: Executar Pipeline de Geração de Vídeo
- UC-004: Retry de Step com Persistência
- UC-006: Upload de Vídeo no YouTube
- UC-007: Verificar Status do Pipeline

---

### Load / Performance Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Verificar se o sistema suporta a carga esperada (10+ vídeos/dia). |
| **Escopo — O que testar** | Throughput de pipelines, latência por step, tempo total de geração (< 10 min), uso de recursos. |
| **Ferramentas sugeridas** | k6 ou artillery (scripts de carga simples) |
| **Critérios de sucesso** | Sistema suporta 10+ vídeos/dia; latência por step dentro do esperado; sem degradação. |

**Métricas a validar:**
- Tempo por step (p50, p95)
- Tempo total pipeline < 10 min
- Retry rate < 5%

---

### Chaos / Resilience Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar a capacidade do sistema de se recuperar de falhas. |
| **Escopo — O que testar** | Fallback de API (LLM, TTS), retry com backoff, persistência em falha de banco, resume de pipeline. |
| **Ferramentas sugeridas** | Testesunitários simulando falhas; não precisa de chaos engineering complexo |
| **Critérios de sucesso** | Retry funciona; fallback para alternativas; sem perda de dados. |

**Cenários de falha:**
- API externa indisponível → retry + fallback
- Banco indisponível → continua em memória + persiste depois
- Step falha → retry 3x + marca failed

---

## Cobertura Mínima

| Camada | Cobertura Mínima | Justificativa |
|---|---|---|
| Unit Tests | 70% | Garante que a lógica de negócio central (engines) está protegida contra regressões. |
| Integration Tests | 60% | Cobre os contratos críticos com APIs externas e banco de dados. |
| End-to-End Tests | 100% dos fluxos críticos | Assegura que as jornadas de maior valor (pipeline, upload, retry) funcionam. |
| Load Tests | 3 cenários-chave | Previne degradação de performance nos pontos críticos. |
| Chaos Tests | 5 cenários de falha | Valida a resiliência nos pontos de falha mais prováveis. |

---

## Ambientes de Teste

| Ambiente | Propósito | Dados |
|---|---|---|
| **Local** | Desenvolvimento e testes unitários rápidos |Mocks e fixtures |
| **CI** | Execução automatizada de unit e integration tests | Banco SQLite em memória |
| **Staging** | Validação pré-produção (upload real pode ser mockado) | Dados de teste |
| **Produção** | Monitoramento contínuo, coleta de métricas reais | Dados reais (observabilidade) |

---

## Automação e CI

| Etapa do Pipeline | Testes Executados | Gatilho | Bloqueante? |
|---|---|---|---|
| **Pull Request** | Unit tests (70% cobertura) | Push / abertura de PR | Sim |
| **Merge na main** | Unit + Integration | Merge | Sim |
| **Deploy staging** | E2E (fluxos críticos) | Deploy automático | Sim |
| **Deploy produção** | Smoke tests | Promoção manual | Sim |
| **Agendado (diário)** | Load tests | Cron | Não |

**Tempo máximo do pipeline de CI:** 15 minutos

---

## Testes Específicos por Engine

| Engine | Tipo de Teste Prioritário | Cobertura Alvo |
|--------|---------------------------|----------------|
| Content Engine | Unit + Integration | 80% |
| Scene Engine | Unit | 75% |
| Voice Engine | Integration (mock ElevenLabs) | 70% |
| Visual Engine | Integration (mock Pexels) | 70% |
| Pacing Engine | Unit | 85% |
| Rendering Engine | Unit + Integration (mock FFmpeg) | 70% |
| Thumbnail Engine | Unit + Integration | 70% |
| Performance Engine | Unit + Integration | 75% |
| Strategy Engine | Unit | 70% |
| Learning Engine | Unit | 80% |
| Pipeline Orchestrator | Unit + E2E | 80% |

---

## Mocks e Stubs

| Serviço | Estratégia | Ferramenta |
|---------|------------|------------|
| OpenRouter | Mock de resposta | MSW |
| ElevenLabs | Mock de áudio | MSW |
| Pexels | Mock de clips | MSW |
| YouTube Data | Mock de upload | MSW |
| YouTube Analytics | Mock de métricas | MSW |
| FFmpeg | Stub de renderização | exec mocking |
| Banco | SQLite em memória | Prisma |

---

## Critérios de Merge

- [ ] Cobertura de unit tests ≥ 70%
- [ ] Todos os unit tests passam
- [ ] Todos os integration tests passam
- [ ] Nenhum teste com `skip` ou `todo`
- [ ] Linting passando
- [ ] TypeScript compila sem erros

<!-- APPEND:coverage -->
