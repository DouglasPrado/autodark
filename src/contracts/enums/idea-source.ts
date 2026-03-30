/** Origem da ideia de vídeo */
export const IdeaSource = {
  STRATEGY: 'strategy',
  MANUAL: 'manual',
  RANDOM: 'random',
} as const

export type IdeaSource = (typeof IdeaSource)[keyof typeof IdeaSource]
