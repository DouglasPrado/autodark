import type { VideoMetricsStatus } from '../enums/video-metrics-status.js'
import type { RetentionCurve } from '../value-objects/retention-curve.js'

/** Métricas reais de performance coletadas via YouTube Analytics API */
export interface VideoMetrics {
  readonly id: string
  readonly pipelineId: string
  readonly youtubeVideoId: string
  readonly publishedAt: Date
  readonly views: number
  readonly likes: number
  readonly comments: number
  readonly retention?: number
  readonly ctr?: number
  readonly avgWatchTime?: number
  readonly dropOffPoints: number[]
  readonly retentionCurve?: RetentionCurve
  readonly status: VideoMetricsStatus
  readonly createdAt: Date
}
