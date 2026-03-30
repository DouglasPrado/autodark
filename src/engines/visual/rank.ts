import type { Clip } from '../../contracts/index.js'

export function rankClips(clips: Clip[]): Clip[] {
  return [...clips].sort((a, b) => b.score - a.score)
}

export function selectBestClip(clips: Clip[]): Clip | undefined {
  if (clips.length === 0) return undefined
  return rankClips(clips)[0]
}
