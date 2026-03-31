import type { PrismaClient } from '@prisma/client'
import type { LearningState } from '../../../contracts/index.js'
import { LearningStatus } from '../../../contracts/index.js'

function toLearningState(row: any): LearningState {
  return {
    id: row.id,
    niche: row.niche,
    hookWeights: JSON.parse(row.hookWeights),
    templateWeights: JSON.parse(row.templateWeights),
    pacingWeights: JSON.parse(row.pacingWeights),
    contentWeights: JSON.parse(row.contentWeights),
    isActive: row.isActive,
    status: row.isActive ? LearningStatus.ACTIVE : LearningStatus.INACTIVE,
    lastUpdated: row.lastUpdated,
    analyzedVideos: row.analyzedVideos,
    createdAt: row.createdAt,
  }
}

export interface LearningStateRepository {
  findByNiche(niche: string): Promise<LearningState | null>
  upsert(state: LearningState): Promise<LearningState>
}

export function createLearningStateRepository(prisma: PrismaClient): LearningStateRepository {
  return {
    async findByNiche(niche) {
      const row = await prisma.learningState.findUnique({ where: { niche } })
      return row ? toLearningState(row) : null
    },

    async upsert(state) {
      const row = await prisma.learningState.upsert({
        where: { niche: state.niche },
        create: {
          id: state.id,
          niche: state.niche,
          hookWeights: JSON.stringify(state.hookWeights),
          templateWeights: JSON.stringify(state.templateWeights),
          pacingWeights: JSON.stringify(state.pacingWeights),
          contentWeights: JSON.stringify(state.contentWeights),
          isActive: state.isActive,
          analyzedVideos: state.analyzedVideos,
        },
        update: {
          hookWeights: JSON.stringify(state.hookWeights),
          templateWeights: JSON.stringify(state.templateWeights),
          pacingWeights: JSON.stringify(state.pacingWeights),
          contentWeights: JSON.stringify(state.contentWeights),
          isActive: state.isActive,
          analyzedVideos: state.analyzedVideos,
        },
      })
      return toLearningState(row)
    },
  }
}
