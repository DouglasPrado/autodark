import type { Command } from 'commander'
import { getDb, disconnectDb } from '../db.js'

export function registerVideosCommand(program: Command): void {
  program
    .command('videos')
    .description('Listar vídeos gerados')
    .option('--niche <niche>', 'Filtrar por nicho')
    .option('--status <status>', 'Filtrar por status (completed, failed, running)')
    .option('--limit <limit>', 'Limite de resultados', '10')
    .action(async (options) => {
      const prisma = getDb()
      try {
        const where: any = {}
        if (options.niche) where.niche = options.niche
        if (options.status) where.status = options.status
        else where.status = 'completed'

        const pipelines = await prisma.pipeline.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: parseInt(options.limit, 10),
          select: {
            id: true, niche: true, status: true, videoId: true,
            videoPath: true, createdAt: true, durationMs: true,
          },
        })

        if (pipelines.length === 0) {
          console.log(`Nenhum vídeo encontrado${options.niche ? ` para nicho "${options.niche}"` : ''}`)
          return
        }

        console.log(`\n${'Nicho'.padEnd(15)} ${'YouTube ID'.padEnd(15)} ${'Arquivo'.padEnd(35)} ${'Duracao'.padEnd(10)} Data`)
        console.log('-'.repeat(95))
        for (const p of pipelines) {
          const dur = p.durationMs ? `${(Number(p.durationMs) / 1000).toFixed(0)}s` : '-'
          console.log(
            `${p.niche.padEnd(15)} ${(p.videoId ?? '-').padEnd(15)} ${(p.videoPath ?? '-').slice(-33).padEnd(35)} ${dur.padEnd(10)} ${p.createdAt.toISOString().slice(0, 10)}`
          )
        }
        console.log(`\n${pipelines.length} vídeo(s)`)
      } catch (err) {
        console.error('Erro ao listar vídeos:', err instanceof Error ? err.message : err)
        process.exitCode = 1
      } finally {
        await disconnectDb()
      }
    })
}
