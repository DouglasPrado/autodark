/** Vídeo final renderizado, pronto para upload no YouTube */
export interface Video {
  readonly id: string
  readonly pipelineId: string
  readonly path: string
  readonly duration: number
  readonly resolution: string
  readonly format: string
  readonly size: number
  readonly hasSubtitles: boolean
  readonly hasMusic: boolean
  readonly createdAt: Date
}
