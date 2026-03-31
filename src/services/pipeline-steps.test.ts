import { describe, it, expect } from 'vitest'
import { createPipelineSteps, type PipelineClients } from './pipeline-steps.js'
import { createMockLLMClient } from './openrouter.js'
import { createMockTTSClient } from './elevenlabs.js'
import { createMockPexelsClient } from './pexels.js'
import { createMockFFmpegClient } from './ffmpeg.js'
import { createMockImageAIClient } from './image-ai.js'
import { createMockYouTubeClient } from './youtube-upload.js'
import { createPipelineOrchestrator, type PipelineRepository } from '../core/pipeline.js'
import { createLogger } from '../core/logger.js'
import { PipelineStatus } from '../contracts/index.js'
import type { PipelineContext } from '../contracts/index.js'

const mockScriptResponse = {
  hook: 'Você não vai acreditar no que existe debaixo da terra.',
  setup: 'Em 1947 um grupo descobriu algo incrível.',
  escalada: 'O que encontraram mudou tudo.',
  twist: 'Ninguém nunca voltou para confirmar.',
  payoff: 'As evidências foram destruídas.',
  loop: 'O próximo lugar é ainda mais aterrorizante.',
}

function createAllMocks(): PipelineClients {
  return {
    llm: createMockLLMClient({
      generate: async () => 'Os 5 lugares mais assombrados do mundo',
      generateStructured: async (prompt: string) => {
        if (prompt.includes('hook') && prompt.includes('variantes')) {
          return { hooks: ['Hook A', 'Hook B', 'Hook C'] }
        }
        if (prompt.includes('conceitos') || prompt.includes('thumbnail')) {
          return { concepts: ['dark forest', 'haunted mansion', 'scary shadow'] }
        }
        if (prompt.includes('metadados') || prompt.includes('Metadados')) {
          return { title: 'Título Incrível', description: 'Descrição', tags: ['dark', 'mystery'] }
        }
        // Default: script generation
        return mockScriptResponse
      },
    }),
    tts: createMockTTSClient({
      generateVoice: async () => ({ audioUrl: '/audio/mock.mp3', duration: 2.0 }),
    }),
    pexels: createMockPexelsClient({
      searchVideos: async () => [
        { id: 'v1', url: 'https://pexels.com/v1.mp4', duration: 3 },
      ],
    }),
    ffmpeg: createMockFFmpegClient({
      execute: async () => ({ outputPath: '/tmp/out.mp4', durationMs: 50 }),
    }),
    imageAI: createMockImageAIClient({
      generateImage: async () => ({ imageUrl: 'https://dalle.ai/thumb.png' }),
    }),
    youtube: createMockYouTubeClient({
      uploadVideo: async () => ({ videoId: 'yt-final-123' }),
      setThumbnail: async () => {},
    }),
  }
}

function createMockRepo(): PipelineRepository {
  const store = new Map<string, PipelineContext>()
  return {
    save: async (ctx) => { store.set(ctx.id, ctx); return ctx },
    findById: async (id) => store.get(id) ?? null,
    update: async (id, data) => {
      const existing = store.get(id)!
      const updated = { ...existing, ...data, updatedAt: new Date() }
      store.set(id, updated)
      return updated
    },
  }
}

describe('createPipelineSteps', () => {
  it('returns all pipeline steps in correct order', () => {
    const clients = createAllMocks()
    const steps = createPipelineSteps({
      clients,
      voiceId: 'voice-1',
      storagePath: './storage',
      outputDir: '/tmp',
    })

    const names = steps.map((s) => s.name)
    expect(names).toEqual([
      'content',
      'scene',
      'voice',
      'visual',
      'pacing',
      'render',
      'thumbnail',
      'upload',
    ])
  })
})

describe('Pipeline E2E', () => {
  it('executes full pipeline from niche to videoId', async () => {
    const clients = createAllMocks()
    const steps = createPipelineSteps({
      clients,
      voiceId: 'voice-1',
      storagePath: './storage',
      outputDir: '/tmp',
    })

    const orchestrator = createPipelineOrchestrator({
      repo: createMockRepo(),
      steps,
      logger: createLogger({ write: () => {}, level: 'error' }),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })

    const result = await orchestrator.execute({ niche: 'dark' })

    expect(result.status).toBe(PipelineStatus.COMPLETED)
    expect(result.idea).toBeDefined()
    expect(result.script).toBeDefined()
    expect(result.scenes).toBeDefined()
    expect(result.scenes!.length).toBeGreaterThan(0)
    expect(result.audioSegments).toBeDefined()
    expect(result.clips).toBeDefined()
    expect(result.videoPath).toBeDefined()
    expect(result.thumbnailPath).toBeDefined()
    expect(result.videoId).toBe('yt-final-123')
    expect(result.metadata).toBeDefined()
    expect(result.metadata!.title).toBe('Título Incrível')
  })

  it('executes with manual idea', async () => {
    const clients = createAllMocks()
    const steps = createPipelineSteps({
      clients,
      voiceId: 'voice-1',
      storagePath: './storage',
      outputDir: '/tmp',
    })

    const orchestrator = createPipelineOrchestrator({
      repo: createMockRepo(),
      steps,
      logger: createLogger({ write: () => {}, level: 'error' }),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })

    const result = await orchestrator.execute({ niche: 'dark', idea: 'Minha ideia manual' })
    expect(result.status).toBe(PipelineStatus.COMPLETED)
    expect(result.idea!.text).toBe('Minha ideia manual')
    expect(result.idea!.source).toBe('manual')
  })

  it('persists structured logs throughout execution', async () => {
    const logs: string[] = []
    const clients = createAllMocks()
    const steps = createPipelineSteps({
      clients,
      voiceId: 'voice-1',
      storagePath: './storage',
      outputDir: '/tmp',
    })

    const orchestrator = createPipelineOrchestrator({
      repo: createMockRepo(),
      steps,
      logger: createLogger({ write: (line) => logs.push(line), level: 'info' }),
      retryOptions: { maxAttempts: 1, backoffMs: [0] },
    })

    await orchestrator.execute({ niche: 'dark' })

    // Should have logs for pipeline start + each step completion
    expect(logs.length).toBeGreaterThanOrEqual(9) // 1 start + 8 steps
    const parsed = logs.map((l) => JSON.parse(l))
    const stepLogs = parsed.filter((l) => l.step)
    expect(stepLogs.length).toBe(8) // one per step
  })
})
