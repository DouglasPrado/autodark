import type { LearningStatus } from '../enums/learning-status.js'
import type { HookWeights } from '../value-objects/hook-weights.js'

/** Estado do Learning Engine com pesos ajustáveis para geração de conteúdo */
export interface LearningState {
  readonly id: string
  readonly niche: string
  readonly hookWeights: HookWeights
  readonly templateWeights: Record<string, number>
  readonly pacingWeights: Record<string, number>
  readonly contentWeights: Record<string, number>
  readonly isActive: boolean
  readonly status: LearningStatus
  readonly lastUpdated: Date
  readonly analyzedVideos: number
  readonly createdAt: Date
}
