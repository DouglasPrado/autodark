import { describe, it, expect } from 'vitest'
import { createVoiceEngine } from './index.js'
import { createMockTTSClient } from '../../services/elevenlabs.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'

function makeScene(id: string, text: string): Scene {
  return {
    id,
    scriptId: 'script-1',
    order: 0,
    text,
    duration: 2,
    start: 0,
    end: 2,
    visualQuery: 'dark cave',
    segmentType: SegmentType.HOOK,
    status: SceneStatus.PENDING,
    createdAt: new Date(),
  }
}

describe('VoiceEngine', () => {
  it('generates audio for a single scene', async () => {
    const tts = createMockTTSClient({
      generateVoice: async (text) => ({
        audioUrl: `/audio/${text.slice(0, 5)}.mp3`,
        duration: 2.0,
      }),
    })
    const engine = createVoiceEngine({ tts, voiceId: 'voice-1' })
    const segment = await engine.generateVoice(makeScene('s1', 'Texto da cena'))

    expect(segment.id).toBeDefined()
    expect(segment.sceneId).toBe('s1')
    expect(segment.text).toBe('Texto da cena')
    expect(segment.voiceId).toBe('voice-1')
    expect(segment.audioUrl).toContain('.mp3')
    expect(segment.duration).toBe(2.0)
    expect(segment.createdAt).toBeInstanceOf(Date)
  })

  it('generates audio for all scenes', async () => {
    let callCount = 0
    const tts = createMockTTSClient({
      generateVoice: async () => {
        callCount++
        return { audioUrl: `/audio/${callCount}.mp3`, duration: 1.5 }
      },
    })
    const engine = createVoiceEngine({ tts, voiceId: 'voice-1' })
    const scenes = [
      makeScene('s1', 'Cena um'),
      makeScene('s2', 'Cena dois'),
      makeScene('s3', 'Cena três'),
    ]
    const segments = await engine.generateAll(scenes)

    expect(segments).toHaveLength(3)
    expect(segments[0]!.sceneId).toBe('s1')
    expect(segments[1]!.sceneId).toBe('s2')
    expect(segments[2]!.sceneId).toBe('s3')
    expect(callCount).toBe(3)
  })

  it('merges audio segments into ordered list', () => {
    const engine = createVoiceEngine({ tts: createMockTTSClient(), voiceId: 'v1' })
    const segments = [
      { id: 'a1', sceneId: 's1', text: 'a', voiceId: 'v1', audioUrl: '/a1.mp3', duration: 1, createdAt: new Date() },
      { id: 'a2', sceneId: 's2', text: 'b', voiceId: 'v1', audioUrl: '/a2.mp3', duration: 2, createdAt: new Date() },
    ]
    const merged = engine.mergeAudioSegments(segments)
    expect(merged).toHaveLength(2)
    expect(merged[0]!.audioUrl).toBe('/a1.mp3')
  })
})
