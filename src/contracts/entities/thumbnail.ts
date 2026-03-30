/** Thumbnail gerada com scoring de CTR */
export interface Thumbnail {
  readonly id: string
  readonly videoId: string
  readonly concepts: string[]
  readonly imageUrl: string
  readonly localPath: string
  readonly ctrScore: number
  readonly isSelected: boolean
  readonly createdAt: Date
}
