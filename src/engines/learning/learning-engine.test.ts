import { describe, it, expect } from 'vitest'
import { analyzeFailures } from './analyze.js'
import { adjustWeights, createDefaultWeights } from './weights.js'
import { shouldActivateLearning } from './optimize.js'
import { createLearningEngine } from './index.js'
import type { VideoMetrics, LearningState } from '../../contracts/index.js'
import { VideoMetricsStatus, LearningStatus } from '../../contracts/index.js'
import { MIN_VIDEOS_FOR_LEARNING, MAX_WEIGHT_ADJUSTMENT } from '../../utils/constants.js'

function makeMetrics(overrides: Partial<VideoMetrics> = {}): VideoMetrics {
  return {
    id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt1',
    publishedAt: new Date(), views: 1000, likes: 50, comments: 10,
    retention: 30, ctr: 3, avgWatchTime: 15,
    dropOffPoints: [3, 7], status: VideoMetricsStatus.COLLECTED,
    createdAt: new Date(), ...overrides,
  }
}

function makeState(overrides: Partial<LearningState> = {}): LearningState {
  return {
    ...createDefaultWeights('dark'),
    ...overrides,
  }
}

describe('analyzeFailures', () => {
  it('identifies videos with low retention (< 45%)', () => {
    const metrics = [
      makeMetrics({ id: 'm1', retention: 30 }),
      makeMetrics({ id: 'm2', retention: 55 }),
      makeMetrics({ id: 'm3', retention: 20 }),
    ]
    const insights = analyzeFailures(metrics)
    expect(insights.lowRetention).toHaveLength(2) // m1 and m3
  })

  it('identifies videos with low CTR (< 6%)', () => {
    const metrics = [
      makeMetrics({ id: 'm1', ctr: 3 }),
      makeMetrics({ id: 'm2', ctr: 8 }),
    ]
    const insights = analyzeFailures(metrics)
    expect(insights.lowCtr).toHaveLength(1)
  })

  it('detects common drop-off patterns', () => {
    const metrics = [
      makeMetrics({ dropOffPoints: [2, 5] }),
      makeMetrics({ dropOffPoints: [2, 8] }),
      makeMetrics({ dropOffPoints: [3, 5] }),
    ]
    const insights = analyzeFailures(metrics)
    expect(insights.commonDropOffs.length).toBeGreaterThan(0)
  })

  it('returns empty insights for empty metrics', () => {
    const insights = analyzeFailures([])
    expect(insights.lowRetention).toHaveLength(0)
    expect(insights.lowCtr).toHaveLength(0)
  })
})

describe('createDefaultWeights', () => {
  it('creates learning state with default weights for niche', () => {
    const state = createDefaultWeights('dark')
    expect(state.niche).toBe('dark')
    expect(state.isActive).toBe(false)
    expect(state.status).toBe(LearningStatus.INACTIVE)
    expect(state.analyzedVideos).toBe(0)
    expect(state.hookWeights.curiosity).toBeGreaterThan(0)
  })
})

describe('adjustWeights', () => {
  it('adjusts weights within max adjustment limit', () => {
    const state = makeState()
    const adjusted = adjustWeights(state, { lowRetention: [], lowCtr: [], commonDropOffs: [2] })
    const diff = Math.abs(adjusted.hookWeights.curiosity - state.hookWeights.curiosity)
    expect(diff).toBeLessThanOrEqual(MAX_WEIGHT_ADJUSTMENT)
  })

  it('increments analyzedVideos', () => {
    const state = makeState({ analyzedVideos: 3 })
    const adjusted = adjustWeights(state, { lowRetention: [], lowCtr: [], commonDropOffs: [] })
    expect(adjusted.analyzedVideos).toBeGreaterThan(3)
  })
})

describe('shouldActivateLearning', () => {
  it('returns false when analyzed videos < minimum', () => {
    expect(shouldActivateLearning(3)).toBe(false)
  })

  it('returns true when analyzed videos >= minimum', () => {
    expect(shouldActivateLearning(MIN_VIDEOS_FOR_LEARNING)).toBe(true)
    expect(shouldActivateLearning(10)).toBe(true)
  })
})

describe('LearningEngine (facade)', () => {
  it('analyzes metrics and adjusts weights', () => {
    const engine = createLearningEngine()
    const metrics = [
      makeMetrics({ retention: 25, ctr: 2 }),
      makeMetrics({ retention: 50, ctr: 7 }),
    ]
    const state = makeState()
    const result = engine.process(state, metrics)

    expect(result.state.analyzedVideos).toBeGreaterThan(0)
    expect(result.insights).toBeDefined()
  })

  it('activates learning when threshold met', () => {
    const engine = createLearningEngine()
    const metrics = [makeMetrics()]
    const state = makeState({ analyzedVideos: MIN_VIDEOS_FOR_LEARNING - 1 })
    const result = engine.process(state, metrics)

    expect(result.state.isActive).toBe(true)
    expect(result.state.status).toBe(LearningStatus.ACTIVE)
  })
})
