import type { Command } from 'commander'
import { getDb, disconnectDb } from '../db.js'

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Ver status dos pipelines')
    .option('--pipeline-id <id>', 'ID de um pipeline específico')
    .action(async (options) => {
      const prisma = getDb()
      try {
        if (options.pipelineId) {
          const pipeline = await prisma.pipeline.findUnique({
            where: { id: options.pipelineId },
          })
          if (!pipeline) {
            console.error(`Pipeline ${options.pipelineId} não encontrado`)
            process.exitCode = 1
            return
          }
          console.log(`\nPipeline: ${pipeline.id}`)
          console.log(`  Nicho:    ${pipeline.niche}`)
          console.log(`  Status:   ${pipeline.status}`)
          console.log(`  Criado:   ${pipeline.createdAt.toISOString()}`)
          if (pipeline.videoId) console.log(`  YouTube:  ${pipeline.videoId}`)
          if (pipeline.videoPath) console.log(`  Arquivo:  ${pipeline.videoPath}`)
          if (pipeline.errorMessage) console.log(`  Erro:     ${pipeline.errorMessage}`)
          if (pipeline.durationMs) console.log(`  Duracao:  ${Number(pipeline.durationMs) / 1000}s`)
        } else {
          const pipelines = await prisma.pipeline.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { id: true, niche: true, status: true, videoId: true, createdAt: true },
          })

          if (pipelines.length === 0) {
            console.log('Nenhum pipeline encontrado')
            return
          }

          console.log(`\n${'ID'.padEnd(38)} ${'Nicho'.padEnd(15)} ${'Status'.padEnd(12)} ${'YouTube'.padEnd(15)} Data`)
          console.log('-'.repeat(100))
          for (const p of pipelines) {
            console.log(
              `${p.id.padEnd(38)} ${p.niche.padEnd(15)} ${p.status.padEnd(12)} ${(p.videoId ?? '-').padEnd(15)} ${p.createdAt.toISOString().slice(0, 19)}`
            )
          }
          console.log(`\n${pipelines.length} pipeline(s)`)
        }
      } catch (err) {
        console.error('Erro ao consultar status:', err instanceof Error ? err.message : err)
        process.exitCode = 1
      } finally {
        await disconnectDb()
      }
    })
}
