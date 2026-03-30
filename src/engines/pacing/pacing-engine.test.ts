import { describe, it, expect } from 'vitest'
import { enforceMaxSceneDuration } from './maxDuration.js'
import { addPatternInterrupts } from './interrupts.js'
import { applyZoomEffects } from './zoom.js'
import { addMicroTransitions } from './transitions.js'
import { createPacingEngine } from './index.js'
import type { Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'
import { MAX_SCENE_DURATION } from '../../utils/constants.js'

function makeScene(overrides: Partial<Scene> = {}): Scene {
  return {
    id: 'scene-1',
    scriptId: 'script-1',
    order: 0,
    text: 'Texto da cena.',
    duration: 2.0,
    start: 0,
    end: 2.0,
    visualQuery: 'dark cave',
    segmentType: SegmentType.SETUP,
    status: SceneStatus.PENDING,
    createdAt: new Date(),
    ...overrides,
  }
}

function makeScenes(): Scene[] {
  return [
    makeScene({ id: 's1', order: 0, segmentType: SegmentType.HOOK, duration: 1.5, start: 0, end: 1.5 }),
    makeScene({ id: 's2', order: 1, segmentType: SegmentType.SETUP, duration: 2.0, start: 1.5, end: 3.5 }),
    makeScene({ id: 's3', order: 2, segmentType: SegmentType.ESCALADA, duration: 2.5, start: 3.5, end: 6.0 }),
    makeScene({ id: 's4', order: 3, segmentType: SegmentType.TWIST, duration: 2.0, start: 6.0, end: 8.0 }),
    makeScene({ id: 's5', order: 4, segmentType: SegmentType.PAYOFF, duration: 2.0, start: 8.0, end: 10.0 }),
    makeScene({ id: 's6', order: 5, segmentType: SegmentType.LOOP, duration: 1.5, start: 10.0, end: 11.5 }),
  ]
}

describe('enforceMaxSceneDuration', () => {
  it('caps scenes that exceed max duration', () => {
    const scenes = [makeScene({ duration: 4.0, end: 4.0 })]
    const result = enforceMaxSceneDuration(scenes)
    result.forEach((s) => {
      expect(s.duration).toBeLessThanOrEqual(MAX_SCENE_DURATION)
    })
  })

  it('does not modify scenes within limit', () => {
    const scenes = [makeScene({ duration: 2.0 })]
    const result = enforceMaxSceneDuration(scenes)
    expect(result).toHaveLength(1)
    expect(result[0]!.duration).toBe(2.0)
  })

  it('recalculates timestamps after capping', () => {
    const scenes = [
      makeScene({ id: 's1', order: 0, duration: 4.0, start: 0, end: 4.0 }),
      makeScene({ id: 's2', order: 1, duration: 2.0, start: 4.0, end: 6.0 }),
    ]
    const result = enforceMaxSceneDuration(scenes)
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.start).toBe(result[i - 1]!.end)
    }
  })
})

describe('addPatternInterrupts', () => {
  it('adds pattern interrupt to alternating scenes', () => {
    const scenes = makeScenes()
    const result = addPatternInterrupts(scenes)
    const withInterrupt = result.filter((s) => s.pacing?.patternInterrupt)
    expect(withInterrupt.length).toBeGreaterThan(0)
    expect(withInterrupt.length).toBeLessThan(scenes.length)
  })

  it('preserves all scene data', () => {
    const scenes = makeScenes()
    const result = addPatternInterrupts(scenes)
    expect(result).toHaveLength(scenes.length)
    result.forEach((s, i) => {
      expect(s.id).toBe(scenes[i]!.id)
      expect(s.text).toBe(scenes[i]!.text)
    })
  })
})

describe('applyZoomEffects', () => {
  it('applies zoom to hook, twist and payoff segments', () => {
    const scenes = makeScenes()
    const result = applyZoomEffects(scenes)
    const hook = result.find((s) => s.segmentType === SegmentType.HOOK)
    const twist = result.find((s) => s.segmentType === SegmentType.TWIST)
    const payoff = result.find((s) => s.segmentType === SegmentType.PAYOFF)
    expect(hook!.pacing?.zoomEffect).toBe(true)
    expect(twist!.pacing?.zoomEffect).toBe(true)
    expect(payoff!.pacing?.zoomEffect).toBe(true)
  })

  it('does not apply zoom to setup/escalada/loop', () => {
    const scenes = makeScenes()
    const result = applyZoomEffects(scenes)
    const setup = result.find((s) => s.segmentType === SegmentType.SETUP)
    expect(setup!.pacing?.zoomEffect).toBeFalsy()
  })
})

describe('addMicroTransitions', () => {
  it('adds transition type to all scenes', () => {
    const scenes = makeScenes()
    const result = addMicroTransitions(scenes)
    result.forEach((s) => {
      expect(s.pacing?.transitionType).toBeDefined()
      expect(s.pacing!.transitionType.length).toBeGreaterThan(0)
    })
  })

  it('varies transition types across scenes', () => {
    const scenes = makeScenes()
    const result = addMicroTransitions(scenes)
    const types = new Set(result.map((s) => s.pacing?.transitionType))
    expect(types.size).toBeGreaterThan(1)
  })
})

describe('PacingEngine (facade)', () => {
  it('applies all pacing transforms and returns valid scenes', () => {
    const engine = createPacingEngine()
    const scenes = makeScenes()
    const result = engine.apply(scenes)

    expect(result.length).toBeGreaterThanOrEqual(scenes.length)
    result.forEach((s) => {
      expect(s.duration).toBeLessThanOrEqual(MAX_SCENE_DURATION)
      expect(s.pacing).toBeDefined()
      expect(s.pacing!.maxDuration).toBe(MAX_SCENE_DURATION)
      expect(s.pacing!.transitionType).toBeDefined()
    })
  })

  it('preserves sequential timestamps', () => {
    const engine = createPacingEngine()
    const result = engine.apply(makeScenes())
    for (let i = 1; i < result.length; i++) {
      expect(result[i]!.start).toBe(result[i - 1]!.end)
    }
  })
})
