# Services

> Camada de orquestração de lógica de negócio. Services orquestram engines e repositories.

<!-- do blueprint: 06-system-architecture.md -->
<!-- do blueprint: 07-critical_flows.md -->

---

## Convenções de Services

- **Services orquestram lógica de negócio** — NAO acessam banco diretamente (usam repositories)
- **Services recebem DTOs e retornam entidades de domínio ou DTOs de response**
- **Toda operação crítica é executada dentro de transação**
- **Services emitem eventos de domínio após operações bem-sucedidas**
- **Services não conhecem HTTP** — sem req/res, headers ou status codes
- **CLI project**: Services são chamados diretamente pelo Pipeline Orchestrator

---

## Catálogo de Services

### PipelineService

**Responsabilidade:** Orquestra execução do pipeline de geração de vídeo, gerencia estado, retry e persistência.

**Não faz:** Não processa scenes individualmente (Engine), não acessa APIs externas.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| PipelineRepository | Repository | Persistência de pipelines |
| ContentEngine | Engine | Gera ideia e roteiro |
| SceneEngine | Engine | Segmenta em cenas |
| VoiceEngine | Engine | Gera áudio |
| VisualEngine | Engine | Busca assets visuais |
| PacingEngine | Engine | Aplica controle de ritmo |
| RenderEngine | Engine | Renderiza vídeo |
| ThumbnailEngine | Engine | Gera thumbnail |
| UploadService | Service | Publica no YouTube |
| EventBus | Infrastructure | Emissão de eventos |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| execute(params) | { niche, idea?, strategyDirective? } | PipelineContext | Executa pipeline completo |
| resume(pipelineId) | UUID | PipelineContext | Retoma pipeline pausado |
| retryStep(pipelineId, stepName) | UUID, string | PipelineContext | Retry de step específico |
| getStatus(pipelineId) | UUID | PipelineStatus | Retorna status atual |
| cancel(pipelineId) | UUID | void | Cancela pipeline em execução |

---

### ContentEngine (Service)

**Responsabilidade:** Gera ideias e roteiros via LLM usando templates otimizados para retenção.

**Não faz:** Não segmenta roteiro em scenes, não gera áudio.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| LLMClient | Infrastructure | Chamadas ao OpenRouter |
| LearningStateRepository | Repository | Lee pesos de learning |
| PromptBuilder | Infrastructure | Monta prompts |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| generateIdea(niche, directive?) | string, StrategyDirective? | Idea | Gera ideia automaticamente |
| generateScript(idea, template) | Idea, Template | Script | Gera roteiro estruturado |
| generateHookVariants(idea, count) | Idea, number | string[] | Gera múltiplas variants de hook |
| optimizeWithLearning(script) | Script | Script | Otimiza com learning weights |

---

### SceneEngine (Service)

**Responsabilidade:** Segmenta roteiro em cenas, estima durações, gera visual queries.

**Não faz:** Não gera áudio, não busca assets visuais.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| Script | Domain Entity | Roteiro de entrada |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| splitIntoScenes(script) | Script | Scene[] | Segmenta roteiro em cenas |
| estimateDurations(scenes) | Scene[] | Scene[] | Estima duração por cena |
| generateVisualQueries(scenes) | Scene[] | Scene[] | Gera queries para busca visual |

---

### VoiceEngine (Service)

**Responsabilidade:** Gera narração via TTS, aplica perfis de voz, concatena segmentos.

**Não faz:** Não gera roteiro, não busca assets visuais.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| ElevenLabsClient | Infrastructure | API de TTS |
| AudioSegmentRepository | Repository | Persistência de áudios |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| generateVoice(scene) | Scene | AudioSegment | Gera áudio para uma cena |
| generateAll(scenes) | Scene[] | AudioSegment[] | Gera áudio para todas as cenas |
| mergeAudioSegments(segments) | AudioSegment[] | Buffer | Concatena segmentos |

---

### VisualEngine (Service)

**Responsabilidade:** Busca clips/imagens no Pexels, ranqueia por relevância, baixa assets.

**Não faz:** Não gera roteiro, não gera áudio.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| PexelsClient | Infrastructure | API do Pexels |
| DalleClient | Infrastructure | Fallback para geração IA |
| AssetRepository | Repository | Cache de assets |
| AssetStorage | Infrastructure | Download e armazenamento local |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| searchClips(query, count) | string, number | Clip[] | Busca clips no Pexels |
| rankClips(query, clips) | string, Clip[] | Clip[] | Ranqueia por relevância |
| downloadMedia(clip) | Clip | Clip | Baixa asset para local |
| fallbackToAI(query) | string | Clip | Gera via DALL-E se Pexels falhar |

---

### PacingEngine (Service)

**Responsabilidade:** Controla ritmo do vídeo: max 2.5s por cena, pattern interrupts, zoom effects.

**Não faz:** Não gera roteiro, não renderiza.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| LearningStateRepository | Repository | Lee pesos de pacing |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| enforceMaxSceneDuration(scenes) | Scene[] | Scene[] | Garante max 2.5s por cena |
| addPatternInterrupts(scenes) | Scene[] | Scene[] | Adiciona interrupts |
| applyZoomEffects(scenes) | Scene[] | Scene[] | Aplica zoom em momentos-chave |
| addMicroTransitions(scenes) | Scene[] | Scene[] | Adiciona transições |

---

### RenderEngine (Service)

**Responsabilidade:** Renderiza vídeo scene-based com FFmpeg, sincroniza audio/video, legendas e música.

**Não faz:** Não gera roteiro, não busca assets.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| FFmpegCLI | Infrastructure | Comandos FFmpeg |
| PipelineRepository | Repository | Persistência de state |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| composeScene(audioSegment, clip, scene) | AudioSegment, Clip, Scene | string | Renderiza cena individual |
| stitchScenes(scenePaths) | string[] | string | Concatena todas as cenas |
| addSubtitles(videoPath, scenes) | string, Scene[] | string | Gera e adiciona legendas |
| addBackgroundMusic(videoPath) | string | string | Adiciona música de fundo |
| renderFullPipeline(scenes, audioSegments, clips) | Scene[], AudioSegment[], Clip[] | Video | Executa renderização completa |

---

### ThumbnailEngine (Service)

**Responsabilidade:** Gera thumbnails com scoring CTR, compõe via Canvas, seleciona melhor opção.

**Não faz:** Não gera roteiro, não renderiza vídeo.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| DalleClient | Infrastructure | Geração de thumbnails |
| CanvasService | Infrastructure | Composição de imagem |
| ThumbnailRepository | Repository | Persistência |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| generateConcepts(idea) | Idea | string[] | Gera conceitos visuais |
| generateVariants(concepts, count) | string[], number | Thumbnail[] | Gera múltiplas variantes |
| composeThumbnail(concept) | string | Thumbnail | Compoe com texto/overlay |
| scoreCTR(thumbnail) | Thumbnail | number | Score de potencial CTR |
| selectBest(thumbnails) | Thumbnail[] | Thumbnail | Seleciona melhor opção |

---

### UploadService

**Responsabilidade:** Publica vídeo no YouTube, gera título/descrição/tags automaticamente.

**Não faz:** Não gera roteiro, não renderiza.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| YouTubeClient | Infrastructure | YouTube Data API |
| PipelineRepository | Repository | Busca metadados |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| upload(video, metadata) | Video, VideoMetadata | string | Upload para YouTube |
| generateMetadata(pipelineContext) | PipelineContext | VideoMetadata | Gera título/descrição/tags |
| setThumbnail(videoId, thumbnail) | string, Thumbnail | void | Define thumbnail |

---

### PerformanceService

**Responsabilidade:** Coleta métricas via YouTube Analytics API, gera curvas de retenção.

**Não faz:** Não gera roteiro, não renderiza.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| YouTubeAnalyticsClient | Infrastructure | YouTube Analytics API |
| VideoMetricsRepository | Repository | Persistência de métricas |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| collectMetrics(videoId) | string | VideoMetrics | Coleta métricas do YouTube |
| getRetentionCurve(videoId) | string | number[] | Curva de retenção por segundo |
| detectDropOffPoints(metrics) | VideoMetrics | number[] | Detecta pontos de abandono |
| calculatePerformanceScore(metrics) | VideoMetrics | number | Score composto |

---

### StrategyService

**Responsabilidade:** Decide próximo conteúdo baseado em dados, clusteriza tópicos, cria séries.

**Não faz:** Não gera roteiro, não renderiza.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| LLMClient | Infrastructure | Geração de conteúdo |
| ContentPlanRepository | Repository | Persistência de planos |
| SeriesRepository | Repository | Persistência de séries |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| generateContentPlan(niche) | string | ContentPlan | Gera plano de conteúdo |
| clusterTopics(topics) | string[] | string[][] | Clusteriza tópicos |
| prioritizeIdeas(ideas) | Idea[] | Idea[] | Prioriza ideias por potencial |
| createSeries(title, topic, count) | string, string, number | Series | Cria série temática |

---

### LearningService

**Responsabilidade:** Analisa performance, ajusta pesos de prompts, otimiza templates.

**Não faz:** Não gera roteiro, não renderiza.

**Dependências:**

| Dependência | Tipo | Função |
|-------------|------|--------|
| LearningStateRepository | Repository | Persistência de pesos |
| VideoMetricsRepository | Repository | Métricas de vídeos |
| LLMClient | Infrastructure | Análise de padrões |

**Métodos:**

| Método | Parâmetros | Retorno | Descrição |
|--------|------------|---------|-----------|
| analyzeFailures(pipelineId) | UUID | LearningInsight | Analisa vídeos de baixa performance |
| updateWeights(niche, insights) | string, LearningInsight[] | LearningState | Ajusta pesos |
| shouldActivate(niche) | string | boolean | Verifica se pode ativar (min 5 vídeos) |
| getWeights(niche) | string | LearningState | Retorna pesos atuais |

---

## Fluxos Detalhados

### PipelineService.execute() — Fluxo Completo

```
1. Recebe { niche, idea?, strategyDirective? }
2. Cria PipelineContext com status=pending
3. Carrega LearningState para o niche (ou cria default)
4. Transiciona para status=running
5. PASSO 1 - Content Engine:
   5.1. Se não há idea → ContentEngine.generateIdea(niche, directive)
   5.2. ContentEngine.generateScript(idea, template)
   5.3. Persiste pipeline com script
6. PASSO 2 - Scene Engine:
   6.1. SceneEngine.splitIntoScenes(script)
   6.2. SceneEngine.estimateDurations(scenes)
   6.3. SceneEngine.generateVisualQueries(scenes)
   6.4. Persiste pipeline com scenes
7. PASSO 3 - Voice + Visual (paralelo):
   7.1. VoiceEngine.generateAll(scenes)
   7.2. VisualEngine.searchClips para cada scene
   7.3. VisualEngine.rankClips
   7.4. VisualEngine.downloadMedia
   7.5. Persiste pipeline com audioSegments e clips
8. PASSO 4 - Pacing Engine:
   8.1. PacingEngine.enforceMaxSceneDuration(scenes)
   8.2. PacingEngine.addPatternInterrupts(scenes)
   8.3. PacingEngine.applyZoomEffects(scenes)
   8.4. Persiste pipeline com scenes ajustadas
9. PASSO 5 - Render Engine:
   9.1. RenderEngine.composeScene para cada scene
   9.2. RenderEngine.stitchScenes
   9.3. RenderEngine.addSubtitles
   9.4. RenderEngine.addBackgroundMusic
   9.5. Persiste pipeline com videoPath
10. PASSO 6 - Thumbnail Engine:
    10.1. ThumbnailEngine.generateConcepts(idea)
    10.2. ThumbnailEngine.generateVariants
    10.3. ThumbnailEngine.scoreCTR para cada thumbnail
    10.4. ThumbnailEngine.selectBest
    10.5. Persiste pipeline com thumbnailPath
11. PASSO 7 - Upload:
    11.1. UploadService.generateMetadata(context)
    11.2. UploadService.upload(video, metadata)
    11.3. Persiste videoId
12. Transiciona para status=completed
13. Emite PipelineCompleted via EventBus
14. Retorna PipelineContext final
```

**Transação:** Sim — cada step persiste estado dentro de transação
**Idempotência:** Pipeline ID único, cada step verifica se já foi executado

---

### LearningService.updateWeights() — Fluxo de Ajuste

```
1. Recebe { niche, insights }
2. Busca LearningState atual para o niche
3. Para cada insight:
   3.1. Calcula delta (max 10% por ajuste)
   3.2. Aplica ajuste ao peso correspondente
4. Atualiza LearningState com novos pesos
5. Incrementa analyzedVideos
6. Persiste LearningState
7. Emite LearningWeightsUpdated via EventBus
8. Retorna LearningState atualizado
```

**Transação:** Sim — atualização atômica
**Idempotência:** LearningState.niche é único, conflito resolvedor por upsert

---

## Injeção de Dependências

| Estratégia | Descrição |
|------------|------------|
| Constructor injection | Dependências passadas via construtor |
| Factory functions | Funções que montam o service com deps |
| Manual DI | Sem container — instâncias criadas em `src/index.ts` |

> Ver [09-errors.md](09-errors.md) para tratamento de erros
