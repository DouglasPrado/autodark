import type { VideoMetrics } from '../../contracts/index.js'

const RETENTION_THRESHOLD = 45
const CTR_THRESHOLD = 6

export interface LearningInsights {
  lowRetention: VideoMetrics[]
  lowCtr: VideoMetrics[]
  commonDropOffs: number[]
}

export function analyzeFailures(metrics: VideoMetrics[]): LearningInsights {
  const lowRetention = metrics.filter((m) => (m.retention ?? 0) < RETENTION_THRESHOLD)
  const lowCtr = metrics.filter((m) => (m.ctr ?? 0) < CTR_THRESHOLD)

  // Find common drop-off points (appear in > 50% of videos)
  const dropOffCounts = new Map<number, number>()
  for (const m of metrics) {
    for (const point of m.dropOffPoints) {
      dropOffCounts.set(point, (dropOffCounts.get(point) ?? 0) + 1)
    }
  }

  const threshold = Math.max(1, Math.floor(metrics.length * 0.5))
  const commonDropOffs = [...dropOffCounts.entries()]
    .filter(([, count]) => count >= threshold)
    .map(([point]) => point)
    .sort((a, b) => a - b)

  return { lowRetention, lowCtr, commonDropOffs }
}
