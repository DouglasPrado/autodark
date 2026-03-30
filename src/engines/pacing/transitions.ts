import type { Scene } from '../../contracts/index.js'

const TRANSITION_TYPES = ['cut', 'fade', 'dissolve', 'swipe', 'zoom-in'] as const

export function addMicroTransitions(scenes: Scene[]): Scene[] {
  return scenes.map((scene, index) => {
    const transitionType = TRANSITION_TYPES[index % TRANSITION_TYPES.length]!
    return {
      ...scene,
      pacing: {
        maxDuration: scene.pacing?.maxDuration ?? 2.5,
        patternInterrupt: scene.pacing?.patternInterrupt ?? false,
        zoomEffect: scene.pacing?.zoomEffect ?? false,
        transitionType,
      },
    }
  })
}
