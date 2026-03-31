import { v4 as uuid } from 'uuid'
import type { Series } from '../../contracts/index.js'
import { SeriesStatus } from '../../contracts/index.js'

export function createSeries(title: string, topic: string, episodeCount: number): Series {
  return {
    id: uuid(),
    title,
    topic,
    episodeCount,
    episodes: [],
    status: SeriesStatus.PLANNING,
    createdAt: new Date(),
  }
}
