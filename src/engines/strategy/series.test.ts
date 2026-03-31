import { describe, it, expect } from 'vitest'
import { createSeries } from './series.js'
import { addEpisode, completeSeries } from './series.js'
import { SeriesStatus } from '../../contracts/index.js'
import { transitionSeries } from '../../core/state-machine.js'

describe('Series management', () => {
  it('creates series with planning status', () => {
    const series = createSeries('10 Mistérios', 'mistérios', 10)
    expect(series.title).toBe('10 Mistérios')
    expect(series.topic).toBe('mistérios')
    expect(series.episodeCount).toBe(10)
    expect(series.episodes).toHaveLength(0)
    expect(series.status).toBe(SeriesStatus.PLANNING)
  })

  it('adds episode to series', () => {
    const series = createSeries('Série', 'dark', 5)
    const updated = addEpisode(series, 'video-1')
    expect(updated.episodes).toHaveLength(1)
    expect(updated.episodes[0]).toBe('video-1')
    expect(updated.status).toBe(SeriesStatus.IN_PROGRESS)
  })

  it('adds multiple episodes', () => {
    let series = createSeries('Série', 'dark', 3)
    series = addEpisode(series, 'v1')
    series = addEpisode(series, 'v2')
    expect(series.episodes).toHaveLength(2)
    expect(series.episodes).toEqual(['v1', 'v2'])
  })

  it('completes series when all episodes added', () => {
    let series = createSeries('Série', 'dark', 2)
    series = addEpisode(series, 'v1')
    series = addEpisode(series, 'v2')
    const completed = completeSeries(series)
    expect(completed.status).toBe(SeriesStatus.COMPLETED)
  })

  it('throws when completing series with missing episodes', () => {
    let series = createSeries('Série', 'dark', 5)
    series = addEpisode(series, 'v1')
    expect(() => completeSeries(series)).toThrow()
  })

  it('validates state transitions via state machine', () => {
    expect(transitionSeries(SeriesStatus.PLANNING, SeriesStatus.IN_PROGRESS)).toBe(SeriesStatus.IN_PROGRESS)
    expect(transitionSeries(SeriesStatus.IN_PROGRESS, SeriesStatus.COMPLETED)).toBe(SeriesStatus.COMPLETED)
    expect(() => transitionSeries(SeriesStatus.COMPLETED, SeriesStatus.PLANNING)).toThrow()
  })
})
