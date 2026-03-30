# Estratégia de Testes

> Defina como o sistema será testado em cada camada para garantir qualidade e confiança nas entregas.

---

## Pirâmide de Testes

A estratégia de testes segue o modelo da pirâmide: a base é composta por um grande volume de **testes unitários** (rápidos e baratos), seguida por uma camada intermediária de **testes de integração**, e no topo uma quantidade reduzida de **testes end-to-end** (lentos e mais frágeis). Testes de **carga** e **resiliência** complementam a pirâmide para validar requisitos não funcionais.

> Qual a proporção ideal de testes para o seu projeto? (ex.: 70% unit, 20% integration, 10% e2e)

```
        /  E2E  \
       /----------\
      / Integração \
     /----------------\
    /    Unitários      \
   /______________________\
```

---

## Categorias de Teste

### Unit Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar o comportamento correto de funções, métodos e classes de forma isolada, sem dependências externas. |
| **Escopo — O que testar** | Lógica de negócio, validações, transformações de dados, cálculos, edge cases e tratamento de erros. |
| **Ferramentas sugeridas** | {{ferramentas_unit_test — ex.: Jest, PyTest, xUnit, Go testing}} |
| **Critérios de sucesso** | Cobertura mínima atingida; todos os testes passam no CI; tempo de execução total abaixo de {{tempo_max_unit — ex.: 2 min}}. |

> Quais módulos possuem lógica crítica de negócio que exige cobertura unitária prioritária?

---

### Integration Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar a comunicação e o contrato entre componentes internos e serviços externos (banco de dados, filas, APIs). |
| **Escopo — O que testar** | Chamadas entre microsserviços, queries ao banco, publicação/consumo de eventos, integrações com APIs de terceiros. |
| **Ferramentas sugeridas** | {{ferramentas_integration_test — ex.: Testcontainers, Supertest, WireMock, Pact}} |
| **Critérios de sucesso** | Contratos entre serviços validados; sem falhas de comunicação; tempo de execução abaixo de {{tempo_max_integration — ex.: 5 min}}. |

> Quais integrações externas são mais críticas e devem ter testes de contrato?

---

### End-to-End Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar fluxos completos do sistema do ponto de vista do usuário final. |
| **Escopo — O que testar** | Jornadas críticas do usuário, fluxos de autenticação, checkout, onboarding e demais happy paths prioritários. |
| **Ferramentas sugeridas** | {{ferramentas_e2e_test — ex.: Cypress, Playwright, Selenium, Maestro}} |
| **Critérios de sucesso** | Todos os fluxos críticos cobertos; execução estável (flaky rate < {{max_flaky_rate — ex.: 2%}}); tempo total abaixo de {{tempo_max_e2e — ex.: 15 min}}. |

> Quais são as jornadas de usuário que, se falharem, causam maior impacto ao negócio?

---

### Load / Performance Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Verificar se o sistema suporta a carga esperada e identificar gargalos de performance. |
| **Escopo — O que testar** | Throughput máximo, latência sob carga (p50, p95, p99), comportamento em picos de tráfego, uso de recursos (CPU, memória). |
| **Ferramentas sugeridas** | {{ferramentas_load_test — ex.: k6, Gatling, Locust, Artillery}} |
| **Critérios de sucesso** | Sistema suporta {{carga_esperada — ex.: 1000 req/s}} com latência p99 < {{latencia_p99 — ex.: 500ms}}; sem degradação ou erros acima de {{taxa_erro_max — ex.: 0.1%}}. |

> Qual o volume de tráfego esperado em condições normais e em picos?

---

### Chaos / Resilience Tests

| Item | Descrição |
|---|---|
| **Objetivo** | Validar a capacidade do sistema de se recuperar de falhas inesperadas em infraestrutura e dependências. |
| **Escopo — O que testar** | Queda de nós/pods, falha de banco de dados, latência elevada em rede, indisponibilidade de serviços externos, esgotamento de recursos. |
| **Ferramentas sugeridas** | {{ferramentas_chaos_test — ex.: Chaos Monkey, Litmus, Gremlin, Toxiproxy}} |
| **Critérios de sucesso** | Sistema se recupera automaticamente em < {{tempo_recuperacao — ex.: 30s}}; circuit breakers atuam corretamente; sem perda de dados. |

> Quais são os cenários de falha mais prováveis em produção que precisam ser simulados?

---

## Cobertura Mínima

> Qual o nível mínimo de cobertura aceitável para cada tipo de teste?

| Camada | Cobertura Mínima | Justificativa |
|---|---|---|
| Unit Tests | {{cobertura_unit — ex.: 80%}} | {{justificativa_unit — ex.: Garante que a lógica de negócio central está protegida contra regressões.}} |
| Integration Tests | {{cobertura_integration — ex.: 60%}} | {{justificativa_integration — ex.: Cobre os contratos críticos entre serviços e dependências externas.}} |
| End-to-End Tests | {{cobertura_e2e — ex.: 100% dos fluxos críticos}} | {{justificativa_e2e — ex.: Assegura que as jornadas de maior valor para o negócio funcionam corretamente.}} |
| Load Tests | {{cobertura_load — ex.: Endpoints de alta demanda}} | {{justificativa_load — ex.: Previne degradação de performance nos pontos de maior tráfego.}} |
| Chaos Tests | {{cobertura_chaos — ex.: Cenários de falha mapeados no risk assessment}} | {{justificativa_chaos — ex.: Valida a resiliência nos pontos de falha mais prováveis.}} |

<!-- APPEND:coverage -->

---

## Ambientes de Teste

> Quais ambientes estão disponíveis para execução de testes e qual o propósito de cada um?

| Ambiente | Propósito | Dados |
|---|---|---|
| {{ambiente_1 — ex.: Local}} | {{proposito_1 — ex.: Desenvolvimento e testes unitários rápidos}} | {{dados_1 — ex.: Mock / fixtures locais}} |
| {{ambiente_2 — ex.: CI}} | {{proposito_2 — ex.: Execução automatizada de unit e integration tests}} | {{dados_2 — ex.: Seed / banco em container}} |
| {{ambiente_3 — ex.: Staging}} | {{proposito_3 — ex.: Testes E2E, carga e validação pré-produção}} | {{dados_3 — ex.: Produção anonimizada}} |
| {{ambiente_4 — ex.: Produção}} | {{proposito_4 — ex.: Chaos tests e monitoramento contínuo}} | {{dados_4 — ex.: Dados reais (observabilidade, não testes destrutivos)}} |

---

## Automação e CI

> Quais testes rodam automaticamente no pipeline de CI/CD?

| Etapa do Pipeline | Testes Executados | Gatilho | Bloqueante? |
|---|---|---|---|
| {{etapa_1 — ex.: Pull Request}} | {{testes_1 — ex.: Unit + Integration}} | {{gatilho_1 — ex.: Push / abertura de PR}} | {{bloqueante_1 — ex.: Sim}} |
| {{etapa_2 — ex.: Merge na main}} | {{testes_2 — ex.: Unit + Integration + E2E}} | {{gatilho_2 — ex.: Merge}} | {{bloqueante_2 — ex.: Sim}} |
| {{etapa_3 — ex.: Deploy em staging}} | {{testes_3 — ex.: E2E + Load}} | {{gatilho_3 — ex.: Deploy automático}} | {{bloqueante_3 — ex.: Sim}} |
| {{etapa_4 — ex.: Deploy em produção}} | {{testes_4 — ex.: Smoke tests + Chaos (agendado)}} | {{gatilho_4 — ex.: Promoção manual ou automática}} | {{bloqueante_4 — ex.: Smoke sim / Chaos não}} |

<!-- APPEND:ci-pipeline -->

> Qual o tempo máximo aceitável para o pipeline completo de testes? {{tempo_max_pipeline — ex.: 20 min}}
