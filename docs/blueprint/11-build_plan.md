# Plano de Construção

> Como o sistema será construído? Defina entregas, prioridades e dependências.

Um bom plano de construção transforma o blueprint em ação. Ele organiza o projeto em **entregas independentes**, cada uma com valor mensurável, e explicita **dependências**, **riscos** e **critérios de aceite** para que a equipe saiba exatamente o que construir.

---

## Entregas (Deliverables)

> Comece pelo que reduz risco mais cedo. Priorize pelo valor e pelas dependências técnicas.

---

### ENT-001: Fundação do Projeto

**Objetivo:** Estabelecer infraestrutura base, configuração de projeto e pipeline de dados.

**Prioridade:** Must

**Itens:**
- Setup do repositório com estrutura de pastas (conforme PRD)
- Configuração TypeScript strict mode
- Configuração Prisma com SQLite (dev)
- Variáveis de ambiente e validação
- Logging estruturado por step
- CLI com commander.js (comandos: generate, status, videos)

**Dependências:**
- Nenhuma (entrega inicial)

**Critérios de Aceite:**
- Repositório configurado com lint e build
- `mestra generate --help` funciona
- Variáveis de ambiente validadas ao iniciar

**Estimativa:** S

---

### ENT-002: Pipeline Core e Retry

**Objetivo:** Implementar o orquestrador de pipeline com persistência e retry.

**Prioridade:** Must

**Itens:**
- PipelineContext tipo e validação
- PipelineOrchestrator com executeStep()
- Retry com backoff (1s, 2s, 4s) — 3 tentativas
- Persistência de estado após cada step
- Resume de pipeline em ponto de falha

**Dependências:**
- ENT-001 concluída

**Critérios de Aceite:**
- Pipeline executa e persiste estado
- Retry funciona em falha de step
- Resume de ponto de falha funciona

**Estimativa:** M

---

### ENT-003: Content Engine

**Objetivo:** Gerar ideias e roteiros via LLM com template.

**Prioridade:** Must

**Itens:**
- OpenRouter SDK configurado
- generateIdea(niche) — via LLM
- generateScriptFromTemplate(idea, template) — HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP
- generateHookVariants(idea)
- selectBestHook()
- optimizeScriptForRetention()

**Dependências:**
- ENT-001 concluída
- API key OpenRouter configurada

**Critérios de Aceite:**
- Gera roteiro válido com template
- Múltiplas variantes de hook

**Estimativa:** M

---

### ENT-004: Scene Engine

**Objetivo:** Segmentar roteiro em cenas com duração e queries visuais.

**Prioridade:** Must

**Itens:**
- splitIntoScenes(script) — quebra por segmentos do template
- estimateDurations(scenes) — calcula duração por cena
- generateVisualQueries(scene) — gera queries para busca de assets

**Dependências:**
- ENT-003 concluída

**Critérios de Aceite:**
- Roteiro segmentado em scenes
- Duração total corresponde ao script

**Estimativa:** S

---

### ENT-005: Voice Engine + Visual Engine

**Objetivo:** Gerar áudio via TTS e buscar assets visuais.

**Prioridade:** Must

**Itens:**
- ElevenLabs SDK configurado
- generateVoice(scene) — TTS por cena
- applyVoiceStyle(profile)
- mergeAudioSegments()
- Pexels API configurada
- searchClips(query)
- rankClips(clips, scene)
- downloadMedia()
- Execução paralela Voice + Visual

**Dependências:**
- ENT-004 concluída
- API keys ElevenLabs e Pexels configuradas

**Critérios de Aceite:**
- Áudio gerado por cena
- Clips baixados e salvos localmente

**Estimativa:** M

---

### ENT-006: Pacing Engine

**Objetivo:** Controlar ritmo do vídeo para maximizar retenção.

**Prioridade:** Must

**Itens:**
- enforceMaxSceneDuration(2.5s) — nenhuma cena > 2.5s
- addPatternInterrupts() — interrupções visuais
- applyZoomEffects() — zoom em momentos-chave
- addMicroTransitions() — transições rápidas entre cenas

**Dependências:**
- ENT-005 concluída

**Critérios de Aceite:**
- Todas as cenas têm ≤ 2.5s
- Pacing aplicado visivelmente

**Estimativa:** S

---

### ENT-007: Rendering Engine

**Objetivo:** Renderizar vídeo scene-based via FFmpeg.

**Prioridade:** Must

**Itens:**
- FFmpeg instalado e configurado
- composeScene(scene) — áudio + visual + legenda
- syncAudioVideo(scene)
- stitchScenes() — concatena todas as cenas
- addSubtitles() — gera e embute legendas
- addBackgroundMusic()

**Dependências:**
- ENT-006 concluída
- FFmpeg instalado no ambiente

**Critérios de Aceite:**
- Vídeo renderizado com áudio sincronizado
- Legendas visíveis
- Música de fundo mixada

**Estimativa:** L

---

### ENT-008: Thumbnail Engine

**Objetivo:** Gerar thumbnails com scoring CTR.

**Prioridade:** Must

**Itens:**
- DALL-E/SDXL configurado (via OpenRouter)
- generateThumbnailConcepts(idea)
- generateMultipleImages(n=4)
- composeThumbnail() — Canvas: texto + overlay + gradiente
- scoreThumbnailCTR()
- selectBestThumbnail()

**Dependências:**
- ENT-003 concluída (idea)

**Critérios de Aceite:**
- Múltiplas thumbnails geradas
- Scoring aplicado
- Melhor thumbnail selecionada

**Estimativa:** M

---

### ENT-009: Upload Module

**Objetivo:** Publicar vídeo no YouTube automaticamente.

**Prioridade:** Must

**Itens:**
- YouTube Data API configurada (OAuth2)
- generateTitle(idea) — via LLM
- generateDescription(script)
- generateTags(idea, script)
- uploadToYoutube(video, thumbnail, metadata)
- updatePipelineStatus()

**Dependências:**
- ENT-007 concluída (video)
- ENT-008 concluída (thumbnail)
- Conta YouTube com OAuth configurado

**Critérios de Aceite:**
- Vídeo publicado no YouTube
- Título, descrição e tags aplicados

**Estimativa:** M

---

### ENT-010: Performance Engine

**Objetivo:** Coletar métricas reais do YouTube Analytics.

**Prioridade:** Must

**Itens:**
- YouTube Analytics API configurada
- collectMetrics(videoId)
- getRetentionCurve()
- detectDropOffPoints()
- scoreVideoPerformance()
- Cron job para coleta (a cada 6h)

**Dependências:**
- ENT-009 concluída (vídeos publicados)

**Critérios de Aceite:**
- Métricas coletadas automaticamente
- Retention curve gerada

**Estimativa:** M

---

### ENT-011: Strategy Engine

**Objetivo:** Decidir próximo conteúdo baseado em dados.

**Prioridade:** Should

**Itens:**
- generateContentPlan(niche, metrics)
- clusterTopics() — agrupa tópicos relacionados
- prioritizeIdeas() — ranqueia por potencial
- createSeries() — cria séries temáticas

**Dependências:**
- ENT-010 concluída (métricas disponíveis)

**Critérios de Aceite:**
- Gera content plan baseado em métricas

**Estimativa:** M

---

### ENT-012: Learning Engine

**Objetivo:** Fechar o loop de aprendizado com ajustes automáticos.

**Prioridade:** Should

**Itens:**
- analyzeFailures() — identifica vídeos com baixa performance
- updatePromptWeights() — ajusta pesos de prompts
- adjustHookStrategy()
- optimizeTemplates()
- Cold start com pesos padrão
- Cron job para learning loop

**Dependências:**
- ENT-010 concluída (métricas)

**Critérios de Aceite:**
- Pesos ajustados após análise
- Cold start usa valores padrão

**Estimativa:** M

---

### ENT-013: Pipeline Completo End-to-End

**Objetivo:** Integrar todas as engines em pipeline executável.

**Prioridade:** Must

**Itens:**
- Integração de todas as engines
- Pipeline completo: generate → script → scene → voice+visual → pacing → render → thumbnail → upload
- Batch processing (10+ vídeos/dia)
- Logs estruturados completos

**Dependências:**
- ENT-009 concluída (todas as engines integradas)

**Critérios de Aceite:**
- `mestra generate --niche dark` produz vídeo no YouTube
- Tempo de execução < 10 minutos

**Estimativa:** L

---

### ENT-014: Observabilidade e Monitoramento

**Objetivo:** Completar sistema de logs e métricas.

**Prioridade:** Should

**Itens:**
- Logs por step com duração
- Métricas de throughput (vídeos/dia)
- Taxa de falha por step
- Status command detalhado

**Dependências:**
- ENT-013 concluída

**Critérios de Aceite:**
- Logs completos por execução
- Métricas exportáveis

**Estimativa:** S

---

## Priorização

| Entrega | Prioridade | Dependências | Justificativa |
|---------|-----------|--------------|---------------|
| ENT-001 | Must | Nenhuma | Fundação necessária para tudo |
| ENT-002 | Must | ENT-001 | Core do pipeline sem o qual nada funciona |
| ENT-003 | Must | ENT-001 | Geração de conteúdo via LLM |
| ENT-004 | Must | ENT-003 | Segmentação necessária para render |
| ENT-005 | Must | ENT-004 | Áudio e visual são essenciais |
| ENT-006 | Must | ENT-005 | Pacing diferencia o produto |
| ENT-007 | Must | ENT-006 | Renderização é critical |
| ENT-008 | Must | ENT-003 | Thumbnails são importantes para CTR |
| ENT-009 | Must | ENT-007, ENT-008 | Upload é o objetivo final |
| ENT-010 | Must | ENT-009 | Métricas alimentam learning |
| ENT-011 | Should | ENT-010 | Estratégia baseada em dados |
| ENT-012 | Should | ENT-010 | Learning fecha o loop |
| ENT-013 | Must | ENT-009 | Integração completa |
| ENT-014 | Should | ENT-013 | Observabilidade completa |

---

## Riscos Técnicos

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| Sincronização audio/video | Alto | Alta | Scene-based rendering; testar exaustivamente |
| Qualidade do roteiro (LLM) | Alto | Média | Template fixo; learning loop ajusta prompts |
| Delay YouTube Analytics (48-72h) | Alto | Certeza | Learning assíncrono; cold start com defaults |
| Cold start do Learning | Médio | Alta | Pesos padrão por nicho |
| Rate limits APIs (OpenRouter, ElevenLabs, YouTube) | Médio | Alta | Retry com backoff; cache de assets |
| FFmpeg performance | Médio | Baixa | Limitar duração de vídeos; render em partes |
| Qualidade TTS | Médio | Baixa | ElevenLabs já é referência; perfis configuráveis |
| Copyright de conteúdo | Médio | Baixa | Apenas Pexels ou geração IA |

---

## Dependências Externas

| Dependência | Tipo | Responsável | Status | Impacto se Atrasar |
|-------------|------|-------------|--------|---------------------|
| OpenRouter API | API | Douglas | Pendente | Crítico — sem LLM não gera conteúdo |
| ElevenLabs API | API | Douglas | Pendente | Crítico — sem TTS não há áudio |
| Pexels API | API | Douglas | Pendente | Crítico — sem visuals não há vídeo |
| YouTube Data API | API | Douglas | Pendente | Crítico — sem upload não há publicação |
| YouTube Analytics API | API | Douglas | Pendente | Alto — sem métricas não há learning |
| DALL-E/SDXL | API | Douglas | Pendente | Alto — sem thumbnails |
| FFmpeg | Ferramenta | Douglas | Pendente | Crítico — sem renderização |
| Conta YouTube (OAuth2) | Serviço | Douglas | Pendente | Crítico — sem conta não há upload |

---

## Roadmap Sugerido

```
Semana 1-2:  ENT-001 (Fundação) + ENT-002 (Pipeline Core)
Semana 3-4:  ENT-003 (Content) + ENT-004 (Scene)
Semana 5-6:  ENT-005 (Voice+Visual) + ENT-006 (Pacing)
Semana 7-9:  ENT-007 (Rendering) [maior esforço]
Semana 10:   ENT-008 (Thumbnail) + ENT-009 (Upload)
Semana 11:   ENT-010 (Performance) + ENT-011 (Strategy)
Semana 12:   ENT-012 (Learning) + ENT-013 (Integração)
Semana 13:   ENT-014 (Observabilidade) + Testes
```

**Total estimado:** ~13 semanas (3 meses)

<!-- APPEND:deliverables -->
