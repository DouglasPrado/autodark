import type { VideoMetrics } from '../../contracts/index.js'
import type { YouTubeAnalyticsClient } from '../../services/youtube-analytics.js'
import { collectMetrics } from './metrics.js'
import { detectDropOffPoints } from './retention.js'
import { calculatePerformanceScore } from './scoring.js'

export interface PerformanceEngineConfig {
  analytics: YouTubeAnalyticsClient
}

export interface CollectParams {
  youtubeVideoId: string
  pipelineId: string
  publishedAt: Date
}

export interface PerformanceResult {
  metrics: VideoMetrics
  dropOffPoints: number[]
  performanceScore: number
}

export interface PerformanceEngine {
  collect(params: CollectParams): Promise<PerformanceResult>
}

export function createPerformanceEngine(config: PerformanceEngineConfig): PerformanceEngine {
  const { analytics } = config

  return {
    async collect(params) {
      const metrics = await collectMetrics({ ...params, analytics })

      const dropOffPoints = metrics.retentionCurve
        ? detectDropOffPoints(metrics.retentionCurve.seconds)
        : []

      const metricsWithDropOffs: VideoMetrics = { ...metrics, dropOffPoints }
      const performanceScore = calculatePerformanceScore(metricsWithDropOffs)

      return { metrics: metricsWithDropOffs, dropOffPoints, performanceScore }
    },
  }
}

export { collectMetrics } from './metrics.js'
export { detectDropOffPoints } from './retention.js'
export { calculatePerformanceScore } from './scoring.js'
