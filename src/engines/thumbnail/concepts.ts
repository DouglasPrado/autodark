import type { Idea } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'

interface ConceptsResponse {
  concepts: string[]
}

export interface GenerateConceptsParams {
  idea: Idea
  llm: LLMClient
  count?: number
}

export async function generateConcepts(params: GenerateConceptsParams): Promise<string[]> {
  const { idea, llm, count = 3 } = params

  const prompt = `Gere ${count} conceitos visuais para thumbnail de vídeo YouTube.
Tema: "${idea.text}"
Nicho: ${idea.niche}

Cada conceito deve ser uma descrição visual em inglês, otimizada para gerar imagem via IA.
Foque em: contraste alto, elementos dramáticos, cores vibrantes.

Retorne JSON com campo "concepts" contendo array de strings.`

  const response = await llm.generateStructured<ConceptsResponse>(prompt, {})
  return response.concepts
}
