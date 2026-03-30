# Data Layer

> Repositories, schema do ORM, estratégia de migrations, índices críticos e queries de alta performance.

<!-- do blueprint: 05-data-model.md -->

---

## Estratégia de Persistência

| Tecnologia | Função | Dados | Justificativa |
|------------|--------|-------|----------------|
| SQLite | Dados transacionais (dev) | Pipelines, metrics, learning states | Zero config, embedded, desenvolvimento |
| PostgreSQL | Dados transacionais (prod) | Pipelines, metrics, learning states | ACID, JSONB, robustez, backup |
| Sistema de arquivos local | Arquivos de mídia | Vídeos, thumbnails, assets baixados | Armazenamento temporário, movido para S3/GCS |
| Variáveis de ambiente | Configurações | API keys, tokens | Segurança — nunca commit |

---

## Repositories

### PipelineRepository

**Responsabilidade:** Acesso a dados de pipelines. Abstrai ORM/queries.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(pipeline) | Pipeline | Pipeline | INSERT INTO pipelines (...) |
| findById(id) | UUID | Pipeline \| null | SELECT * FROM pipelines WHERE id = $1 |
| findByStatus(status) | string | Pipeline[] | SELECT * FROM pipelines WHERE status = $1 |
| findByNiche(niche) | string | Pipeline[] | SELECT * FROM pipelines WHERE niche = $1 ORDER BY created_at DESC |
| findByVideoId(videoId) | string | Pipeline \| null | SELECT * FROM pipelines WHERE video_id = $1 |
| update(id, data) | UUID, Partial | Pipeline | UPDATE pipelines SET ... WHERE id = $1 |
| list(filters) | ListFilters | PaginatedResult | SELECT com WHERE + LIMIT/OFFSET |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_pipelines_status | status | BTREE | Busca pipelines por status (pending, running) |
| idx_pipelines_niche | niche | BTREE | Filtro por nicho |
| idx_pipelines_created | created_at | BTREE DESC | Ordenação temporal |
| idx_pipelines_video_id | video_id | BTREE | Lookup por video YouTube |

---

### VideoMetricsRepository

**Responsabilidade:** Acesso a métricas de vídeo coletadas do YouTube.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(metrics) | VideoMetrics | VideoMetrics | INSERT INTO video_metrics (...) |
| findById(id) | UUID | VideoMetrics \| null | SELECT * FROM video_metrics WHERE id = $1 |
| findByPipelineId(pipelineId) | UUID | VideoMetrics \| null | SELECT * FROM video_metrics WHERE pipeline_id = $1 |
| findByYouTubeId(youtubeVideoId) | string | VideoMetrics \| null | SELECT * FROM video_metrics WHERE youtube_video_id = $1 |
| update(id, data) | UUID, Partial | VideoMetrics | UPDATE video_metrics SET ... WHERE id = $1 |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_metrics_pipeline | pipeline_id | BTREE | Lookup por pipeline |
| idx_metrics_youtube | youtube_video_id | BTREE | Busca por video YouTube |
| idx_metrics_retention | retention | BTREE DESC | Ordenação por retenção |

---

### LearningStateRepository

**Responsabilidade:** Acesso a estados de learning por nicho.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(state) | LearningState | LearningState | INSERT INTO learning_states (...) |
| findById(id) | UUID | LearningState \| null | SELECT * FROM learning_states WHERE id = $1 |
| findByNiche(niche) | string | LearningState \| null | SELECT * FROM learning_states WHERE niche = $1 |
| upsert(niche, data) | string, Partial | LearningState | INSERT ... ON CONFLICT DO UPDATE |
| update(id, data) | UUID, Partial | LearningState | UPDATE learning_states SET ... WHERE id = $1 |
| list() | — | LearningState[] | SELECT * FROM learning_states |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_learning_niche | niche | UNIQUE | Lookup por nicho (único) |

---

### ContentPlanRepository

**Responsabilidade:** Acesso a planos de conteúdo gerados.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(plan) | ContentPlan | ContentPlan | INSERT INTO content_plans (...) |
| findById(id) | UUID | ContentPlan \| null | SELECT * FROM content_plans WHERE id = $1 |
| findByNiche(niche) | ContentPlan[] | string | SELECT * FROM content_plans WHERE niche = $1 ORDER BY generated_at DESC |
| list(filters) | ListFilters | PaginatedResult | SELECT com WHERE + LIMIT/OFFSET |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_plans_niche | niche | BTREE | Busca por nicho |
| idx_plans_generated | generated_at | BTREE DESC | Ordenação temporal |

---

### SeriesRepository

**Responsabilidade:** Acesso a séries temáticas.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(series) | Series | Series | INSERT INTO series (...) |
| findById(id) | UUID | Series \| null | SELECT * FROM series WHERE id = $1 |
| findByTopic(topic) | string | Series[] | SELECT * FROM series WHERE topic = $1 |
| findByStatus(status) | string | Series[] | SELECT * FROM series WHERE status = $1 |
| addEpisode(seriesId, pipelineId, order) | UUID, UUID, number | void | INSERT INTO series_videos (...) |
| list(filters) | ListFilters | PaginatedResult | SELECT com WHERE + LIMIT/OFFSET |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_series_topic | topic | BTREE | Busca por tópico |
| idx_series_status | status | BTREE | Filtro por status |

---

### AssetRepository

**Responsabilidade:** Cache de assets visuais e áudio (Pexels, ElevenLabs).

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| save(asset) | Asset | Asset | INSERT INTO assets (...) |
| findById(id) | UUID | Asset \| null | SELECT * FROM assets WHERE id = $1 |
| findBySource(source, sourceId) | string, string | Asset \| null | SELECT * FROM assets WHERE source = $1 AND source_id = $2 |
| findByQuery(query) | string | Asset[] | SELECT * FROM assets WHERE query ILIKE $1 |
| findByMediaType(mediaType) | string | Asset[] | SELECT * FROM assets WHERE media_type = $1 |
| deleteOld(ttl) | Date | number | DELETE FROM assets WHERE cached_at < $1 |

**Índices:**

| Índice | Campos | Tipo | Justificativa |
|--------|--------|------|---------------|
| idx_assets_source | source, source_id | UNIQUE | Lookup por source |
| idx_assets_query | query | BTREE | Busca por query |
| idx_assets_type | media_type | BTREE | Filtro por tipo |
| idx_assets_cached | cached_at | BTREE | Cleanup TTL |

---

### SettingsRepository

**Responsabilidade:** Configurações globais do sistema.

**Interface:**

| Método | Parâmetros | Retorno | Query Principal |
|--------|------------|---------|------------------|
| get(key) | string | string \| null | SELECT value FROM settings WHERE key = $1 |
| set(key, value, description?) | string, string, string? | void | INSERT INTO settings ... ON CONFLICT DO UPDATE |
| delete(key) | string | void | DELETE FROM settings WHERE key = $1 |
| list() | — | Settings[] | SELECT * FROM settings |

---

## Schema do ORM

```prisma
// docs/backend/prisma/schema.prisma
// Schema gerado a partir do blueprint - não editar manualmente

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite" // mudar para "postgresql" em prod
  url      = env("DATABASE_URL")
}

model Pipeline {
  id              String   @id @default(uuid())
  niche           String
  status          String   @default("pending") // pending, running, paused, completed, failed
  idea            String?
  script          String?  // JSONB
  scenes          String?  // JSONB
  audioSegments   String?  // JSONB
  clips           String?  // JSONB
  videoPath       String?
  thumbnailPath   String?
  metadata        String?  // JSONB
  videoId         String?
  metricsId       String?
  performanceScore Float?
  learningState   String?  // JSONB
  errorMessage    String?
  durationMs      BigInt?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  metrics         VideoMetrics? @relation(fields: [metricsId], references: [id])

  @@index([status])
  @@index([niche])
  @@index([createdAt])
  @@index([videoId])
}

model VideoMetrics {
  id              String   @id @default(uuid())
  pipelineId      String
  youtubeVideoId  String
  publishedAt     DateTime
  views           Int      @default(0)
  likes           Int      @default(0)
  comments        Int      @default(0)
  retention       Float?
  ctr             Float?
  avgWatchTime    Float?
  dropOffPoints   String?  // JSONB
  retentionCurve  String?  // JSONB
  status          String   @default("pending") // pending, collected, failed
  createdAt       DateTime @default(now())

  pipeline        Pipeline @relation(fields: [pipelineId], references: [id])

  @@index([pipelineId])
  @@index([youtubeVideoId])
}

model LearningState {
  id              String   @id @default(uuid())
  niche           String   @unique
  hookWeights     String   // JSONB
  templateWeights String   // JSONB
  pacingWeights   String   // JSONB
  contentWeights  String   // JSONB
  isActive        Boolean  @default(false)
  analyzedVideos  Int      @default(0)
  lastUpdated     DateTime @updatedAt
  createdAt       DateTime @default(now())

  @@index([niche])
}

model ContentPlan {
  id              String   @id @default(uuid())
  niche           String
  topics          String   // JSONB
  generatedAt     DateTime @default(now())

  @@index([niche])
  @@index([generatedAt])
}

model Series {
  id              String   @id @default(uuid())
  title           String
  topic           String
  episodeCount    Int      @default(0)
  status          String   @default("planning") // planning, in_progress, completed, cancelled
  createdAt       DateTime @default(now())

  videos          SeriesVideo[]

  @@index([topic])
  @@index([status])
}

model SeriesVideo {
  id            String   @id @default(uuid())
  seriesId      String
  pipelineId    String
  episodeOrder  Int
  addedAt       DateTime @default(now())

  series        Series   @relation(fields: [seriesId], references: [id])
  pipeline      Pipeline @relation(fields: [pipelineId], references: [id])

  @@index([seriesId])
  @@index([pipelineId])
}

model Asset {
  id            String   @id @default(uuid())
  source        String   // pexels, elevenlabs, dalle
  sourceId      String
  sourceUrl     String
  localPath     String
  mediaType     String   // video, image, audio
  duration      Float?
  query         String?
  score         Float?
  cachedAt      DateTime @default(now())

  @@unique([source, sourceId])
  @@index([query])
  @@index([mediaType])
  @@index([cachedAt])
}

model Setting {
  key           String   @id
  value         String
  description   String?
  updatedAt     DateTime @updatedAt
}
```

> Para PostgreSQL: mudar provider para "postgresql" e usar `@db.Text` para JSONB fields.

---

## Estratégia de Migrations

| Aspecto | Decisão |
|---------|----------|
| Ferramenta | Prisma Migrate |
| Convenção de nomes | `YYYYMMDDHHMMSS__description.sql` |
| Rollback | Toda migration tem down via nova migration |
| Ambientes | Dev: auto-apply, Staging: CI, Prod: manual |
| Dados de seed | Apenas em dev/staging |

**Fluxo de Migração:**
1. Alterar schema em `prisma/schema.prisma`
2. Gerar migration: `npx prisma migrate dev --name description`
3. Aplicar em dev local
4. Gerar PR com migration
5. CI aplica em staging automaticamente
6. Produção: verificar manualmente, depois aplicar com aprovação

---

## Queries Críticas

| Descrição | Tabelas | Frequência | SLA (p95) | Otimização |
|-----------|---------|------------|-----------|-------------|
| Buscar pipeline por status | pipelines | Alta (cron 30s) | < 50ms | Índice em status |
| Buscar pipeline por video_id | pipelines | Alta (após upload) | < 50ms | Índice UNIQUE em video_id |
| Listar métricas por pipeline | video_metrics | Alta | < 100ms | Índice em pipeline_id |
| Buscar learning state por niche | learning_states | Alta (a cada video) | < 20ms | Índice UNIQUE em niche |
| Listar pipelines por nicho e data | pipelines | Média | < 200ms | Índice composto (niche, created_at) |
| Buscar assets por query (cache) | assets | Alta | < 30ms | Índice em query |
| Cleanup assets antigos | assets | Diária | < 1s | Índice em cached_at + TTL |

---

## Consistência e Transações

| Cenário | Tipo | Estratégia |
|---------|------|------------|
| Pipeline step + persist state | Transação local | Prisma transaction para atomicidade |
| Retry step | Idempotência | Cada step tem idempotency key no contexto |
| Learning weight adjustment | Transação local | UPDATE com version/optimistic locking |
| Cache + banco | Eventual | Invalidação por evento após write |

**Idempotência:**
- Cada PipelineContext tem `id` único (UUID) que serve como idempotency key
- Steps verificam se já foram executados antes de reprocessar
- Retry usa o mesmo ID — se step já existe no DB, retorna existente

---

> Ver [06-services.md](06-services.md) para as implementações dos services
