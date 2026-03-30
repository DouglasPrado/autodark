import { PrismaClient } from '@prisma/client'

export interface DatabaseClient {
  prisma: PrismaClient
  connect(): Promise<void>
  disconnect(): Promise<void>
}

let instance: DatabaseClient | null = null

export function createDatabaseClient(): DatabaseClient {
  if (instance) return instance

  const prisma = new PrismaClient()

  instance = {
    prisma,
    async connect() {
      await prisma.$connect()
    },
    async disconnect() {
      await prisma.$disconnect()
      instance = null
    },
  }

  return instance
}
