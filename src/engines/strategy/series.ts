import { v4 as uuid } from 'uuid'
import type { Series } from '../../contracts/index.js'
import { SeriesStatus } from '../../contracts/index.js'
import { PipelineError } from '../../core/errors.js'

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

export function addEpisode(series: Series, videoId: string): Series {
  const status = series.status === SeriesStatus.PLANNING
    ? SeriesStatus.IN_PROGRESS
    : series.status

  return {
    ...series,
    episodes: [...series.episodes, videoId],
    status,
  }
}

export function completeSeries(series: Series): Series {
  if (series.episodes.length < series.episodeCount) {
    throw new PipelineError(
      'SERIES_INCOMPLETE',
      `Série tem ${series.episodes.length}/${series.episodeCount} episódios — não pode ser concluída`,
    )
  }

  return { ...series, status: SeriesStatus.COMPLETED }
}
