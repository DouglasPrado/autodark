import { describe, it, expect } from 'vitest'
import { type PexelsClient, createMockPexelsClient } from './pexels.js'

describe('PexelsClient interface', () => {
  it('mock client returns search results', async () => {
    const client = createMockPexelsClient({
      searchVideos: async () => [
        { id: 'v1', url: 'https://pexels.com/v1.mp4', duration: 5 },
        { id: 'v2', url: 'https://pexels.com/v2.mp4', duration: 8 },
      ],
    })
    const results = await client.searchVideos('dark cave', 5)
    expect(results).toHaveLength(2)
    expect(results[0]!.url).toContain('pexels.com')
  })

  it('mock client returns empty when no results', async () => {
    const client = createMockPexelsClient({
      searchVideos: async () => [],
    })
    const results = await client.searchVideos('xyznonexistent', 5)
    expect(results).toHaveLength(0)
  })
})
