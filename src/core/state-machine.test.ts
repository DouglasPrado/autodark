import { describe, it, expect } from 'vitest'
import {
  createStateMachine,
  transitionScene,
  transitionVideoMetrics,
  transitionSeries,
} from './state-machine.js'
import { SceneStatus, VideoMetricsStatus, SeriesStatus } from '../contracts/index.js'

describe('createStateMachine (generic)', () => {
  it('transitions between valid states', () => {
    const machine = createStateMachine({
      transitions: {
        pending: ['running'],
        running: ['completed', 'failed'],
      },
    })
    expect(machine.canTransition('pending', 'running')).toBe(true)
    expect(machine.transition('pending', 'running')).toBe('running')
  })

  it('rejects invalid transitions', () => {
    const machine = createStateMachine({
      transitions: {
        pending: ['running'],
        completed: [],
      },
    })
    expect(machine.canTransition('pending', 'completed')).toBe(false)
    expect(() => machine.transition('pending', 'completed')).toThrow('Transição inválida')
  })

  it('blocks transitions from terminal states', () => {
    const machine = createStateMachine({
      transitions: {
        completed: [],
      },
    })
    expect(machine.canTransition('completed', 'pending')).toBe(false)
  })
})

describe('transitionScene', () => {
  it('pending → audio_generating', () => {
    expect(transitionScene(SceneStatus.PENDING, SceneStatus.AUDIO_GENERATING)).toBe(SceneStatus.AUDIO_GENERATING)
  })

  it('audio_generating → audio_ready', () => {
    expect(transitionScene(SceneStatus.AUDIO_GENERATING, SceneStatus.AUDIO_READY)).toBe(SceneStatus.AUDIO_READY)
  })

  it('audio_ready → visual_ready', () => {
    expect(transitionScene(SceneStatus.AUDIO_READY, SceneStatus.VISUAL_READY)).toBe(SceneStatus.VISUAL_READY)
  })

  it('visual_ready → rendered', () => {
    expect(transitionScene(SceneStatus.VISUAL_READY, SceneStatus.RENDERED)).toBe(SceneStatus.RENDERED)
  })

  it('audio_generating → failed', () => {
    expect(transitionScene(SceneStatus.AUDIO_GENERATING, SceneStatus.FAILED)).toBe(SceneStatus.FAILED)
  })

  it('visual_ready → failed', () => {
    expect(transitionScene(SceneStatus.VISUAL_READY, SceneStatus.FAILED)).toBe(SceneStatus.FAILED)
  })

  it('rejects rendered → any (terminal)', () => {
    expect(() => transitionScene(SceneStatus.RENDERED, SceneStatus.PENDING)).toThrow()
  })

  it('rejects failed → any (terminal)', () => {
    expect(() => transitionScene(SceneStatus.FAILED, SceneStatus.PENDING)).toThrow()
  })

  it('rejects pending → rendered (must follow sequence)', () => {
    expect(() => transitionScene(SceneStatus.PENDING, SceneStatus.RENDERED)).toThrow()
  })
})

describe('transitionVideoMetrics', () => {
  it('pending → collected', () => {
    expect(transitionVideoMetrics(VideoMetricsStatus.PENDING, VideoMetricsStatus.COLLECTED)).toBe(VideoMetricsStatus.COLLECTED)
  })

  it('pending → failed', () => {
    expect(transitionVideoMetrics(VideoMetricsStatus.PENDING, VideoMetricsStatus.FAILED)).toBe(VideoMetricsStatus.FAILED)
  })

  it('failed → pending (retry)', () => {
    expect(transitionVideoMetrics(VideoMetricsStatus.FAILED, VideoMetricsStatus.PENDING)).toBe(VideoMetricsStatus.PENDING)
  })

  it('rejects collected → any (terminal)', () => {
    expect(() => transitionVideoMetrics(VideoMetricsStatus.COLLECTED, VideoMetricsStatus.PENDING)).toThrow()
  })
})

describe('transitionSeries', () => {
  it('planning → in_progress', () => {
    expect(transitionSeries(SeriesStatus.PLANNING, SeriesStatus.IN_PROGRESS)).toBe(SeriesStatus.IN_PROGRESS)
  })

  it('in_progress → completed', () => {
    expect(transitionSeries(SeriesStatus.IN_PROGRESS, SeriesStatus.COMPLETED)).toBe(SeriesStatus.COMPLETED)
  })

  it('in_progress → cancelled', () => {
    expect(transitionSeries(SeriesStatus.IN_PROGRESS, SeriesStatus.CANCELLED)).toBe(SeriesStatus.CANCELLED)
  })

  it('planning → cancelled', () => {
    expect(transitionSeries(SeriesStatus.PLANNING, SeriesStatus.CANCELLED)).toBe(SeriesStatus.CANCELLED)
  })

  it('rejects completed → any (terminal)', () => {
    expect(() => transitionSeries(SeriesStatus.COMPLETED, SeriesStatus.PLANNING)).toThrow()
  })

  it('rejects cancelled → any (terminal)', () => {
    expect(() => transitionSeries(SeriesStatus.CANCELLED, SeriesStatus.PLANNING)).toThrow()
  })

  it('rejects planning → completed (must go through in_progress)', () => {
    expect(() => transitionSeries(SeriesStatus.PLANNING, SeriesStatus.COMPLETED)).toThrow()
  })
})
