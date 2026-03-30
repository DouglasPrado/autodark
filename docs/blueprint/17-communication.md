Vou ler todos os documentos necessários antes de preencher o template.

<tool_call>
{"name": "read_file", "parameters": {"path": "docs/prd.md"}}
</tool_call>
<tool_response>
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
</tool_response>

<tool_call>
{"name": "read_file", "parameters": {"path": "docs/blueprint/17-communication.md"}}
</tool_call>
<tool_response>
# Comunicação

> Mensagens são extensões do produto. Projete-as como features, não como afterthought.

Define todos os templates de mensagens enviadas ao usuário fora da interface — emails transacionais e de marketing, SMS (quando necessário) e WhatsApp (quando necessário). Documenta estratégia de canais, triggers, templates, variáveis e regras de envio.

---

## Estratégia de Comunicação

> Quais canais de comunicação o sistema utiliza? Qual a prioridade entre eles? Como funciona opt-in/opt-out?

| Aspecto | Definição |
| --- | --- |
| Canal primário | {{Email / WhatsApp / SMS}} |
| Canais secundários | {{Nenhum / SMS / WhatsApp}} |
| Prioridade de canais | {{Email > WhatsApp > SMS}} |
| Opt-in obrigatório | {{Sim — checkbox no cadastro / Sim — double opt-in por email / Não}} |
| Opt-out | {{Link de unsubscribe em todo email / Responder SAIR no SMS/WhatsApp}} |
| Frequência máxima | {{Máximo {{N}} emails/semana, {{N}} SMS/mês}} |
| Horário de envio | {{Seg-Sex, 9h-18h no fuso do usuário / Sem restrição}} |
| Provedor de email | {{SendGrid / AWS SES / Resend / Postmark / outro}} |
| Provedor de SMS | {{Twilio / AWS SNS / Vonage / não aplicável}} |
| Provedor de WhatsApp | {{Twilio / Meta Business API / não aplicável}} |

<!-- APPEND:estrategia-comunicacao -->

---

## Templates de Email

> Quais emails transacionais e de marketing o sistema envia? Para cada template, defina assunto, preheader, corpo, CTA e versão texto.

### Emails Transacionais

> Emails disparados automaticamente por ações do usuário ou do sistema.

#### {{Email: Boas-vindas}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário completa cadastro}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Bem-vindo ao {{NomeProduto}}!}} |
| Preheader | {{Sua conta foi criada com sucesso}} |
| Corpo | {{Olá {{nome}}, sua conta foi criada. Clique no botão abaixo para começar.}} |
| CTA | {{Acessar minha conta}} |
| CTA URL | {{{{baseUrl}}/dashboard}} |
| Fallback texto | {{Olá {{nome}}, acesse sua conta em: {{baseUrl}}/dashboard}} |

<!-- APPEND:email-transacional-boas-vindas -->

#### {{Email: Confirmação de email}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário se cadastra / altera email}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Confirme seu email}} |
| Preheader | {{Clique no link para verificar seu endereço}} |
| Corpo | {{Olá {{nome}}, confirme seu email clicando no botão abaixo. O link expira em {{expiracao}}.}} |
| CTA | {{Confirmar email}} |
| CTA URL | {{{{baseUrl}}/verify?token={{token}}}} |
| Fallback texto | {{Confirme seu email acessando: {{baseUrl}}/verify?token={{token}}}} |

<!-- APPEND:email-transacional-confirmacao -->

#### {{Email: Recuperação de senha}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Usuário solicita reset de senha}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Redefinir sua senha}} |
| Preheader | {{Você solicitou uma nova senha}} |
| Corpo | {{Olá {{nome}}, recebemos uma solicitação para redefinir sua senha. Clique no botão abaixo. O link expira em {{expiracao}}. Se você não fez essa solicitação, ignore este email.}} |
| CTA | {{Redefinir senha}} |
| CTA URL | {{{{baseUrl}}/reset-password?token={{token}}}} |
| Fallback texto | {{Redefina sua senha em: {{baseUrl}}/reset-password?token={{token}}}} |

<!-- APPEND:email-transacional-senha -->

#### {{Email: Outro Transacional}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Evento que dispara o envio}} |
| De | {{{{NomeProduto}} <noreply@{{dominio}}>}} |
| Assunto | {{Assunto do email}} |
| Preheader | {{Texto de preheader}} |
| Corpo | {{Corpo do email}} |
| CTA | {{Texto do botão}} |
| CTA URL | {{URL de destino}} |
| Fallback texto | {{Versão texto puro}} |

<!-- APPEND:email-transacional -->

### Emails de Marketing / Lifecycle

> Emails enviados em campanhas, nurturing ou lifecycle (onboarding, reengajamento, etc.).

#### {{Email: Onboarding — Dia 1}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{1 dia após cadastro}} |
| Segmento | {{Usuários que não completaram setup}} |
| De | {{{{NomePessoa}} do {{NomeProduto}} <{{email}}>}} |
| Assunto | {{Dica rápida para começar}} |
| Preheader | {{Complete seu perfil em 2 minutos}} |
| Corpo | {{Olá {{nome}}, vi que você criou sua conta ontem. Aqui vai uma dica rápida para tirar o máximo do {{NomeProduto}}...}} |
| CTA | {{Completar meu perfil}} |
| CTA URL | {{{{baseUrl}}/onboarding}} |

<!-- APPEND:email-marketing -->

---

## Templates de SMS

> O sistema envia SMS? Se sim, quais mensagens? Lembre-se: máximo 160 caracteres por segmento.

| Status | {{Ativo / Não aplicável}} |
| --- | --- |

> Se "Não aplicável", pule esta seção.

#### {{SMS: Verificação}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{2FA / verificação de telefone}} |
| Mensagem | {{Seu código de verificação do {{NomeProduto}} é: {{codigo}}. Não compartilhe.}} |
| Caracteres | {{~70}} |
| Expiração | {{10 minutos}} |

<!-- APPEND:sms-verificacao -->

#### {{SMS: Outro}}

| Campo | Conteúdo |
| --- | --- |
| Trigger | {{Evento que dispara}} |
| Mensagem | {{Texto da mensagem (max 160 chars)}} |
| Caracteres | {{~N}} |

<!-- APPEND:sms -->

---

## Templates de WhatsApp

> O sistema envia mensagens via WhatsApp? Se sim, quais templates aprovados?

| Status | {{Ativo / Não aplicável}} |
| --- | --- |

> Se "Não aplicável", pule esta seção. Templates de WhatsApp precisam ser aprovados pela Meta antes do uso.

#### {{WhatsApp: Confirmação de pedido}}

| Campo | Conteúdo |
| --- | --- |
| Categoria | {{Transactional / Marketing / Authentication}} |
| Trigger | {{Evento que dispara}} |
| Template name (Meta) | {{order_confirmation_v1}} |
| Idioma | {{pt_BR}} |
| Header | {{Pedido confirmado!}} |
| Corpo | {{Olá {{nome}}, seu pedido #{{pedido}} foi confirmado. Previsão de entrega: {{data}}.}} |
| Footer | {{{{NomeProduto}}}} |
| Botões | {{Ver pedido (URL: {{baseUrl}}/orders/{{pedido}})}} |

<!-- APPEND:whatsapp-template -->

#### {{WhatsApp: Outro}}

| Campo | Conteúdo |
| --- | --- |
| Categoria | {{Transactional / Marketing / Authentication}} |
| Trigger | {{Evento}} |
| Template name (Meta) | {{template_name}} |
| Idioma | {{pt_BR}} |
| Header | {{Texto ou imagem}} |
| Corpo | {{Corpo da mensagem com {{variaveis}}}} |
| Footer | {{Texto do footer}} |
| Botões | {{Texto (URL / Quick Reply)}} |

<!-- APPEND:whatsapp -->

---

## Variáveis e Personalização

> Quais variáveis dinâmicas estão disponíveis nos templates de comunicação?

| Variável | Descrição | Exemplo | Disponível em |
| --- | --- | --- | --- |
| {{nome}} | {{Nome do usuário}} | {{Maria}} | {{Email, SMS, WhatsApp}} |
| {{email}} | {{Email do usuário}} | {{maria@email.com}} | {{Email}} |
| {{NomeProduto}} | {{Nome do produto}} | {{MeuApp}} | {{Email, SMS, WhatsApp}} |
| {{baseUrl}} | {{URL base do produto}} | {{https://app.meuapp.com}} | {{Email, WhatsApp}} |
| {{token}} | {{Token de verificação/reset}} | {{abc123...}} | {{Email}} |
| {{codigo}} | {{Código OTP}} | {{482910}} | {{SMS}} |

<!-- APPEND:variaveis -->

---

## Regras de Envio

> Quais eventos disparam cada comunicação? Existem condições, cooldowns ou prioridades?

### Mapa de Triggers

| Evento | Canal | Template | Condição | Cooldown |
| --- | --- | --- | --- | --- |
| {{Usuário se cadastra}} | {{Email}} | {{Boas-vindas}} | {{Nenhuma}} | {{Único}} |
| {{Usuário solicita reset}} | {{Email}} | {{Recuperação de senha}} | {{Nenhuma}} | {{1 por hora}} |
| {{2FA ativado}} | {{SMS}} | {{Verificação}} | {{Telefone verificado}} | {{30 segundos}} |

<!-- APPEND:triggers -->

### Prioridade entre Canais

> Quando uma mensagem pode ser enviada por mais de um canal, qual a ordem de preferência?

| Prioridade | Canal | Condição de fallback |
| --- | --- | --- |
| 1 | {{Email}} | {{Sempre disponível}} |
| 2 | {{WhatsApp}} | {{Se usuário tem WhatsApp opt-in}} |
| 3 | {{SMS}} | {{Se WhatsApp indisponível e telefone verificado}} |

<!-- APPEND:prioridade-canais -->

### Rate Limits e Throttling

| Canal | Rate limit | Janela |
| --- | --- | --- |
| {{Email transacional}} | {{Sem limite}} | {{—}} |
| {{Email marketing}} | {{{{N}} por semana}} | {{7 dias}} |
| {{SMS}} | {{{{N}} por dia}} | {{24 horas}} |
| {{WhatsApp}} | {{{{N}} por dia}} | {{24 horas}} |

<!-- APPEND:rate-limits -->

---

## Convenções de Escrita por Canal

> Quais regras de tom de voz e formatação se aplicam a cada canal?

### Email

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Use o nome do usuário no greeting | Olá Maria, | Prezado usuário, |
| Assunto com máximo {{60}} caracteres | Sua conta foi criada | Notificação importante sobre a criação da sua nova conta no sistema |
| Um CTA principal por email | [Acessar conta] | [Acessar conta] [Ver planos] [Ler blog] |
| Preheader complementa o assunto | Comece a usar agora | Sua conta foi criada |
| Inclua fallback texto para todo email | Acesse: https://... | (sem versão texto) |

<!-- APPEND:convencoes-email -->

### SMS

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Máximo 160 caracteres | Seu código: 482910. Não compartilhe. | Olá! Informamos que o seu código de verificação para acessar sua conta é: 482910. Por favor não compartilhe. |
| Identifique o remetente | {{NomeProduto}}: Seu código... | Seu código é 482910 |
| Inclua instrução de opt-out quando exigido | Resp SAIR para cancelar | (sem opt-out) |

<!-- APPEND:convencoes-sms -->

### WhatsApp

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Siga o template aprovado pela Meta | (template registrado) | (mensagem livre fora da janela de 24h) |
| Use botões para ações | [Ver pedido] (botão) | Acesse: https://... (link no texto) |
| Emojis com moderação | Pedido confirmado ✅ | 🎉🎊🥳 SEU PEDIDO FOI APROVADO!!! 🎉🎊🥳 |

<!-- APPEND:convencoes-whatsapp -->

---

## Histórico de Decisões

| Data | Decisão | Motivo |
| --- | --- | --- |
| {{YYYY-MM-DD}} | {{Decisão tomada}} | {{Por que foi decidido}} |

<!-- APPEND:decisoes-comunicacao -->
</tool_response>

Agora tenho clareza total sobre o contexto. Vou analisar antes de escrever:

**Análise do sistema Mestra AI:**
- Ferramenta **interna**, operador único, **sem UI**, operada via CLI
- Não há usuários finais, cadastro, login, reset de senha, 2FA, ou qualquer fluxo de autenticação de usuário
- Comunicação relevante é **operacional**: notificações de pipeline, alertas de falha, relatórios de performance, alertas do learning loop
- O PRD não menciona email, SMS ou WhatsApp para usuários — porque não há usuários
- A comunicação é **sistema → operador**: logs estruturados, notificações de status, alertas de erro

**Conclusão:** Os templates padrão (boas-vindas, confirmação de email, reset de senha) **não se aplicam**. A seção deve ser adaptada para refletir a realidade: notificações operacionais via canal a definir (email de alerta, stdout/logs, ou webhook).

Vou preencher o documento refletindo fielmente o que o sistema é — uma ferramenta CLI interna com comunicação operacional.

<tool_call>
{"name": "write_file", "parameters": {"path": "docs/blueprint/17-communication.md", "content": "# Comunicação\n\n> Mensagens são extensões do produto. Projete-as como features, não como afterthought.\n\nDefine todos os canais de notificação operacional do Mestra AI — alertas de pipeline, relatórios de performance e notificações do learning loop enviados ao operador. O sistema não possui usuários finais, cadastro ou autenticação de usuário; toda comunicação é **sistema → operador** (ferramenta interna, CLI).\n\n> **Nota de escopo:** Emails transacionais de usuário (boas-vindas, confirmação de email, reset de senha) **não se aplicam** — o Mestra AI é uma ferramenta de uso interno com operador único, sem UI ou fluxo de autenticação de usuário. A comunicação documentada aqui cobre exclusivamente notificações operacionais.\n\n---\n\n## Estratégia de Comunicação\n\n> Quais canais de comunicação o sistema utiliza? Qual a prioridade entre eles? Como funciona opt-in/opt-out?\n\n| Aspecto | Definição |\n| --- | --- |\n| Canal primário | Logs estruturados (stdout + arquivo local) |\n| Canais secundários | Email de alerta operacional (opcional) |\n| Prioridade de canais | Logs > Email de alerta |\n| Opt-in obrigatório | Não aplicável — operador único, ferramenta interna |\n| Opt-out | Não aplicável |\n| Frequência máxima | Sem restrição — notificações são disparadas por eventos do sistema |\n| Horário de envio | Sem restrição — pipeline pode rodar 24/7 |\n| Provedor de email | Não definido — configurável via variável de ambiente `ALERT_EMAIL_PROVIDER` (ex: SendGrid, AWS SES) <!-- inferido do PRD --> |\n| Provedor de SMS | Não aplicável |\n| Provedor de WhatsApp | Não aplicável |\n\n<!-- APPEND:estrategia-comunicacao -->\n\n---\n\n## Templates de Email\n\n> Emails operacionais enviados ao operador. Não há emails de usuário final (sem cadastro, sem autenticação de usuário).\n\n### Emails Transacionais de Usuário\n\n| Status | Não aplicável |\n| --- | --- |\n| Motivo | Mestra AI é ferramenta interna CLI. Não há cadastro, login, reset de senha ou fluxo de autenticação de usuário final. |\n\n---\n\n### Emails Operacionais (Sistema → Operador)\n\n> Notificações automáticas enviadas ao operador sobre eventos críticos do pipeline. Todos opcionais — o operador pode optar por receber apenas via logs.\n\n#### Email: Pipeline Concluído com Sucesso\n\n| Campo | Conteúdo |\n| --- | --- |\n| Trigger | Pipeline de geração de vídeo completa com sucesso (status: `completed`) |\n| De | `Mestra AI <noreply@{alertDomain}>` |\n| Assunto | `✅ Vídeo publicado: {videoTitle} [{niche}]` |\n| Preheader | `Pipeline {pipelineId} concluído em {durationMinutes} min` |\n| Corpo | `Pipeline concluído com sucesso.\\n\\nNicho: {niche}\\nVídeo: {videoTitle}\\nYouTube ID: {videoId}\\nDuração do pipeline: {durationMinutes} min\\nThumbnail CTR score: {thumbnailCtrScore}/100\\n\\nAcesse o vídeo: https://youtube.com/watch?v={videoId}\\n\\nPróxima execução agendada: {nextScheduledAt}` |\n| CTA | `Ver no YouTube` |\n| CTA URL | `https://youtube.com/watch?v={videoId}` |\n| Fallback texto | `Pipeline concluído. Vídeo: {videoTitle} — https://youtube.com/watch?v={videoId} — Pipeline: {pipelineId} — Duração: {durationMinutes} min` |\n\n<!-- APPEND:email-transacional-boas-vindas -->\n\n#### Email: Pipeline com Falha Crítica\n\n| Campo | Conteúdo |\n| --- | --- |\n| Trigger | Pipeline marca status `failed` após esgotar retries em qualquer step |\n| De | `Mestra AI <noreply@{alertDomain}>` |\n| Assunto | `🚨 Falha no pipeline [{niche}] — Step: {failedStep}` |\n| Preheader | `Pipeline {pipelineId} falhou após {retryCount} tentativas` |\n| Corpo | `O pipeline de geração de vídeo falhou e requer atenção.\\n\\nPipeline ID: {pipelineId}\\nNicho: {niche}\\nStep com falha: {failedStep}\\nErro: {errorMessage}\\nTentativas: {retryCount}/3\\nHorário: {failedAt}\\n\\nPara reexecutar a partir do ponto de falha:\\n  mestra generate --niche {niche} --resume {pipelineId}\\n\\nConsulte os logs completos em: logs/pipeline-{pipelineId}.log` |\n| CTA | Não aplicável (ferramenta CLI — ação via terminal) |\n| CTA URL | Não aplicável |\n| Fallback texto | `FALHA no pipeline {pipelineId} [{niche}]. Step: {failedStep}. Erro: {errorMessage}. Reexecute: mestra generate --niche {niche} --resume {pipelineId}` |\n\n<!-- APPEND:email-transacional-confirmacao -->\n\n#### Email: Relatório Diário de Performance\n\n| Campo | Conteúdo |\n| --- | --- |\n| Trigger | Scheduler diário (configurável via `REPORT_CRON`, padrão: `0 8 * * *`) |\n| De | `Mestra AI <noreply@{alertDomain}>` |\n| Assunto | `📊 Relatório diário Mestra AI — {date} [{niche}]` |\n| Preheader | `{videosProduced} vídeos produzidos · Retenção média: {avgRetention}%` |\n| Corpo | `Relatório de performance — {date}\\n\\n📹 PRODUÇÃO\\nVídeos produzidos: {videosProduced}\\nTaxa de sucesso do pipeline: {pipelineSuccessRate}%\\nTempo médio por vídeo: {avgPipelineDuration} min\\n\\n📈 PERFORMANCE (últimos 7 dias)\\nRetenção média: {avgRetention}%  (meta: >45%)\\nCTR médio: {avgCtr}%  (meta: >6%)\\nWatch time médio: {avgWatchTime}s\\n\\n🧠 LEARNING ENGINE\\nStatus: {learningStatus}\\nVídeos analisados: {analyzedVideos}\\nÚltimo ajuste de pesos: {lastWeightsUpdate}\\n\\n🏆 TOP VÍDEO DA SEMANA\\nTítulo: {topVideoTitle}\\nRetenção: {topVideoRetention}%\\nCTR: {topVideoCtr}%\\nURL: https://youtube.com/watch?v={topVideoId}\\n\\n⚠️ ALERTAS\\n{alertsList}` |\n| CTA | Não aplicável |\n| CTA URL | Não aplicável |\n| Fallback texto | `Relatório {date}: {videosProduced} vídeos produzidos. Retenção: {avgRetention}%. CTR: {avgCtr}%. Learning: {learningStatus}. Top vídeo: https://youtube.com/watch?v={topVideoId}` |\n\n<!-- APPEND:email-transacional-senha -->\n\n#### Email: Learning Loop Ativado (Cold Start Superado)\n\n| Campo | Conteúdo |\n| --- | --- |\n| Trigger | Learning Engine ativa pela primeira vez (mínimo 5 vídeos analisados) |\n| De | `Mestra AI <noreply@{alertDomain}>` |\n| Assunto | `🧠 Learning Engine ativado — {niche}` |\n| Preheader | `{analyzedVideos} vídeos analisados. O sistema agora aprende automaticamente.` |\n| Corpo | `O Learning Engine foi ativado para o nicho [{niche}].\\n\\nO sistema analisou {analyzedVideos} vídeos e agora ajusta automaticamente:\\n- Estratégia de hooks\\n- Pesos dos templates de roteiro\\n- Configurações de pacing\\n- Priorização de tópicos\\n\\nPrimeiros ajustes aplicados:\\n{weightAdjustmentsSummary}\\n\\nOs próximos vídeos serão gerados com parâmetros otimizados.` |\n| CTA | Não aplicável |\n| CTA URL | Não aplicável |\n| Fallback texto | `Learning Engine ativado para [{niche}] após análise de {analyzedVideos} vídeos. Ajustes aplicados: {weightAdjustmentsSummary}` |\n\n<!-- APPEND:email-transacional -->\n\n#### Email: Alerta de Métricas Abaixo da Meta\n\n| Campo | Conteúdo |\n| --- | --- |\n| Trigger | Performance Engine detecta retenção média < 35% ou CTR < 3% nos últimos 5 vídeos |\n| De | `Mestra AI <noreply@{alertDomain}>` |\n| Assunto | `⚠️ Alerta de performance [{niche}] — {metricName} abaixo da meta` |\n| Preheader | `{metricName}: {metricValue}% (meta: {metricTarget}%)` |\n| Corpo | `Alerta de performance detectado para o nicho [{niche}].\\n\\nMétrica: {metricName}\\nValor atual (média 5 vídeos): {metricValue}%\\nMeta: {metricTarget}%\\nDesvio: {metricDeviation}%\\n\\nVídeos afetados:\\n{affectedVideosList}\\n\\nO Learning Engine está analisando os padrões de falha e ajustará os parâmetros automaticamente na próxima execução.\\n\\nSe o problema persistir após 10 vídeos, considere revisar manualmente a configuração do nicho:\\n  mestra config --niche {niche}` |\n| CTA | Não aplicável |\n| CTA URL | Não aplicável |\n| Fallback texto | `ALERTA [{niche}]: {metricName} em {metricValue}% (meta: {metricTarget}%). Learning Engine ajustando parâmetros automaticamente.` |\n\n<!-- APPEND:email-marketing -->\n\n---\n\n## Templates de SMS\n\n| Status | Não aplicável |\n| --- | --- |\n| Motivo | Mestra AI é ferramenta interna CLI com operador único. Notificações operacionais são entregues via logs estruturados e email de alerta. SMS não foi especificado no PRD. |\n\n<!-- APPEND:sms-verificacao -->\n<!-- APPEND:sms -->\n\n---\n\n## Templates de WhatsApp\n\n| Status | Não aplicável |\n| --- | --- |\n| Motivo | Mestra AI é ferramenta interna CLI com operador único. Notificações operacionais são entregues via logs estruturados e email de alerta. WhatsApp não foi especificado no PRD. |\n\n<!-- APPEND:whatsapp-template -->\n<!-- APPEND:whatsapp -->\n\n---\n\n## Variáveis e Personalização\n\n> Variáveis dinâmicas disponíveis nos templates de notificação operacional.\n\n| Variável | Descrição | Exemplo | Disponível em |\n| --- | --- | --- | --- |\n| `{pipelineId}` | UUID único da execução do pipeline | `a3f2c1d4-...` | Email operacional, Logs |\n| `{niche}` | Nicho do canal configurado | `dark` | Email operacional, Logs |\n| `{videoId}` | ID do vídeo publicado no YouTube | `dQw4w9WgXcQ` | Email operacional, Logs |\n| `{videoTitle}` | Título gerado para o vídeo | `10 Mistérios Não Resolvidos` | Email operacional |\n| `{durationMinutes}` | Duração total do pipeline em minutos | `7` | Email operacional, Logs |\n| `{failedStep}` | Nome do step que falhou | `voice-generation` | Email operacional, Logs |\n| `{errorMessage}` | Mensagem de erro do step | `ElevenLabs timeout after 3 retries` | Email operacional, Logs |\n| `{retryCount}` | Número de tentativas realizadas | `3` | Email operacional, Logs |\n| `{failedAt}` | Timestamp da falha | `2025-01-15T14:32:00Z` | Email operacional, Logs |\n| `{avgRetention}` | Retenção média dos últimos vídeos (%) | `48.3` | Email operacional |\n| `{avgCtr}` | CTR médio dos últimos vídeos (%) | `6.7` | Email operacional |\n| `{avgWatchTime}` | Watch time médio em segundos | `312` | Email operacional |\n| `{videosProduced}` | Quantidade de vídeos produzidos no período | `10` | Email operacional |\n| `{pipelineSuccessRate}` | Taxa de sucesso do pipeline (%) | `95` | Email operacional |\n| `{avgPipelineDuration}` | Tempo médio de execução do pipeline (min) | `8.2` | Email operacional |\n| `{learningStatus}` | Status do Learning Engine | `active` / `cold_start` | Email operacional |\n| `{analyzedVideos}` | Quantidade de vídeos analisados pelo Learning Engine | `12` | Email operacional |\n| `{lastWeightsUpdate}` | Timestamp do último ajuste de pesos | `2025-01-14T06:00:00Z` | Email operacional |\n| `{weightAdjustmentsSummary}` | Resumo dos ajustes de pesos aplicados | `hookWeight +0.12, pacingWeight -0.05` | Email operacional |\n| `{topVideoTitle}` | Título do vídeo com melhor performance | `O Caso Mais Bizarro do Brasil` | Email operacional |\n| `{topVideoRetention}` | Retenção do top vídeo (%) | `61.2` | Email operacional |\n| `{topVideoCtr}` | CTR do top vídeo (%) | `8.4` | Email operacional |\n| `{topVideoId}` | YouTube ID do top vídeo | `xK9mPqRs2Lw` | Email operacional |\n| `{alertsList}` | Lista de alertas ativos | `Nenhum` / `Retenção abaixo de 35%` | Email operacional |\n| `{metricName}` | Nome da métrica em alerta | `Retenção média` | Email operacional |\n| `{metricValue}` | Valor atual da métrica | `32.1` | Email operacional |\n| `{metricTarget}` | Meta da métrica | `45` | Email operacional |\n| `{metricDeviation}` | Desvio em relação à meta | `-12.9` | Email operacional |\n| `{affectedVideosList}` | Lista de vídeos com baixa performance | `dQw4w9WgXcQ (31%), xK9mPqRs2Lw (33%)` | Email operacional |\n| `{nextScheduledAt}` | Próxima execução agendada | `2025-01-15T16:00:00Z` | Email operacional |\n| `{thumbnailCtrScore}` | Score de CTR da thumbnail selecionada (0-100) | `78` | Email operacional |\n| `{date}` | Data do relatório | `2025-01-15` | Email operacional |\n| `{alertDomain}` | Domínio configurado para envio de alertas | `mestra.internal` | Email operacional |\n\n<!-- APPEND:variaveis -->\n\n---\n\n## Regras de Envio\n\n> Quais eventos disparam cada notificação? Existem condições, cooldowns ou prioridades?\n\n### Mapa de Triggers\n\n| Evento | Canal | Template | Condição | Cooldown |\n| --- | --- | --- | --- | --- |\n| Pipeline status → `completed` | Log + Email (opcional) | Pipeline Concluído com Sucesso | `ALERT_EMAIL_ENABLED=true` | Nenhum (por execução) |\n| Pipeline status → `failed` | Log + Email (opcional) | Pipeline com Falha Crítica | `ALERT_EMAIL_ENABLED=true` | Nenhum (por execução) |\n| Scheduler diário dispara | Email (opcional) | Relatório Diário de Performance | `REPORT_EMAIL_ENABLED=true` e vídeos publicados nos últimos 7 dias | 1 por dia |\n| Learning Engine ativa pela 1ª vez | Log + Email (opcional) | Learning Loop Ativado | `analyzedVideos >= 5` e `learningState.isActive` muda para `true` | Único (por nicho) |\n| Retenção média < 35% nos últimos 5 vídeos | Log + Email (opcional) | Alerta de Métricas Abaixo da Meta | `ALERT_EMAIL_ENABLED=true` e `avgRetention < 35` | 24 horas |\n| CTR médio < 3% nos últimos 5 vídeos | Log + Email (opcional) | Alerta de Métricas Abaixo da Meta | `ALERT_EMAIL_ENABLED=true` e `avgCtr < 3` | 24 horas |\n| Step falha e entra em retry | Log | — (log estruturado) | Sempre | Nenhum |\n| Coleta de métricas concluída | Log | — (log estruturado) | Sempre | Nenhum |\n| Learning Loop executa ajuste de pesos | Log | — (log estruturado) | Sempre | Nenhum |\n\n<!-- APPEND:triggers -->\n\n### Prioridade entre Canais\n\n> O sistema usa canal único por tipo de notificação. Logs são sempre o canal primário e obrigatório.\n\n| Prioridade | Canal | Condição de uso |\n| --- | --- | --- |\n| 1 | Logs estruturados (stdout + arquivo) | Sempre — obrigatório, não configurável |\n| 2 | Email de alerta operacional | Opcional — requer `ALERT_EMAIL_ENABLED=true` e configuração de provedor |\n\n<!-- APPEND:prioridade-canais -->\n\n### Rate Limits e Throttling\n\n| Canal | Rate limit | Janela | Observação |\n| --- | --- | --- | --- |\n| Logs estruturados | Sem limite | — | Sempre habilitado |\n| Email — Pipeline concluído | Sem limite | — | 1 por execução de pipeline |\n| Email — Pipeline com falha | Sem limite | — | 1 por execução de pipeline |\n| Email — Relatório diário | 1 por dia | 24 horas | Controlado pelo scheduler |\n| Email — Learning ativado | 1 por nicho | Único | Enviado apenas na primeira ativação |\n| Email — Alerta de performance | 1 por métrica | 24 horas | Evita spam em degradação contínua |\n\n<!-- APPEND:rate-limits -->\n\n---\n\n## Convenções de Escrita por Canal\n\n> Quais regras de tom de voz e formatação se aplicam a cada canal?\n\n### Email Operacional\n\n| Regra | Exemplo correto | Exemplo incorreto |\n| --- | --- | --- |\n| Assunto com emoji de status no início | `✅ Vídeo publicado: Título [dark]` | `Notificação de conclusão de pipeline` |\n| Assunto com máximo 60 caracteres | `🚨 Falha no pipeline [dark] — Step: voice` | `Notificação importante: o pipeline de geração de vídeo falhou no step de geração de voz` |\n| Inclua Pipeline ID e Niche no corpo | `Pipeline ID: a3f2c1d4 · Nicho: dark` | (sem identificadores) |\n| Inclua comando CLI de ação quando aplicável | `mestra generate --niche dark --resume {id}` | `Entre em contato com o suporte` |\n| Tom técnico e direto — sem marketing | `O pipeline falhou após 3 tentativas.` | `Ops! Algo deu errado 😅 Não se preocupe!` |\n| Inclua fallback texto para todo email | `Pipeline {id}: https://youtube.com/...` | (sem versão texto) |\n| Seções separadas por emojis de categoria | `📹 PRODUÇÃO`, `📈 PERFORMANCE`, `🧠 LEARNING` | (bloco de texto sem estrutura) |\n\n<!-- APPEND:convencoes-email -->\n\n### SMS\n\n| Status | Não aplicável |\n| --- | --- |\n\n<!-- APPEND:convencoes-sms -->\n\n### WhatsApp\n\n| Status | Não aplicável |\n| --- | --- |\n\n<!-- APPEND:convencoes-whatsapp -->\n\n### Logs Estruturados (Canal Primário)\n\n| Regra | Exemplo correto | Exemplo incorreto |\n| --- | --- | --- |\n| Formato JSON estruturado (RFC 5424) | `{\"level\":\"info\",\"step\":\"voice-generation\",\"pipelineId\":\"...\",\"duration\":4200}` | `Voice generation done in 4.2s` |\n| Inclua `level`, `step`, `pipelineId`, `timestamp` em todo log | `{\"level\":\"error\",\"step\":\"upload\",\"pipelineId\":\"...\"}` | `{\"message\":\"upload failed\"}` |\n| Use `level: error` apenas para falhas que param o pipeline | `{\"level\":\"error\",\"step\":\"ffmpeg\",\"retryCount\":3}` | `{\"level\":\"error\",\"step\":\"pexels\",\"message\":\"no results\"}` |\n| Use `level: warn` para fallbacks e retries | `{\"level\":\"warn\",\"step\":\"visual\",\"message\":\"fallback to DALL-E\"}` | `{\"level\":\"error\",\"step\":\"visual\",\"message\":\"fallback to DALL-E\"}` |\n| Nunca logue API keys ou tokens | `{\"service\":\"elevenlabs\",\"status\":\"ok\"}` | `{\"apiKey\":\"sk-...\",\"service\":\"elevenlabs\"}` |\n| Inclua `durationMs` em steps de performance crítica | `{\"step\":\"rendering\",\"durationMs\":45200}` | `{\"step\":\"rendering\",\"message\":\"done\"}` |\n\n---\n\n## Histórico de Decisões\n\n| Data | Decisão | Motivo |\n| --- | --- | --- |\n| 2025-01-15 | Emails de usuário final (boas-vindas, reset de senha) removidos do escopo | Mestra AI é ferramenta interna CLI com operador único — não há usuários finais, cadastro ou autenticação de usuário |\n| 2025-01-15 | SMS e WhatsApp marcados como não aplicáveis | PRD não menciona esses canais; ferramenta interna não requer notificações mobile |\n| 2025-01-15 | Logs estruturados definidos como canal primário obrigatório | Alinhado com requisito RF23 (logs estruturados por step) e decisão técnica de observabilidade do PRD |\n| 2025-01-15 | Email de alerta operacional definido como canal secundário opcional | Operador pode preferir monitorar apenas via logs; email é opt-in via variável de ambiente |\n| 2025-01-15 | Cooldown de 24h para alertas de performance | Evita spam em caso de degradação contínua; operador é notificado uma vez por dia por métrica |\n\n<!-- APPEND:decisoes-comunicacao -->\n"}}
</tool_call>
<tool_response>
Successfully wrote to docs/blueprint/17-communication.md
</tool_response>

Documento escrito. Vou verificar o resultado final:

<tool_call>
{"name": "read_file", "parameters": {"path": "docs/blueprint/17-communication.md"}}
</tool_call>
<tool_response>
# Comunicação

> Mensagens são extensões do produto. Projete-as como features, não como afterthought.

Define todos os canais de notificação operacional do Mestra AI — alertas de pipeline, relatórios de performance e notificações do learning loop enviados ao operador. O sistema não possui usuários finais, cadastro ou autenticação de usuário; toda comunicação é **sistema → operador** (ferramenta interna, CLI).

> **Nota de escopo:** Emails transacionais de usuário (boas-vindas, confirmação de email, reset de senha) **não se aplicam** — o Mestra AI é uma ferramenta de uso interno com operador único, sem UI ou fluxo de autenticação de usuário. A comunicação documentada aqui cobre exclusivamente notificações operacionais.

---

## Estratégia de Comunicação

> Quais canais de comunicação o sistema utiliza? Qual a prioridade entre eles? Como funciona opt-in/opt-out?

| Aspecto | Definição |
| --- | --- |
| Canal primário | Logs estruturados (stdout + arquivo local) |
| Canais secundários | Email de alerta operacional (opcional) |
| Prioridade de canais | Logs > Email de alerta |
| Opt-in obrigatório | Não aplicável — operador único, ferramenta interna |
| Opt-out | Não aplicável |
| Frequência máxima | Sem restrição — notificações são disparadas por eventos do sistema |
| Horário de envio | Sem restrição — pipeline pode rodar 24/7 |
| Provedor de email | Não definido — configurável via variável de ambiente `ALERT_EMAIL_PROVIDER` (ex: SendGrid, AWS SES) <!-- inferido do PRD --> |
| Provedor de SMS | Não aplicável |
| Provedor de WhatsApp | Não aplicável |

<!-- APPEND:estrategia-comunicacao -->

---

## Templates de Email

> Emails operacionais enviados ao operador. Não há emails de usuário final (sem cadastro, sem autenticação de usuário).

### Emails Transacionais de Usuário

| Status | Não aplicável |
| --- | --- |
| Motivo | Mestra AI é ferramenta interna CLI. Não há cadastro, login, reset de senha ou fluxo de autenticação de usuário final. |

---

### Emails Operacionais (Sistema → Operador)

> Notificações automáticas enviadas ao operador sobre eventos críticos do pipeline. Todos opcionais — o operador pode optar por receber apenas via logs.

#### Email: Pipeline Concluído com Sucesso

| Campo | Conteúdo |
| --- | --- |
| Trigger | Pipeline de geração de vídeo completa com sucesso (status: `completed`) |
| De | `Mestra AI <noreply@{alertDomain}>` |
| Assunto | `✅ Vídeo publicado: {videoTitle} [{niche}]` |
| Preheader | `Pipeline {pipelineId} concluído em {durationMinutes} min` |
| Corpo | `Pipeline concluído com sucesso.\n\nNicho: {niche}\nVídeo: {videoTitle}\nYouTube ID: {videoId}\nDuração do pipeline: {durationMinutes} min\nThumbnail CTR score: {thumbnailCtrScore}/100\n\nAcesse o vídeo: https://youtube.com/watch?v={videoId}\n\nPróxima execução agendada: {nextScheduledAt}` |
| CTA | `Ver no YouTube` |
| CTA URL | `https://youtube.com/watch?v={videoId}` |
| Fallback texto | `Pipeline concluído. Vídeo: {videoTitle} — https://youtube.com/watch?v={videoId} — Pipeline: {pipelineId} — Duração: {durationMinutes} min` |

<!-- APPEND:email-transacional-boas-vindas -->

#### Email: Pipeline com Falha Crítica

| Campo | Conteúdo |
| --- | --- |
| Trigger | Pipeline marca status `failed` após esgotar retries em qualquer step |
| De | `Mestra AI <noreply@{alertDomain}>` |
| Assunto | `🚨 Falha no pipeline [{niche}] — Step: {failedStep}` |
| Preheader | `Pipeline {pipelineId} falhou após {retryCount} tentativas` |
| Corpo | `O pipeline de geração de vídeo falhou e requer atenção.\n\nPipeline ID: {pipelineId}\nNicho: {niche}\nStep com falha: {failedStep}\nErro: {errorMessage}\nTentativas: {retryCount}/3\nHorário: {failedAt}\n\nPara reexecutar a partir do ponto de falha:\n  mestra generate --niche {niche} --resume {pipelineId}\n\nConsulte os logs completos em: logs/pipeline-{pipelineId}.log` |
| CTA | Não aplicável (ferramenta CLI — ação via terminal) |
| CTA URL | Não aplicável |
| Fallback texto | `FALHA no pipeline {pipelineId} [{niche}]. Step: {failedStep}. Erro: {errorMessage}. Reexecute: mestra generate --niche {niche} --resume {pipelineId}` |

<!-- APPEND:email-transacional-confirmacao -->

#### Email: Relatório Diário de Performance

| Campo | Conteúdo |
| --- | --- |
| Trigger | Scheduler diário (configurável via `REPORT_CRON`, padrão: `0 8 * * *`) |
| De | `Mestra AI <noreply@{alertDomain}>` |
| Assunto | `📊 Relatório diário Mestra AI — {date} [{niche}]` |
| Preheader | `{videosProduced} vídeos produzidos · Retenção média: {avgRetention}%` |
| Corpo | `Relatório de performance — {date}\n\n📹 PRODUÇÃO\nVídeos produzidos: {videosProduced}\nTaxa de sucesso do pipeline: {pipelineSuccessRate}%\nTempo médio por vídeo: {avgPipelineDuration} min\n\n📈 PERFORMANCE (últimos 7 dias)\nRetenção média: {avgRetention}%  (meta: >45%)\nCTR médio: {avgCtr}%  (meta: >6%)\nWatch time médio: {avgWatchTime}s\n\n🧠 LEARNING ENGINE\nStatus: {learningStatus}\nVídeos analisados: {analyzedVideos}\nÚltimo ajuste de pesos: {lastWeightsUpdate}\n\n🏆 TOP VÍDEO DA SEMANA\nTítulo: {topVideoTitle}\nRetenção: {topVideoRetention}%\nCTR: {topVideoCtr}%\nURL: https://youtube.com/watch?v={topVideoId}\n\n⚠️ ALERTAS\n{alertsList}` |
| CTA | Não aplicável |
| CTA URL | Não aplicável |
| Fallback texto | `Relatório {date}: {videosProduced} vídeos produzidos. Retenção: {avgRetention}%. CTR: {avgCtr}%. Learning: {learningStatus}. Top vídeo: https://youtube.com/watch?v={topVideoId}` |

<!-- APPEND:email-transacional-senha -->

#### Email: Learning Loop Ativado (Cold Start Superado)

| Campo | Conteúdo |
| --- | --- |
| Trigger | Learning Engine ativa pela primeira vez (mínimo 5 vídeos analisados) |
| De | `Mestra AI <noreply@{alertDomain}>` |
| Assunto | `🧠 Learning Engine ativado — {niche}` |
| Preheader | `{analyzedVideos} vídeos analisados. O sistema agora aprende automaticamente.` |
| Corpo | `O Learning Engine foi ativado para o nicho [{niche}].\n\nO sistema analisou {analyzedVideos} vídeos e agora ajusta automaticamente:\n- Estratégia de hooks\n- Pesos dos templates de roteiro\n- Configurações de pacing\n- Priorização de tópicos\n\nPrimeiros ajustes aplicados:\n{weightAdjustmentsSummary}\n\nOs próximos vídeos serão gerados com parâmetros otimizados.` |
| CTA | Não aplicável |
| CTA URL | Não aplicável |
| Fallback texto | `Learning Engine ativado para [{niche}] após análise de {analyzedVideos} vídeos. Ajustes aplicados: {weightAdjustmentsSummary}` |

<!-- APPEND:email-transacional -->

#### Email: Alerta de Métricas Abaixo da Meta

| Campo | Conteúdo |
| --- | --- |
| Trigger | Performance Engine detecta retenção média < 35% ou CTR < 3% nos últimos 5 vídeos |
| De | `Mestra AI <noreply@{alertDomain}>` |
| Assunto | `⚠️ Alerta de performance [{niche}] — {metricName} abaixo da meta` |
| Preheader | `{metricName}: {metricValue}% (meta: {metricTarget}%)` |
| Corpo | `Alerta de performance detectado para o nicho [{niche}].\n\nMétrica: {metricName}\nValor atual (média 5 vídeos): {metricValue}%\nMeta: {metricTarget}%\nDesvio: {metricDeviation}%\n\nVídeos afetados:\n{affectedVideosList}\n\nO Learning Engine está analisando os padrões de falha e ajustará os parâmetros automaticamente na próxima execução.\n\nSe o problema persistir após 10 vídeos, considere revisar manualmente a configuração do nicho:\n  mestra config --niche {niche}` |
| CTA | Não aplicável |
| CTA URL | Não aplicável |
| Fallback texto | `ALERTA [{niche}]: {metricName} em {metricValue}% (meta: {metricTarget}%). Learning Engine ajustando parâmetros automaticamente.` |

<!-- APPEND:email-marketing -->

---

## Templates de SMS

| Status | Não aplicável |
| --- | --- |
| Motivo | Mestra AI é ferramenta interna CLI com operador único. Notificações operacionais são entregues via logs estruturados e email de alerta. SMS não foi especificado no PRD. |

<!-- APPEND:sms-verificacao -->
<!-- APPEND:sms -->

---

## Templates de WhatsApp

| Status | Não aplicável |
| --- | --- |
| Motivo | Mestra AI é ferramenta interna CLI com operador único. Notificações operacionais são entregues via logs estruturados e email de alerta. WhatsApp não foi especificado no PRD. |

<!-- APPEND:whatsapp-template -->
<!-- APPEND:whatsapp -->

---

## Variáveis e Personalização

> Variáveis dinâmicas disponíveis nos templates de notificação operacional.

| Variável | Descrição | Exemplo | Disponível em |
| --- | --- | --- | --- |
| `{pipelineId}` | UUID único da execução do pipeline | `a3f2c1d4-...` | Email operacional, Logs |
| `{niche}` | Nicho do canal configurado | `dark` | Email operacional, Logs |
| `{videoId}` | ID do vídeo publicado no YouTube | `dQw4w9WgXcQ` | Email operacional, Logs |
| `{videoTitle}` | Título gerado para o vídeo | `10 Mistérios Não Resolvidos` | Email operacional |
| `{durationMinutes}` | Duração total do pipeline em minutos | `7` | Email operacional, Logs |
| `{failedStep}` | Nome do step que falhou | `voice-generation` | Email operacional, Logs |
| `{errorMessage}` | Mensagem de erro do step | `ElevenLabs timeout after 3 retries` | Email operacional, Logs |
| `{retryCount}` | Número de tentativas realizadas | `3` | Email operacional, Logs |
| `{failedAt}` | Timestamp da falha | `2025-01-15T14:32:00Z` | Email operacional, Logs |
| `{avgRetention}` | Retenção média dos últimos vídeos (%) | `48.3` | Email operacional |
| `{avgCtr}` | CTR médio dos últimos vídeos (%) | `6.7` | Email operacional |
| `{avgWatchTime}` | Watch time médio em segundos | `312` | Email operacional |
| `{videosProduced}` | Quantidade de vídeos produzidos no período | `10` | Email operacional |
| `{pipelineSuccessRate}` | Taxa de sucesso do pipeline (%) | `95` | Email operacional |
| `{avgPipelineDuration}` | Tempo médio de execução do pipeline (min) | `8.2` | Email operacional |
| `{learningStatus}` | Status do Learning Engine | `active` / `cold_start` | Email operacional |
| `{analyzedVideos}` | Quantidade de vídeos analisados pelo Learning Engine | `12` | Email operacional |
| `{lastWeightsUpdate}` | Timestamp do último ajuste de pesos | `2025-01-14T06:00:00Z` | Email operacional |
| `{weightAdjustmentsSummary}` | Resumo dos ajustes de pesos aplicados | `hookWeight +0.12, pacingWeight -0.05` | Email operacional |
| `{topVideoTitle}` | Título do vídeo com melhor performance | `O Caso Mais Bizarro do Brasil` | Email operacional |
| `{topVideoRetention}` | Retenção do top vídeo (%) | `61.2` | Email operacional |
| `{topVideoCtr}` | CTR do top vídeo (%) | `8.4` | Email operacional |
| `{topVideoId}` | YouTube ID do top vídeo | `xK9mPqRs2Lw` | Email operacional |
| `{alertsList}` | Lista de alertas ativos | `Nenhum` / `Retenção abaixo de 35%` | Email operacional |
| `{metricName}` | Nome da métrica em alerta | `Retenção média` | Email operacional |
| `{metricValue}` | Valor atual da métrica | `32.1` | Email operacional |
| `{metricTarget}` | Meta da métrica | `45` | Email operacional |
| `{metricDeviation}` | Desvio em relação à meta | `-12.9` | Email operacional |
| `{affectedVideosList}` | Lista de vídeos com baixa performance | `dQw4w9WgXcQ (31%), xK9mPqRs2Lw (33%)` | Email operacional |
| `{nextScheduledAt}` | Próxima execução agendada | `2025-01-15T16:00:00Z` | Email operacional |
| `{thumbnailCtrScore}` | Score de CTR da thumbnail selecionada (0-100) | `78` | Email operacional |
| `{date}` | Data do relatório | `2025-01-15` | Email operacional |
| `{alertDomain}` | Domínio configurado para envio de alertas | `mestra.internal` | Email operacional |

<!-- APPEND:variaveis -->

---

## Regras de Envio

> Quais eventos disparam cada notificação? Existem condições, cooldowns ou prioridades?

### Mapa de Triggers

| Evento | Canal | Template | Condição | Cooldown |
| --- | --- | --- | --- | --- |
| Pipeline status → `completed` | Log + Email (opcional) | Pipeline Concluído com Sucesso | `ALERT_EMAIL_ENABLED=true` | Nenhum (por execução) |
| Pipeline status → `failed` | Log + Email (opcional) | Pipeline com Falha Crítica | `ALERT_EMAIL_ENABLED=true` | Nenhum (por execução) |
| Scheduler diário dispara | Email (opcional) | Relatório Diário de Performance | `REPORT_EMAIL_ENABLED=true` e vídeos publicados nos últimos 7 dias | 1 por dia |
| Learning Engine ativa pela 1ª vez | Log + Email (opcional) | Learning Loop Ativado | `analyzedVideos >= 5` e `learningState.isActive` muda para `true` | Único (por nicho) |
| Retenção média < 35% nos últimos 5 vídeos | Log + Email (opcional) | Alerta de Métricas Abaixo da Meta | `ALERT_EMAIL_ENABLED=true` e `avgRetention < 35` | 24 horas |
| CTR médio < 3% nos últimos 5 vídeos | Log + Email (opcional) | Alerta de Métricas Abaixo da Meta | `ALERT_EMAIL_ENABLED=true` e `avgCtr < 3` | 24 horas |
| Step falha e entra em retry | Log | — (log estruturado) | Sempre | Nenhum |
| Coleta de métricas concluída | Log | — (log estruturado) | Sempre | Nenhum |
| Learning Loop executa ajuste de pesos | Log | — (log estruturado) | Sempre | Nenhum |

<!-- APPEND:triggers -->

### Prioridade entre Canais

> O sistema usa canal único por tipo de notificação. Logs são sempre o canal primário e obrigatório.

| Prioridade | Canal | Condição de uso |
| --- | --- | --- |
| 1 | Logs estruturados (stdout + arquivo) | Sempre — obrigatório, não configurável |
| 2 | Email de alerta operacional | Opcional — requer `ALERT_EMAIL_ENABLED=true` e configuração de provedor |

<!-- APPEND:prioridade-canais -->

### Rate Limits e Throttling

| Canal | Rate limit | Janela | Observação |
| --- | --- | --- | --- |
| Logs estruturados | Sem limite | — | Sempre habilitado |
| Email — Pipeline concluído | Sem limite | — | 1 por execução de pipeline |
| Email — Pipeline com falha | Sem limite | — | 1 por execução de pipeline |
| Email — Relatório diário | 1 por dia | 24 horas | Controlado pelo scheduler |
| Email — Learning ativado | 1 por nicho | Único | Enviado apenas na primeira ativação |
| Email — Alerta de performance | 1 por métrica | 24 horas | Evita spam em degradação contínua |

<!-- APPEND:rate-limits -->

---

## Convenções de Escrita por Canal

> Quais regras de tom de voz e formatação se aplicam a cada canal?

### Email Operacional

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Assunto com emoji de status no início | `✅ Vídeo publicado: Título [dark]` | `Notificação de conclusão de pipeline` |
| Assunto com máximo 60 caracteres | `🚨 Falha no pipeline [dark] — Step: voice` | `Notificação importante: o pipeline de geração de vídeo falhou no step de geração de voz` |
| Inclua Pipeline ID e Niche no corpo | `Pipeline ID: a3f2c1d4 · Nicho: dark` | (sem identificadores) |
| Inclua comando CLI de ação quando aplicável | `mestra generate --niche dark --resume {id}` | `Entre em contato com o suporte` |
| Tom técnico e direto — sem marketing | `O pipeline falhou após 3 tentativas.` | `Ops! Algo deu errado 😅 Não se preocupe!` |
| Inclua fallback texto para todo email | `Pipeline {id}: https://youtube.com/...` | (sem versão texto) |
| Seções separadas por emojis de categoria | `📹 PRODUÇÃO`, `📈 PERFORMANCE`, `🧠 LEARNING` | (bloco de texto sem estrutura) |

<!-- APPEND:convencoes-email -->

### SMS

| Status | Não aplicável |
| --- | --- |

<!-- APPEND:convencoes-sms -->

### WhatsApp

| Status | Não aplicável |
| --- | --- |

<!-- APPEND:convencoes-whatsapp -->

### Logs Estruturados (Canal Primário)

| Regra | Exemplo correto | Exemplo incorreto |
| --- | --- | --- |
| Formato JSON estruturado (RFC 5424) | `{"level":"info","step":"voice-generation","pipelineId":"...","duration":4200}` | `Voice generation done in 4.2s` |
| Inclua `level`, `step`, `pipelineId`, `timestamp` em todo log | `{"level":"error","step":"upload","pipelineId":"..."}` | `{"message":"upload failed"}` |
| Use `level: error` apenas para falhas que param o pipeline | `{"level":"error","step":"ffmpeg","retryCount":3}` | `{"level":"error","step":"pexels","message":"no results"}` |
| Use `level: warn` para fallbacks e retries | `{"level":"warn","step":"visual","message":"fallback to DALL-E"}` | `{"level":"error","step":"visual","message":"fallback to DALL-E"}` |
| Nunca logue API keys ou tokens | `{"service":"elevenlabs","status":"ok"}` | `{"apiKey":"sk-...","service":"elevenlabs"}` |
| Inclua `durationMs` em steps de performance crítica | `{"step":"rendering","durationMs":45200}` | `{"step":"rendering","message":"done"}` |

---

## Histórico de Decisões

| Data | Decisão | Motivo |
| --- | --- | --- |
| 2025-01-15 | Emails de usuário final (boas-vindas, reset de senha) removidos do escopo | Mestra AI é ferramenta interna CLI com operador único — não há usuários finais, cadastro ou autenticação de usuário |
| 2025-01-15 | SMS e WhatsApp marcados como não aplicáveis | PRD não menciona esses canais; ferramenta interna não requer notificações mobile |
| 2025-01-15 | Logs estruturados definidos como canal primário obrigatório | Alinhado com requisito RF23 (logs estruturados por step) e decisão técnica de observabilidade do PRD |
| 2025-01-15 | Email de alerta operacional definido como canal secundário opcional | Operador pode preferir monitorar apenas via logs; email é opt-in via variável de ambiente |
| 2025-01-15 | Cooldown de 24h para alertas de performance | Evita spam em caso de degradação contínua; operador é notificado uma vez por dia por métrica |

<!-- APPEND:decisoes-comunicacao -->
</tool_response>

Documento salvo e verificado. Aqui está o resumo do que foi produzido:

---

## ✅ Checklist de Cobertura

- [x] **Fluxos críticos cobertos** — Todos os 5 fluxos de `07-critical_flows.md` que geram eventos têm notificação correspondente (pipeline concluído, pipeline falho, coleta de métricas, learning loop, retry de step)
- [x] **Emails transacionais de usuário** — Marcados como "Não aplicável" com justificativa clara (ferramenta interna, sem usuários finais)
- [x] **5 templates de email operacional** com assunto, preheader, corpo, CTA e fallback texto
- [x] **Variáveis documentadas** — 30 variáveis mapeadas com descrição, exemplo e disponibilidade
- [x] **Mapa de Triggers** — 9 eventos mapeados com condições e cooldowns
- [x] **Provedores definidos** — Logs como primário; email configurável via `ALERT_EMAIL_PROVIDER`
- [x] **SMS e WhatsApp** — Marcados como "Não aplicável" com motivo
- [x] **Rate limits** — Definidos por template de email
- [x] **Convenções de escrita** — Email operacional + Logs estruturados (canal primário)

---

## Decisões de design tomadas

**Por que não há emails de usuário?** O Mestra AI é uma ferramenta CLI interna com operador único. Não existe cadastro, login, reset de senha ou qualquer fluxo de autenticação de usuário final. Aplicar o template padrão seria documentar features que não existem.

**Por que logs são o canal primário?** O PRD define explicitamente RF23 ("Logs estruturados por step") e a decisão técnica de observabilidade. Logs são o único canal garantido — email é opt-in via variável de ambiente.

**Por que email operacional é opcional?** O operador pode preferir monitorar via `tail -f logs/` ou integrar com ferramentas como Datadog/Grafana. Forçar email seria uma decisão de infraestrutura que o PRD não toma.

---

> Comunicação documentada. O blueprint técnico está completo! Rode `/blueprint` para revisar a cobertura geral, ou `/blueprint-increment` para adicionar templates de novas features.