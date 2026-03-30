import type { Scene, Clip } from '../../contracts/index.js'
import type { PexelsClient } from '../../services/pexels.js'
import { searchClipsForScene } from './search.js'
import { selectBestClip } from './rank.js'

export interface VisualEngineConfig {
  pexels: PexelsClient
  storagePath: string
}

export interface VisualEngine {
  searchClips(scene: Scene): Promise<Clip[]>
  processAll(scenes: Scene[]): Promise<Clip[]>
}

export function createVisualEngine(config: VisualEngineConfig): VisualEngine {
  const { pexels, storagePath } = config

  return {
    async searchClips(scene: Scene): Promise<Clip[]> {
      return searchClipsForScene(scene, pexels, storagePath)
    },

    async processAll(scenes: Scene[]): Promise<Clip[]> {
      const clips: Clip[] = []
      for (const scene of scenes) {
        const results = await searchClipsForScene(scene, pexels, storagePath)
        const best = selectBestClip(results)
        if (best) clips.push(best)
      }
      return clips
    },
  }
}

export { searchClipsForScene } from './search.js'
export { rankClips, selectBestClip } from './rank.js'
export { downloadMedia } from './download.js'
