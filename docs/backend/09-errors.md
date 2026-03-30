# Erros e Exceções

> Hierarquia de exceções, formato padrão de erro, catálogo de códigos e estratégia de tratamento.

---

## Formato Padrão de Erro

> Todo erro logado/seh retorna segue este formato.

```typescript
interface ErrorResponse {
  error: {
    code: string;           // UPPER_SNAKE_CASE
    message: string;       // Portuguese, user-friendly
    status: number;        // HTTP status
    details?: FieldError[]; // Validation details
    requestId?: string;    // UUID do request
    timestamp: string;     // ISO8601
    retryable?: boolean;  // Se o erro permite retry
  };
}

interface FieldError {
  field: string;
  message: string;
}
```

**Regras:**
- `code` é sempre UPPER_SNAKE_CASE
- `message` é sempre em português e seguro para exibir ao operador
- `details` só aparece em erros de validação de entrada
- `stack trace` NUNCA aparece em produção (apenas em logs)
- `retryable` indica se o erro pode ser retentado

---

## Hierarquia de Exceções

```
AppError (base)
├── ValidationError (CLI: exit 1)
│   ├── InvalidArgumentError
│   └── MissingArgumentError
├── EngineError (exit 1)
│   ├── ContentGenerationError
│   ├── SceneSegmentationError
│   ├── VoiceGenerationError
│   ├── VisualSearchError
│   ├── RenderingError
│   └── ThumbnailGenerationError
├── ExternalServiceError (retryable)
│   ├── LLMError
│   │   ├── LLMTimeoutError
│   │   └── LLMQuotaError
│   ├── ElevenLabsError
│   │   ├── ElevenLabsQuotaError
│   │   └── ElevenLabsTimeoutError
│   ├── PexelsError
│   │   ├── PexelsRateLimitError
│   │   └── PexelsNotFoundError
│   ├── YouTubeError
│   │   ├── YouTubeUploadError
│   │   ├── YouTubeAuthError
│   │   └── YouTubeQuotaError
│   └── FFmpegError
│       └── FFmpegRenderError
├── PipelineError (exit 1)
│   ├── StepFailedError
│   │   ├── MaxRetriesExceededError
│   │   └── StepTimeoutError
│   ├── InvalidStateTransitionError
│   └── PipelineCancelledError
├── LearningError (exit 0 - não blocking)
│   ├── InsufficientDataError
│   └── WeightAdjustmentError
├── StorageError (exit 1)
│   ├── AssetDownloadError
│   ├── FileNotFoundError
│   └── DiskSpaceError
└── DatabaseError (exit 1)
    ├── ConnectionError
    └── QueryError
```

---

## Catálogo de Códigos de Erro

| Código | Status CLI | Mensagem | Quando | Retentável |
|--------|------------|----------|--------|-------------|
| VALIDATION_ERROR | 1 | Argumentos inválidos | CLI args falham validação | Não |
| MISSING_ARGUMENT | 1 | Argumento obrigatório | --niche não fornecido | Não |
| CONTENT_GENERATION_FAILED | 1 | Falha ao gerar conteúdo | LLM retorna erro | Sim (3x) |
| SCENE_SEGMENTATION_FAILED | 1 | Falha ao segmentar roteiro | Parse de roteiro falha | Não |
| VOICE_GENERATION_FAILED | 1 | Falha ao gerar voz | ElevenLabs retorna erro | Sim (3x) |
| VISUAL_SEARCH_FAILED | 1 | Falha ao buscar assets | Pexels não retorna resultados | Sim (3x) |
| VISUAL_DOWNLOAD_FAILED | 1 | Falha ao baixar asset | Timeout/download falha | Sim (3x) |
| RENDERING_FAILED | 1 | Falha ao renderizar vídeo | FFmpeg erro | Sim (3x) |
| THUMBNAIL_GENERATION_FAILED | 1 | Falha ao gerar thumbnail | DALL-E erro | Sim (3x) |
| YOUTUBE_UPLOAD_FAILED | 1 | Falha ao subir vídeo | YouTube API erro | Sim (3x) |
| YOUTUBE_AUTH_FAILED | 1 | Falha na autenticação YouTube | Token inválido/expirado | Não |
| YOUTUBE_QUOTA_EXCEEDED | 1 | Cota do YouTube excedida | Limite diário atingido | Sim (amanhã) |
| LLM_TIMEOUT | 1 | Timeout do LLM | API não responde em 30s | Sim |
| LLM_QUOTA_EXCEEDED | 1 | Cota do LLM excedida | Limite da APIKey | Não |
| ELEVENLABS_QUOTA_EXCEEDED | 1 | Cota do ElevenLabs excedida | Limite de caracteres | Não |
| PEXELS_RATE_LIMIT | 1 | Rate limit do Pexels | Muitas requisições | Sim (60s) |
| PEXELS_NO_RESULTS | 1 | Nenhum resultado encontrado | Query sem matches | Sim (outra query) |
| MAX_RETRIES_EXCEEDED | 1 | Máximo de tentativas excedido | 3 retries sem sucesso | Não |
| STEP_TIMEOUT | 1 | Step excedeu timeout | 5 min por step | Sim |
| INVALID_STATE_TRANSITION | 1 | Transição de estado inválida | pending → completed | Não |
| PIPELINE_CANCELLED | 0 | Pipeline cancelado | Cancelamento explícito | Não |
| ASSET_DOWNLOAD_FAILED | 1 | Falha ao baixar asset | rede/disco | Sim (3x) |
| FILE_NOT_FOUND | 1 | Arquivo não encontrado | Caminho inválido | Não |
| DISK_SPACE_EXHAUSTED | 1 | Espaço em disco insuficiente | < 1GB disponível | Não |
| DATABASE_ERROR | 1 | Erro no banco de dados | Query falha | Sim |
| LEARNING_INSUFFICIENT_DATA | 0 | Dados insuficientes para learning | < 5 vídeos | Não |
| INTERNAL_ERROR | 1 | Erro interno não tratado | Exceção não mapeada | Não |

---

## Estratégia de Tratamento

| Tipo de Erro | Onde Tratar | Logar | Alertar | Retry |
|--------------|-------------|-------|---------|-------|
| ValidationError | CLI parser | Debug | Não | Não |
| EngineError | Pipeline step | Error | Sim (Slack) | Sim (3x com backoff) |
| ExternalServiceError | Client wrapper | Warn | Sim (se > 5%) | Sim (backoff exponencial) |
| PipelineError | Orchestrator | Error | Sim | Depende |
| StorageError | Service | Error | Sim | Sim |
| DatabaseError | Repository | Error | Sim | Sim |
| LearningError | Learning service | Info | Não | Não (não blocking) |

**Retry Strategy:**
- Backoff exponencial: 1s → 2s → 4s
- Máximo de 3 tentativas por step
- Jitter: ±20% para evitar thundering herd

**Exit Codes:**
- `0`: Sucesso ou erro não-blocking (learning insufficient data)
- `1`: Erro blocking (pipeline falha)
- `2`: Erro de uso (CLI args inválidos)

---

## Tratamento de Erros por Engine

### Content Engine
```typescript
try {
  const script = await contentEngine.generateScript(idea, template);
} catch (error) {
  if (error instanceof LLMError) {
    // Retry com backoff
    // Se após 3x ainda falha → throw StepFailedError
  }
  throw new ContentGenerationError(error.message);
}
```

### Voice Engine
```typescript
try {
  const audio = await voiceEngine.generateVoice(scene);
} catch (error) {
  if (error.code === 'ELEVENLABS_QUOTA_EXCEEDED') {
    throw new VoiceGenerationError('Cota do ElevenLabs excedida');
  }
  // Retry para outros erros
}
```

### Visual Engine
```typescript
try {
  const clips = await visualEngine.searchClips(query);
} catch (error) {
  if (clips.length === 0) {
    // Fallback para DALL-E
    return await visualEngine.fallbackToAI(query);
  }
  throw new VisualSearchError('Falha ao buscar assets');
}
```

### Render Engine
```typescript
try {
  const video = await renderEngine.renderFullPipeline(scenes);
} catch (error) {
  if (error.message.includes('disk space')) {
    throw new DiskSpaceError('Espaço insuficiente para renderização');
  }
  throw new RenderingError(error.message);
}
```

---

> Ver [10-validation.md](10-validation.md) para regras de validação de argumentos
