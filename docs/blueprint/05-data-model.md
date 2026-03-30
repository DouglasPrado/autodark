# Modelo de Dados

Enquanto o [Modelo de Domínio](./04-domain-model.md) descreve entidades e regras de negócio de forma **lógica e conceitual**, o modelo de dados define como essas entidades serão **fisicamente armazenadas**. Aqui tratamos de tabelas, campos, tipos de dados, constraints, índices e estratégias de migração.

> A separação entre domínio e dados permite que decisões de negócio e decisões de infraestrutura evoluam de forma independente.

---

## Banco de Dados

> Qual banco de dados será usado? Relacional ou NoSQL? Justifique a escolha considerando os padrões de leitura/escrita do sistema.

- **Tecnologia:** SQLite (desenvolvimento) / PostgreSQL (produção)
- **Justificativa:** 
  - Dados estruturados com relacionamentos claros entre entidades (Pipeline → Scenes → Video → Metrics)
  - Necessidade de ACID para transações de pipeline (estado deve ser consistente)
  - Volume moderado (10+ vídeos/dia = ~300 registros/mês)
  - Schema evolutivo com migrações
  - Sem necessidade de NoSQL para este caso de uso
  - SQLite para dev: zero config, embedded
  - PostgreSQL para prod: robustez, backup, concorrência

---

## Tabelas / Collections

> Quais estruturas de armazenamento são necessárias? Lembre-se de que nem toda entidade do domínio precisa de uma tabela própria, e uma entidade pode ser distribuída em mais de uma tabela.

### pipelines

**Descrição:** Armazena o estado de cada execução do pipeline de geração de vídeo.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único da execução |
| niche | VARCHAR(100) | NOT NULL | Nicho do canal |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'pending' | Status: pending, running, completed, failed |
| idea | TEXT | | Texto da ideia gerada |
| script | JSONB | | Roteiro estruturado (template + segmentos) |
| scenes | JSONB | | Array de scenes segmentadas |
| audio_segments | JSONB | | Array de segmentos de áudio |
| clips | JSONB | | Array de clips visuais |
| video_path | VARCHAR(500) | | Caminho local do vídeo renderizado |
| thumbnail_path | VARCHAR(500) | | Caminho local da thumbnail |
| metadata | JSONB | | Título, descrição, tags |
| video_id | VARCHAR(20) | | ID do vídeo no YouTube |
| metrics_id | UUID | FK | Referência para video_metrics |
| performance_score | DECIMAL(5,2) | | Score composto de performance |
| learning_state | JSONB | | Estado atual do learning |
| error_message | TEXT | | Mensagem de erro se failed |
| duration_ms | BIGINT | | Tempo total de execução em milissegundos |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de início |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de última atualização |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_pipelines_status | status | BTREE | Busca pipelines por status (pending, running) |
| idx_pipelines_niche | niche | BTREE | Filtro por nicho |
| idx_pipelines_created | created_at | BTREE | Ordenação temporal |
| idx_pipelines_video_id | video_id | BTREE | Lookup por video YouTube |

---

### video_metrics

**Descrição:** Armazena métricas de performance coletadas via YouTube Analytics API.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| pipeline_id | UUID | FK, NOT NULL | Referência para pipeline |
| youtube_video_id | VARCHAR(20) | NOT NULL | ID do vídeo no YouTube |
| published_at | TIMESTAMP | NOT NULL | Data de publicação |
| views | INTEGER | DEFAULT 0 | Total de visualizações |
| likes | INTEGER | DEFAULT 0 | Total de likes |
| comments | INTEGER | DEFAULT 0 | Total de comentários |
| retention | DECIMAL(5,2) | | Porcentagem de retenção média |
| ctr | DECIMAL(5,2) | | Click-through rate (%) |
| avg_watch_time | DECIMAL(10,2) | | Tempo médio de visualização (segundos) |
| drop_off_points | JSONB | | Array de timestamps de abandono |
| retention_curve | JSONB | | Curva de retenção por segundo |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de coleta |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_metrics_pipeline | pipeline_id | BTREE | Lookup por pipeline |
| idx_metrics_youtube | youtube_video_id | BTREE | Busca por video YouTube |
| idx_metrics_retention | retention | BTREE | Ordenação por retenção |

---

### learning_states

**Descrição:** Armazena os pesos ajustáveis do Learning Engine por nicho.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| niche | VARCHAR(100) | NOT NULL, UNIQUE | Nicho do canal |
| hook_weights | JSONB | NOT NULL | Pesos para tipos de hook |
| template_weights | JSONB | NOT NULL | Pesos para segmentos de template |
| pacing_weights | JSONB | NOT NULL | Pesos para configurações de pacing |
| content_weights | JSONB | NOT NULL | Pesos para topics/angles |
| is_active | BOOLEAN | NOT NULL, DEFAULT FALSE | Se o learning está ativo |
| analyzed_videos | INTEGER | NOT NULL, DEFAULT 0 | Quantidade de vídeos analisados |
| last_updated | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de última atualização |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de criação |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_learning_niche | niche | BTREE, UNIQUE | Lookup por nicho |

---

### content_plans

**Descrição:** Armazena planos de conteúdo gerados pela Strategy Engine.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| niche | VARCHAR(100) | NOT NULL | Nicho do canal |
| topics | JSONB | NOT NULL | Array de tópicos priorizados |
| generated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de geração |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_plans_niche | niche | BTREE | Busca por nicho |
| idx_plans_generated | generated_at | BTREE | Ordenação temporal |

---

### series

**Descrição:** Armazena séries temáticas de vídeos.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| title | VARCHAR(200) | NOT NULL | Título da série |
| topic | VARCHAR(100) | NOT NULL | Tópico central |
| episode_count | INTEGER | NOT NULL, DEFAULT 0 | Número de episódios planejados |
| status | VARCHAR(20) | NOT NULL, DEFAULT 'planning' | Status: planning, in_progress, completed |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de criação |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_series_topic | topic | BTREE | Busca por tópico |

---

### series_videos

**Descrição:** Relacionamento N:N entre séries e vídeos.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| series_id | UUID | FK, NOT NULL | Referência para série |
| pipeline_id | UUID | FK, NOT NULL | Referência para pipeline |
| episode_order | INTEGER | NOT NULL | Ordem do episódio na série |
| added_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de adição |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_series_videos_series | series_id | BTREE | Videos de uma série |
| idx_series_videos_pipeline | pipeline_id | BTREE | Série de um video |

---

### assets

**Descrição:** Cache de assets visuais e áudio baixados (Pexels, ElevenLabs).

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| id | UUID | PK | Identificador único |
| source | VARCHAR(20) | NOT NULL | Fonte: pexels, elevenlabs, dalle |
| source_id | VARCHAR(100) | NOT NULL | ID no sistema de origem |
| source_url | TEXT | NOT NULL | URL original |
| local_path | VARCHAR(500) | NOT NULL | Caminho local |
| media_type | VARCHAR(20) | NOT NULL | Tipo: video, image, audio |
| duration | DECIMAL(10,2) | | Duração (para video/audio) |
| query | VARCHAR(200) | | Query usada na busca |
| score | DECIMAL(5,2) | | Score de relevância |
| cached_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de cache |

**Índices:**

| Nome do Índice | Campos | Tipo | Justificativa |
|---------------|--------|------|---------------|
| idx_assets_source | source, source_id | BTREE, UNIQUE | Lookup por source |
| idx_assets_query | query | BTREE | Busca por query |
| idx_assets_type | media_type | BTREE | Filtro por tipo |

---

### settings

**Descrição:** Configurações globais do sistema.

**Campos:**

| Campo | Tipo | Constraint | Descrição |
|-------|------|-----------|-----------|
| key | VARCHAR(100) | PK | Chave de configuração |
| value | TEXT | NOT NULL | Valor (JSON stringificado) |
| description | VARCHAR(500) | | Descrição |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp de atualização |

<!-- APPEND:tables -->

---

## Diagrama ER

> Atualize o diagrama abaixo conforme as tabelas e relacionamentos definidos acima.

> 📐 Diagrama: [er-diagram.mmd](../diagrams/domain/er-diagram.mmd)

---

## Estratégia de Migração

> Como as mudanças no schema serão gerenciadas ao longo do tempo? Existe risco de downtime durante migrações?

- **Ferramenta:** Prisma Migrate (para SQLite/PostgreSQL)
- **Convenção de nomes:** `YYYYMMDDHHMMSS__description.sql`
- **Estratégia de rollback:** 
  - Migrações são versionadas e reversíveis
  - Backup do banco antes de migração
  - Rollback via nova migração (não modify)
- **Migrações destrutivas:**
  - Colunas removidas são depreciadas por 2 versões antes de drop
  - Nunca remover tabela sem backup prévio
  - Dados sensíveis: migrar, não remover

---

## Índices e Otimizações

> Quais queries são críticas para performance? Quais padrões de acesso devem guiar a criação de índices?

### Queries Críticas

| Descrição da Query | Tabelas Envolvidas | Frequência | SLA Esperado |
|--------------------|--------------------|-----------|-------------|
| Buscar pipeline por status | pipelines | Alta (a cada 30s) | < 50ms |
| Buscar pipeline por video_id YouTube | pipelines | Alta (após upload) | < 50ms |
| Listar métricas por pipeline | video_metrics | Alta | < 100ms |
| Buscar learning state por niche | learning_states | Alta (a cada video) | < 20ms |
| Listar pipelines por nicho e data | pipelines | Média | < 200ms |
| Buscar assets por query (cache) | assets | Alta | < 30ms |

### Diretrizes de Otimização

- **Evitar SELECT *** — especificar campos necessários
- **Paginação por cursor** — não offset para tabelas grandes
- **Cache de assets** —重复 queries no Pexels devem usar cache local
- **Batch inserts** — para scenes e audio_segments (JSONB array)
- **Particionamento** — não necessário no volume atual (10+ vídeos/dia)
- **TTL para cache** — assets: 30 dias, metrics: ilimitado

---

## Referências

- [Prisma Docs](https://www.prisma.io/docs) — ORM e migrações
- [SQLite Docs](https://www.sqlite.org/docs.html) — Desenvolvimento local
- [PostgreSQL Docs](https://www.postgresql.org/docs/) — Produção
- [Modelo de Domínio](./04-domain-model.md)
