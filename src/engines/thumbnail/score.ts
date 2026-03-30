import type { Thumbnail } from '../../contracts/index.js'

export function scoreCTR(thumbnail: Thumbnail): number {
  let score = 50 // base

  // More concepts = more visual richness
  score += Math.min(thumbnail.concepts.length * 10, 30)

  // Longer concept descriptions = more detail
  const avgLength = thumbnail.concepts.reduce((sum, c) => sum + c.length, 0) / (thumbnail.concepts.length || 1)
  score += Math.min(avgLength / 5, 20)

  return Math.round(Math.min(Math.max(score, 0), 100))
}
