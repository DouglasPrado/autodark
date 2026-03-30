import { describe, it, expect } from 'vitest'
import { type ImageAIClient, createMockImageAIClient } from './image-ai.js'

describe('ImageAIClient interface', () => {
  it('mock client returns generated image url', async () => {
    const client = createMockImageAIClient({
      generateImage: async () => ({ imageUrl: 'https://dalle.ai/img1.png' }),
    })
    const result = await client.generateImage('dark cave thumbnail')
    expect(result.imageUrl).toBe('https://dalle.ai/img1.png')
  })

  it('mock client uses defaults', async () => {
    const client = createMockImageAIClient()
    const result = await client.generateImage('test')
    expect(result.imageUrl).toBeDefined()
  })
})
