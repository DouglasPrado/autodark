import type { LearningState, VideoMetrics } from '../../contracts/index.js'
import { LearningStatus } from '../../contracts/index.js'
import { analyzeFailures, type LearningInsights } from './analyze.js'
import { adjustWeights } from './weights.js'
import { shouldActivateLearning } from './optimize.js'

export interface LearningResult {
  state: LearningState
  insights: LearningInsights
}

export interface LearningEngine {
  process(state: LearningState, metrics: VideoMetrics[]): LearningResult
}

export function createLearningEngine(): LearningEngine {
  return {
    process(state, metrics) {
      const insights = analyzeFailures(metrics)
      let newState = adjustWeights(state, insights)

      if (shouldActivateLearning(newState.analyzedVideos) && !newState.isActive) {
        newState = { ...newState, isActive: true, status: LearningStatus.ACTIVE }
      }

      return { state: newState, insights }
    },
  }
}

export { analyzeFailures } from './analyze.js'
export { adjustWeights, createDefaultWeights } from './weights.js'
export { shouldActivateLearning } from './optimize.js'
