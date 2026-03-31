import { describe, it, expect } from 'vitest'
import { createVisualEngineWithFallback } from './fallback.js'
import { createMockPexelsClient } from '../../services/pexels.js'
import { createMockImageAIClient } from '../../services/image-ai.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus, ClipSource } from '../../contracts/index.js'

function makeScene(id: string, query: string): Scene {
  return {
    id, scriptId: 'script-1', order: 0, text: 'Texto',
    duration: 2, start: 0, end: 2, visualQuery: query,
    segmentType: SegmentType.HOOK, status: SceneStatus.PENDING, createdAt: new Date(),
  }
}

describe('Visual Engine Fallback (Pexels → DALL-E)', () => {
  it('uses Pexels when results are available', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [{ id: 'v1', url: 'https://pexels.com/v1.mp4', duration: 3 }],
    })
    const imageAI = createMockImageAIClient()

    const engine = createVisualEngineWithFallback({ pexels, imageAI, storagePath: './storage' })
    const clip = await engine.getClipForScene(makeScene('s1', 'dark cave'))

    expect(clip).toBeDefined()
    expect(clip!.source).toBe(ClipSource.PEXELS)
  })

  it('falls back to DALL-E when Pexels returns empty', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [],
    })
    const imageAI = createMockImageAIClient({
      generateImage: async () => ({ imageUrl: 'https://dalle.ai/fallback.png' }),
    })

    const engine = createVisualEngineWithFallback({ pexels, imageAI, storagePath: './storage' })
    const clip = await engine.getClipForScene(makeScene('s1', 'nonexistent'))

    expect(clip).toBeDefined()
    expect(clip!.source).toBe(ClipSource.DALLE)
    expect(clip!.mediaUrl).toContain('dalle.ai')
  })

  it('falls back to DALL-E when Pexels throws', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => { throw new Error('Pexels rate limit') },
    })
    const imageAI = createMockImageAIClient({
      generateImage: async () => ({ imageUrl: 'https://dalle.ai/recovered.png' }),
    })

    const engine = createVisualEngineWithFallback({ pexels, imageAI, storagePath: './storage' })
    const clip = await engine.getClipForScene(makeScene('s1', 'cave'))

    expect(clip).toBeDefined()
    expect(clip!.source).toBe(ClipSource.DALLE)
  })

  it('returns undefined when both Pexels and DALL-E fail', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => { throw new Error('Pexels down') },
    })
    const imageAI = createMockImageAIClient({
      generateImage: async () => { throw new Error('DALL-E down') },
    })

    const engine = createVisualEngineWithFallback({ pexels, imageAI, storagePath: './storage' })
    const clip = await engine.getClipForScene(makeScene('s1', 'cave'))

    expect(clip).toBeUndefined()
  })
})
