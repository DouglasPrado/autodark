import { describe, it, expect } from 'vitest'
import { generateVisualQueries } from './query.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'

function makeScene(text: string, segmentType: SegmentType = SegmentType.HOOK): Scene {
  return {
    id: 'scene-1',
    scriptId: 'script-1',
    order: 0,
    text,
    duration: 2,
    start: 0,
    end: 2,
    visualQuery: '',
    segmentType,
    status: SceneStatus.PENDING,
    createdAt: new Date(),
  }
}

describe('generateVisualQueries', () => {
  it('generates a visual query for each scene', () => {
    const scenes = generateVisualQueries([
      makeScene('Cavernas escuras e misteriosas'),
      makeScene('Exploradores com lanternas', SegmentType.SETUP),
    ])
    expect(scenes[0]!.visualQuery).toBeTruthy()
    expect(scenes[1]!.visualQuery).toBeTruthy()
  })

  it('generates English queries for Pexels search', () => {
    const scenes = generateVisualQueries([
      makeScene('Lugares assombrados do mundo'),
    ])
    // Query should be non-empty and contain relevant keywords
    expect(scenes[0]!.visualQuery.length).toBeGreaterThan(2)
  })

  it('does not overwrite existing non-empty queries', () => {
    const scene: Scene = {
      ...makeScene('Texto qualquer'),
      visualQuery: 'existing query',
    }
    const result = generateVisualQueries([scene])
    expect(result[0]!.visualQuery).toBe('existing query')
  })

  it('generates different queries for different texts', () => {
    const scenes = generateVisualQueries([
      makeScene('Oceano profundo e escuro'),
      makeScene('Montanhas cobertas de neve'),
    ])
    expect(scenes[0]!.visualQuery).not.toBe(scenes[1]!.visualQuery)
  })
})
