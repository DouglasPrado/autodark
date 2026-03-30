import { describe, it, expect } from 'vitest'
import { createVisualEngine } from './index.js'
import { createMockPexelsClient } from '../../services/pexels.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus, ClipSource } from '../../contracts/index.js'

function makeScene(id: string, query: string): Scene {
  return {
    id,
    scriptId: 'script-1',
    order: 0,
    text: 'Texto da cena',
    duration: 2,
    start: 0,
    end: 2,
    visualQuery: query,
    segmentType: SegmentType.HOOK,
    status: SceneStatus.PENDING,
    createdAt: new Date(),
  }
}

describe('VisualEngine', () => {
  it('searches and returns ranked clips for a scene', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [
        { id: 'v1', url: 'https://pexels.com/v1.mp4', duration: 5 },
        { id: 'v2', url: 'https://pexels.com/v2.mp4', duration: 3 },
      ],
    })
    const engine = createVisualEngine({ pexels, storagePath: './storage' })
    const clips = await engine.searchClips(makeScene('s1', 'dark cave'))

    expect(clips.length).toBeGreaterThanOrEqual(1)
    expect(clips[0]!.sceneId).toBe('s1')
    expect(clips[0]!.source).toBe(ClipSource.PEXELS)
    expect(clips[0]!.query).toBe('dark cave')
    expect(clips[0]!.score).toBeGreaterThanOrEqual(0)
  })

  it('ranks clips by relevance (shorter duration preferred for scenes)', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [
        { id: 'long', url: 'https://pexels.com/long.mp4', duration: 30 },
        { id: 'short', url: 'https://pexels.com/short.mp4', duration: 3 },
        { id: 'mid', url: 'https://pexels.com/mid.mp4', duration: 10 },
      ],
    })
    const engine = createVisualEngine({ pexels, storagePath: './storage' })
    const clips = await engine.searchClips(makeScene('s1', 'cave'))

    // Shorter clips should score higher (closer to scene duration)
    expect(clips[0]!.score).toBeGreaterThanOrEqual(clips[clips.length - 1]!.score)
  })

  it('returns empty clips when Pexels has no results', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [],
    })
    const engine = createVisualEngine({ pexels, storagePath: './storage' })
    const clips = await engine.searchClips(makeScene('s1', 'xyznonexistent'))
    expect(clips).toHaveLength(0)
  })

  it('processes all scenes and returns best clip per scene', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async (query) => [
        { id: `v-${query}`, url: `https://pexels.com/${query}.mp4`, duration: 4 },
      ],
    })
    const engine = createVisualEngine({ pexels, storagePath: './storage' })
    const scenes = [
      makeScene('s1', 'dark cave'),
      makeScene('s2', 'snow mountain'),
    ]
    const clips = await engine.processAll(scenes)

    expect(clips).toHaveLength(2)
    expect(clips[0]!.sceneId).toBe('s1')
    expect(clips[1]!.sceneId).toBe('s2')
  })

  it('assigns localPath based on storage path', async () => {
    const pexels = createMockPexelsClient({
      searchVideos: async () => [
        { id: 'v1', url: 'https://pexels.com/v1.mp4', duration: 3 },
      ],
    })
    const engine = createVisualEngine({ pexels, storagePath: './storage' })
    const clips = await engine.searchClips(makeScene('s1', 'cave'))

    expect(clips[0]!.localPath).toContain('storage')
  })
})
