import type { Idea, VideoMetrics } from '../../contracts/index.js'

export function prioritizeIdeas(ideas: Idea[], metrics?: VideoMetrics[]): Idea[] {
  if (!metrics || metrics.length === 0) return [...ideas]

  const avgRetention = metrics.reduce((sum, m) => sum + (m.retention ?? 0), 0) / metrics.length
  const avgCtr = metrics.reduce((sum, m) => sum + (m.ctr ?? 0), 0) / metrics.length

  return [...ideas].sort((a, b) => {
    const scoreA = a.text.length + (a.angle ? 10 : 0)
    const scoreB = b.text.length + (b.angle ? 10 : 0)
    return scoreB - scoreA
  })
}
