import type { PipelineStatus } from '../enums/pipeline-status.js'
import type { Idea } from './idea.js'
import type { Script } from './script.js'
import type { Scene } from './scene.js'
import type { AudioSegment } from './audio-segment.js'
import type { Clip } from './clip.js'
import type { VideoMetadata } from '../value-objects/video-metadata.js'
import type { VideoMetrics } from './video-metrics.js'
import type { ContentPlan } from './content-plan.js'
import type { LearningState } from './learning-state.js'
import type { StrategyDirective } from './strategy-directive.js'

/** Estado global imutável que flui entre todos os steps do pipeline */
export interface PipelineContext {
  readonly id: string
  readonly niche: string
  readonly contentPlan?: ContentPlan
  readonly strategyDirective?: StrategyDirective
  readonly idea?: Idea
  readonly script?: Script
  readonly scenes?: Scene[]
  readonly audioSegments?: AudioSegment[]
  readonly clips?: Clip[]
  readonly videoPath?: string
  readonly thumbnailPath?: string
  readonly metadata?: VideoMetadata
  readonly videoId?: string
  readonly metrics?: VideoMetrics
  readonly performanceScore?: number
  readonly learningState?: LearningState
  readonly status: PipelineStatus
  readonly errorMessage?: string
  readonly durationMs?: number
  readonly createdAt: Date
  readonly updatedAt: Date
}
