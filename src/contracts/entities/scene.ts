import type { SegmentType } from '../enums/segment-type.js'
import type { SceneStatus } from '../enums/scene-status.js'
import type { PacingConfig } from '../value-objects/pacing-config.js'

/** Menor unidade atômica do vídeo — renderizada individualmente e concatenada */
export interface Scene {
  readonly id: string
  readonly scriptId: string
  readonly order: number
  readonly text: string
  readonly duration: number
  readonly start: number
  readonly end: number
  readonly visualQuery: string
  readonly segmentType: SegmentType
  readonly pacing?: PacingConfig
  readonly status: SceneStatus
  readonly createdAt: Date
}
