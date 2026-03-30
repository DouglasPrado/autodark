/** Status da coleta de métricas do YouTube */
export const VideoMetricsStatus = {
  PENDING: 'pending',
  COLLECTED: 'collected',
  FAILED: 'failed',
} as const

export type VideoMetricsStatus = (typeof VideoMetricsStatus)[keyof typeof VideoMetricsStatus]
