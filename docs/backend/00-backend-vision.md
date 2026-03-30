# Visao do Backend

Define a stack tecnologica, principios de design e objetivos do backend. Este documento e o ponto de partida para qualquer decisao de implementacao.

---

## Stack Tecnologica

> **Fonte:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md)

| Camada | Tecnologia | Versao | Justificativa |
| --- | --- | --- | --- |
| Linguagem | Node.js | 20+ LTS | Runtime definido no blueprint |
| Framework | TypeScript | 5.x | Tipagem forte necessaria para PipelineContext |
| CLI | commander.js | 15.x | Interface CLI leve e popular |
| ORM | Prisma | 5.x | Suporte SQLite/PostgreSQL, migrations, type-safety |
| Banco principal | SQLite (dev) / PostgreSQL (prod) | 16 | Definido no blueprint 05-data-model |
| Scheduler | node-cron | 0.6.x | Tasks assincronas (metrics, learning) |
| Retry | Built-in | — | Backoff simples (1s, 2s, 4s) |
| Storage | Local Filesystem | — | Videos e thumbnails em disco |

<!-- APPEND:stack -->

---

## Padrao Arquitetural

> **Fonte:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md) - Monolito Node.js

Este projeto segue uma **arquitetura funcional** com Pipeline Orchestrator como核:

```
┌─────────────────────────────────────────┐
│              CLI Layer                  │
│         (Commander.js commands)         │
├─────────────────────────────────────────┤
│         Pipeline Orchestrator           │
│    (Coordena steps, retry, estado)      │
├─────────────────────────────────────────┤
│              Engines Layer               │
│  Content, Scene, Voice, Visual,        │
│  Pacing, Render, Thumbnail,            │
│  Performance, Strategy, Learning        │
├─────────────────────────────────────────┤
│           Infrastructure Layer          │
│  Prisma, FileSystem, External APIs      │
└─────────────────────────────────────────┘
```

| Camada | Responsabilidade | Depende de | Nao depende de |
| --- | --- | --- | --- |
| CLI | Parse args, executar commands | Pipeline Orchestrator | — |
| Pipeline Orchestrator | Orquestrar steps, retry, persist | Engines | — |
| Engines | Logica de negocio (cada uma) | Domain entities | — |
| Infrastructure | Banco, arquivos, APIs externas | Interfaces | CLI |

<!-- APPEND:camadas -->

---

## Principios de Design

> **Fonte:** [docs/blueprint/02-architecture_principles.md](../blueprint/02-architecture_principles.md)

| Principio | Descricao | Implicacao Pratica |
| --- | --- | --- |
| Feedback Loop Fechado | Performance real → Learning → Strategy → Content | Pipeline fecha ciclo automaticamente |
| Processamento Scene-Based | Cada cena e renderizada individualmente | Scene e unidade atomica |
| Resiliencia por Retry | Falhas transitorias com retry + backoff | 3 tentativas, backoff 1s/2s/4s |
| Simplicidade Funcional | Funcoes puras, PipelineContext imutavel | Cada step recebe e retorna contexto |
| Assincronia do Aprendizado | Learning loop nao bloqueia producao | Cron jobs separados |
| Observabilidade por Step | Logs em cada step | Structured logs com duration |
| Seguranca por Variaveis | Credenciais em .env | Validate ao iniciar |

<!-- APPEND:principios -->

---

## Objetivos e Metricas

> **Fonte:** [docs/blueprint/01-vision.md](../blueprint/01-vision.md)

| Metrica | Meta | Como Medir |
| --- | --- | --- |
| Tempo de pipeline | < 10 min por video | Logs de duracao |
| Taxa de falha | < 5% | Pipeline status = failed |
| Throughput | 10+ videos/dia | Contagem de execucoes |
| Cobertura de testes | > 70% | Vitest coverage |
| Learning ativo | Apos 5 videos | isActive = true |

<!-- APPEND:metricas -->

---

## Nao-objetivos

> **Fonte:** [docs/blueprint/01-vision.md](../blueprint/01-vision.md)

- **Nao tem API REST** — e uma ferramenta CLI, nao um servidor HTTP
- **Nao tem Dashboard/UI** — interface via terminal apenas
- **Nao tem multi-usuario** — operador unico
- **Nao tem filas de mensagens** — pipeline sincrono com retry
- **Nao tem autenticacao** — acesso via sistema operacional

---

## Provedores e Infraestrutura

> **Fonte:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md)

| Servico | Provedor | Funcao | Ambiente |
| --- | --- | --- | --- |
| Banco de dados | SQLite (dev) / PostgreSQL (prod) | Dados transacionais | Todos |
| Object Storage | Local Filesystem | Videos, thumbnails, assets | Todos |
| Scheduler | node-cron | Coleta metrics, learning loop | Prod |
| APIs externas | OpenRouter, ElevenLabs, Pexels, YouTube | Conteudo e publicacao | Prod |

> (ver [01-architecture.md](01-architecture.md) para detalhes de deploy e infraestrutura)
