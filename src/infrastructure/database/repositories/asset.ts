import type { PrismaClient } from '@prisma/client'

export interface AssetRecord {
  id: string
  source: string
  sourceId: string
  sourceUrl: string
  localPath: string
  mediaType: string
  duration?: number
  query?: string
  score?: number
  cachedAt: Date
}

export interface AssetRepository {
  save(asset: AssetRecord): Promise<AssetRecord>
  findBySource(source: string, sourceId: string): Promise<AssetRecord | null>
  findByQuery(query: string): Promise<AssetRecord[]>
  deleteOlderThan(date: Date): Promise<number>
}

export function createAssetRepository(prisma: PrismaClient): AssetRepository {
  return {
    async save(asset) {
      const row = await prisma.asset.create({
        data: {
          id: asset.id,
          source: asset.source,
          sourceId: asset.sourceId,
          sourceUrl: asset.sourceUrl,
          localPath: asset.localPath,
          mediaType: asset.mediaType,
          duration: asset.duration ?? null,
          query: asset.query ?? null,
          score: asset.score ?? null,
        },
      })
      return { ...row, duration: row.duration ?? undefined, query: row.query ?? undefined, score: row.score ?? undefined }
    },

    async findBySource(source, sourceId) {
      const row = await prisma.asset.findUnique({ where: { source_sourceId: { source, sourceId } } })
      if (!row) return null
      return { ...row, duration: row.duration ?? undefined, query: row.query ?? undefined, score: row.score ?? undefined }
    },

    async findByQuery(query) {
      const rows = await prisma.asset.findMany({ where: { query: { contains: query } } })
      return rows.map((r) => ({ ...r, duration: r.duration ?? undefined, query: r.query ?? undefined, score: r.score ?? undefined }))
    },

    async deleteOlderThan(date) {
      const result = await prisma.asset.deleteMany({ where: { cachedAt: { lt: date } } })
      return result.count
    },
  }
}
