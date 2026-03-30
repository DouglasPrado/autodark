import { v4 as uuid } from 'uuid'
import type { PipelineContext } from '../contracts/index.js'
import { PipelineStatus } from '../contracts/index.js'
import { ValidationError } from './errors.js'

export interface CreateContextParams {
  niche: string
}

export function createContext(params: CreateContextParams): PipelineContext {
  if (!params.niche || params.niche.trim().length === 0) {
    throw new ValidationError('INVALID_NICHE', 'Nicho é obrigatório e não pode ser vazio')
  }

  const now = new Date()
  return {
    id: uuid(),
    niche: params.niche.trim(),
    status: PipelineStatus.PENDING,
    createdAt: now,
    updatedAt: now,
  }
}

export function nextContext(
  ctx: PipelineContext,
  updates: Partial<Omit<PipelineContext, 'id' | 'niche' | 'createdAt'>>,
): PipelineContext {
  return {
    ...ctx,
    ...updates,
    updatedAt: new Date(),
  }
}
