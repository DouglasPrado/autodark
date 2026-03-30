import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { loadConfig, type Config } from './config.js'

describe('Config', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('loads valid config from env', () => {
    process.env.DATABASE_URL = 'file:./dev.db'
    process.env.OPENROUTER_API_KEY = 'sk-test-123'
    process.env.ELEVENLABS_API_KEY = 'el-test-123'
    process.env.ELEVENLABS_VOICE_ID = 'voice-123'
    process.env.PEXELS_API_KEY = 'px-test-123'
    process.env.STORAGE_PATH = './storage'
    process.env.LOG_LEVEL = 'info'

    const config = loadConfig()
    expect(config.databaseUrl).toBe('file:./dev.db')
    expect(config.openrouterApiKey).toBe('sk-test-123')
    expect(config.logLevel).toBe('info')
    expect(config.storagePath).toBe('./storage')
  })

  it('uses default values for optional fields', () => {
    process.env.DATABASE_URL = 'file:./dev.db'
    process.env.OPENROUTER_API_KEY = 'sk-test'
    process.env.ELEVENLABS_API_KEY = 'el-test'
    process.env.ELEVENLABS_VOICE_ID = 'voice-123'
    process.env.PEXELS_API_KEY = 'px-test'

    const config = loadConfig()
    expect(config.storagePath).toBe('./storage')
    expect(config.logLevel).toBe('info')
  })

  it('throws ConfigError when required env is missing', () => {
    delete process.env.DATABASE_URL
    delete process.env.OPENROUTER_API_KEY

    expect(() => loadConfig()).toThrow()
  })

  it('validates log level values', () => {
    process.env.DATABASE_URL = 'file:./dev.db'
    process.env.OPENROUTER_API_KEY = 'sk-test'
    process.env.ELEVENLABS_API_KEY = 'el-test'
    process.env.ELEVENLABS_VOICE_ID = 'voice-123'
    process.env.PEXELS_API_KEY = 'px-test'
    process.env.LOG_LEVEL = 'invalid'

    expect(() => loadConfig()).toThrow()
  })
})
