import type { PrismaClient } from '@prisma/client'
import type { ContentPlan } from '../../../contracts/index.js'

function toContentPlan(row: any): ContentPlan {
  return {
    id: row.id,
    niche: row.niche,
    topics: JSON.parse(row.topics),
    generatedAt: row.generatedAt,
  }
}

export interface ContentPlanRepository {
  save(plan: ContentPlan): Promise<ContentPlan>
  findLatestByNiche(niche: string): Promise<ContentPlan | null>
}

export function createContentPlanRepository(prisma: PrismaClient): ContentPlanRepository {
  return {
    async save(plan) {
      const row = await prisma.contentPlan.create({
        data: {
          id: plan.id,
          niche: plan.niche,
          topics: JSON.stringify(plan.topics),
        },
      })
      return toContentPlan(row)
    },

    async findLatestByNiche(niche) {
      const row = await prisma.contentPlan.findFirst({
        where: { niche },
        orderBy: { generatedAt: 'desc' },
      })
      return row ? toContentPlan(row) : null
    },
  }
}
