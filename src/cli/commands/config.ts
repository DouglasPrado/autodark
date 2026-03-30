import type { Command } from 'commander'

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('Ver configuração do sistema')
    .option('--list', 'Listar todas as configurações')
    .action(async (options) => {
      console.log('Configuração do Mestra AI:')
      console.log('  Use --list para ver detalhes')
    })
}
