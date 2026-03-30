# Mestra AI

## Fonte de Verdade

Todo código DEVE implementar fielmente o que está documentado nos blueprints.

**Docs:** `docs/blueprint/` (O QUE) → `docs/backend/` (COMO backend) → `docs/shared/` (glossário, mappings)

**Regras:**
1. Leia docs relevantes antes de codar
2. Use linguagem ubíqua de `docs/shared/glossary.md`
3. Leia `src/contracts/` antes de implementar (tipos compartilhados)
4. Siga `docs/shared/MAPPING.md` para rastreabilidade
5. Test-first (RED→GREEN→REFACTOR)
6. Credenciais em .env (nunca em código)

## Stack

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Runtime | Node.js | 20+ LTS |
| Linguagem | TypeScript | 5.x (strict mode) |
| CLI | commander.js | 15.x |
| ORM | Prisma | 5.x |
| Banco | SQLite (dev) / PostgreSQL (prod) | — / 16 |
| Scheduler | node-cron | 0.6.x |
| Rendering | FFmpeg | — |
| APIs | OpenRouter, ElevenLabs, Pexels, YouTube Data, YouTube Analytics | — |

## Estrutura do Projeto

```
src/
├── cli/
│   ├── commands/            # generate.ts, status.ts, videos.ts, config.ts
│   └── index.ts             # Commander setup
├── contracts/               # Tipos compartilhados (PipelineContext, Scene, etc.)
├── core/
│   ├── pipeline.ts          # PipelineOrchestrator
│   ├── context.ts           # PipelineContext type
│   └── logger.ts            # Structured logger
├── engines/                 # 10 engines especializadas
│   ├── content/             # idea.ts, script.ts, hook.ts
│   ├── scene/               # segment.ts, duration.ts, query.ts
│   ├── voice/               # tts.ts, merge.ts
│   ├── visual/              # search.ts, rank.ts, download.ts
│   ├── pacing/              # maxDuration.ts, interrupts.ts, zoom.ts, transitions.ts
│   ├── render/              # compose.ts, sync.ts, stitch.ts, subtitles.ts, music.ts
│   ├── thumbnail/           # concepts.ts, generate.ts, compose.ts, score.ts, select.ts
│   ├── upload/              # metadata.ts, youtube.ts
│   ├── performance/         # collect.ts, retention.ts, score.ts
│   ├── strategy/            # plan.ts, cluster.ts, prioritize.ts
│   └── learning/            # analyze.ts, weights.ts, optimize.ts
├── infrastructure/          # DB clients, filesystem, HTTP clients
├── repositories/            # Prisma repositories
├── services/                # Orchestration services
└── jobs/                    # Cron jobs (metrics, learning)
```

## Camadas e Dependências

```
CLI Layer → Pipeline Orchestrator → Engines → Infrastructure
```

| Camada | Contém | Regra |
|--------|--------|-------|
| CLI | Commander commands | Depende apenas de PipelineOrchestrator |
| Core | Pipeline, Context, Logger | Depende de Engines |
| Engines | Lógica de negócio | Dependem de Infrastructure |
| Infrastructure | DB, Files, APIs | Implementa interfaces |

**Regra:** Camada superior depende da inferior, nunca o contrário.

## Convenções

- **Entidades:** PascalCase, singular, inglês (`Scene`, `Video`, `Thumbnail`)
- **Campos:** camelCase (`videoId`, `createdAt`)
- **Arrays:** plural (`scenes`, `clips`)
- **Enums:** camelCase (`pending`, `completed`, `failed`)
- **Types/Interfaces:** PascalCase (`PipelineContext`, `VideoMetrics`)
- **Funções de Engine:** camelCase, verbo (`generateIdea`, `composeScene`)
- **Arquivos:** camelCase, descritivo (`maxDuration.ts`, `segment.ts`)

## Princípios Arquiteturais

1. **Feedback Loop Fechado** — Performance → Learning → Strategy → Content (learning assíncrono, não bloqueia produção)
2. **Processamento Scene-Based** — Cena é unidade atômica (max 2.5s)
3. **Resiliência por Retry** — 3 tentativas, backoff 1s/2s/4s, persistência após cada step
4. **Simplicidade Funcional** — PipelineContext imutável entre steps, funções puras
5. **Observabilidade por Step** — Structured logs com duration por step
6. **Segurança por Padrão** — Credenciais em .env, conteúdo via Pexels (copyright-free), OAuth2 para YouTube

## Conceitos-Chave (Glossário)

| Termo | Definição |
|-------|-----------|
| **Engine** | Módulo especializado (Content, Rendering, etc.) |
| **Pipeline** | Fluxo sequencial: nicho → vídeo publicado |
| **PipelineContext** | Estado imutável que flui entre steps |
| **Scene** | Menor unidade do vídeo (texto + duração + query) |
| **Template** | HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP |
| **Hook** | Primeiros 0-5 segundos |
| **Pacing** | Controle de ritmo (max 2.5s por cena) |
| **Learning Loop** | Performance → Learning → Strategy → Content |
| **Cold Start** | Período 48-72h antes de dados do YouTube Analytics |
| **Strategy Directive** | Instrução Strategy→Content (tema, ângulo, métricas-alvo) |
| **Learning Weights** | Parâmetros ajustáveis que influenciam geração de conteúdo |

## Antes de Codar

Leia apenas o necessário para a tarefa. Use `/codegen-feature` para guia por tipo de feature.

**Sempre leia:** `src/contracts/` (tipos) + `prisma/schema.prisma` (DB, se relevante)

| Tarefa | Docs a ler |
|--------|-----------|
| Nova engine | `docs/blueprint/06-system-architecture.md`, `docs/backend/01-architecture.md` |
| Entidades/domínio | `docs/backend/03-domain.md`, `docs/blueprint/04-domain-model.md` |
| Schema/DB | `docs/backend/04-data-layer.md`, `docs/blueprint/05-data-model.md` |
| Pipeline/retry | `docs/backend/06-services.md`, `docs/blueprint/07-critical_flows.md` |
| Testes | `docs/backend/14-tests.md`, `docs/blueprint/12-testing_strategy.md` |
| Integrações | `docs/backend/13-integrations.md`, `docs/blueprint/00-context.md` |
| Rastreabilidade | `docs/shared/MAPPING.md` |

## Commands CLI

```bash
mestra generate --niche <nicho>              # Gerar vídeo
mestra generate --niche <nicho> --idea "x"   # Com ideia específica
mestra generate --niche <nicho> --dry-run    # Simular sem executar
mestra status                                 # Status dos pipelines
mestra videos --niche dark --limit 10        # Listar vídeos
mestra config                                 # Ver configuração
```

## Métricas do Sistema

| Métrica | Meta |
|---------|------|
| Tempo de pipeline | < 10 min |
| Taxa de falha | < 5% |
| Throughput | 10+ vídeos/dia |
| Cobertura testes | > 70% |
| Learning ativo | Após 5 vídeos |

## Não-objetivos

- API REST (é CLI)
- Dashboard/UI
- Multi-usuário
- Filas de mensagens
- Autenticação (acesso local)
