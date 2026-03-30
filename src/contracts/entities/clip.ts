import type { ClipSource } from '../enums/clip-source.js'

/** Asset visual (vídeo ou imagem) buscado no Pexels para uma scene */
export interface Clip {
  readonly id: string
  readonly sceneId: string
  readonly query: string
  readonly source: ClipSource
  readonly mediaId: string
  readonly mediaUrl: string
  readonly localPath: string
  readonly duration?: number
  readonly score: number
  readonly createdAt: Date
}
