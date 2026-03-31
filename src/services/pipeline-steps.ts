import type { PipelineStep } from '../core/pipeline.js'
import type { PipelineContext } from '../contracts/index.js'
import type { LLMClient } from './openrouter.js'
import type { TTSClient } from './elevenlabs.js'
import type { PexelsClient } from './pexels.js'
import type { FFmpegClient } from './ffmpeg.js'
import type { ImageAIClient } from './image-ai.js'
import type { YouTubeClient } from './youtube-upload.js'

import { createContentEngine } from '../engines/content/index.js'
import { createSceneEngine } from '../engines/scene/index.js'
import { createVoiceEngine } from '../engines/voice/index.js'
import { createVisualEngine } from '../engines/visual/index.js'
import { createPacingEngine } from '../engines/pacing/index.js'
import { createRenderEngine } from '../engines/render/index.js'
import { createThumbnailEngine } from '../engines/thumbnail/index.js'
import { createUploadEngine } from '../engines/upload/index.js'

export interface PipelineClients {
  llm: LLMClient
  tts: TTSClient
  pexels: PexelsClient
  ffmpeg: FFmpegClient
  imageAI: ImageAIClient
  youtube: YouTubeClient
}

export interface PipelineStepsConfig {
  clients: PipelineClients
  voiceId: string
  storagePath: string
  outputDir: string
}

export function createPipelineSteps(config: PipelineStepsConfig): PipelineStep[] {
  const { clients, voiceId, storagePath, outputDir } = config

  const contentEngine = createContentEngine({ llm: clients.llm })
  const sceneEngine = createSceneEngine()
  const voiceEngine = createVoiceEngine({ tts: clients.tts, voiceId })
  const visualEngine = createVisualEngine({ pexels: clients.pexels, storagePath })
  const pacingEngine = createPacingEngine()
  const thumbnailEngine = createThumbnailEngine({
    llm: clients.llm,
    imageAI: clients.imageAI,
    storagePath,
  })
  const uploadEngine = createUploadEngine({
    llm: clients.llm,
    youtube: clients.youtube,
  })

  return [
    {
      name: 'content',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const manualIdea = (ctx as any).manualIdea as string | undefined
        const { idea, script } = await contentEngine.generateContent({
          niche: ctx.niche,
          idea: manualIdea,
        })
        return { ...ctx, idea, script }
      },
    },
    {
      name: 'scene',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const scenes = sceneEngine.process(ctx.script!)
        return { ...ctx, scenes }
      },
    },
    {
      name: 'voice',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const audioSegments = await voiceEngine.generateAll(ctx.scenes!)
        return { ...ctx, audioSegments }
      },
    },
    {
      name: 'visual',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const clips = await visualEngine.processAll(ctx.scenes!)
        return { ...ctx, clips }
      },
    },
    {
      name: 'pacing',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const scenes = pacingEngine.apply(ctx.scenes!)
        return { ...ctx, scenes }
      },
    },
    {
      name: 'render',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const renderEngine = createRenderEngine({
          ffmpeg: clients.ffmpeg,
          outputDir,
          pipelineId: ctx.id,
        })
        const video = await renderEngine.renderFull(ctx.scenes!, ctx.audioSegments!, ctx.clips!)
        return { ...ctx, videoPath: video.path }
      },
    },
    {
      name: 'thumbnail',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const { selected } = await thumbnailEngine.process({
          idea: ctx.idea!,
          videoId: ctx.id,
        })
        return { ...ctx, thumbnailPath: selected.localPath }
      },
    },
    {
      name: 'upload',
      async execute(ctx: PipelineContext): Promise<PipelineContext> {
        const result = await uploadEngine.upload({
          idea: ctx.idea!,
          script: ctx.script!,
          video: {
            id: ctx.id, pipelineId: ctx.id,
            path: ctx.videoPath!, duration: 0,
            resolution: '1920x1080', format: 'mp4',
            size: 0, hasSubtitles: true, hasMusic: true,
            createdAt: new Date(),
          },
          thumbnail: {
            id: 'thumb', videoId: ctx.id,
            concepts: [], imageUrl: '', localPath: ctx.thumbnailPath!,
            ctrScore: 0, isSelected: true, createdAt: new Date(),
          },
        })
        return { ...ctx, videoId: result.videoId, metadata: result.metadata }
      },
    },
  ]
}
