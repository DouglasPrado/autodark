/** Status do pipeline de geração de vídeo */
export const PipelineStatus = {
  PENDING: 'pending',
  RUNNING: 'running',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const

export type PipelineStatus = (typeof PipelineStatus)[keyof typeof PipelineStatus]
