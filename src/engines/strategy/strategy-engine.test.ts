import { describe, it, expect } from 'vitest'
import { generateContentPlan } from './plan.js'
import { clusterTopics } from './cluster.js'
import { prioritizeIdeas } from './prioritize.js'
import { createStrategyEngine } from './index.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import type { Idea, VideoMetrics } from '../../contracts/index.js'
import { VideoMetricsStatus } from '../../contracts/index.js'

describe('generateContentPlan', () => {
  it('generates content plan with topics via LLM', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        topics: ['mistérios submarinos', 'cidades abandonadas', 'fenômenos inexplicáveis'],
      }),
    })
    const plan = await generateContentPlan({ niche: 'dark', llm })
    expect(plan.id).toBeDefined()
    expect(plan.niche).toBe('dark')
    expect(plan.topics).toHaveLength(3)
    expect(plan.generatedAt).toBeInstanceOf(Date)
  })

  it('incorporates metrics into plan generation', async () => {
    let capturedPrompt = ''
    const llm = createMockLLMClient({
      generateStructured: async (prompt) => {
        capturedPrompt = prompt
        return { topics: ['topic1'] }
      },
    })
    const metrics: VideoMetrics[] = [{
      id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt1',
      publishedAt: new Date(), views: 5000, likes: 300, comments: 50,
      retention: 55, ctr: 8, avgWatchTime: 35,
      dropOffPoints: [], status: VideoMetricsStatus.COLLECTED, createdAt: new Date(),
    }]
    await generateContentPlan({ niche: 'dark', llm, metrics })
    expect(capturedPrompt).toContain('5000')
  })
})

describe('clusterTopics', () => {
  it('groups similar topics together', () => {
    const topics = [
      'cidades abandonadas', 'cidades fantasma', 'ruínas urbanas',
      'oceano profundo', 'criaturas marinhas',
      'fenômenos inexplicáveis',
    ]
    const clusters = clusterTopics(topics)
    expect(clusters.length).toBeGreaterThan(0)
    expect(clusters.length).toBeLessThanOrEqual(topics.length)
  })

  it('returns empty for empty input', () => {
    expect(clusterTopics([])).toHaveLength(0)
  })
})

describe('prioritizeIdeas', () => {
  it('sorts ideas by metrics potential (with metrics)', () => {
    const ideas: Idea[] = [
      { id: 'i1', niche: 'dark', text: 'Low potential', source: 'strategy', createdAt: new Date() },
      { id: 'i2', niche: 'dark', text: 'High potential topic fenômenos', source: 'strategy', createdAt: new Date() },
    ]
    const metrics: VideoMetrics[] = [{
      id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt1',
      publishedAt: new Date(), views: 5000, likes: 300, comments: 50,
      retention: 55, ctr: 8, avgWatchTime: 35,
      dropOffPoints: [], status: VideoMetricsStatus.COLLECTED, createdAt: new Date(),
    }]
    const sorted = prioritizeIdeas(ideas, metrics)
    expect(sorted).toHaveLength(2)
  })

  it('returns ideas as-is when no metrics', () => {
    const ideas: Idea[] = [
      { id: 'i1', niche: 'dark', text: 'Idea A', source: 'manual', createdAt: new Date() },
    ]
    const sorted = prioritizeIdeas(ideas)
    expect(sorted).toHaveLength(1)
    expect(sorted[0]!.id).toBe('i1')
  })
})

describe('StrategyEngine (facade)', () => {
  it('generates plan and clusters topics', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        topics: ['cidades abandonadas', 'cidades fantasma', 'oceano profundo', 'criaturas marinhas'],
      }),
    })
    const engine = createStrategyEngine({ llm })
    const result = await engine.generatePlan({ niche: 'dark' })

    expect(result.plan.topics.length).toBeGreaterThan(0)
    expect(result.clusters.length).toBeGreaterThan(0)
  })
})
