import { v4 as uuid } from 'uuid'
import type { ContentPlan, VideoMetrics } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'

interface PlanResponse {
  topics: string[]
}

export interface GenerateContentPlanParams {
  niche: string
  llm: LLMClient
  metrics?: VideoMetrics[]
}

export async function generateContentPlan(params: GenerateContentPlanParams): Promise<ContentPlan> {
  const { niche, llm, metrics } = params

  let metricsContext = ''
  if (metrics && metrics.length > 0) {
    const topPerforming = metrics
      .filter((m) => m.retention && m.retention > 0)
      .sort((a, b) => (b.retention ?? 0) - (a.retention ?? 0))
      .slice(0, 5)

    metricsContext = `\n\nDados de performance dos últimos vídeos:
${topPerforming.map((m) => `- Views: ${m.views}, Retenção: ${m.retention}%, CTR: ${m.ctr}%`).join('\n')}`
  }

  const prompt = `Gere um plano de conteúdo para o nicho "${niche}" no YouTube.
Liste 5-10 tópicos priorizados por potencial de engajamento.${metricsContext}

Retorne JSON com campo "topics" contendo array de strings.`

  const response = await llm.generateStructured<PlanResponse>(prompt, {})

  return {
    id: uuid(),
    niche,
    topics: response.topics,
    generatedAt: new Date(),
  }
}
