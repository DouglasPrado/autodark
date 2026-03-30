import { describe, it, expect } from 'vitest'
import { createDatabaseClient, type DatabaseClient } from './client.js'

describe('DatabaseClient', () => {
  it('creates a database client', () => {
    const client = createDatabaseClient()
    expect(client).toBeDefined()
    expect(client.connect).toBeTypeOf('function')
    expect(client.disconnect).toBeTypeOf('function')
  })
})
