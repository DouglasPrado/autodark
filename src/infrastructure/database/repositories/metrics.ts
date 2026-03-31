import type { PrismaClient } from '@prisma/client'
import type { VideoMetrics } from '../../../contracts/index.js'

function toVideoMetrics(row: any): VideoMetrics {
  return {
    id: row.id,
    pipelineId: row.pipelineId,
    youtubeVideoId: row.youtubeVideoId,
    publishedAt: row.publishedAt,
    views: row.views,
    likes: row.likes,
    comments: row.comments,
    retention: row.retention ?? undefined,
    ctr: row.ctr ?? undefined,
    avgWatchTime: row.avgWatchTime ?? undefined,
    dropOffPoints: row.dropOffPoints ? JSON.parse(row.dropOffPoints) : [],
    retentionCurve: row.retentionCurve ? JSON.parse(row.retentionCurve) : undefined,
    status: row.status,
    createdAt: row.createdAt,
  }
}

export interface VideoMetricsRepository {
  save(metrics: VideoMetrics): Promise<VideoMetrics>
  findByPipelineId(pipelineId: string): Promise<VideoMetrics | null>
  findByYouTubeId(youtubeVideoId: string): Promise<VideoMetrics | null>
  findRecent(limit: number): Promise<VideoMetrics[]>
}

export function createVideoMetricsRepository(prisma: PrismaClient): VideoMetricsRepository {
  return {
    async save(metrics) {
      const row = await prisma.videoMetrics.create({
        data: {
          id: metrics.id,
          pipelineId: metrics.pipelineId,
          youtubeVideoId: metrics.youtubeVideoId,
          publishedAt: metrics.publishedAt,
          views: metrics.views,
          likes: metrics.likes,
          comments: metrics.comments,
          retention: metrics.retention ?? null,
          ctr: metrics.ctr ?? null,
          avgWatchTime: metrics.avgWatchTime ?? null,
          dropOffPoints: JSON.stringify(metrics.dropOffPoints),
          retentionCurve: metrics.retentionCurve ? JSON.stringify(metrics.retentionCurve) : null,
          status: metrics.status,
        },
      })
      return toVideoMetrics(row)
    },

    async findByPipelineId(pipelineId) {
      const row = await prisma.videoMetrics.findFirst({ where: { pipelineId } })
      return row ? toVideoMetrics(row) : null
    },

    async findByYouTubeId(youtubeVideoId) {
      const row = await prisma.videoMetrics.findFirst({ where: { youtubeVideoId } })
      return row ? toVideoMetrics(row) : null
    },

    async findRecent(limit) {
      const rows = await prisma.videoMetrics.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
      return rows.map(toVideoMetrics)
    },
  }
}
