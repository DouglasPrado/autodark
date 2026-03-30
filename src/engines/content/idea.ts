import { v4 as uuid } from 'uuid'
import type { Idea, StrategyDirective } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import { ValidationError } from '../../core/errors.js'

export interface GenerateIdeaParams {
  niche: string
  llm: LLMClient
  directive?: StrategyDirective
  manualIdea?: string
}

export async function generateIdea(params: GenerateIdeaParams): Promise<Idea> {
  const { niche, llm, directive, manualIdea } = params

  if (!niche || niche.trim().length === 0) {
    throw new ValidationError('INVALID_NICHE', 'Nicho é obrigatório')
  }

  if (manualIdea) {
    return {
      id: uuid(),
      niche,
      text: manualIdea,
      source: 'manual',
      createdAt: new Date(),
    }
  }

  let prompt = `Gere UMA ideia de vídeo para o nicho "${niche}" no YouTube.
A ideia deve ser curta (máximo 1 frase), provocativa e otimizada para retenção.
Responda APENAS com o texto da ideia, sem explicações.`

  if (directive) {
    prompt += `\n\nDiretiva da estratégia:
- Tópico: ${directive.topic}`
    if (directive.angle) {
      prompt += `\n- Ângulo: ${directive.angle}`
    }
  }

  const text = await llm.generate(prompt)

  return {
    id: uuid(),
    niche,
    text: text.trim(),
    angle: directive?.angle,
    source: 'strategy',
    createdAt: new Date(),
  }
}
