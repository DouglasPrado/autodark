import type { Command } from 'commander'

export function registerVideosCommand(program: Command): void {
  program
    .command('videos')
    .description('Listar vídeos gerados')
    .option('--niche <niche>', 'Filtrar por nicho')
    .option('--limit <limit>', 'Limite de resultados', '10')
    .action(async (options) => {
      console.log(`Listando vídeos${options.niche ? ` do nicho ${options.niche}` : ''}`)
      console.log('Nenhum vídeo encontrado')
    })
}
