# PRD — Mestra AI: Sistema Autonomo de Crescimento de Canal YouTube

## 1. Visao do Produto

Mestra AI nao e apenas um gerador de videos. E um **sistema autonomo de crescimento de canais no YouTube**, capaz de gerar conteudo, publicar, medir performance, aprender com dados reais e otimizar automaticamente os proximos videos.

**Proposta de valor:**

> "Crie e escale canais dark que melhoram automaticamente a cada video."

Para operadores de canais YouTube (nichos dark/curiosidades), o Mestra AI e um sistema autonomo que produz, publica e **aprende** — cada video alimenta o proximo. Diferente de ferramentas de edicao ou geradores de video, o Mestra AI fecha o loop: performance real do YouTube influencia diretamente a estrategia, o roteiro e a producao dos proximos videos.

---

## 2. Problema

Ferramentas atuais automatizam producao, mas nao resolvem os problemas reais de crescimento:

- Videos nao performam (baixa retencao) porque nao ha otimizacao baseada em dados reais
- Nao existe aprendizado continuo — cada video parte do zero
- Falta estrategia de conteudo — decisoes sobre o que produzir sao manuais e baseadas em intuicao
- Producao manual nao escala (horas por video)
- Sincronizacao audio/video exige habilidade tecnica
- Nao ha feedback loop entre performance e producao

---

## 3. Objetivos

**Primarios:**

- Automatizar criacao + publicacao + otimizacao em ciclo fechado
- Maximizar retencao (> 45%), CTR (> 6%) e tempo de sessao
- Fechar o loop: performance real → aprendizado → melhores videos

**Secundarios:**

- Permitir escala multi-canal
- Reduzir custo por video
- Evoluir automaticamente com dados (sem intervencao manual)

---

## 4. Usuario-Alvo

| Persona | Necessidade | Frequencia de Uso |
|---------|-------------|-------------------|
| Operador de canais dark | Gerar, publicar e otimizar videos automaticamente para canais YouTube | Diario |

> Ferramenta de uso interno. Operador unico.

---

## 5. Escopo

### Incluido

- 4 Engines: Content, Rendering, Performance, Strategy
- Learning Engine (feedback loop)
- Scene Engine com segmentacao e pacing
- Thumbnail Engine com scoring de CTR
- Template System para roteiros (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
- Coleta de metricas reais via YouTube Analytics API
- Batch processing (10+ videos/dia)
- Persistencia de estado e retry por step

### Fora do Escopo

- UI / Dashboard
- Multi-tenant / multiusuario / SaaS
- MastraJS
- Integracao com Shorts / TikTok / Reels

---

## 6. Arquitetura do Sistema

### 6.1 Modelo: 4 Engines

```
Content Engine       → Gera conteudo otimizado (roteiro, hooks, ideias)
Rendering Engine     → Produz video final (scene-based + pacing)
Performance Engine   → Analisa dados reais do YouTube
Strategy Engine      → Decide proximos videos com base em dados
```

O **Learning Engine** e transversal — conecta Performance → Strategy → Content, fechando o ciclo.

### 6.2 Content Engine

Responsavel por gerar conteudo otimizado para retencao.

**Funcoes:**
- `generateIdea(niche)` — gera ideia baseada no nicho e diretivas da Strategy
- `generateScriptFromTemplate(idea, template)` — roteiro estruturado via template
- `generateHookVariants(idea)` — multiplas opcoes de gancho
- `selectBestHook()` — seleciona melhor hook baseado em dados de learning
- `optimizeScriptForRetention(script)` — otimiza para retencao

### 6.3 Scene Engine

Transforma script em unidades sincronizadas.

```typescript
type Scene = {
  id: string
  text: string
  duration: number
  start: number
  end: number
  visualQuery: string
}
```

**Funcoes:**
- `splitIntoScenes(script)` — quebra roteiro em cenas
- `estimateDurations(scenes)` — calcula duracao por cena
- `generateVisualQueries(scene)` — gera queries de busca visual por cena

### 6.4 Voice Engine

**Funcoes:**
- `generateVoice(scene)` — gera audio por cena
- `applyVoiceStyle(profile)` — aplica perfil de voz
- `mergeAudioSegments()` — concatena segmentos de audio

### 6.5 Visual Engine

**Funcoes:**
- `searchClips(query)` — busca clips no Pexels
- `rankClips(clips)` — ranqueia por relevancia
- `downloadMedia()` — baixa assets

### 6.6 Pacing Engine

Controla retencao via ritmo. **Modulo critico** — define o "feel" do video.

**Funcoes:**
- `enforceMaxSceneDuration(2.5)` — nenhuma cena passa de 2.5s
- `addPatternInterrupts()` — quebra monotonia com interrupcoes visuais
- `applyZoomEffects()` — zoom dinamico em momentos-chave
- `addMicroTransitions()` — transicoes rapidas entre cenas

### 6.7 Rendering Engine

Modelo scene-based — cada cena e renderizada individualmente e depois unida.

**Funcoes:**
- `composeScene(scene)` — renderiza uma cena (audio + visual + legenda)
- `syncAudioVideo(scene)` — sincroniza audio e video por cena
- `stitchScenes()` — concatena todas as cenas renderizadas
- `addSubtitles()` — gera e embute legendas
- `addBackgroundMusic()` — adiciona musica de fundo

### 6.8 Thumbnail Engine

Gera multiplas opcoes e seleciona a melhor.

**Funcoes:**
- `generateThumbnailConcepts(idea)` — gera conceitos visuais
- `generateMultipleImages(n=4)` — gera 4 variantes via IA
- `composeThumbnail()` — composicao via Canvas (texto + overlay + gradiente)
- `scoreThumbnailCTR()` — pontua potencial de CTR
- `selectBestThumbnail()` — seleciona a melhor opcao

### 6.9 Performance Engine

Coleta e analisa dados reais do YouTube.

**Funcoes:**
- `collectMetrics(videoId)` — coleta metricas via YouTube Analytics API
- `getRetentionCurve()` — curva de retencao por segundo
- `detectDropOffPoints()` — identifica pontos de abandono
- `scoreVideoPerformance()` — score composto do video

**Score interno:**
```
performanceScore =
  retentionWeight * retention +
  ctrWeight * ctr +
  watchTimeWeight * watchTime
```

> **Nota:** YouTube Analytics tem delay de 48-72h. O learning loop opera de forma assincrona.

### 6.10 Strategy Engine

Decide **o que** produzir com base em dados reais.

**Funcoes:**
- `generateContentPlan(niche)` — plano de conteudo baseado em performance
- `clusterTopics()` — agrupa topicos relacionados (ex: misterios, casos reais, historias bizarras)
- `prioritizeIdeas()` — prioriza ideias por potencial de performance
- `createSeries()` — cria series tematicas (ex: "Misterios nao resolvidos", 10 episodios)

### 6.11 Learning Engine (Feedback Loop)

O diferencial do sistema. Conecta performance real a producao futura.

**Funcoes:**
- `analyzeFailures()` — analisa videos com baixa performance
- `updatePromptWeights()` — ajusta pesos dos prompts de geracao
- `adjustHookStrategy()` — muda estrategia de ganchos baseado em dados
- `optimizeTemplates()` — otimiza templates de roteiro

**Fluxo:**
```
Performance Engine → dados reais
    ↓
Learning Engine → analise + ajustes
    ↓
Strategy Engine → novo plano de conteudo
    ↓
Content Engine → producao otimizada
```

**Cold start:** Antes de ter dados de performance, o sistema usa configuracoes padrao (templates base, hooks genericos, estrategia por nicho). Apos os primeiros videos publicados e dados coletados (48-72h), o learning loop se ativa.

### 6.12 Template System (Roteiro)

Estrutura padrao de roteiro otimizado para retencao:

| Segmento | Tempo | Funcao |
|----------|-------|--------|
| HOOK | 0-5s | Gancho — prende atencao imediatamente |
| SETUP | 5-15s | Contexto — estabelece o tema |
| ESCALADA | 15s+ | Tensao crescente — mantem curiosidade |
| TWIST | variavel | Virada — surpreende o espectador |
| PAYOFF | variavel | Entrega — resolve a promessa do hook |
| LOOP | final | Reengancha — leva ao proximo video |

**Funcao:** `generateScriptFromTemplate(template, idea)`

O Learning Engine ajusta parametros do template (duracao de cada segmento, tipo de hook, intensidade da escalada) com base em dados reais.

### 6.13 Estrutura de Pastas

```
src/
├── core/
│   ├── pipeline.ts
│   ├── context.ts
│   └── logger.ts
│
├── engines/
│   ├── content/
│   │   ├── idea.ts
│   │   ├── script.ts
│   │   └── hook.ts
│   │
│   ├── rendering/
│   │   ├── scene.ts
│   │   ├── pacing.ts
│   │   ├── voice.ts
│   │   ├── visual.ts
│   │   ├── render.ts
│   │   └── thumbnail.ts
│   │
│   ├── performance/
│   │   ├── metrics.ts
│   │   ├── retention.ts
│   │   └── scoring.ts
│   │
│   ├── strategy/
│   │   ├── planner.ts
│   │   ├── clustering.ts
│   │   └── series.ts
│   │
│   └── learning/
│       ├── analyzer.ts
│       ├── weights.ts
│       └── optimizer.ts
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
├── pipelines/
│   ├── video.ts
│   ├── thumbnail.ts
│   └── learning.ts
│
└── index.ts
```

### 6.14 Pipeline Context

```typescript
type PipelineContext = {
  // Strategy
  niche: string
  contentPlan: ContentPlan
  strategyDirective: StrategyDirective

  // Content
  idea: string
  script: string
  template: ScriptTemplate
  scenes: Scene[]

  // Rendering
  audioSegments: AudioSegment[]
  clips: Clip[]
  pacingConfig: PacingConfig
  videoPath: string

  // Thumbnail
  thumbnailConcepts: ThumbnailConcept[]
  thumbnailPath: string

  // Upload
  metadata: VideoMetadata
  videoId: string

  // Performance
  metrics: VideoMetrics
  performanceScore: number

  // Learning
  learningState: LearningState
}
```

---

## 7. Pipeline

Fluxo completo com feedback loop:

```
Strategy → Idea → Script (template) → Scene Segmentation
    ↓
Voice + Visuals (paralelo)
    ↓
Pacing Engine → Render Engine → Thumbnail Engine
    ↓
Upload → Performance Engine → Learning Loop → volta para Strategy
```

### 7.1 Strategy Decision
- **Entrada:** dados de performance anteriores + learning state
- **Saida:** diretiva de conteudo (topico, angulo, template, metricas-alvo)
- **Funcoes:** `generateContentPlan()`, `prioritizeIdeas()`, `clusterTopics()`

### 7.2 Geracao de Ideia
- **Entrada:** diretiva da Strategy + nicho
- **Saida:** ideia de video
- **Funcoes:** `generateIdea(niche)`

### 7.3 Geracao de Roteiro
- **Entrada:** ideia + template + learning weights
- **Saida:** roteiro estruturado (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
- **Funcoes:** `generateScriptFromTemplate()`, `generateHookVariants()`, `selectBestHook()`, `optimizeScriptForRetention()`

### 7.4 Segmentacao em Cenas
- **Entrada:** roteiro
- **Saida:** lista de Scene com duracao e visual query
- **Funcoes:** `splitIntoScenes()`, `estimateDurations()`, `generateVisualQueries()`

### 7.5 Geracao de Voz
- **Entrada:** cenas
- **Saida:** segmentos de audio por cena
- **Funcoes:** `generateVoice()`, `applyVoiceStyle()`, `mergeAudioSegments()`
- **Execucao:** paralela com 7.6

### 7.6 Selecao de Visuais
- **Entrada:** visual queries das cenas
- **Saida:** clips/imagens por cena
- **Funcoes:** `searchClips()`, `rankClips()`, `downloadMedia()`
- **Execucao:** paralela com 7.5

### 7.7 Pacing
- **Entrada:** cenas com audio e visuais
- **Saida:** cenas com pacing aplicado
- **Funcoes:** `enforceMaxSceneDuration()`, `addPatternInterrupts()`, `applyZoomEffects()`, `addMicroTransitions()`

### 7.8 Renderizacao
- **Entrada:** cenas com pacing
- **Saida:** video final (.mp4)
- **Funcoes:** `composeScene()`, `syncAudioVideo()`, `stitchScenes()`, `addSubtitles()`, `addBackgroundMusic()`

### 7.9 Thumbnail
- **Entrada:** ideia + conceitos
- **Saida:** thumbnail 1280x720
- **Funcoes:** `generateThumbnailConcepts()`, `generateMultipleImages()`, `composeThumbnail()`, `scoreThumbnailCTR()`, `selectBestThumbnail()`

### 7.10 Upload
- **Entrada:** video + thumbnail + metadata
- **Saida:** video publicado no YouTube (videoId)
- **Funcoes:** `generateTitle()`, `generateDescription()`, `uploadToYoutube()`

### 7.11 Coleta de Performance
- **Entrada:** videoId
- **Saida:** metricas reais (retencao, CTR, watch time, drop-off points)
- **Funcoes:** `collectMetrics()`, `getRetentionCurve()`, `detectDropOffPoints()`, `scoreVideoPerformance()`
- **Nota:** execucao assincrona (delay de 48-72h do YouTube Analytics)

### 7.12 Learning Loop
- **Entrada:** metricas de performance
- **Saida:** ajustes em prompts, templates, estrategia
- **Funcoes:** `analyzeFailures()`, `updatePromptWeights()`, `adjustHookStrategy()`, `optimizeTemplates()`
- **Resultado:** proxima execucao do pipeline usa parametros otimizados

---

## 8. Integracoes

| Servico | Protocolo | Funcao | Observacoes |
|---------|-----------|--------|-------------|
| OpenRouter | REST API | Gateway LLM para roteiro, ideias, estrategia | Acesso a multiplos modelos sem lock-in |
| ElevenLabs | REST API | Text-to-Speech (narracao) | Qualidade da voz impacta retencao diretamente |
| Pexels API | REST API | Busca de videos/imagens stock | Conteudo livre de copyright |
| FFmpeg | CLI local | Motor de renderizacao scene-based | Cortes, merge, legendas, zoom, pacing |
| YouTube Data API | REST API | Upload e publicacao | Autenticacao OAuth2 |
| YouTube Analytics API | REST API | Coleta de metricas reais (retencao, CTR, watch time) | Delay de 48-72h. Core do Performance Engine |
| DALL-E / SDXL | REST API (via OpenRouter) | Geracao de imagens para thumbnails | Assets para composicao via Canvas |

---

## 9. Requisitos Funcionais

### Content Engine

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF01 | Gerar ideias automaticamente baseadas em nicho e diretivas da Strategy | Must |
| RF02 | Gerar roteiro via template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP) | Must |
| RF03 | Gerar multiplas variantes de hook e selecionar a melhor | Must |
| RF04 | Otimizar roteiro para retencao com base em learning weights | Must |

### Rendering Engine

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF05 | Segmentar roteiro em cenas com duracao e timestamps | Must |
| RF06 | Gerar voz por cena via TTS | Must |
| RF07 | Buscar e ranquear visuais por cena | Must |
| RF08 | Aplicar pacing (max 2.5s/cena, pattern interrupts, zoom, transicoes) | Must |
| RF09 | Renderizar video scene-based (composicao + sincronizacao + legendas + musica) | Must |
| RF10 | Gerar multiplos conceitos de thumbnail, pontuar CTR e selecionar melhor | Must |

### Performance Engine

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF11 | Coletar metricas reais via YouTube Analytics API | Must |
| RF12 | Gerar curva de retencao e detectar pontos de abandono | Must |
| RF13 | Calcular score composto de performance por video | Must |

### Strategy Engine

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF14 | Gerar plano de conteudo baseado em dados de performance | Must |
| RF15 | Clusterizar topicos e priorizar ideias por potencial | Must |
| RF16 | Criar series tematicas | Must |

### Learning Engine

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF17 | Analisar videos com baixa performance e identificar causas | Must |
| RF18 | Ajustar pesos dos prompts de geracao automaticamente | Must |
| RF19 | Otimizar templates de roteiro com base em dados reais | Must |

### Infraestrutura

| ID | Requisito | Prioridade |
|----|-----------|------------|
| RF20 | Upload automatico para YouTube com titulo, descricao e tags | Must |
| RF21 | Retry automatico por step em caso de falha | Must |
| RF22 | Persistencia de estado (retomar execucao, salvar learning state) | Must |
| RF23 | Logs estruturados por step | Must |
| RF24 | Paralelismo entre voice e visuals | Must |
| RF25 | Batch processing (10+ videos/dia) | Must |

---

## 10. Requisitos Nao Funcionais

| Categoria | Requisito |
|-----------|-----------|
| Performance | Tempo maximo por video: < 10 min |
| Throughput | Suportar 10+ videos/dia em producao |
| Resiliencia | Retry automatico por step (3 tentativas), persistencia de estado |
| Observabilidade | Logs por step com tempo de execucao e status |
| Qualidade | Roteiro segue template, cenas max 2.5s, pacing aplicado, voz natural |
| Seguranca | API keys em variaveis de ambiente, conteudo livre de copyright |
| Learning | Loop de aprendizado executa apos cada coleta de metricas (assincrono, 48-72h) |

---

## 11. Riscos Tecnicos

| Risco | Severidade | Mitigacao |
|-------|------------|-----------|
| Sincronizacao audio vs video | Alta | Render scene-based — cada cena sincronizada individualmente |
| Qualidade do roteiro | Alta | Template system + learning loop ajustando prompts continuamente |
| Delay do YouTube Analytics (48-72h) | Alta | Learning loop assincrono; sistema produz normalmente enquanto aguarda dados |
| Cold start do Strategy Engine | Media | Configuracoes padrao por nicho ate ter dados reais suficientes |
| Convergencia do Learning Engine | Media | Limitar taxa de ajuste de pesos; monitorar degradacao de metricas |
| Pacing excessivo | Media | Configuracao ajustavel; monitorar retencao para calibrar |
| Conteudo visual repetitivo | Media | Randomizacao de clips, variacao de queries, ranking por relevancia |
| TTS com voz robotica | Media | ElevenLabs (melhor qualidade); perfis de voz configuraveis |
| Rate limits das APIs | Media | Retry com backoff, cache de resultados |
| Copyright de conteudo | Media | Apenas stock livre (Pexels) ou geracao via IA |
| Shadowban YouTube | Media | Variacao de conteudo + qualidade alta via learning loop |

---

## 12. Metricas de Sucesso

| Metrica | Meta | Como Medir |
|---------|------|------------|
| Retencao media | > 45% | YouTube Analytics (via Performance Engine) |
| CTR (click-through rate) | > 6% | YouTube Analytics (via Performance Engine) |
| Tempo de producao por video | < 10 min | Logs do pipeline |
| Videos produzidos por dia | 10+ | Contagem de execucoes |
| Video gerado sem intervencao | 100% | Pipeline executa do inicio ao fim |
| Taxa de falha do pipeline | < 5% | Logs de erro |
| Aprendizado automatico | Ativo | Learning loop executando e ajustando parametros |
| Melhoria mes a mes | Positiva | Comparacao de performance score medio mensal |

---

## 13. Decisoes Tecnicas

- **Sem framework backend** — Node puro, arquitetura funcional
- **TypeScript** — tipagem forte para contexto do pipeline e engines
- **Funcoes puras** — cada step recebe e retorna contexto, sem side effects ocultos
- **Arquitetura em 4 Engines** — Content, Rendering, Performance, Strategy + Learning transversal
- **Render scene-based** — cada cena renderizada individualmente (resolve sincronizacao)
- **FFmpeg como motor de render** — flexivel, poderoso, open source
- **OpenRouter como gateway LLM** — acesso a multiplos modelos via API unica, sem lock-in
- **YouTube Analytics API** — dados reais para fechar o feedback loop
- **Paralelismo** — voice e visuals rodam em paralelo
- **Learning assincrono** — nao bloqueia producao; opera com delay de 48-72h
- **Sem MastraJS** — pipeline funcional resolve; sem dependencia desnecessaria
- **Sem UI** — ferramenta interna, operada via CLI/scripts

---

## 14. Escopo de Entrega

Entrega unica — tudo de uma vez:

- Content Engine completo (ideias, roteiros, hooks, templates, otimizacao)
- Scene Engine (segmentacao, duracao, visual queries)
- Voice Engine (TTS por cena, perfis de voz)
- Visual Engine (busca, ranking, download)
- Pacing Engine (max 2.5s, pattern interrupts, zoom, transicoes)
- Rendering Engine scene-based (composicao, sincronizacao, legendas, musica)
- Thumbnail Engine (multiplos conceitos, scoring CTR, selecao automatica)
- Upload automatico (YouTube Data API)
- Performance Engine (YouTube Analytics, curva de retencao, drop-off, scoring)
- Strategy Engine (plano de conteudo, clustering, series, priorizacao)
- Learning Engine (analise de falhas, ajuste de pesos, otimizacao de templates)
- Template System (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
- Infraestrutura (retry, persistencia, logs, paralelismo, batch)

---

## 15. Criterios de Aceite

- [ ] Sistema gera video completo sem intervencao manual
- [ ] Video e publicado automaticamente no YouTube
- [ ] Pipeline executa sem falhas criticas (retry funciona)
- [ ] Tempo de execucao < 10 minutos por video
- [ ] Roteiro segue template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
- [ ] Cenas tem max 2.5s com pacing aplicado
- [ ] Audio e video estao sincronizados (render scene-based)
- [ ] Legendas sao geradas automaticamente
- [ ] Thumbnail Engine gera multiplos conceitos e seleciona melhor
- [ ] Performance Engine coleta retencao e CTR via YouTube Analytics
- [ ] Strategy Engine produz diretiva de conteudo baseada em dados
- [ ] Learning Engine ajusta pesos de prompts apos analise de performance
- [ ] Sistema produz 10+ videos/dia
- [ ] Retencao media > 45% apos periodo de aprendizado
- [ ] CTR medio > 6% apos periodo de aprendizado
