import { describe, it, expect } from 'vitest'
import { generateHookVariants, selectBestHook } from './hook.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import type { Idea } from '../../contracts/index.js'

const mockIdea: Idea = {
  id: 'idea-1',
  niche: 'dark',
  text: 'Os 5 lugares mais assombrados',
  source: 'strategy',
  createdAt: new Date(),
}

describe('generateHookVariants', () => {
  it('generates N hook variants via LLM', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        hooks: [
          'Você não vai acreditar...',
          'Isso deveria ter ficado escondido...',
          'O que aconteceu aqui nunca foi explicado...',
        ],
      }),
    })
    const hooks = await generateHookVariants({ idea: mockIdea, count: 3, llm })
    expect(hooks).toHaveLength(3)
    expect(hooks[0]).toBe('Você não vai acreditar...')
  })

  it('defaults to 3 variants', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        hooks: ['hook1', 'hook2', 'hook3'],
      }),
    })
    const hooks = await generateHookVariants({ idea: mockIdea, llm })
    expect(hooks).toHaveLength(3)
  })
})

describe('selectBestHook', () => {
  it('selects the first hook when no learning weights', () => {
    const hooks = ['hook A', 'hook B', 'hook C']
    const best = selectBestHook(hooks)
    expect(hooks).toContain(best)
  })

  it('returns the only hook if single variant', () => {
    const best = selectBestHook(['only hook'])
    expect(best).toBe('only hook')
  })

  it('throws on empty hooks array', () => {
    expect(() => selectBestHook([])).toThrow()
  })
})
