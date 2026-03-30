import type { Scene } from '../../contracts/index.js'
import { enforceMaxSceneDuration } from './maxDuration.js'
import { addPatternInterrupts } from './interrupts.js'
import { applyZoomEffects } from './zoom.js'
import { addMicroTransitions } from './transitions.js'

export interface PacingEngine {
  apply(scenes: Scene[]): Scene[]
}

export function createPacingEngine(): PacingEngine {
  return {
    apply(scenes: Scene[]): Scene[] {
      let result = enforceMaxSceneDuration(scenes)
      result = addPatternInterrupts(result)
      result = applyZoomEffects(result)
      result = addMicroTransitions(result)
      return result
    },
  }
}

export { enforceMaxSceneDuration } from './maxDuration.js'
export { addPatternInterrupts } from './interrupts.js'
export { applyZoomEffects } from './zoom.js'
export { addMicroTransitions } from './transitions.js'
