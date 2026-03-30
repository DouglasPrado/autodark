import type { IdeaSource } from '../enums/idea-source.js'

/** Ideia de vídeo gerada pela Content Engine */
export interface Idea {
  readonly id: string
  readonly niche: string
  readonly text: string
  readonly angle?: string
  readonly source: IdeaSource
  readonly createdAt: Date
}
