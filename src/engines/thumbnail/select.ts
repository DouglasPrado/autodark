import type { Thumbnail } from '../../contracts/index.js'
import { ValidationError } from '../../core/errors.js'

export function selectBest(thumbnails: Thumbnail[]): Thumbnail {
  if (thumbnails.length === 0) {
    throw new ValidationError('NO_THUMBNAILS', 'Nenhuma thumbnail disponível para seleção')
  }

  const sorted = [...thumbnails].sort((a, b) => b.ctrScore - a.ctrScore)
  const best = sorted[0]!

  return { ...best, isSelected: true }
}
