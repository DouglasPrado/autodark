import type { PrismaClient } from '@prisma/client'

export interface SettingsRepository {
  get(key: string): Promise<string | null>
  set(key: string, value: string, description?: string): Promise<void>
  list(): Promise<Array<{ key: string; value: string; description?: string }>>
}

export function createSettingsRepository(prisma: PrismaClient): SettingsRepository {
  return {
    async get(key) {
      const row = await prisma.setting.findUnique({ where: { key } })
      return row?.value ?? null
    },

    async set(key, value, description) {
      await prisma.setting.upsert({
        where: { key },
        create: { key, value, description },
        update: { value, description },
      })
    },

    async list() {
      const rows = await prisma.setting.findMany()
      return rows.map((r) => ({ key: r.key, value: r.value, description: r.description ?? undefined }))
    },
  }
}
