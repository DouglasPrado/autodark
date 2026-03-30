import type { SeriesStatus } from '../enums/series-status.js'

/** Série temática de vídeos (ex: "10 Mistérios Não Resolvidos") */
export interface Series {
  readonly id: string
  readonly title: string
  readonly topic: string
  readonly episodeCount: number
  readonly episodes: string[]
  readonly status: SeriesStatus
  readonly createdAt: Date
}
