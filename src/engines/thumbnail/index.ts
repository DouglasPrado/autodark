import type { Idea, Thumbnail } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import type { ImageAIClient } from '../../services/image-ai.js'
import { generateConcepts } from './concepts.js'
import { generateVariants } from './generate.js'
import { scoreCTR } from './score.js'
import { selectBest } from './select.js'

export interface ThumbnailEngineConfig {
  llm: LLMClient
  imageAI: ImageAIClient
  storagePath: string
}

export interface ThumbnailResult {
  variants: Thumbnail[]
  selected: Thumbnail
}

export interface ThumbnailEngine {
  process(params: { idea: Idea; videoId: string }): Promise<ThumbnailResult>
}

export function createThumbnailEngine(config: ThumbnailEngineConfig): ThumbnailEngine {
  const { llm, imageAI, storagePath } = config

  return {
    async process({ idea, videoId }) {
      const concepts = await generateConcepts({ idea, llm })

      const variants = await generateVariants({ concepts, videoId, imageAI, storagePath })

      const scored = variants.map((t) => ({ ...t, ctrScore: scoreCTR(t) }))

      const selected = selectBest(scored)

      return { variants: scored, selected }
    },
  }
}

export { generateConcepts } from './concepts.js'
export { generateVariants } from './generate.js'
export { scoreCTR } from './score.js'
export { selectBest } from './select.js'
