import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { createPipelineRepository } from './pipeline.js'
import { createContext } from '../../../core/context.js'
import { PipelineStatus } from '../../../contracts/index.js'

const prisma = new PrismaClient({
  datasources: { db: { url: 'file:./test.db' } },
})

describe('PipelineRepository (integration)', () => {
  beforeAll(async () => {
    await prisma.$connect()
    // Push schema to test DB
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS Pipeline (
        id TEXT PRIMARY KEY, niche TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'pending',
        idea TEXT, script TEXT, scenes TEXT, audioSegments TEXT, clips TEXT,
        videoPath TEXT, thumbnailPath TEXT, metadata TEXT, videoId TEXT,
        performanceScore REAL, learningState TEXT, errorMessage TEXT, durationMs INTEGER,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    // Also create SeriesVideo table since Pipeline has relation
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS SeriesVideo (
        id TEXT PRIMARY KEY, seriesId TEXT NOT NULL, pipelineId TEXT NOT NULL,
        episodeOrder INTEGER NOT NULL, addedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS VideoMetrics (
        id TEXT PRIMARY KEY, pipelineId TEXT NOT NULL, youtubeVideoId TEXT NOT NULL,
        publishedAt DATETIME NOT NULL, views INTEGER DEFAULT 0, likes INTEGER DEFAULT 0,
        comments INTEGER DEFAULT 0, retention REAL, ctr REAL, avgWatchTime REAL,
        dropOffPoints TEXT, retentionCurve TEXT, status TEXT DEFAULT 'pending',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `)
  })

  afterAll(async () => {
    await prisma.$executeRawUnsafe('DELETE FROM Pipeline')
    await prisma.$disconnect()
  })

  it('saves and retrieves a pipeline', async () => {
    const repo = createPipelineRepository(prisma)
    const ctx = createContext({ niche: 'dark' })

    const saved = await repo.save(ctx)
    expect(saved.id).toBe(ctx.id)
    expect(saved.niche).toBe('dark')
    expect(saved.status).toBe(PipelineStatus.PENDING)

    const found = await repo.findById(ctx.id)
    expect(found).not.toBeNull()
    expect(found!.id).toBe(ctx.id)
    expect(found!.niche).toBe('dark')
  })

  it('updates pipeline status', async () => {
    const repo = createPipelineRepository(prisma)
    const ctx = createContext({ niche: 'curiosidades' })
    await repo.save(ctx)

    const updated = await repo.update(ctx.id, { status: PipelineStatus.RUNNING })
    expect(updated.status).toBe(PipelineStatus.RUNNING)

    const found = await repo.findById(ctx.id)
    expect(found!.status).toBe(PipelineStatus.RUNNING)
  })

  it('saves and retrieves JSON fields', async () => {
    const repo = createPipelineRepository(prisma)
    const ctx = createContext({ niche: 'dark' })
    await repo.save(ctx)

    const idea = { id: 'i1', niche: 'dark', text: 'test idea', source: 'manual', createdAt: new Date().toISOString() }
    await repo.update(ctx.id, { idea } as any)

    const found = await repo.findById(ctx.id)
    expect(found!.idea).toBeDefined()
    expect((found!.idea as any).text).toBe('test idea')
  })

  it('returns null for non-existent pipeline', async () => {
    const repo = createPipelineRepository(prisma)
    const found = await repo.findById('non-existent-id')
    expect(found).toBeNull()
  })
})
