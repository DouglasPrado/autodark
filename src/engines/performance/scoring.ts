import type { VideoMetrics } from '../../contracts/index.js'

export function calculatePerformanceScore(metrics: VideoMetrics): number {
  let score = 0

  // Retention weight: 40% (target > 45%)
  const retention = metrics.retention ?? 0
  score += Math.min(retention / 45, 1) * 40

  // CTR weight: 30% (target > 6%)
  const ctr = metrics.ctr ?? 0
  score += Math.min(ctr / 6, 1) * 30

  // Engagement weight: 20% (likes + comments relative to views)
  const views = metrics.views || 1
  const engagementRate = ((metrics.likes + metrics.comments) / views) * 100
  score += Math.min(engagementRate / 5, 1) * 20

  // Watch time weight: 10%
  const avgWatch = metrics.avgWatchTime ?? 0
  score += Math.min(avgWatch / 30, 1) * 10

  return Math.round(Math.min(Math.max(score, 0), 100))
}
