import { v4 as uuid } from 'uuid'
import type { VideoMetrics } from '../../contracts/index.js'
import { VideoMetricsStatus } from '../../contracts/index.js'
import type { YouTubeAnalyticsClient } from '../../services/youtube-analytics.js'

export interface CollectMetricsParams {
  youtubeVideoId: string
  pipelineId: string
  publishedAt: Date
  analytics: YouTubeAnalyticsClient
}

export async function collectMetrics(params: CollectMetricsParams): Promise<VideoMetrics> {
  const { youtubeVideoId, pipelineId, publishedAt, analytics } = params

  try {
    const data = await analytics.getVideoMetrics(youtubeVideoId)

    let retentionCurve: { seconds: number[] } | undefined
    try {
      const curve = await analytics.getRetentionCurve(youtubeVideoId)
      retentionCurve = { seconds: curve }
    } catch {
      // Retention curve is optional
    }

    return {
      id: uuid(),
      pipelineId,
      youtubeVideoId,
      publishedAt,
      views: data.views,
      likes: data.likes,
      comments: data.comments,
      retention: data.retention,
      ctr: data.ctr,
      avgWatchTime: data.avgWatchTime,
      dropOffPoints: [],
      retentionCurve,
      status: VideoMetricsStatus.COLLECTED,
      createdAt: new Date(),
    }
  } catch {
    return {
      id: uuid(),
      pipelineId,
      youtubeVideoId,
      publishedAt,
      views: 0,
      likes: 0,
      comments: 0,
      dropOffPoints: [],
      status: VideoMetricsStatus.FAILED,
      createdAt: new Date(),
    }
  }
}
