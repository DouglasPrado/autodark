import type { Scene } from '../../contracts/index.js'
import { MAX_SCENE_DURATION } from '../../utils/constants.js'

export function enforceMaxSceneDuration(scenes: Scene[]): Scene[] {
  const result: Scene[] = []
  let currentTime = scenes[0]?.start ?? 0

  for (const scene of scenes) {
    const capped = Math.min(scene.duration, MAX_SCENE_DURATION)
    const end = Math.round((currentTime + capped) * 100) / 100
    result.push({
      ...scene,
      duration: capped,
      start: Math.round(currentTime * 100) / 100,
      end,
      pacing: {
        ...(scene.pacing ?? { patternInterrupt: false, zoomEffect: false, transitionType: '' }),
        maxDuration: MAX_SCENE_DURATION,
      },
    })
    currentTime = end
  }

  return result
}
