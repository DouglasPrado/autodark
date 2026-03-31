import { writeFile, mkdir } from 'fs/promises'
import { dirname } from 'path'

export interface TTSResult {
  audioUrl: string
  duration: number
}

export interface TTSClient {
  generateVoice(text: string, voiceId: string): Promise<TTSResult>
}

export interface TTSClientConfig {
  apiKey: string
  model?: string
  outputDir?: string
}

export function createElevenLabsClient(config: TTSClientConfig): TTSClient {
  const model = config.model ?? 'eleven_multilingual_v2'
  const outputDir = config.outputDir ?? './storage/audio'

  return {
    async generateVoice(text: string, voiceId: string): Promise<TTSResult> {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
            'Accept': 'audio/mpeg',
          },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.status} ${response.statusText}`)
      }

      // Save audio to disk
      const buffer = Buffer.from(await response.arrayBuffer())
      const filename = `${Date.now()}-${voiceId}.mp3`
      const audioPath = `${outputDir}/${filename}`

      await mkdir(dirname(audioPath), { recursive: true })
      await writeFile(audioPath, buffer)

      // Estimate duration from audio size (MP3 ~16kB/s at 128kbps)
      const estimatedDuration = buffer.length / 16000
      // Better estimate from word count as fallback
      const wordDuration = text.split(/\s+/).length / 2.5
      const duration = estimatedDuration > 0.5 ? estimatedDuration : wordDuration

      return { audioUrl: audioPath, duration: Math.round(duration * 100) / 100 }
    },
  }
}

export interface MockTTSOverrides {
  generateVoice?: (text: string, voiceId: string) => Promise<TTSResult>
}

export function createMockTTSClient(overrides?: MockTTSOverrides): TTSClient {
  return {
    generateVoice: overrides?.generateVoice ?? (async () => ({
      audioUrl: '/mock/audio.mp3',
      duration: 1.5,
    })),
  }
}
