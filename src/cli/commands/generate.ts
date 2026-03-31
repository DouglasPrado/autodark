import type { Command } from 'commander'
import { bootstrap } from '../bootstrap.js'

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Gerar novo vídeo para o canal')
    .requiredOption('--niche <niche>', 'Nicho do canal (ex: dark, curiosidades)')
    .option('--idea <idea>', 'Ideia específica para o vídeo')
    .option('--dry-run', 'Simular sem executar', false)
    .action(async (options) => {
      if (options.dryRun) {
        console.log(`[dry-run] Simulação para nicho: ${options.niche}`)
        if (options.idea) console.log(`[dry-run] Ideia: ${options.idea}`)
        console.log('[dry-run] Pipeline não será executado')
        return
      }

      let app
      try {
        app = await bootstrap()
        app.logger.info('Comando generate iniciado', { niche: options.niche, idea: options.idea })

        const start = performance.now()
        const result = await app.orchestrator.execute({
          niche: options.niche,
          idea: options.idea,
        })
        const durationMs = Math.round(performance.now() - start)

        if (result.status === 'completed') {
          console.log(`\nVideo gerado com sucesso!`)
          console.log(`  Pipeline ID: ${result.id}`)
          console.log(`  Nicho: ${result.niche}`)
          if (result.videoId) console.log(`  YouTube ID: ${result.videoId}`)
          if (result.videoPath) console.log(`  Arquivo: ${result.videoPath}`)
          console.log(`  Duracao: ${(durationMs / 1000).toFixed(1)}s`)
        } else {
          console.error(`\nPipeline falhou: ${result.errorMessage}`)
          process.exitCode = 1
        }
      } catch (err) {
        console.error('Erro fatal:', err instanceof Error ? err.message : err)
        process.exitCode = 1
      } finally {
        await app?.disconnect()
      }
    })
}
