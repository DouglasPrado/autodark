/** Status de processamento de uma scene */
export const SceneStatus = {
  PENDING: 'pending',
  AUDIO_GENERATING: 'audio_generating',
  AUDIO_READY: 'audio_ready',
  VISUAL_READY: 'visual_ready',
  RENDERED: 'rendered',
  FAILED: 'failed',
} as const

export type SceneStatus = (typeof SceneStatus)[keyof typeof SceneStatus]
