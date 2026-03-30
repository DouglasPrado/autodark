import type { Idea } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import { ValidationError } from '../../core/errors.js'

interface HookLLMResponse {
  hooks: string[]
}

export interface GenerateHookVariantsParams {
  idea: Idea
  llm: LLMClient
  count?: number
}

export async function generateHookVariants(params: GenerateHookVariantsParams): Promise<string[]> {
  const { idea, llm, count = 3 } = params

  const prompt = `Gere ${count} variantes de hook (primeiros 5 segundos) para um vídeo sobre: "${idea.text}"
Nicho: ${idea.niche}

Cada hook deve:
- Ter no máximo 1-2 frases
- Ser provocativo e gerar curiosidade
- Prender a atenção imediatamente

Retorne JSON com campo "hooks" contendo array de strings.`

  const response = await llm.generateStructured<HookLLMResponse>(prompt, {})
  return response.hooks
}

export function selectBestHook(hooks: string[]): string {
  if (hooks.length === 0) {
    throw new ValidationError('NO_HOOKS', 'Nenhuma variante de hook disponível')
  }

  // Without learning weights, select the first (LLM typically orders by quality)
  return hooks[0]!
}
