import { describe, it, expect } from 'vitest'
import { collectMetrics } from './metrics.js'
import { detectDropOffPoints } from './retention.js'
import { calculatePerformanceScore } from './scoring.js'
import { createPerformanceEngine } from './index.js'
import { createMockYouTubeAnalyticsClient } from '../../services/youtube-analytics.js'
import { VideoMetricsStatus } from '../../contracts/index.js'
import type { VideoMetrics } from '../../contracts/index.js'

const mockAnalyticsResponse = {
  views: 2000, likes: 150, comments: 45,
  retention: 48.5, ctr: 6.8, avgWatchTime: 32.0,
}

describe('collectMetrics', () => {
  it('collects metrics from YouTube Analytics', async () => {
    const analytics = createMockYouTubeAnalyticsClient({
      getVideoMetrics: async () => mockAnalyticsResponse,
      getRetentionCurve: async () => [100, 90, 80, 70, 60, 50, 45, 42],
    })
    const metrics = await collectMetrics({
      youtubeVideoId: 'yt-123',
      pipelineId: 'pipe-1',
      publishedAt: new Date(),
      analytics,
    })

    expect(metrics.id).toBeDefined()
    expect(metrics.youtubeVideoId).toBe('yt-123')
    expect(metrics.pipelineId).toBe('pipe-1')
    expect(metrics.views).toBe(2000)
    expect(metrics.retention).toBe(48.5)
    expect(metrics.ctr).toBe(6.8)
    expect(metrics.status).toBe(VideoMetricsStatus.COLLECTED)
    expect(metrics.retentionCurve).toBeDefined()
  })

  it('returns failed status when analytics throws', async () => {
    const analytics = createMockYouTubeAnalyticsClient({
      getVideoMetrics: async () => { throw new Error('API unavailable') },
    })
    const metrics = await collectMetrics({
      youtubeVideoId: 'yt-123',
      pipelineId: 'pipe-1',
      publishedAt: new Date(),
      analytics,
    })
    expect(metrics.status).toBe(VideoMetricsStatus.FAILED)
    expect(metrics.views).toBe(0)
  })
})

describe('detectDropOffPoints', () => {
  it('detects significant drops in retention curve', () => {
    const curve = [100, 95, 90, 85, 60, 58, 55, 30, 28, 25]
    const dropOffs = detectDropOffPoints(curve)
    expect(dropOffs.length).toBeGreaterThan(0)
    // Should detect the big drops (85→60 at index 4, 55→30 at index 7)
    expect(dropOffs).toContain(4)
    expect(dropOffs).toContain(7)
  })

  it('returns empty for smooth curve', () => {
    const curve = [100, 98, 96, 94, 92, 90, 88, 86]
    const dropOffs = detectDropOffPoints(curve)
    expect(dropOffs).toHaveLength(0)
  })

  it('handles empty curve', () => {
    expect(detectDropOffPoints([])).toHaveLength(0)
  })
})

describe('calculatePerformanceScore', () => {
  it('returns score between 0 and 100', () => {
    const metrics: VideoMetrics = {
      id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt-1',
      publishedAt: new Date(), views: 2000, likes: 150, comments: 45,
      retention: 48.5, ctr: 6.8, avgWatchTime: 32,
      dropOffPoints: [4, 7], status: VideoMetricsStatus.COLLECTED,
      createdAt: new Date(),
    }
    const score = calculatePerformanceScore(metrics)
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })

  it('scores higher for better retention', () => {
    const base = {
      id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt-1',
      publishedAt: new Date(), views: 1000, likes: 50, comments: 10,
      ctr: 5, avgWatchTime: 20, dropOffPoints: [] as number[],
      status: VideoMetricsStatus.COLLECTED as const, createdAt: new Date(),
    }
    const low: VideoMetrics = { ...base, retention: 20 }
    const high: VideoMetrics = { ...base, retention: 70 }
    expect(calculatePerformanceScore(high)).toBeGreaterThan(calculatePerformanceScore(low))
  })

  it('scores higher for better CTR', () => {
    const base = {
      id: 'm1', pipelineId: 'p1', youtubeVideoId: 'yt-1',
      publishedAt: new Date(), views: 1000, likes: 50, comments: 10,
      retention: 45, avgWatchTime: 20, dropOffPoints: [] as number[],
      status: VideoMetricsStatus.COLLECTED as const, createdAt: new Date(),
    }
    const low: VideoMetrics = { ...base, ctr: 2 }
    const high: VideoMetrics = { ...base, ctr: 10 }
    expect(calculatePerformanceScore(high)).toBeGreaterThan(calculatePerformanceScore(low))
  })
})

describe('PerformanceEngine (facade)', () => {
  it('collects metrics with drop-off detection and score', async () => {
    const analytics = createMockYouTubeAnalyticsClient({
      getVideoMetrics: async () => mockAnalyticsResponse,
      getRetentionCurve: async () => [100, 90, 80, 55, 50, 48, 45, 42],
    })
    const engine = createPerformanceEngine({ analytics })
    const result = await engine.collect({
      youtubeVideoId: 'yt-456',
      pipelineId: 'pipe-2',
      publishedAt: new Date(),
    })

    expect(result.metrics.status).toBe(VideoMetricsStatus.COLLECTED)
    expect(result.metrics.views).toBe(2000)
    expect(result.dropOffPoints.length).toBeGreaterThanOrEqual(0)
    expect(result.performanceScore).toBeGreaterThan(0)
    expect(result.performanceScore).toBeLessThanOrEqual(100)
  })
})
