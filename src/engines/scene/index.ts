import type { Script, Scene } from '../../contracts/index.js'
import { splitIntoScenes } from './segment.js'
import { estimateDurations } from './duration.js'
import { generateVisualQueries } from './query.js'

export interface SceneEngine {
  process(script: Script): Scene[]
}

export function createSceneEngine(): SceneEngine {
  return {
    process(script: Script): Scene[] {
      const rawScenes = splitIntoScenes(script)
      const withDurations = estimateDurations(rawScenes)
      const withQueries = generateVisualQueries(withDurations)
      return withQueries
    },
  }
}

export { splitIntoScenes } from './segment.js'
export { estimateDurations } from './duration.js'
export { generateVisualQueries } from './query.js'
