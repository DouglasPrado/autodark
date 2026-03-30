# Integrações Externas

> Clients de APIs externas — métodos, timeout, retry, circuit breaker e fallback.

---

## Catálogo de Integrações

| Serviço | Função | Protocolo | Criticidade | SLA |
|---------|--------|-----------|-------------|-----|
| OpenRouter | Geração LLM (conteúdo) | REST API | Alta | 99.9% |
| ElevenLabs | TTS (voz) | REST API | Alta | 99.9% |
| Pexels | Busca de assets visuais | REST API | Alta | 99.9% |
| DALL-E / SDXL | Geração de thumbnails | REST API | Média | 99% |
| YouTube Data API | Upload de vídeos | REST API | Alta | 99.9% |
| YouTube Analytics | Métricas | REST API | Média | 99% |
| FFmpeg | Renderização | CLI | Alta | 100% (local) |

---

## OpenRouter (LLM)

**Função:** Geração de ideias e roteiros via LLM.

**Client Class:** `LLMClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| generate(prompt) | 30s | 3x, backoff 2^n | Gera texto via LLM |
| generateStructured(prompt, schema) | 30s | 3x | Gera JSON estruturado |
| generateStream(prompt) | 60s | 2x | Geração com streaming |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 5 falhas em 60s |
| Estado aberto | 30s |
| Half-open | 1 request de teste |
| Fallback | Usar template default |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| OPENROUTER_API_KEY | Chave da API |
| OPENROUTER_BASE_URL | https://openrouter.ai/api/v1 |
| OPENROUTER_MODEL | anthropic/claude-3-haiku (default) |

**Fallback:**
- Se LLM falhar: usar template de roteiro fixo
- Se quota excedida: logar erro, pular geração de conteúdo

---

## ElevenLabs (TTS)

**Função:** Geração de narração via Text-to-Speech.

**Client Class:** `ElevenLabsClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| generateVoice(text, voiceId) | 20s | 3x, backoff 2^n | Gera áudio para texto |
| getVoices() | 10s | 2x | Lista vozes disponíveis |
| getVoiceSettings(voiceId) | 5s | 1x | Configurações da voz |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 5 falhas em 60s |
| Estado aberto | 60s |
| Half-open | 1 request de teste |
| Fallback | Usar voz default |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| ELEVENLABS_API_KEY | Chave da API |
| ELEVENLABS_VOICE_ID | Voz padrão (predefinida) |
| ELEVENLABS_MODEL | eleven_multilingual_v2 |

**Fallback:**
- Se ElevenLabs falhar: tentar novamente com voz alternativa
- Se quota excedida: erro blocking (áudio é obrigatório)

---

## Pexels (Assets Visuais)

**Função:** Busca de clips e imagens para cenas.

**Client Class:** `PexelsClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| searchVideos(query, perPage) | 15s | 3x | Busca vídeos por query |
| searchPhotos(query, perPage) | 15s | 3x | Busca fotos por query |
| getVideo(videoId) | 10s | 2x | Detalhes do vídeo |
| downloadVideo(videoId, url) | 60s | 2x | Baixa vídeo |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 10 falhas em 60s |
| Estado aberto | 60s |
| Half-open | 1 request de teste |
| Fallback | Usar DALL-E |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| PEXELS_API_KEY | Chave da API |

**Fallback:**
- Se Pexels não retornar resultados: usar DALL-E para gerar imagem
- Se Pexels rate limit: esperar 60s e retry

---

## DALL-E / SDXL (Thumbnails + Fallback)

**Função:** Geração de thumbnails e fallback para assets visuais.

**Client Class:** `DalleClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| generateImage(prompt) | 60s | 3x | Gera imagem via DALL-E |
| generateThumbnail(idea) | 60s | 3x | Gera thumbnail conceito |
| generateVariants(concepts, count) | 180s | 2x | Gera múltiplas variantes |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 3 falhas em 120s |
| Estado aberto | 120s |
| Half-open | 1 request de teste |
| Fallback | Usar template estático |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| OPENAI_API_KEY | Chave da API OpenAI (para DALL-E) |

**Fallback:**
- Se DALL-E falhar: usar thumbnail placeholder
- Se quota excedida: erro blocking (thumbnail é obrigatória)

---

## YouTube Data API (Upload)

**Função:** Upload de vídeos para o YouTube.

**Client Class:** `YouTubeClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| uploadVideo(videoPath, metadata) | 300s (5min) | 3x | Upload de vídeo |
| setThumbnail(videoId, thumbnailPath) | 30s | 2x | Define thumbnail |
| updateVideoMetadata(videoId, metadata) | 30s | 2x | Atualiza título/descrição |
| getVideoStatus(videoId) | 15s | 2x | Status do processamento |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 3 falhas em 300s |
| Estado aberto | 300s |
| Half-open | 1 request de teste |
| Fallback | Salvar local, retry manual |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| YOUTUBE_CLIENT_ID | Client ID OAuth |
| YOUTUBE_CLIENT_SECRET | Client Secret |
| YOUTUBE_REFRESH_TOKEN | Refresh Token |
| YOUTUBE_CHANNEL_ID | ID do canal |

**Auth:**
- OAuth 2.0 com refresh token
- Token renovável automaticamente

---

## YouTube Analytics (Métricas)

**Função:** Coleta de métricas de performance.

**Client Class:** `YouTubeAnalyticsClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| getMetrics(videoId) | 30s | 3x | Métricas do vídeo |
| getRetentionCurve(videoId) | 30s | 3x | Curva de retenção |
| getDemographics(videoId) | 30s | 2x | Dados demográficos |

**Circuit Breaker:**

| Parâmetro | Valor |
|-----------|-------|
| Threshold | 5 falhas em 60s |
| Estado aberto | 60s |
| Half-open | 1 request de teste |
| Fallback | Usar dados em cache |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| YOUTUBE_ANALYTICS_CLIENT_ID | Client ID OAuth |
| YOUTUBE_ANALYTICS_CLIENT_SECRET | Client Secret |
| YOUTUBE_ANALYTICS_REFRESH_TOKEN | Refresh Token |

---

## FFmpeg (Renderização)

**Função:** Renderização de vídeo scene-by-scene.

**Client Class:** `FFmpegClient`

**Métodos:**

| Método | Timeout | Retry | Descrição |
|--------|---------|-------|-----------|
| composeScene(audio, visual, scene) | 60s | 3x | Renderiza cena individual |
| stitchScenes(scenePaths, output) | 300s | 2x | Concatena cenas |
| addSubtitles(videoPath, subtitles) | 120s | 2x | Adiciona legendas |
| addAudio(videoPath, audioPath) | 60s | 2x | Adiciona áudio |

**Configuração:**

| Variável | Descrição |
|----------|-----------|
| FFMPEG_PATH | Path para binário (default: system) |
| FFMPEG_THREADS | Número de threads (default: 4) |

**Fallback:**
- Se FFmpeg falhar: erro blocking
- Verificar prerequisites na inicialização

---

## Health Checks de Integrações

| Serviço | Método | Frequência | Ação se falhar |
|---------|--------|------------|-----------------|
| OpenRouter | POST /generate | 60s | Log warning, usar fallback |
| ElevenLabs | GET /voices | 60s | Log error, falhar pipeline |
| Pexels | GET /videos/search | 60s | Log warning, usar fallback |
| YouTube | GET /videos | 60s | Log error, marcar para retry |
| FFmpeg | --version | Startup | Erro fatal se não encontrado |

---

> Ver [14-tests.md](14-tests.md) para estratégia de testes
