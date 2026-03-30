import { describe, it, expect } from 'vitest'
import { createContentEngine } from './index.js'
import { createMockLLMClient } from '../../services/openrouter.js'

describe('ContentEngine (facade)', () => {
  const mockScriptResponse = {
    hook: 'Hook gerado',
    setup: 'Setup gerado',
    escalada: 'Escalada gerada',
    twist: 'Twist gerado',
    payoff: 'Payoff gerado',
    loop: 'Loop gerado',
  }

  it('generates idea and script in sequence', async () => {
    const llm = createMockLLMClient({
      generate: async () => 'Ideia incrível sobre mistérios',
      generateStructured: async () => mockScriptResponse,
    })

    const engine = createContentEngine({ llm })
    const result = await engine.generateContent({ niche: 'dark' })

    expect(result.idea.text).toBe('Ideia incrível sobre mistérios')
    expect(result.script.hook).toBe('Hook gerado')
    expect(result.script.ideaId).toBe(result.idea.id)
  })

  it('uses manual idea when provided', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => mockScriptResponse,
    })

    const engine = createContentEngine({ llm })
    const result = await engine.generateContent({ niche: 'dark', idea: 'Minha ideia manual' })

    expect(result.idea.text).toBe('Minha ideia manual')
    expect(result.idea.source).toBe('manual')
  })

  it('generates hook variants and selects best', async () => {
    const llm = createMockLLMClient({
      generate: async () => 'Ideia gerada',
      generateStructured: async (prompt: string) => {
        if (prompt.includes('hook')) {
          return { hooks: ['Hook A', 'Hook B', 'Hook C'] }
        }
        return mockScriptResponse
      },
    })

    const engine = createContentEngine({ llm })
    const result = await engine.generateContentWithHookSelection({ niche: 'dark' })

    expect(result.idea).toBeDefined()
    expect(result.script).toBeDefined()
    expect(result.selectedHook).toBeDefined()
    expect(['Hook A', 'Hook B', 'Hook C']).toContain(result.selectedHook)
  })
})
