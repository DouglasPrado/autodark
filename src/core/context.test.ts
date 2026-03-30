import { describe, it, expect } from 'vitest'
import { createContext, nextContext } from './context.js'
import { PipelineStatus } from '../contracts/index.js'

describe('createContext', () => {
  it('creates context with pending status and required fields', () => {
    const ctx = createContext({ niche: 'dark' })
    expect(ctx.id).toBeDefined()
    expect(ctx.niche).toBe('dark')
    expect(ctx.status).toBe(PipelineStatus.PENDING)
    expect(ctx.createdAt).toBeInstanceOf(Date)
    expect(ctx.updatedAt).toBeInstanceOf(Date)
  })

  it('generates unique ids', () => {
    const a = createContext({ niche: 'dark' })
    const b = createContext({ niche: 'dark' })
    expect(a.id).not.toBe(b.id)
  })

  it('validates niche is non-empty', () => {
    expect(() => createContext({ niche: '' })).toThrow()
  })
})

describe('nextContext', () => {
  it('returns new context with updates (immutable)', () => {
    const ctx = createContext({ niche: 'dark' })
    const next = nextContext(ctx, { status: PipelineStatus.RUNNING })
    expect(next.status).toBe(PipelineStatus.RUNNING)
    expect(next.id).toBe(ctx.id)
    expect(next.niche).toBe('dark')
    expect(ctx.status).toBe(PipelineStatus.PENDING) // original unchanged
  })

  it('updates updatedAt on every call', () => {
    const ctx = createContext({ niche: 'dark' })
    const next = nextContext(ctx, { status: PipelineStatus.RUNNING })
    expect(next.updatedAt.getTime()).toBeGreaterThanOrEqual(ctx.updatedAt.getTime())
  })

  it('merges optional fields', () => {
    const ctx = createContext({ niche: 'dark' })
    const next = nextContext(ctx, { idea: { id: '1', niche: 'dark', text: 'test idea', source: 'manual', createdAt: new Date() } as any })
    expect(next.idea).toBeDefined()
    expect(next.idea!.text).toBe('test idea')
  })
})
