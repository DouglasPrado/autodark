import type { Command } from 'commander'

export function registerGenerateCommand(program: Command): void {
  program
    .command('generate')
    .description('Gerar novo vídeo para o canal')
    .requiredOption('--niche <niche>', 'Nicho do canal (ex: dark, curiosidades)')
    .option('--idea <idea>', 'Ideia específica para o vídeo')
    .option('--dry-run', 'Simular sem executar', false)
    .action(async (options) => {
      console.log(`Gerando vídeo para nicho: ${options.niche}`)
      if (options.dryRun) {
        console.log('[dry-run] Simulação — nenhum vídeo gerado')
        return
      }
      console.log('Pipeline não implementado ainda. Use /codegen-feature Pipeline Core')
    })
}
