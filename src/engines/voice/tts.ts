import { v4 as uuid } from 'uuid'
import type { Scene, AudioSegment } from '../../contracts/index.js'
import type { TTSClient } from '../../services/elevenlabs.js'

export async function generateVoiceForScene(
  scene: Scene,
  tts: TTSClient,
  voiceId: string,
): Promise<AudioSegment> {
  const result = await tts.generateVoice(scene.text, voiceId)

  return {
    id: uuid(),
    sceneId: scene.id,
    text: scene.text,
    voiceId,
    audioUrl: result.audioUrl,
    duration: result.duration,
    createdAt: new Date(),
  }
}
