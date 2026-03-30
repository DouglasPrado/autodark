import { v4 as uuid } from 'uuid'
import type { Thumbnail } from '../../contracts/index.js'
import type { ImageAIClient } from '../../services/image-ai.js'

export interface GenerateVariantsParams {
  concepts: string[]
  videoId: string
  imageAI: ImageAIClient
  storagePath: string
}

export async function generateVariants(params: GenerateVariantsParams): Promise<Thumbnail[]> {
  const { concepts, videoId, imageAI, storagePath } = params
  const thumbnails: Thumbnail[] = []

  for (const concept of concepts) {
    const result = await imageAI.generateImage(concept)
    const id = uuid()

    thumbnails.push({
      id,
      videoId,
      concepts: [concept],
      imageUrl: result.imageUrl,
      localPath: `${storagePath}/thumbnails/${videoId}/${id}.png`,
      ctrScore: 0,
      isSelected: false,
      createdAt: new Date(),
    })
  }

  return thumbnails
}
