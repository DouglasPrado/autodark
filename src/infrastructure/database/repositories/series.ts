import type { PrismaClient } from '@prisma/client'
import type { Series } from '../../../contracts/index.js'
import { SeriesStatus } from '../../../contracts/index.js'

function toSeries(row: any, episodes: string[] = []): Series {
  return {
    id: row.id,
    title: row.title,
    topic: row.topic,
    episodeCount: row.episodeCount,
    episodes,
    status: row.status as SeriesStatus,
    createdAt: row.createdAt,
  }
}

export interface SeriesRepository {
  save(series: Series): Promise<Series>
  findById(id: string): Promise<Series | null>
  addEpisode(seriesId: string, pipelineId: string, order: number): Promise<void>
}

export function createSeriesRepository(prisma: PrismaClient): SeriesRepository {
  return {
    async save(series) {
      const row = await prisma.series.create({
        data: {
          id: series.id,
          title: series.title,
          topic: series.topic,
          episodeCount: series.episodeCount,
          status: series.status,
        },
      })
      return toSeries(row, [])
    },

    async findById(id) {
      const row = await prisma.series.findUnique({
        where: { id },
        include: { videos: { orderBy: { episodeOrder: 'asc' } } },
      })
      if (!row) return null
      const episodes = row.videos.map((v: any) => v.pipelineId)
      return toSeries(row, episodes)
    },

    async addEpisode(seriesId, pipelineId, order) {
      await prisma.seriesVideo.create({
        data: { seriesId, pipelineId, episodeOrder: order },
      })
    },
  }
}
