import { v4 as uuid } from 'uuid'
import type { Idea, Script } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'

const TEMPLATE = 'HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP'

const WORDS_PER_SECOND = 2.5

interface ScriptLLMResponse {
  hook: string
  setup: string
  escalada: string
  twist?: string
  payoff?: string
  loop?: string
}

export interface GenerateScriptParams {
  idea: Idea
  llm: LLMClient
}

function estimateDuration(segments: ScriptLLMResponse): number {
  const allText = [
    segments.hook,
    segments.setup,
    segments.escalada,
    segments.twist,
    segments.payoff,
    segments.loop,
  ]
    .filter(Boolean)
    .join(' ')

  const wordCount = allText.split(/\s+/).length
  return Math.round(wordCount / WORDS_PER_SECOND)
}

export async function generateScript(params: GenerateScriptParams): Promise<Script> {
  const { idea, llm } = params

  const prompt = `Crie um roteiro para vídeo YouTube sobre: "${idea.text}"
Nicho: ${idea.niche}

Use a estrutura:
- hook: Primeiros 5 segundos, frase provocativa que prende atenção
- setup: Contexto do tema (10-15s)
- escalada: Aprofundamento com tensão crescente
- twist: Reviravolta inesperada (opcional)
- payoff: Conclusão satisfatória (opcional)
- loop: Frase que incentiva assistir o próximo vídeo (opcional)

Retorne JSON com os campos: hook, setup, escalada, twist, payoff, loop`

  const response = await llm.generateStructured<ScriptLLMResponse>(prompt, {})

  return {
    id: uuid(),
    ideaId: idea.id,
    template: TEMPLATE,
    hook: response.hook,
    setup: response.setup,
    escalada: response.escalada,
    twist: response.twist || undefined,
    payoff: response.payoff || undefined,
    loop: response.loop || undefined,
    estimatedDuration: estimateDuration(response),
    createdAt: new Date(),
  }
}
