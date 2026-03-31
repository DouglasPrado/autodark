import type { PrismaClient } from '@prisma/client'
import type { PipelineContext } from '../../../contracts/index.js'
import type { PipelineRepository } from '../../../core/pipeline.js'

function serializeJson(value: unknown): string | null {
  if (value === undefined || value === null) return null
  return JSON.stringify(value)
}

function toPipelineContext(row: any): PipelineContext {
  return {
    id: row.id,
    niche: row.niche,
    status: row.status,
    idea: row.idea ? JSON.parse(row.idea) : undefined,
    script: row.script ? JSON.parse(row.script) : undefined,
    scenes: row.scenes ? JSON.parse(row.scenes) : undefined,
    audioSegments: row.audioSegments ? JSON.parse(row.audioSegments) : undefined,
    clips: row.clips ? JSON.parse(row.clips) : undefined,
    videoPath: row.videoPath ?? undefined,
    thumbnailPath: row.thumbnailPath ?? undefined,
    metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    videoId: row.videoId ?? undefined,
    performanceScore: row.performanceScore ?? undefined,
    learningState: row.learningState ? JSON.parse(row.learningState) : undefined,
    errorMessage: row.errorMessage ?? undefined,
    durationMs: row.durationMs ? Number(row.durationMs) : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function createPipelineRepository(prisma: PrismaClient): PipelineRepository {
  return {
    async save(ctx: PipelineContext): Promise<PipelineContext> {
      const row = await prisma.pipeline.create({
        data: {
          id: ctx.id,
          niche: ctx.niche,
          status: ctx.status,
          idea: serializeJson(ctx.idea),
          script: serializeJson(ctx.script),
          scenes: serializeJson(ctx.scenes),
          audioSegments: serializeJson(ctx.audioSegments),
          clips: serializeJson(ctx.clips),
          videoPath: ctx.videoPath ?? null,
          thumbnailPath: ctx.thumbnailPath ?? null,
          metadata: serializeJson(ctx.metadata),
          videoId: ctx.videoId ?? null,
          performanceScore: ctx.performanceScore ?? null,
          learningState: serializeJson(ctx.learningState),
          errorMessage: ctx.errorMessage ?? null,
          durationMs: ctx.durationMs ? BigInt(ctx.durationMs) : null,
        },
      })
      return toPipelineContext(row)
    },

    async findById(id: string): Promise<PipelineContext | null> {
      const row = await prisma.pipeline.findUnique({ where: { id } })
      if (!row) return null
      return toPipelineContext(row)
    },

    async update(id: string, data: Partial<PipelineContext>): Promise<PipelineContext> {
      const updateData: any = {}
      if (data.status !== undefined) updateData.status = data.status
      if (data.idea !== undefined) updateData.idea = serializeJson(data.idea)
      if (data.script !== undefined) updateData.script = serializeJson(data.script)
      if (data.scenes !== undefined) updateData.scenes = serializeJson(data.scenes)
      if (data.audioSegments !== undefined) updateData.audioSegments = serializeJson(data.audioSegments)
      if (data.clips !== undefined) updateData.clips = serializeJson(data.clips)
      if (data.videoPath !== undefined) updateData.videoPath = data.videoPath
      if (data.thumbnailPath !== undefined) updateData.thumbnailPath = data.thumbnailPath
      if (data.metadata !== undefined) updateData.metadata = serializeJson(data.metadata)
      if (data.videoId !== undefined) updateData.videoId = data.videoId
      if (data.performanceScore !== undefined) updateData.performanceScore = data.performanceScore
      if (data.learningState !== undefined) updateData.learningState = serializeJson(data.learningState)
      if (data.errorMessage !== undefined) updateData.errorMessage = data.errorMessage
      if (data.durationMs !== undefined) updateData.durationMs = data.durationMs ? BigInt(data.durationMs) : null

      const row = await prisma.pipeline.update({ where: { id }, data: updateData })
      return toPipelineContext(row)
    },
  }
}
