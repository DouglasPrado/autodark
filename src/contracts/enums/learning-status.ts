/** Status do Learning Engine */
export const LearningStatus = {
  INACTIVE: 'inactive',
  ACTIVE: 'active',
  PAUSED: 'paused',
} as const

export type LearningStatus = (typeof LearningStatus)[keyof typeof LearningStatus]
