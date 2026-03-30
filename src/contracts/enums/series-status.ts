/** Status de progresso de uma série temática */
export const SeriesStatus = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type SeriesStatus = (typeof SeriesStatus)[keyof typeof SeriesStatus]
