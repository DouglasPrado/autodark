import type { ContentPlan, VideoMetrics } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import { generateContentPlan } from './plan.js'
import { clusterTopics } from './cluster.js'

export interface StrategyEngineConfig {
  llm: LLMClient
}

export interface GeneratePlanParams {
  niche: string
  metrics?: VideoMetrics[]
}

export interface StrategyResult {
  plan: ContentPlan
  clusters: string[][]
}

export interface StrategyEngine {
  generatePlan(params: GeneratePlanParams): Promise<StrategyResult>
}

export function createStrategyEngine(config: StrategyEngineConfig): StrategyEngine {
  const { llm } = config

  return {
    async generatePlan(params) {
      const plan = await generateContentPlan({
        niche: params.niche,
        llm,
        metrics: params.metrics,
      })
      const clusters = clusterTopics(plan.topics)
      return { plan, clusters }
    },
  }
}

export { generateContentPlan } from './plan.js'
export { clusterTopics } from './cluster.js'
export { prioritizeIdeas } from './prioritize.js'
export { createSeries } from './series.js'
