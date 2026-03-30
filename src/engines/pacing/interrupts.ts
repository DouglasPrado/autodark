import type { Scene } from '../../contracts/index.js'

export function addPatternInterrupts(scenes: Scene[]): Scene[] {
  return scenes.map((scene, index) => {
    // Add interrupt to every other scene starting from index 1
    const shouldInterrupt = index % 2 === 1
    return {
      ...scene,
      pacing: {
        maxDuration: scene.pacing?.maxDuration ?? 2.5,
        patternInterrupt: shouldInterrupt,
        zoomEffect: scene.pacing?.zoomEffect ?? false,
        transitionType: scene.pacing?.transitionType ?? '',
      },
    }
  })
}
