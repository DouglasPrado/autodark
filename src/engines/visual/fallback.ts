import { v4 as uuid } from 'uuid'
import type { Scene, Clip } from '../../contracts/index.js'
import { ClipSource } from '../../contracts/index.js'
import type { PexelsClient } from '../../services/pexels.js'
import type { ImageAIClient } from '../../services/image-ai.js'
import { searchClipsForScene } from './search.js'
import { selectBestClip } from './rank.js'

export interface VisualFallbackConfig {
  pexels: PexelsClient
  imageAI: ImageAIClient
  storagePath: string
}

export interface VisualEngineWithFallback {
  getClipForScene(scene: Scene): Promise<Clip | undefined>
}

export function createVisualEngineWithFallback(config: VisualFallbackConfig): VisualEngineWithFallback {
  const { pexels, imageAI, storagePath } = config

  return {
    async getClipForScene(scene: Scene): Promise<Clip | undefined> {
      // Try Pexels first
      try {
        const clips = await searchClipsForScene(scene, pexels, storagePath)
        const best = selectBestClip(clips)
        if (best) return best
      } catch {
        // Pexels failed, fall through to DALL-E
      }

      // Fallback to DALL-E
      try {
        const result = await imageAI.generateImage(scene.visualQuery)
        const id = uuid()
        return {
          id,
          sceneId: scene.id,
          query: scene.visualQuery,
          source: ClipSource.DALLE,
          mediaId: id,
          mediaUrl: result.imageUrl,
          localPath: `${storagePath}/clips/${scene.id}/${id}.png`,
          score: 50,
          createdAt: new Date(),
        }
      } catch {
        return undefined
      }
    },
  }
}
