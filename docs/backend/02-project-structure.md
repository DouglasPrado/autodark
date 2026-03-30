# Estrutura do Projeto

Arvore de diretorios que segue a arquitetura de Pipeline (CLI, nao HTTP).

> **Implementa:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md)
> **Nota:** Projeto CLI, nao HTTP/REST.

---

## Arvore de Diretorios

```
src/
├── cli/
│   ├── commands/
│   │   ├── generate.ts      # mestra generate
│   │   ├── status.ts      # mestra status
│   │   ├── videos.ts     # mestra videos
│   │   └── config.ts    # mestra config
│   └── index.ts         # Commander setup
│
├── core/
│   ├── pipeline.ts       # PipelineOrchestrator
│   ├── context.ts       # PipelineContext type
│   └── logger.ts       # Structured logger
│
├── engines/
│   ├── content/
│   │   ├── idea.ts
│   │   ├── script.ts
│   │   └── hook.ts
│   ├── scene/
│   │   ├── segment.ts
│   │   ├── duration.ts
│   │   └── query.ts
│   ├── voice/
│   │   ├── tts.ts
│   │   └── merge.ts
│   ├── visual/
│   │   ├── search.ts
│   │   ├── rank.ts
│   │   └── download.ts
│   ├── pacing/
│   │   ├── maxDuration.ts
│   │   ├── interrupts.ts
│   │   ├── zoom.ts
│   │   └── transitions.ts
│   ├── render/
│   │   ├── compose.ts
│   │   ├── sync.ts
│   │   ├── stitch.ts
│   │   ├── subtitles.ts
│   │   └── music.ts
│   ├── thumbnail/
│   │   ├── concepts.ts
│   │   ├── generate.ts
│   │   ├── compose.ts
│   │   ├── score.ts
│   │   └── select.ts
│   ├── upload/
│   │   ├── metadata.ts
│   │   └── youtube.ts
│   ├── performance/
│   │   ├── metrics.ts
│   │   ├── retention.ts
│   │   ├── dropoff.ts
│   │   └── scoring.ts
│   ├── strategy/
│   │   ├── plan.ts
│   │   ├── cluster.ts
│   │   ├── prioritize.ts
│   │   └── series.ts
│   └── learning/
│       ├── analyze.ts
│       ├── weights.ts
│       └── optimize.ts
│
├── services/
│   ├── openrouter.ts
│   ├── elevenlabs.ts
│   ├── pexels.ts
│   ├── ffmpeg.ts
│   ├── youtube-upload.ts
│   ├── youtube-analytics.ts
│   └── image-ai.ts
│
├── infrastructure/
│   ├── database/
│   │   ├── client.ts
│   │   ├── repositories/
│   │   │   ├── pipeline.ts
│   │   │   ├── metrics.ts
│   │   │   └── learning-state.ts
│   │   └── migrations/
│   ├── storage/
│   │   └── files.ts
│   └── scheduler/
│       └── cron.ts
│
├── types/
│   ├── pipeline.ts
│   └── domain.ts
│
├── utils/
│   ├── retry.ts
│   ├── validation.ts
│   └── constants.ts
│
└── index.ts
```

---

## Convencoes de Nomenclatura

| Tipo | Convencao | Exemplo |
| --- | --- | --- |
| Engines | kebab-case | `content/idea.ts` |
| Funcoes exportadas | camelCase | `generateIdea()` |
| Types/Interfaces | PascalCase | `PipelineContext` |
| Constantes | UPPER_SNAKE | `MAX_SCENE_DURATION` |
| Testes | `.test.ts` suffix | `idea.test.ts` |

---

## Arquivos de Configuracao

| Arquivo | Proposito |
| --- | --- |
| package.json | Dependencias e scripts |
| tsconfig.json | Configuracao TypeScript |
| .env.example | Template de variaveis |
| vitest.config.ts | Configuracao de testes |
| prisma/schema.prisma | Schema do banco |

---

## Comandos CLI

```bash
# Desenvolvimento
npm run dev        # watch mode

# Build
npm run build

# CLI
npm link          # torna mestra disponivel globalmente
mestra generate --niche dark
mestra status --pipeline-id <id>
mestra videos --niche dark
mestra config --list
```

> (ver [03-domain.md](03-domain.md) para as entidades de dominio)
