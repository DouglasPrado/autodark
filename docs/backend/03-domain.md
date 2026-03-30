# Domínio

> Camada mais interna do sistema — não depende de nenhuma outra. Contém entidades, value objects, regras de negócio e máquinas de estado.

<!-- do blueprint: 04-domain-model.md -->
<!-- do blueprint: 09-state-models.md -->
<!-- do blueprint: 03-requirements.md -->

---

## Glossário Ubíquo

> **Fonte única:** [docs/shared/glossary.md](../shared/glossary.md). Nao duplique termos aqui — consulte e atualize o glossario compartilhado.

| Termo | Definição |
|-------|-----------|
| **Engine** | Módulo especializado do sistema que executa uma função específica (Content, Rendering, Performance, Strategy, Learning). |
| **Pipeline** | Fluxo sequencial de steps que transforma entrada (nicho) em saída (vídeo publicado). |
| **PipelineContext** | Estado imutável que flui entre os steps do pipeline, carregando dados de todas as engines. |
| **Scene** | Menor unidade atômica do vídeo. Contém texto, duração, timestamps e query visual. |
| **Template** | Estrutura fixa de roteiro (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP) otimizada para retenção. |
| **Hook** | Primeiros 0-5 segundos do vídeo — momento crítico para reter viewer. |
| **Pacing** | Controle de ritmo via duração de cenas (max 2.5s), pattern interrupts, zoom e transições. |
| **Learning Loop** | Ciclo fechado: Performance → Learning → Strategy → Content. |
| **Cold Start** | Período inicial (48-72h) antes de ter dados do YouTube Analytics. |
| **Drop-off Points** | Momentos específicos onde espectadores abandonam o vídeo. |

---

## Entidades

### PipelineContext

**Descrição:** Estado global que flui através de todos os steps do pipeline. É o único estado compartilhado entre engines.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único da execução |
| niche | string | sim | min 2, max 100 | Nicho do canal |
| contentPlan | ContentPlan | não | object | Plano de conteúdo da Strategy Engine |
| strategyDirective | StrategyDirective | não | object | Diretiva atual para geração |
| idea | Idea | não | object | Ideia de vídeo gerada |
| script | Script | não | object | Roteiro estruturado |
| scenes | Scene[] | não | array | Lista de cenas segmentadas |
| audioSegments | AudioSegment[] | não | array | Segmentos de áudio por cena |
| clips | Clip[] | não | array | Assets visuais por cena |
| videoPath | string | não | path | Caminho do vídeo renderizado |
| thumbnailPath | string | não | path | Caminho da thumbnail |
| metadata | VideoMetadata | não | object | Título, descrição, tags |
| videoId | string | não | YouTube ID | ID do vídeo no YouTube |
| metrics | VideoMetrics | não | object | Métricas de performance |
| performanceScore | number | não | 0-100 | Score composto de performance |
| learningState | LearningState | não | object | Estado atual do learning |
| status | enum | sim | pending/running/paused/completed/failed | Status do pipeline |
| createdAt | datetime | sim | auto | Timestamp de início |
| updatedAt | datetime | sim | auto | Timestamp de última atualização |

**Invariantes:**
- PipelineContext é imutável — cada step retorna novo contexto com spread operator
- Status determina quais campos são esperados
- Cold start: learningState usa valores padrão até dados suficientes

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { niche } | PipelineContext | Cria instância com status=pending |
| next() | { ...updates } | PipelineContext | Retorna novo contexto com updates (imutável) |
| getCurrentStep() | — | string | Retorna step atual baseado no status |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| PipelineCreated | Após criação | { id, niche, timestamp } |
| PipelineStepCompleted | Step executado | { id, stepName, timestamp } |
| PipelineCompleted | Vídeo publicado | { id, videoId, timestamp } |
| PipelineFailed | Step falha | { id, stepName, error, timestamp } |

---

### Idea

**Descrição:** Ideia de vídeo gerada pela Content Engine baseada no nicho e diretiva da Strategy.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| niche | string | sim | min 2, max 100 | Nicho do canal |
| text | string | sim | min 10, max 200 | Texto da ideia/título |
| angle | string | não | max 100 | Ângulo/twist da ideia |
| source | enum | sim | strategy/manual/random | Fonte |
| createdAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- text deve ter no mínimo 10 caracteres
- source determina origem da ideia

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { niche, text, angle?, source } | Idea | Cria instância validada |
| validate() | — | boolean | Validaidea antes de passar para roteiro |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| IdeaCreated | Após criação | { id, niche, source, timestamp } |

---

### Script

**Descrição:** Roteiro estruturado seguindo o template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP).

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| ideaId | UUID | sim | UUID válido | Referência à ideia |
| template | enum | sim | fixed | Template usado |
| hook | string | sim | max 50 palavras | Texto do hook (0-5s) |
| setup | string | sim | max 150 palavras | Texto do setup (5-15s) |
| escalada | string | sim | max 200 palavras | Texto da escalada (15s+) |
| twist | string | não | max 100 palavras | Texto do twist |
| payoff | string | não | max 100 palavras | Texto do payoff |
| loop | string | não | max 50 palavras | Texto do loop (reenganche) |
| estimatedDuration | number | sim | > 0 | Duração estimada em segundos |
| createdAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- Hook é obrigatório e deve ter no máximo 5 segundos de duração estimada
- Template não pode ser alterado em runtime
- Learning weights influenciam tom e intensidade de cada segmento

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { ideaId, template, segments } | Script | Cria instância com segmentos validados |
| getSegmentDuration() | segmentType | number | Retorna duração estimada do segmento |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| ScriptCreated | Após criação | { id, ideaId, template, timestamp } |

---

### Scene

**Descrição:** Menor unidade atômica do vídeo. Cada scene é renderizada individualmente e depois concatenada.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| scriptId | UUID | sim | UUID válido | Referência ao roteiro |
| order | number | sim | >= 0 | Ordem da cena no vídeo |
| text | string | sim | max 50 palavras | Texto da narração |
| duration | number | sim | 0.5 - 2.5 | Duração em segundos |
| start | number | sim | >= 0 | Timestamp de início no vídeo final |
| end | number | sim | > start | Timestamp de fim no vídeo final |
| visualQuery | string | sim | min 3, max 200 | Query para busca de assets visuais |
| segmentType | enum | sim | hook/setup/escalada/twist/payoff/loop | Tipo |
| pacing | PacingConfig | não | object | Configurações de pacing |
| status | enum | sim | pending/audio_generating/audio_ready/visual_ready/rendered/failed | Estado |
| createdAt | datetime | sim | auto | Timestamp de criação |

**Invariantes:**
- Duração máxima: 2.5 segundos por scene
- Scene é a unidade mínima de renderização
- visualQuery é obrigatória para busca de assets
- Status transiciona conforme máquina de estados definida

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { scriptId, order, text, segmentType } | Scene | Cria instância validada |
| applyPacing() | PacingConfig | Scene | Retorna nova scene com pacing aplicado |
| transitionTo() | newStatus | Scene | Retorna nova scene com status atualizado |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| SceneCreated | Após criação | { id, scriptId, order, timestamp } |
| SceneAudioReady | Áudio gerado | { id, audioUrl, timestamp } |
| SceneVisualReady | Visual baixado | { id, clipUrl, timestamp } |
| SceneRendered | Scene renderizada | { id, outputPath, timestamp } |
| SceneFailed | Falha no processamento | { id, error, timestamp } |

---

### AudioSegment

**Descrição:** Áudio gerado via TTS para uma scene específica.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| sceneId | UUID | sim | UUID válido | Referência à scene |
| text | string | sim | max 500 caracteres | Texto narrado |
| voiceId | string | sim | ElevenLabs ID | ID da voz ElevenLabs |
| audioUrl | string | sim | URL válida | URL do áudio gerado |
| duration | number | sim | > 0 | Duração em segundos |
| createdAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- Um AudioSegment por Scene
- Duração deve corresponder à duração da scene (+/- 0.5s)

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { sceneId, text, voiceId, audioUrl, duration } | AudioSegment | Cria instância validada |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| AudioSegmentCreated | Após criação | { id, sceneId, duration, timestamp } |

---

### Clip

**Descrição:** Asset visual (vídeo ou imagem) buscado no Pexels para uma scene.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| sceneId | UUID | sim | UUID válido | Referência à scene |
| query | string | sim | min 3, max 200 | Query usada na busca |
| source | enum | sim | pexels/dalle | Fonte |
| mediaId | string | sim | — | ID do media no source |
| mediaUrl | string | sim | URL válida | URL do media |
| localPath | string | sim | path | Caminho local após download |
| duration | number | não | > 0 | Duração (para vídeos) |
| score | number | sim | 0-100 | Score de relevância |
| createdAt | datetime | sim | auto | Timestamp de busca |

**Invariantes:**
- Score determina relevância para a scene
- Fallback: se não encontrar no Pexels, usa imagem gerada via IA (DALL-E)

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { sceneId, query, source, mediaId, mediaUrl, score } | Clip | Cria instância validada |
| download() | — | Promise<Clip> | Baixa asset para localPath |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| ClipCreated | Após criação | { id, sceneId, query, score, timestamp } |
| ClipDownloaded | Asset baixado | { id, localPath, timestamp } |

---

### Video

**Descrição:** Vídeo final renderizado, pronto para upload.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| pipelineId | UUID | sim | UUID válido | Referência ao PipelineContext |
| path | string | sim | path válido | Caminho local do arquivo .mp4 |
| duration | number | sim | > 0 | Duração total em segundos |
| resolution | string | sim | 1920x1080 | Resolução |
| format | string | sim | mp4 | Formato (H.264) |
| size | number | sim | > 0 | Tamanho em bytes |
| hasSubtitles | boolean | sim | boolean | Se tem legendas |
| hasMusic | boolean | sim | boolean | Se tem música de fundo |
| createdAt | datetime | sim | auto | Timestamp de renderização |

**Invariantes:**
- Resolução padrão: 1920x1080 (16:9)
- Formato: MP4 (H.264)
- Todos os clips devem estar ready antes de renderizar

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { pipelineId, path, duration, size } | Video | Cria instância validada |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| VideoCreated | Após criação | { id, pipelineId, duration, timestamp } |

---

### Thumbnail

**Descrição:** Thumbnail gerada automaticamente com scoring de CTR.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| videoId | UUID | sim | UUID válido | Referência ao vídeo |
| concepts | string[] | sim | array não vazio | Conceitos visuais gerados |
| imageUrl | string | sim | URL válida | URL da imagem gerada |
| localPath | string | sim | path | Caminho local após download |
| ctrScore | number | sim | 0-100 | Score de potencial CTR |
| isSelected | boolean | sim | boolean | Se foi selecionada |
| createdAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- Gera múltiplas variantes (3-5), seleciona a com maior CTR score
- Resolução: 1280x720

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { videoId, concepts, imageUrl, ctrScore } | Thumbnail | Cria instância validada |
| select() | — | Thumbnail | Marca como isSelected=true |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| ThumbnailCreated | Após criação | { id, videoId, ctrScore, timestamp } |
| ThumbnailSelected | Selecionada | { id, timestamp } |

---

### VideoMetrics

**Descrição:** Métricas reais de performance coletadas via YouTube Analytics API.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| videoId | UUID | sim | YouTube ID | ID do vídeo no YouTube |
| publishedAt | datetime | sim | date | Data de publicação |
| views | number | sim | >= 0 | Total de visualizações |
| likes | number | sim | >= 0 | Total de likes |
| comments | number | sim | >= 0 | Total de comentários |
| retention | number | sim | 0-100 | Porcentagem de retenção média |
| ctr | number | sim | 0-100 | Click-through rate (%) |
| avgWatchTime | number | sim | >= 0 | Tempo médio de visualização (segundos) |
| dropOffPoints | number[] | sim | array | Timestamps de abandono |
| retentionCurve | object | não | object | Curva de retenção por segundo |
| status | enum | sim | pending/collected/failed | Estado da coleta |
| createdAt | datetime | sim | auto | Timestamp de coleta |

**Invariantes:**
- Dados disponíveis apenas 48-72h após publicação (cold start)
- retentionCurve é opcional (API pode não retornar)
- Status transiciona conforme máquina de estados

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { videoId, publishedAt, metrics } | VideoMetrics | Cria instância validada |
| transitionTo() | newStatus | VideoMetrics | Retorna novo estado |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| VideoMetricsCollected | Dados obtidos | { id, videoId, views, retention, timestamp } |
| VideoMetricsFailed | Falha na coleta | { id, videoId, error, timestamp } |

---

### ContentPlan

**Descrição:** Plano de conteúdo gerado pela Strategy Engine baseado em dados de performance.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| niche | string | sim | min 2, max 100 | Nicho do canal |
| topics | string[] | sim | array não vazio | Tópicos priorizados |
| series | Series[] | não | array | Séries temáticas |
| generatedAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- Gera tópicos baseados em clusterização de dados
- Pode criar séries temáticas (ex: "Mysteries Unolved", 10 episódios)

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { niche, topics } | ContentPlan | Cria instância validada |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| ContentPlanCreated | Após criação | { id, niche, topicsCount, timestamp } |

---

### LearningState

**Descrição:** Estado do Learning Engine com pesos ajustáveis para geração de conteúdo.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| niche | string | sim | min 2, max 100 | Nicho do canal |
| hookWeights | object | sim | object | Pesos para tipos de hook |
| templateWeights | object | sim | object | Pesos para segmentos de template |
| pacingWeights | object | sim | object | Pesos para configurações de pacing |
| contentWeights | object | sim | object | Pesos para topics/angles |
| isActive | boolean | sim | boolean | Se o learning está ativo |
| status | enum | sim | inactive/active/paused | Estado do learning |
| lastUpdated | datetime | sim | auto | Timestamp de última atualização |
| analyzedVideos | number | sim | >= 0 | Quantidade de vídeos analisados |
| createdAt | datetime | sim | auto | Timestamp de criação |

**Invariantes:**
- Cold start: usa valores padrão até analisar mínimo de 5 vídeos
- Pesos ajustados após análise de performance
- Taxa de ajuste limitada para evitar oscilação (max 10% por ajuste)
- Status transiciona conforme máquina de estados

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { niche } | LearningState | Cria com valores padrão |
| adjustWeights() | { metric, delta } | LearningState | Ajusta pesos com limite de 10% |
| activate() | — | LearningState | Ativa learning (min 5 vídeos) |
| pause() | — | LearningState | Pausa learning |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| LearningStateCreated | Após criação | { id, niche, timestamp } |
| LearningWeightsAdjusted | Pesos ajustados | { id, metric, delta, timestamp } |
| LearningActivated | Learning ativado | { id, timestamp } |
| LearningPaused | Learning pausado | { id, timestamp } |

---

### StrategyDirective

**Descrição:** Instrução da Strategy Engine para a Content Engine sobre o que gerar.

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| topic | string | sim | min 3, max 200 | Tópico principal |
| angle | string | não | max 100 | Ângulo/twist |
| targetMetrics | object | não | object | Métricas-alvo (retenção, CTR) |
| template | string | sim | fixed | Template de roteiro recomendado |
| priority | number | sim | 1-5 | Prioridade |
| createdAt | datetime | sim | auto | Timestamp de geração |

**Invariantes:**
- Gerada automaticamente pela Strategy Engine
- Pode ser sobrescrita manualmente pelo operador

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { topic, template, priority } | StrategyDirective | Cria instância validada |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| StrategyDirectiveCreated | Após criação | { id, topic, template, timestamp } |

---

### Series

**Descrição:** Série temática de vídeos (ex: "10 Mistérios Não Resolvidos").

**Atributos:**

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|:-----------:|-----------|-----------|
| id | UUID | sim | auto-generated | UUID único |
| title | string | sim | min 3, max 200 | Título da série |
| topic | string | sim | min 3, max 200 | Tópico central |
| episodeCount | number | sim | > 0 | Número de episódios |
| episodes | string[] | sim | array | IDs dos vídeos na série |
| status | enum | sim | planning/in_progress/completed/cancelled | Estado |
| createdAt | datetime | sim | auto | Timestamp de criação |

**Invariantes:**
- Episodes são adicionados conforme vídeos são gerados
- Status tracking para saber progresso da série
- Status transiciona conforme máquina de estados

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| create() | { title, topic, episodeCount } | Series | Cria instância com status=planning |
| addEpisode() | videoId | Series | Adiciona vídeo à série |
| complete() | — | Series | Marca como completed |

**Eventos Emitidos:**

| Evento | Quando | Payload |
|--------|--------|---------|
| SeriesCreated | Após criação | { id, title, episodeCount, timestamp } |
| SeriesEpisodeAdded | Episódio adicionado | { id, videoId, timestamp } |
| SeriesCompleted | Série concluída | { id, timestamp } |

---

## Value Objects

| Value Object | Campos | Validação | Usado em |
|--------------|--------|-----------|-----------|
| VideoMetadata | title: string, description: string, tags: string[] | title max 100, description max 5000, tags max 500 | PipelineContext.metadata |
| PacingConfig | maxDuration: number, patternInterrupt: boolean, zoomEffect: boolean, transitionType: string | maxDuration <= 2.5 | Scene.pacing |
| TargetMetrics | retention: number, ctr: number | 0-100 | StrategyDirective.targetMetrics |
| HookWeights | curiosity: number, shock: number, question: number, promise: number | 0-1, soma <= 1 | LearningState.hookWeights |
| RetentionCurve | seconds: number[] | array de segundos | VideoMetrics.retentionCurve |

---

## Regras de Negócio

| ID | Regra | Severidade | Entidade | Onde Validar |
|----|-------|------------|----------|--------------|
| RN-001 | Duração máxima de cada scene é 2.5 segundos | Alta | Scene | Scene Engine |
| RN-002 | Hook deve ter no máximo 5 segundos de duração | Alta | Script | Content Engine |
| RN-003 | Learning só ativa após analisar mínimo 5 vídeos | Alta | LearningState | Learning Engine |
| RN-004 | Ajuste de pesos limitado a 10% por operação | Alta | LearningState | Learning Engine |
| RN-005 | Vídeo só é renderizado quando todos os clips estão ready | Alta | Video | Render Engine |
| RN-006 | Thumbnail deve ter resolução 1280x720 | Alta | Thumbnail | Thumbnail Engine |
| RN-007 | Cold start: métricas disponíveis apenas 48-72h após publicação | Alta | VideoMetrics | Performance Engine |
| RN-008 | Retry automático com máximo 3 tentativas por step | Alta | PipelineContext | Pipeline |
| RN-009 | Resolução padrão do vídeo: 1920x1080 (16:9) | Alta | Video | Render Engine |
| RN-010 | Formato de saída: MP4 (H.264) | Alta | Video | Render Engine |
| RN-011 | PipelineContext é imutável — cada step retorna novo contexto | Alta | PipelineContext | Pipeline |
| RN-012 | Um AudioSegment por Scene | Alta | AudioSegment | Voice Engine |
| RN-013 | Duração do AudioSegment deve corresponder à duração da Scene | Alta | AudioSegment | Voice Engine |

---

## Relacionamentos

| Entidade A | Cardinalidade | Entidade B | Cascade | Obrigatório | Descrição |
|------------|:-------------:|------------|---------|:-----------:|------------|
| PipelineContext | 1:1 | ContentPlan | — | não | Um contexto tem um plano de conteúdo |
| PipelineContext | 1:N | Scene | — | não | Um contexto tem múltiplas scenes |
| PipelineContext | 1:1 | Video | — | não | Um contexto gera um vídeo |
| PipelineContext | 1:1 | Thumbnail | — | não | Um contexto gera uma thumbnail |
| PipelineContext | 1:1 | LearningState | — | não | Um contexto carrega estado de learning |
| PipelineContext | 1:1 | VideoMetrics | — | não | Um contexto pode ter métricas |
| Idea | 1:N | Script | — | sim | Uma ideia gera um roteiro |
| Script | 1:N | Scene | CASCADE | sim | Um roteiro tem múltiplas scenes |
| Scene | 1:1 | AudioSegment | CASCADE | sim | Uma scene tem um áudio |
| Scene | 1:1 | Clip | CASCADE | sim | Uma scene tem um clip visual |
| Video | 1:1 | Thumbnail | CASCADE | sim | Um vídeo tem uma thumbnail |
| Video | 1:N | VideoMetrics | — | não | Um vídeo pode ter métricas (histórico) |
| ContentPlan | 1:N | Series | — | não | Um plano pode ter séries |
| Series | 1:N | Video | — | não | Uma série tem múltiplos vídeos |
| LearningState | N:1 | PipelineContext | — | não | Learning state asociado a um nicho |

---

## Máquinas de Estado

### PipelineContext — Pipeline

**Estados:**

```
[pending] → start() → [running]
[running] → stepComplete() → [running]
[running] → pause() → [paused]
[paused] → resume() → [running]
[running] → complete() → [completed]
[running] → fail() → [failed]
[paused] → cancel() → [failed]
[failed] → restart() → [pending]
```

**Transições:**

| De | Evento/Ação | Para | Regra | Side-effect |
|----|-------------|------|-------|-------------|
| pending | start() | running | Nicho configurado | Emite PipelineStarted |
| running | stepComplete() | running | Próximo step executado | Emite PipelineStepCompleted |
| running | pause() | paused | Retry manual necessário | Emite PipelinePaused |
| paused | resume() | running | Problema resolvido | Emite PipelineResumed |
| running | complete() | completed | Upload YouTube bem-sucedido | Emite PipelineCompleted |
| running | fail() | failed | Step falha após 3 tentativas | Emite PipelineFailed |
| paused | cancel() | failed | Cancelamento explícito | Emite PipelineCancelled |
| failed | restart() | pending | Novo pipeline | Emite PipelineRestarted |

**Estados terminais:**
- completed — vídeo publicado com sucesso
- failed — erro irrecuperável

**Transições proibidas:**
- pending → completed (deve passar por running)
- failed → completed (não é possível completar um pipeline que falhou)
- completed → qualquer estado (estado terminal)

---

### Scene — Processamento

**Estados:**

```
[pending] → generateAudio() → [audio_generating]
[audio_generating] → audioReady() → [audio_ready]
[audio_ready] → downloadVisual() → [visual_ready]
[visual_ready] → render() → [rendered]
[audio_generating] → fail() → [failed]
[visual_ready] → fail() → [failed]
```

**Transições:**

| De | Evento/Ação | Para | Regra | Side-effect |
|----|-------------|------|-------|-------------|
| pending | generateAudio() | audio_generating | — | Chama ElevenLabs API |
| audio_generating | audioReady() | audio_ready | Sucesso | Emite SceneAudioReady |
| audio_ready | downloadVisual() | visual_ready | Sucesso | Baixa clip do Pexels |
| visual_ready | render() | rendered | Sucesso | FFmpeg processa |
| audio_generating | fail() | failed | Após 3 retries | Emite SceneFailed |
| visual_ready | fail() | failed | Após 3 retries | Emite SceneFailed |

**Estados terminais:**
- rendered — scene processada com sucesso

**Transições proibidas:**
- rendered → qualquer estado (estado terminal)
- failed → qualquer estado (precisa de retry manual)

---

### LearningState — Learning Loop

**Estados:**

```
[inactive] → activate(minVideos) → [active]
[active] → deactivate() → [inactive]
[active] → pause() → [paused]
[paused] → activate() → [active]
```

**Transições:**

| De | Evento/Ação | Para | Regra | Side-effect |
|----|-------------|------|-------|-------------|
| inactive | activate() | active | Mínimo 5 vídeos analisados | Emite LearningActivated |
| active | deactivate() | inactive | Configuração explícita | Emite LearningDeactivated |
| active | pause() | paused | Instabilidade detectada | Emite LearningPaused |
| paused | activate() | active | Verificação manual | Emite LearningActivated |

**Transições proibidas:**
- inactive → paused (não pode pausar algo inativo)

---

### VideoMetrics — Coleta

**Estados:**

```
[pending] → collect() → [collected]
[pending] → fail() → [failed]
[failed] → retry() → [pending]
```

**Transições:**

| De | Evento/Ação | Para | Regra | Side-effect |
|----|-------------|------|-------|-------------|
| pending | collect() | collected | Sucesso na API | Emite VideoMetricsCollected |
| pending | fail() | failed | Falha na API | Emite VideoMetricsFailed |
| failed | retry() | pending | Tentativa de retry | — |

**Estados terminais:**
- collected — métricas obtidas com sucesso

---

### Series — Progresso

**Estados:**

```
[planning] → start() → [in_progress]
[in_progress] → complete() → [completed]
[in_progress] → cancel() → [cancelled]
[planning] → cancel() → [cancelled]
```

**Transições:**

| De | Evento/Ação | Para | Regra | Side-effect |
|----|-------------|------|-------|-------------|
| planning | start() | in_progress | Primeiro vídeo publicado | Emite SeriesStarted |
| in_progress | complete() | completed | episode_count atingido | Emite SeriesCompleted |
| in_progress | cancel() | cancelled | Cancelamento explícito | Emite SeriesCancelled |
| planning | cancel() | cancelled | Cancelamento explícito | Emite SeriesCancelled |

**Estados terminais:**
- completed — todos os episódios publicados
- cancelled — série cancelada

**Transições proibidas:**
- completed → qualquer estado (estado terminal)
- cancelled → qualquer estado (estado terminal)
- planning → completed (deve produzir episódios)

---

> Ver [04-data-layer.md](04-data-layer.md) para schema de banco e repositories
