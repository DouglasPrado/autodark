/** Áudio gerado via TTS (ElevenLabs) para uma scene */
export interface AudioSegment {
  readonly id: string
  readonly sceneId: string
  readonly text: string
  readonly voiceId: string
  readonly audioUrl: string
  readonly duration: number
  readonly createdAt: Date
}
