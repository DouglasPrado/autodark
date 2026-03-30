import type { Command } from 'commander'

export function registerStatusCommand(program: Command): void {
  program
    .command('status')
    .description('Ver status dos pipelines')
    .option('--pipeline-id <id>', 'ID de um pipeline específico')
    .action(async (options) => {
      if (options.pipelineId) {
        console.log(`Status do pipeline: ${options.pipelineId}`)
      } else {
        console.log('Nenhum pipeline em execução')
      }
    })
}
