import type { TargetMetrics } from '../value-objects/target-metrics.js'

/** Instrução da Strategy Engine para a Content Engine sobre o que gerar */
export interface StrategyDirective {
  readonly id: string
  readonly topic: string
  readonly angle?: string
  readonly targetMetrics?: TargetMetrics
  readonly template: string
  readonly priority: number
  readonly createdAt: Date
}
