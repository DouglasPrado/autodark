import type { AudioSegment } from '../../contracts/index.js'

export function mergeAudioSegments(segments: AudioSegment[]): AudioSegment[] {
  return [...segments].sort((a, b) => {
    if (a.sceneId < b.sceneId) return -1
    if (a.sceneId > b.sceneId) return 1
    return 0
  })
}
