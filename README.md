# Mestra AI

Sistema autonomo de crescimento de canal YouTube. Gera, publica e otimiza videos automaticamente em ciclo fechado.

```
ideia -> roteiro -> cenas -> audio + visual -> pacing -> render -> thumbnail -> upload -> metricas -> learning
```

## Pre-requisitos

- **Node.js** 20+ LTS
- **FFmpeg** instalado e no PATH
- Contas com API keys:
  - [OpenRouter](https://openrouter.ai/) (LLM)
  - [ElevenLabs](https://elevenlabs.io/) (TTS)
  - [Pexels](https://www.pexels.com/api/) (assets visuais)
  - [YouTube Data API](https://developers.google.com/youtube/v3) (upload)
  - [YouTube Analytics API](https://developers.google.com/youtube/analytics) (metricas)

## Instalacao

```bash
# 1. Clone o repositorio
git clone https://github.com/seu-usuario/mestra-ai.git
cd mestra-ai

# 2. Instale dependencias
npm install

# 3. Configure variaveis de ambiente
cp .env.example .env
```

Edite o `.env` com suas API keys:

```env
# Obrigatorias
DATABASE_URL="file:./dev.db"
OPENROUTER_API_KEY="sk-or-..."
ELEVENLABS_API_KEY="..."
ELEVENLABS_VOICE_ID="..."
PEXELS_API_KEY="..."

# Para upload no YouTube (obrigatorio para publicacao)
YOUTUBE_CLIENT_ID="..."
YOUTUBE_CLIENT_SECRET="..."
YOUTUBE_REFRESH_TOKEN="..."

# Opcionais
STORAGE_PATH="./storage"
LOG_LEVEL="info"
```

```bash
# 4. Gere o Prisma Client e crie o banco
npm run db:generate
npm run db:push

# 5. Build do projeto
npm run build

# 6. Torne o CLI disponivel globalmente
npm link
```

## Uso

### Gerar um video

```bash
# Gerar video para um nicho (ideia automatica via LLM)
mestra generate --niche dark

# Gerar com ideia especifica
mestra generate --niche dark --idea "Os 5 lugares mais assombrados do mundo"

# Simular sem executar (dry-run)
mestra generate --niche dark --dry-run
```

O pipeline executa automaticamente:

| Step | Engine | O que faz |
|------|--------|-----------|
| 1 | Content | Gera ideia e roteiro (HOOK -> SETUP -> ESCALADA -> TWIST -> PAYOFF -> LOOP) |
| 2 | Scene | Segmenta roteiro em cenas (max 2.5s cada) |
| 3 | Voice | Gera narracao via ElevenLabs (TTS) por cena |
| 4 | Visual | Busca clips no Pexels (fallback para DALL-E) |
| 5 | Pacing | Aplica controle de ritmo, zoom, transicoes |
| 6 | Render | Renderiza video via FFmpeg com legendas e musica |
| 7 | Thumbnail | Gera thumbnails via IA com scoring CTR |
| 8 | Upload | Publica no YouTube com titulo, descricao e tags |

### Consultar status

```bash
# Ver status dos pipelines
mestra status

# Status de um pipeline especifico
mestra status --pipeline-id <id>
```

### Listar videos

```bash
# Listar todos os videos
mestra videos

# Filtrar por nicho
mestra videos --niche dark --limit 10
```

### Ver configuracao

```bash
# Ver APIs configuradas
mestra config

# Validar se tudo esta OK
mestra config --validate
```

### Iniciar scheduler (metricas + learning)

```bash
# Roda em foreground — coleta metricas a cada 6h e learning loop diario
mestra start
```

## Desenvolvimento

```bash
# Modo watch (recarrega ao salvar)
npm run dev

# Rodar testes
npm test

# Testes em modo watch
npm run test:watch

# Testes com cobertura
npm run test:coverage

# Type check
npm run typecheck

# Prisma Studio (visualizar banco)
npm run db:studio
```

## Estrutura do Projeto

```
src/
├── cli/              # Comandos CLI (commander.js)
├── contracts/        # Tipos compartilhados (entidades, enums, value objects)
├── core/             # Pipeline orchestrator, context, logger, state machines, errors
├── engines/          # 11 engines especializadas
│   ├── content/      # Gera ideias e roteiros via LLM
│   ├── scene/        # Segmenta em cenas com duracao e queries
│   ├── voice/        # TTS via ElevenLabs
│   ├── visual/       # Busca assets no Pexels (fallback DALL-E)
│   ├── pacing/       # Controle de ritmo (max 2.5s, zoom, transicoes)
│   ├── render/       # FFmpeg rendering (compose, stitch, subtitles, music)
│   ├── thumbnail/    # Gera thumbnails com scoring CTR
│   ├── upload/       # Upload YouTube + metadata via LLM
│   ├── performance/  # Coleta metricas YouTube Analytics
│   ├── strategy/     # Gera content plan baseado em dados
│   └── learning/     # Ajusta pesos automaticamente
├── services/         # Clients de APIs externas (OpenRouter, ElevenLabs, Pexels, FFmpeg, YouTube)
├── infrastructure/   # Database, storage, scheduler, observability
└── utils/            # Retry, validation, constants
```

## Como funciona o Learning Loop

```
1. Videos sao publicados no YouTube
2. Performance Engine coleta metricas a cada 6h (views, retencao, CTR)
3. Learning Engine analisa videos com baixa performance
4. Pesos sao ajustados (hooks, templates, pacing) — max 10% por ajuste
5. Strategy Engine gera novo content plan baseado nos dados
6. Proximo video usa os pesos otimizados
```

O learning ativa automaticamente apos 5 videos analisados. Antes disso (cold start), usa valores padrao.

## Metricas-alvo

| Metrica | Meta |
|---------|------|
| Tempo de pipeline | < 10 min |
| Taxa de falha | < 5% |
| Throughput | 10+ videos/dia |
| Retencao media | > 45% |
| CTR | > 6% |

## Resiliencia

- **Retry automatico**: 3 tentativas com backoff (1s, 2s, 4s) por step
- **Resume de falha**: pipeline retoma do ponto onde parou
- **Fallback visual**: Pexels sem resultado -> gera via DALL-E
- **Persistencia por step**: estado salvo no banco apos cada etapa
- **State machines**: transicoes validadas para Pipeline, Scene, VideoMetrics, Series

## Licenca

Privado.
