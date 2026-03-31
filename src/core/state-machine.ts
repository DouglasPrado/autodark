import { PipelineError } from './errors.js'
import { SceneStatus, VideoMetricsStatus, SeriesStatus } from '../contracts/index.js'

export interface StateMachineConfig<S extends string> {
  transitions: Record<string, S[]>
}

export interface StateMachine<S extends string> {
  canTransition(from: S, to: S): boolean
  transition(from: S, to: S): S
}

export function createStateMachine<S extends string>(config: StateMachineConfig<S>): StateMachine<S> {
  return {
    canTransition(from: S, to: S): boolean {
      const allowed = config.transitions[from]
      if (!allowed) return false
      return allowed.includes(to)
    },

    transition(from: S, to: S): S {
      if (!this.canTransition(from, to)) {
        throw new PipelineError(
          'INVALID_STATE_TRANSITION',
          `Transição inválida: ${from} → ${to}`,
        )
      }
      return to
    },
  }
}

// --- Scene State Machine ---

const sceneMachine = createStateMachine<SceneStatus>({
  transitions: {
    [SceneStatus.PENDING]: [SceneStatus.AUDIO_GENERATING],
    [SceneStatus.AUDIO_GENERATING]: [SceneStatus.AUDIO_READY, SceneStatus.FAILED],
    [SceneStatus.AUDIO_READY]: [SceneStatus.VISUAL_READY],
    [SceneStatus.VISUAL_READY]: [SceneStatus.RENDERED, SceneStatus.FAILED],
    [SceneStatus.RENDERED]: [],
    [SceneStatus.FAILED]: [],
  },
})

export function transitionScene(from: SceneStatus, to: SceneStatus): SceneStatus {
  return sceneMachine.transition(from, to)
}

// --- VideoMetrics State Machine ---

const videoMetricsMachine = createStateMachine<VideoMetricsStatus>({
  transitions: {
    [VideoMetricsStatus.PENDING]: [VideoMetricsStatus.COLLECTED, VideoMetricsStatus.FAILED],
    [VideoMetricsStatus.COLLECTED]: [],
    [VideoMetricsStatus.FAILED]: [VideoMetricsStatus.PENDING],
  },
})

export function transitionVideoMetrics(from: VideoMetricsStatus, to: VideoMetricsStatus): VideoMetricsStatus {
  return videoMetricsMachine.transition(from, to)
}

// --- Series State Machine ---

const seriesMachine = createStateMachine<SeriesStatus>({
  transitions: {
    [SeriesStatus.PLANNING]: [SeriesStatus.IN_PROGRESS, SeriesStatus.CANCELLED],
    [SeriesStatus.IN_PROGRESS]: [SeriesStatus.COMPLETED, SeriesStatus.CANCELLED],
    [SeriesStatus.COMPLETED]: [],
    [SeriesStatus.CANCELLED]: [],
  },
})

export function transitionSeries(from: SeriesStatus, to: SeriesStatus): SeriesStatus {
  return seriesMachine.transition(from, to)
}
