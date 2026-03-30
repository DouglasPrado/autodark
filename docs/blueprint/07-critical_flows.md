# Fluxos Críticos

> Documente os 3 a 5 fluxos mais importantes do sistema. Estes são os caminhos que, se falharem, impactam diretamente o valor entregue.

Para cada fluxo crítico, utilize o template abaixo. O objetivo é garantir que qualquer pessoa da equipe consiga entender o caminho completo, os pontos de falha e as expectativas de performance.

---

## Fluxo 1: Geração e Publicação de Vídeo

**Descrição:** Pipeline completo que gera ideia, roteiriza, produz e publica vídeo no YouTube. Este é o fluxo principal do sistema — se falhar, não há entrega de valor.

**Atores envolvidos:** Operador, CLI, Pipeline Orchestrator, Engines (Content, Scene, Voice, Visual, Pacing, Rendering, Thumbnail), APIs Externas (OpenRouter, ElevenLabs, Pexels, FFmpeg, YouTube Data API), Banco de Dados

### Passos

1. Operador executa comando CLI (`mestra generate --niche dark`)
2. CLI inicializa Pipeline Orchestrator com nicho
3. Pipeline Orchestrator busca Learning State (se ativo) e Content Plan
4. **Content Engine** gera ideia via OpenRouter (LLM)
5. **Content Engine** gera roteiro via template (HOOK → SETUP → ESCALADA → TWIST → PAYOFF → LOOP)
6. **Content Engine** gera variantes de hook e seleciona melhor
7. **Scene Engine** segmenta roteiro em cenas com durações
8. **Scene Engine** gera visual queries por cena
9. Voice Engine e Visual Engine executam em paralelo:
   - Voice Engine gera áudio via ElevenLabs (TTS) por cena
   - Visual Engine busca clips no Pexels por query
10. **Pacing Engine** aplica max 2.5s por cena, pattern interrupts, zoom
11. **Rendering Engine** renderiza cada cena (FFmpeg) e concatena
12. **Rendering Engine** adiciona legendas e música de fundo
13. **Thumbnail Engine** gera conceitos e imagens via DALL-E
14. **Thumbnail Engine** compõe thumbnail com texto/overlay
15. **Thumbnail Engine** pontua CTR e seleciona melhor
16. **Upload Module** gera título, descrição, tags
17. **Upload Module** publica vídeo no YouTube (Data API)
18. Pipeline Orchestrator persiste estado no banco

### Diagrama de Sequência

> 📐 Diagrama: [video-generation.mmd](../diagrams/sequences/video-generation.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 4-6 | OpenRouter indisponível | Retry 3x com backoff; falha final marca pipeline como failed |
| 9a | ElevenLabs indisponível | Retry 3x; fallback para voz alternativa ou falha |
| 9b | Pexels sem resultados | Fallback para imagem gerada via DALL-E |
| 11 | FFmpeg falha | Retry na cena específica; se persistir, marcar falha |
| 17 | YouTube Data API falha | Retry 3x; status pending até sucesso |
| 18 | Banco de dados indisponível | Pipeline continua em memória; persiste quando disponível |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência total (p95) | < 10 minutos por vídeo |
| Latência total (p99) | < 15 minutos por vídeo |
| Throughput mínimo | 10+ vídeos/dia |

---

## Fluxo 2: Coleta de Métricas do YouTube

**Descrição:** Coleta métricas de performance (retenção, CTR, watch time) via YouTube Analytics API. Alimenta o Learning Engine.

**Atores envolvidos:** Scheduler/Cron, Performance Engine, YouTube Analytics API, Banco de Dados

### Passos

1. Scheduler (cron) dispara coleta a cada 6 horas
2. Performance Engine busca vídeos publicados nos últimos 7 dias
3. Para cada vídeo, Performance Engine chama YouTube Analytics API
4. YouTube Analytics retorna métricas (retenção, CTR, views, likes)
5. Performance Engine detecta drop-off points
6. Performance Engine calcula performance score
7. Performance Engine persiste VideoMetrics no banco

### Diagrama de Sequência

> 📐 Diagrama: [metrics-collection.mmd](../diagrams/sequences/metrics-collection.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 3 | YouTube Analytics API rate limit | Backoff exponential; agenda retry |
| 3 | Dados não disponíveis (ainda < 48h) | Pula vídeo; marca para retry posterior |
| 5 | API retorna dados incompletos | Log warning; usa valores padrão (0) |
| 7 | Banco indisponível | Retry com backoff; mantém métricas em memória |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência por vídeo | < 5 segundos |
| Throughput | 100+ vídeos/hora |
| SLA de disponibilidade | 99% |

---

## Fluxo 3: Learning Loop (Ajuste de Pesos)

**Descrição:** Analisa métricas de vídeos publicados, identifica padrões de falha, ajusta pesos de prompts e templates. Fecha o ciclo de aprendizado.

**Atores envolvidos:** Scheduler/Cron, Learning Engine, Performance Engine, Strategy Engine, Banco de Dados

### Passos

1. Scheduler dispara Learning Loop após coleta de métricas
2. Learning Engine busca últimos 5+ VideoMetrics
3. Learning Engine analisa vídeos com baixa performance (retenção < 45%)
4. Learning Engine identifica padrões:
   - Hooks com baixa retenção inicial
   - Segmentos com alto drop-off
   - Templates com baixa performance
5. Learning Engine calcula novos pesos (hookWeights, templateWeights, pacingWeights)
6. Learning Engine atualiza LearningState no banco
7. Strategy Engine recebe novos pesos para próximas diretivas

### Diagrama de Sequência

> 📐 Diagrama: [learning-loop.mmd](../diagrams/sequences/learning-loop.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 2 | Menos de 5 vídeos analisados | Pula ajuste; usa pesos padrão (cold start) |
| 5 | Convergência instável | Limita taxa de ajuste; mantém pesos anteriores |
| 6 | Banco indisponível | Retry; mantém LearningState inalterado |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência total | < 30 segundos |
| Frequência | Após cada coleta de métricas (6h) |
| Minimum videos | 5 vídeos para ativar |

---

## Fluxo 4: Retry de Step com Persistência

**Descrição:** Quando um step falha, o pipeline persiste estado e faz retry sem perder progresso. Garante resiliência em ambiente com APIs instáveis.

**Atores envolvidos:** Pipeline Orchestrator, Banco de Dados, Step específico (qualquer engine)

### Passos

1. Step falha (ex: ElevenLabs timeout)
2. Pipeline Orchestrator captura erro e incrementa contador
3. Se contador < 3: Pipeline Orchestrator persiste estado atual
4. Pipeline Orchestrator faz retry do step com mesmo contexto
5. Step succeeds: Pipeline continua normalmente
6. Step fails após 3 tentativas: Pipeline marca como failed
7. Operador pode reexecutar do ponto de falha via CLI

### Diagrama de Sequência

> 📐 Diagrama: [pipeline-retry.mmd](../diagrams/sequences/pipeline-retry.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 1-2 | Erro não capturado | Pipeline crash; operador deve investigar logs |
| 5 | Step continua falhando | Após 3 tentativas, marca failed |
| 7 | Estado corrompido | Operador pode forçar restart do início |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Tempo de retry | Backoff: 1s, 2s, 4s |
| Max tentativas | 3 por step |
| Persistência | A cada step completo |

---

## Fluxo 5: Upload e Publicação no YouTube

**Descrição:** Publica vídeo renderizado com thumbnail e metadados自动mente gerados. Étimo passo antes do valor ser entregue.

**Atores envolvidos:** Upload Module, YouTube Data API, Rendering Engine, Thumbnail Engine

### Passos

1. Video renderizado e salvo em disco (done)
2. Thumbnail selecionada (done)
3. Upload Module gera título automático (via LLM)
4. Upload Module gera descrição automática
5. Upload Module gera tags automaticamente
6. Upload Module faz upload do vídeo (YouTube Data API)
7. Upload Module faz upload da thumbnail
8. YouTube retorna videoId
9. Pipeline atualiza status para completed

### Diagrama de Sequência

> 📐 Diagrama: [youtube-upload.mmd](../diagrams/sequences/youtube-upload.mmd)

### Tratamento de Erros

| Passo | Falha possível | Comportamento esperado |
|-------|---------------|----------------------|
| 3-5 | LLM indisponível | Usa título/descrição gerados no script |
| 6 | YouTube API rate limit | Retry 3x com backoff |
| 6 | Video muito grande | Comprimir ou falhar com mensagem clara |
| 7 | Thumbnail upload falha | Retry; se falhar, usa thumbnail default |
| 9 | Salvar videoId falha | Retry; vídeo já está no YouTube |

### Requisitos de Performance

| Métrica | Valor esperado |
|---------|---------------|
| Latência upload | < 2 minutos (vídeo < 100MB) |
| Latência thumbnail | < 10 segundos |
| Retry attempts | 3 com backoff |

---

<!-- APPEND:flows -->
