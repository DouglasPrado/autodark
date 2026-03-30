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
}

export function createElevenLabsClient(config: TTSClientConfig): TTSClient {
  const model = config.model ?? 'eleven_multilingual_v2'

  return {
    async generateVoice(text: string, voiceId: string): Promise<TTSResult> {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.apiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text,
            model_id: model,
          }),
        },
      )

      if (!response.ok) {
        throw new Error(`ElevenLabs error: ${response.status} ${response.statusText}`)
      }

      const audioUrl = `elevenlabs://${voiceId}/${Date.now()}.mp3`
      const wordCount = text.split(/\s+/).length
      const duration = wordCount / 2.5

      return { audioUrl, duration }
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
