import type { Command } from 'commander'
import { loadConfig } from '../../infrastructure/config.js'

export function registerConfigCommand(program: Command): void {
  program
    .command('config')
    .description('Ver configuração do sistema')
    .option('--list', 'Listar todas as configurações')
    .option('--validate', 'Validar configuração')
    .action(async (options) => {
      try {
        const config = loadConfig()

        if (options.validate) {
          console.log('Configuração válida!')
          return
        }

        console.log('\nConfiguração do Mestra AI:\n')
        console.log(`  Database:     ${config.databaseUrl.startsWith('file:') ? 'SQLite' : 'PostgreSQL'}`)
        console.log(`  OpenRouter:   ${config.openrouterApiKey ? 'configurado' : 'FALTANDO'}`)
        console.log(`  ElevenLabs:   ${config.elevenlabsApiKey ? 'configurado' : 'FALTANDO'}`)
        console.log(`  Voice ID:     ${config.elevenlabsVoiceId || 'FALTANDO'}`)
        console.log(`  Pexels:       ${config.pexelsApiKey ? 'configurado' : 'FALTANDO'}`)
        console.log(`  YouTube:      ${config.youtubeClientId ? 'OAuth2 configurado' : 'não configurado (mock)'}`)
        console.log(`  Storage:      ${config.storagePath}`)
        console.log(`  Log Level:    ${config.logLevel}`)
        console.log(`  Metrics Cron: ${config.metricsCron}`)
        console.log(`  Learning Cron: ${config.learningCron}`)
      } catch (err) {
        console.error('Erro na configuração:', err instanceof Error ? err.message : err)
        console.error('\nCopie .env.example para .env e preencha as API keys')
        process.exitCode = 1
      }
    })
}
