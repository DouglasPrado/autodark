import { describe, it, expect } from 'vitest'
import { type TTSClient, createMockTTSClient } from './elevenlabs.js'

describe('TTSClient interface', () => {
  it('mock client returns audio url and duration', async () => {
    const client = createMockTTSClient({
      generateVoice: async () => ({ audioUrl: '/audio/scene1.mp3', duration: 2.1 }),
    })
    const result = await client.generateVoice('texto', 'voice-123')
    expect(result.audioUrl).toBe('/audio/scene1.mp3')
    expect(result.duration).toBe(2.1)
  })

  it('mock client uses defaults when no overrides', async () => {
    const client = createMockTTSClient()
    const result = await client.generateVoice('texto', 'voice-123')
    expect(result.audioUrl).toBeDefined()
    expect(result.duration).toBeGreaterThan(0)
  })
})
