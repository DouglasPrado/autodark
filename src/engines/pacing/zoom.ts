import type { Scene } from '../../contracts/index.js'
import { SegmentType } from '../../contracts/index.js'

const ZOOM_SEGMENTS = new Set<string>([
  SegmentType.HOOK,
  SegmentType.TWIST,
  SegmentType.PAYOFF,
])

export function applyZoomEffects(scenes: Scene[]): Scene[] {
  return scenes.map((scene) => {
    const shouldZoom = ZOOM_SEGMENTS.has(scene.segmentType)
    return {
      ...scene,
      pacing: {
        maxDuration: scene.pacing?.maxDuration ?? 2.5,
        patternInterrupt: scene.pacing?.patternInterrupt ?? false,
        zoomEffect: shouldZoom,
        transitionType: scene.pacing?.transitionType ?? '',
      },
    }
  })
}
