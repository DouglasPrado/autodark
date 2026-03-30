import { describe, it, expect } from 'vitest'
import { generateIdea } from './idea.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import type { StrategyDirective } from '../../contracts/index.js'

describe('generateIdea', () => {
  it('generates idea from niche via LLM', async () => {
    const llm = createMockLLMClient({
      generate: async () => 'Os 5 lugares mais assombrados do mundo',
    })
    const idea = await generateIdea({ niche: 'dark', llm })
    expect(idea.id).toBeDefined()
    expect(idea.niche).toBe('dark')
    expect(idea.text).toBe('Os 5 lugares mais assombrados do mundo')
    expect(idea.source).toBe('strategy')
    expect(idea.createdAt).toBeInstanceOf(Date)
  })

  it('incorporates strategy directive into prompt', async () => {
    let capturedPrompt = ''
    const llm = createMockLLMClient({
      generate: async (prompt) => {
        capturedPrompt = prompt
        return 'Ideia gerada'
      },
    })
    const directive: StrategyDirective = {
      id: 'd1',
      topic: 'mistérios submarinos',
      angle: 'nunca resolvidos',
      template: 'standard',
      priority: 1,
      createdAt: new Date(),
    }
    await generateIdea({ niche: 'dark', llm, directive })
    expect(capturedPrompt).toContain('mistérios submarinos')
    expect(capturedPrompt).toContain('nunca resolvidos')
  })

  it('uses manual source when idea text is provided', async () => {
    const llm = createMockLLMClient()
    const idea = await generateIdea({ niche: 'dark', llm, manualIdea: 'Minha ideia' })
    expect(idea.text).toBe('Minha ideia')
    expect(idea.source).toBe('manual')
  })

  it('validates niche is not empty', async () => {
    const llm = createMockLLMClient()
    await expect(generateIdea({ niche: '', llm })).rejects.toThrow()
  })
})
