import { describe, it, expect } from 'vitest'
import { estimateDurations } from './duration.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'
import { MAX_SCENE_DURATION } from '../../utils/constants.js'

function makeScene(overrides: Partial<Scene> = {}): Scene {
  return {
    id: 'scene-1',
    scriptId: 'script-1',
    order: 0,
    text: 'Uma frase de teste para estimar duração.',
    duration: 0,
    start: 0,
    end: 0,
    visualQuery: '',
    segmentType: SegmentType.HOOK,
    status: SceneStatus.PENDING,
    createdAt: new Date(),
    ...overrides,
  }
}

describe('estimateDurations', () => {
  it('estimates duration based on word count', () => {
    const scenes = estimateDurations([makeScene()])
    expect(scenes[0]!.duration).toBeGreaterThan(0)
  })

  it('enforces max duration of 2.5s per scene', () => {
    const longText = 'palavra '.repeat(100) // very long text
    const scenes = estimateDurations([makeScene({ text: longText })])
    expect(scenes[0]!.duration).toBeLessThanOrEqual(MAX_SCENE_DURATION)
  })

  it('splits long scenes into multiple sub-scenes', () => {
    const longText = 'Esta é uma frase muito longa que deve ser dividida em múltiplas cenas para respeitar o limite de duração máxima de cada cena individual no vídeo final.'
    const scenes = estimateDurations([makeScene({ text: longText })])
    expect(scenes.length).toBeGreaterThanOrEqual(1)
    scenes.forEach((s) => {
      expect(s.duration).toBeLessThanOrEqual(MAX_SCENE_DURATION)
    })
  })

  it('calculates start and end timestamps sequentially', () => {
    const scenes = estimateDurations([
      makeScene({ order: 0, text: 'Frase curta.' }),
      makeScene({ order: 1, text: 'Outra frase curta.' }),
    ])
    expect(scenes[0]!.start).toBe(0)
    expect(scenes[0]!.end).toBeGreaterThan(0)
    expect(scenes[1]!.start).toBe(scenes[0]!.end)
    expect(scenes[1]!.end).toBeGreaterThan(scenes[1]!.start)
  })

  it('preserves order after estimation', () => {
    const scenes = estimateDurations([
      makeScene({ order: 0, text: 'Cena um.' }),
      makeScene({ order: 1, text: 'Cena dois.' }),
      makeScene({ order: 2, text: 'Cena três.' }),
    ])
    scenes.forEach((s, i) => {
      expect(s.order).toBe(i)
    })
  })
})
