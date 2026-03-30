# Arquitetura do Backend

Define as camadas arquiteturais, regras de dependencia, fronteiras de dominio e estrategia de deploy.

> **Implementa:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md) (componentes e deploy)
> **Nota:** Este e um projeto CLI, nao API REST.

---

## Arquitetura Funcioal (Pipeline-Based)

```
┌─────────────────────────────────────────┐
│              CLI Layer                  │
│    mestra generate, status, videos       │
├─────────────────────────────────────────┤
│         Pipeline Orchestrator            │
│   execute(), executeStep(), retry()     │
├─────────────────────────────────────────┤
│              Engines Layer              │
│  Content | Scene | Voice | Visual       │
│  Pacing | Render | Thumbnail           │
│  Performance | Strategy | Learning       │
├─────────────────────────────────────────┤
│           Infrastructure Layer         │
│  PrismaClient | FileSystem | HTTP      │
└─────────────────────────────────────────┘
```

| Camada | Contem | Regra de Dependencia |
| --- | --- | --- |
| CLI | Commander commands | Depende de PipelineOrchestrator |
| PipelineOrchestrator | execute, retry, persist | Depende de Engines |
| Engines | Logica de negocio | Dependem de Infrastructure |
| Infrastructure | DB, Files, APIs | Implementa interfaces |

<!-- APPEND:camadas -->

---

## Pipeline Orchestrator

> **Fonte:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md)

O核 do sistema:

```typescript
interface PipelineOrchestrator {
  execute(niche: string): Promise<PipelineContext>
  executeStep(step: string, context: PipelineContext): Promise<PipelineContext>
  retry(step: string, context: PipelineContext, attempt: number): Promise<PipelineContext>
  persistState(context: PipelineContext): Promise<void>
}
```

**Responsabilidades:**
- Coordenar steps sequenciais
- Gerenciar retry com backoff
- Persistir estado apos cada step
- Emitir logs estruturados

---

## Engines (Modulos de Negocio)

> **Fonte:** [docs/blueprint/06-system-architecture.md](../blueprint/06-system-architecture.md)

| Engine | Responsabilidade | Input | Output |
| --- | --- | --- | --- |
| Content | Gerar ideias e roteiros | niche, directive | Idea, Script |
| Scene | Segmentar em cenas | Script | Scene[] |
| Voice | Gerar audio TTS | Scene[] | AudioSegment[] |
| Visual | Buscar clips | Scene[] | Clip[] |
| Pacing | Controlar ritmo | Scene[] | Scene[] (com pacing) |
| Render | Renderizar video | Scene[] | videoPath |
| Thumbnail | Gerar thumbnail | Idea | Thumbnail |
| Upload | Publicar YouTube | video, thumbnail | videoId |
| Performance | Coletar metricas | videoId | VideoMetrics |
| Strategy | Gerar plano | metrics | ContentPlan |
| Learning | Ajustar pesos | VideoMetrics[] | LearningState |

---

## Estrategia de Deploy

| Ambiente | Infraestrutura | Deploy | Command |
| --- | --- | --- | --- |
| Development | Local (npm) | Manual | `npm run dev` |
| Staging | VPS | GitHub Actions | `npm run build && npm start` |
| Production | VPS + PM2 | GitHub Actions | `pm2 start` |

**Pipeline CI/CD:**
```
Push → Lint → Typecheck → Test → Build → Deploy
```

> (ver [02-project-structure.md](02-project-structure.md) para a arvore de diretorios)
