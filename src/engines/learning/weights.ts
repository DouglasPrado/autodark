import { v4 as uuid } from 'uuid'
import type { LearningState } from '../../contracts/index.js'
import { LearningStatus } from '../../contracts/index.js'
import { MAX_WEIGHT_ADJUSTMENT } from '../../utils/constants.js'
import type { LearningInsights } from './analyze.js'

export function createDefaultWeights(niche: string): LearningState {
  return {
    id: uuid(),
    niche,
    hookWeights: { curiosity: 0.3, shock: 0.25, question: 0.25, promise: 0.2 },
    templateWeights: { hook: 0.25, setup: 0.15, escalada: 0.2, twist: 0.15, payoff: 0.15, loop: 0.1 },
    pacingWeights: { maxDuration: 0.3, patternInterrupt: 0.25, zoomEffect: 0.25, transition: 0.2 },
    contentWeights: { trending: 0.3, evergreen: 0.3, series: 0.2, experimental: 0.2 },
    isActive: false,
    status: LearningStatus.INACTIVE,
    lastUpdated: new Date(),
    analyzedVideos: 0,
    createdAt: new Date(),
  }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function adjustWeights(state: LearningState, insights: LearningInsights): LearningState {
  let { curiosity, shock, question, promise } = state.hookWeights

  // If many videos have low retention, boost curiosity hooks
  if (insights.lowRetention.length > 0) {
    curiosity = clamp(curiosity + MAX_WEIGHT_ADJUSTMENT * 0.5, 0, 1)
    shock = clamp(shock - MAX_WEIGHT_ADJUSTMENT * 0.2, 0, 1)
  }

  // If common early drop-offs, boost pattern interrupt pacing
  if (insights.commonDropOffs.some((p) => p <= 3)) {
    question = clamp(question + MAX_WEIGHT_ADJUSTMENT * 0.3, 0, 1)
  }

  return {
    ...state,
    hookWeights: { curiosity, shock, question, promise },
    analyzedVideos: state.analyzedVideos + 1,
    lastUpdated: new Date(),
  }
}
