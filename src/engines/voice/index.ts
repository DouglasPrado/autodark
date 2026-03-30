import type { Scene, AudioSegment } from '../../contracts/index.js'
import type { TTSClient } from '../../services/elevenlabs.js'
import { generateVoiceForScene } from './tts.js'
import { mergeAudioSegments as mergeSegments } from './merge.js'

export interface VoiceEngineConfig {
  tts: TTSClient
  voiceId: string
}

export interface VoiceEngine {
  generateVoice(scene: Scene): Promise<AudioSegment>
  generateAll(scenes: Scene[]): Promise<AudioSegment[]>
  mergeAudioSegments(segments: AudioSegment[]): AudioSegment[]
}

export function createVoiceEngine(config: VoiceEngineConfig): VoiceEngine {
  const { tts, voiceId } = config

  return {
    async generateVoice(scene: Scene): Promise<AudioSegment> {
      return generateVoiceForScene(scene, tts, voiceId)
    },

    async generateAll(scenes: Scene[]): Promise<AudioSegment[]> {
      const segments: AudioSegment[] = []
      for (const scene of scenes) {
        const segment = await generateVoiceForScene(scene, tts, voiceId)
        segments.push(segment)
      }
      return segments
    },

    mergeAudioSegments(segments: AudioSegment[]): AudioSegment[] {
      return mergeSegments(segments)
    },
  }
}

export { generateVoiceForScene } from './tts.js'
export { mergeAudioSegments } from './merge.js'
