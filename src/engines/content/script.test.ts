import { describe, it, expect } from 'vitest'
import { generateScript } from './script.js'
import { createMockLLMClient } from '../../services/openrouter.js'
import type { Idea } from '../../contracts/index.js'

const mockIdea: Idea = {
  id: 'idea-1',
  niche: 'dark',
  text: 'Os 5 lugares mais assombrados',
  source: 'strategy',
  createdAt: new Date(),
}

const mockScriptResponse = {
  hook: 'Você não vai acreditar no que existe debaixo da terra...',
  setup: 'Em 1947, um grupo de exploradores descobriu...',
  escalada: 'Mas o que eles encontraram lá dentro mudou tudo...',
  twist: 'O mais perturbador é que ninguém nunca voltou para confirmar.',
  payoff: 'As evidências foram destruídas pelo governo.',
  loop: 'E o próximo lugar da lista é ainda mais aterrorizante.',
}

describe('generateScript', () => {
  it('generates structured script from idea via LLM', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => mockScriptResponse,
    })
    const script = await generateScript({ idea: mockIdea, llm })
    expect(script.id).toBeDefined()
    expect(script.ideaId).toBe('idea-1')
    expect(script.hook).toBe(mockScriptResponse.hook)
    expect(script.setup).toBe(mockScriptResponse.setup)
    expect(script.escalada).toBe(mockScriptResponse.escalada)
    expect(script.twist).toBe(mockScriptResponse.twist)
    expect(script.payoff).toBe(mockScriptResponse.payoff)
    expect(script.loop).toBe(mockScriptResponse.loop)
    expect(script.template).toBe('HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP')
    expect(script.estimatedDuration).toBeGreaterThan(0)
    expect(script.createdAt).toBeInstanceOf(Date)
  })

  it('calculates estimated duration from segment lengths', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => mockScriptResponse,
    })
    const script = await generateScript({ idea: mockIdea, llm })
    // Duration based on word count — should be reasonable
    expect(script.estimatedDuration).toBeGreaterThan(10)
    expect(script.estimatedDuration).toBeLessThan(300)
  })

  it('handles script with only required segments (no twist/payoff/loop)', async () => {
    const llm = createMockLLMClient({
      generateStructured: async () => ({
        hook: 'Hook text here',
        setup: 'Setup text here',
        escalada: 'Escalada text here',
      }),
    })
    const script = await generateScript({ idea: mockIdea, llm })
    expect(script.hook).toBe('Hook text here')
    expect(script.twist).toBeUndefined()
    expect(script.payoff).toBeUndefined()
    expect(script.loop).toBeUndefined()
  })
})
