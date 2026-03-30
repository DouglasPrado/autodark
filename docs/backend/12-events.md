# Eventos e Mensageria

> Eventos de domínio, filas, workers assíncronos, schemas de payload e estratégias de retry.

> **Nota:** Este é um sistema CLI síncrono. A maioria dos eventos são emitidos localmente (EventEmitter). A mensageria externa só é usada para jobs agendados.

---

## Estratégia de Mensageria

> Qual tecnologia e padrão de mensageria o sistema usa?

| Aspecto | Decisão |
|---------|----------|
| Message Broker (local) | Node.js EventEmitter |
| Scheduled Jobs | node-cron |
| Formato | JSON |
| Idempotência | Por pipelineId + stepName |

> O sistema não precisa de message broker externo porque:
> - Pipeline é síncrono (step a step)
> - Volume baixo (10+ vídeos/dia)
> - Só há jobs assíncronos para métricas (YouTube tem delay de 48-72h)

---

## Mapa de Eventos

| Evento | Produtor | Consumidor(es) | Tipo | Retry |
|--------|----------|----------------|------|-------|
| PipelineStarted | PipelineOrchestrator | CLI, Logger | Sync | - |
| PipelineStepCompleted | PipelineOrchestrator | Logger | Sync | - |
| PipelineCompleted | PipelineOrchestrator | UploadService, Logger | Sync | - |
| PipelineFailed | PipelineOrchestrator | Logger | Sync | - |
| PipelineCancelled | PipelineOrchestrator | Logger | Sync | - |
| MetricsCollected | PerformanceService | LearningService, Logger | Async (cron) | 3x |
| LearningWeightsUpdated | LearningService | Logger | Async (cron) | - |
| ContentPlanGenerated | StrategyService | Logger | Async (cron) | 3x |

---

## Schema de Eventos

### PipelineStarted

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "type": "PipelineStarted",
  "version": "1.0",
  "timestamp": "2024-01-01T00:00:00Z",
  "source": "pipeline-orchestrator",
  "payload": {
    "pipelineId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "niche": "dark",
    "idea": "Os segredos nunca revelados",
    "estimatedDuration": 300
  }
}
```

**Idempotência:** Por pipelineId (não inicia se já existe)

---

### PipelineStepCompleted

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "PipelineStepCompleted",
  "version": "1.0",
  "timestamp": "2024-01-01T00:01:00Z",
  "source": "pipeline-orchestrator",
  "payload": {
    "pipelineId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "step": "content",
    "nextStep": "scene"
  }
}
```

**Idempotência:** Por pipelineId + step

---

### PipelineCompleted

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440002",
  "type": "PipelineCompleted",
  "version": "1.0",
  "timestamp": "2024-01-01T00:10:00Z",
  "source": "pipeline-orchestrator",
  "payload": {
    "pipelineId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "videoId": "dQw4w9WgXcQ",
    "videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ",
    "duration": 480,
    "durationMs": 480000
  }
}
```

**Idempotência:** Por pipelineId (não completa se já completed)

---

### PipelineFailed

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440003",
  "type": "PipelineFailed",
  "version": "1.0",
  "timestamp": "2024-01-01T00:05:00Z",
  "source": "pipeline-orchestrator",
  "payload": {
    "pipelineId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "step": "render",
    "error": {
      "code": "RENDERING_FAILED",
      "message": "FFmpeg error: Invalid input",
      "retryable": true
    },
    "attempts": 3
  }
}
```

**Idempotência:** Por pipelineId

---

### MetricsCollected

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440004",
  "type": "MetricsCollected",
  "version": "1.0",
  "timestamp": "2024-01-03T00:00:00Z",
  "source": "performance-service",
  "payload": {
    "pipelineId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "youtubeVideoId": "dQw4w9WgXcQ",
    "metrics": {
      "views": 10000,
      "likes": 500,
      "comments": 100,
      "retention": 45.5,
      "ctr": 8.2,
      "avgWatchTime": 210
    }
  }
}
```

**Idempotência:** Por youtubeVideoId + timestamp (dia)

---

### LearningWeightsUpdated

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440005",
  "type": "LearningWeightsUpdated",
  "version": "1.0",
  "timestamp": "2024-01-04T00:00:00Z",
  "source": "learning-service",
  "payload": {
    "niche": "dark",
    "analyzedVideos": 6,
    "adjustments": {
      "hookWeights": {
        "curiosity": 0.05,
        "shock": -0.02
      }
    }
  }
}
```

**Idempotência:** Por niche + analyzedVideos (increment)

---

## Cron Jobs / Scheduled Tasks

| Job | Frequência | Função | Timeout | Observação |
|-----|------------|--------|---------|-------------|
| CollectMetrics | A cada 6h | Coleta métricas de vídeos publicados (48-72h) | 300s | YouTube API delay |
| RunLearningLoop | Diário 01:00 | Analisa métricas e ajusta learning weights | 600s | Learning assíncrono |
| GenerateContentPlan | Diário 00:30 | Gera plano de conteúdo baseado em performance | 300s | Strategy assíncrono |
| CleanupOldAssets | Semanal (Domingo 03:00) | Remove assets locais antigos (> 30 dias) | 600s | Disco |
| HealthCheck | A cada 15min | Verifica APIs externas e connectivity | 30s | Alertas |

### Configuração node-cron

```typescript
// src/jobs/index.ts
import cron from 'node-cron';

export const jobs = [
  // Coleta métricas a cada 6 horas
  cron.schedule('0 */6 * * *', async () => {
    await collectMetricsJob.execute();
  }, { timezone: 'America/Sao_Paulo' }),

  // Learning loop diário à 01:00
  cron.schedule('0 1 * * *', async () => {
    await learningLoopJob.execute();
  }, { timezone: 'America/Sao_Paulo' }),

  // Content plan diário à 00:30
  cron.schedule('30 0 * * *', async () => {
    await contentPlanJob.execute();
  }, { timezone: 'America/Sao_Paulo' }),

  // Cleanup semanal
  cron.schedule('0 3 * * 0', async () => {
    await cleanupAssetsJob.execute();
  }, { timezone: 'America/Sao_Paulo' }),

  // Health check a cada 15 minutos
  cron.schedule('*/15 * * * *', async () => {
    await healthCheckJob.execute();
  }, { timezone: 'America/Sao_Paulo' }),
];
```

---

## Estratégia de Retry

| Estratégia | Descrição | Quando Usar |
|------------|-----------|-------------|
| Backoff exponencial | 1s, 2s, 4s, 8s | APIs externas (YouTube, LLM, ElevenLabs) |
| Imediato | Retry sem delay | Erros transientes locais |
| Scheduling | Job agendado | Métricas do YouTube (48-72h delay) |

**Dead Letter:**
- Para jobs de métricas: após 3 tentativas falhas, marca vídeo para retry manual
- Logs sempre gravados, alertas/enviados para erros críticos

---

> Ver [13-integrations.md](13-integrations.md) para clients de APIs externas
