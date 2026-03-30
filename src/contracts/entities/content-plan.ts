import type { Series } from './series.js'

/** Plano de conteúdo gerado pela Strategy Engine baseado em dados de performance */
export interface ContentPlan {
  readonly id: string
  readonly niche: string
  readonly topics: string[]
  readonly series?: Series[]
  readonly generatedAt: Date
}
