import { describe, it, expect } from 'vitest'
import { generateConcepts } from './concepts.js'
import { generateVariants } from './generate.js'
import { scoreCTR } from './score.js'
import { selectBest } from './select.js'
import { createThumbnailEngine } from './index.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import { createMockImageAIClient } from '../../services/image-ai.js'
import type { Idea, Thumbnail } from '../../contracts/index.js'

const mockIdea: Idea = {
  id: 'idea-1',
  niche: 'dark',
  text: 'Os 5 lugares mais assombrados do mundo',
  source: 'strategy',
  createdAt: new Date(),
}

describe('generateConcepts', () => {
  it('generates visual concepts from idea via LLM', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        concepts: [
          'Abandoned hospital with fog',
          'Dark corridor with shadow figure',
          'Spooky mansion at night',
        ],
      }),
    })
    const concepts = await generateConcepts({ idea: mockIdea, llm })
    expect(concepts).toHaveLength(3)
    expect(concepts[0]).toContain('hospital')
  })
})

describe('generateVariants', () => {
  it('generates thumbnail variants from concepts', async () => {
    let callCount = 0
    const imageAI = createMockImageAIClient({
      generateImage: async () => {
        callCount++
        return { imageUrl: `https://dalle.ai/img${callCount}.png` }
      },
    })
    const thumbnails = await generateVariants({
      concepts: ['concept A', 'concept B'],
      videoId: 'vid-1',
      imageAI,
      storagePath: './storage',
    })
    expect(thumbnails).toHaveLength(2)
    expect(thumbnails[0]!.videoId).toBe('vid-1')
    expect(thumbnails[0]!.imageUrl).toContain('img1')
    expect(thumbnails[1]!.imageUrl).toContain('img2')
    expect(thumbnails[0]!.isSelected).toBe(false)
  })
})

describe('scoreCTR', () => {
  it('returns score between 0 and 100', () => {
    const thumbnail: Thumbnail = {
      id: 't1', videoId: 'v1',
      concepts: ['dark spooky abandoned'],
      imageUrl: 'https://img.png', localPath: '/t.png',
      ctrScore: 0, isSelected: false, createdAt: new Date(),
    }
    const score = scoreCTR(thumbnail)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores higher for thumbnails with more concepts', () => {
    const few: Thumbnail = {
      id: 't1', videoId: 'v1', concepts: ['one'],
      imageUrl: 'a', localPath: 'a', ctrScore: 0, isSelected: false, createdAt: new Date(),
    }
    const many: Thumbnail = {
      id: 't2', videoId: 'v1', concepts: ['one', 'two', 'three', 'four'],
      imageUrl: 'b', localPath: 'b', ctrScore: 0, isSelected: false, createdAt: new Date(),
    }
    expect(scoreCTR(many)).toBeGreaterThanOrEqual(scoreCTR(few))
  })
})

describe('selectBest', () => {
  it('selects thumbnail with highest CTR score', () => {
    const thumbnails: Thumbnail[] = [
      { id: 't1', videoId: 'v1', concepts: ['a'], imageUrl: 'a', localPath: 'a', ctrScore: 60, isSelected: false, createdAt: new Date() },
      { id: 't2', videoId: 'v1', concepts: ['b'], imageUrl: 'b', localPath: 'b', ctrScore: 85, isSelected: false, createdAt: new Date() },
      { id: 't3', videoId: 'v1', concepts: ['c'], imageUrl: 'c', localPath: 'c', ctrScore: 72, isSelected: false, createdAt: new Date() },
    ]
    const best = selectBest(thumbnails)
    expect(best.id).toBe('t2')
    expect(best.isSelected).toBe(true)
  })

  it('throws on empty array', () => {
    expect(() => selectBest([])).toThrow()
  })
})

describe('ThumbnailEngine (facade)', () => {
  it('processes idea into selected thumbnail', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        concepts: ['dark forest', 'haunted mansion', 'scary shadow'],
      }),
    })
    let imgCount = 0
    const imageAI = createMockImageAIClient({
      generateImage: async () => {
        imgCount++
        return { imageUrl: `https://dalle.ai/${imgCount}.png` }
      },
    })

    const engine = createThumbnailEngine({ llm, imageAI, storagePath: './storage' })
    const result = await engine.process({ idea: mockIdea, videoId: 'vid-1' })

    expect(result.selected.isSelected).toBe(true)
    expect(result.selected.ctrScore).toBeGreaterThan(0)
    expect(result.variants.length).toBeGreaterThanOrEqual(3)
  })
})
