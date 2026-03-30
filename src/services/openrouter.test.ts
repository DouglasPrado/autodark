import { describe, it, expect } from 'vitest'
import { type LLMClient, createMockLLMClient } from './openrouter.js'

describe('LLMClient interface', () => {
  it('mock client returns configured response for generate', async () => {
    const client = createMockLLMClient({
      generate: async () => 'resposta do LLM',
    })
    const result = await client.generate('qualquer prompt')
    expect(result).toBe('resposta do LLM')
  })

  it('mock client returns configured response for generateStructured', async () => {
    const data = { hook: 'texto', setup: 'texto' }
    const client = createMockLLMClient({
      generateStructured: async () => data,
    })
    const result = await client.generateStructured('prompt', {})
    expect(result).toEqual(data)
  })
})
