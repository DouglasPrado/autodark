import type { Idea, Script, StrategyDirective } from '../../contracts/index.js'
import type { LLMClient } from '../../services/openrouter.js'
import { generateIdea } from './idea.js'
import { generateScript } from './script.js'
import { generateHookVariants, selectBestHook } from './hook.js'

export interface ContentEngineConfig {
  llm: LLMClient
}

export interface GenerateContentParams {
  niche: string
  idea?: string
  directive?: StrategyDirective
}

export interface ContentResult {
  idea: Idea
  script: Script
}

export interface ContentWithHookResult extends ContentResult {
  selectedHook: string
}

export interface ContentEngine {
  generateContent(params: GenerateContentParams): Promise<ContentResult>
  generateContentWithHookSelection(params: GenerateContentParams): Promise<ContentWithHookResult>
}

export function createContentEngine(config: ContentEngineConfig): ContentEngine {
  const { llm } = config

  return {
    async generateContent(params) {
      const idea = await generateIdea({
        niche: params.niche,
        llm,
        directive: params.directive,
        manualIdea: params.idea,
      })

      const script = await generateScript({ idea, llm })

      return { idea, script }
    },

    async generateContentWithHookSelection(params) {
      const { idea, script } = await this.generateContent(params)

      const hooks = await generateHookVariants({ idea, llm })
      const selectedHook = selectBestHook(hooks)

      return { idea, script, selectedHook }
    },
  }
}

export { generateIdea } from './idea.js'
export { generateScript } from './script.js'
export { generateHookVariants, selectBestHook } from './hook.js'
