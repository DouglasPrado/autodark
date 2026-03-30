import { describe, it, expect } from 'vitest'
import { splitIntoScenes } from './segment.js'
import type { Script } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'

const fullScript: Script = {
  id: 'script-1',
  ideaId: 'idea-1',
  template: 'HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP',
  hook: 'Você não vai acreditar no que existe debaixo da terra.',
  setup: 'Em 1947 um grupo de exploradores descobriu algo incrível nas profundezas.',
  escalada: 'Mas o que eles encontraram lá dentro mudou tudo o que sabíamos sobre história.',
  twist: 'O mais perturbador é que ninguém nunca voltou para confirmar a descoberta.',
  payoff: 'As evidências foram destruídas pelo governo e nunca mais recuperadas.',
  loop: 'E o próximo lugar da lista é ainda mais aterrorizante do que esse.',
  estimatedDuration: 45,
  createdAt: new Date(),
}

const minimalScript: Script = {
  id: 'script-2',
  ideaId: 'idea-2',
  template: 'HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP',
  hook: 'Hook text.',
  setup: 'Setup text.',
  escalada: 'Escalada text.',
  estimatedDuration: 15,
  createdAt: new Date(),
}

describe('splitIntoScenes', () => {
  it('creates one scene per non-empty segment', () => {
    const scenes = splitIntoScenes(fullScript)
    expect(scenes).toHaveLength(6)
  })

  it('skips undefined segments', () => {
    const scenes = splitIntoScenes(minimalScript)
    expect(scenes).toHaveLength(3)
  })

  it('assigns correct segment types', () => {
    const scenes = splitIntoScenes(fullScript)
    expect(scenes[0]!.segmentType).toBe(SegmentType.HOOK)
    expect(scenes[1]!.segmentType).toBe(SegmentType.SETUP)
    expect(scenes[2]!.segmentType).toBe(SegmentType.ESCALADA)
    expect(scenes[3]!.segmentType).toBe(SegmentType.TWIST)
    expect(scenes[4]!.segmentType).toBe(SegmentType.PAYOFF)
    expect(scenes[5]!.segmentType).toBe(SegmentType.LOOP)
  })

  it('assigns sequential order starting from 0', () => {
    const scenes = splitIntoScenes(fullScript)
    scenes.forEach((scene, i) => {
      expect(scene.order).toBe(i)
    })
  })

  it('sets scriptId on all scenes', () => {
    const scenes = splitIntoScenes(fullScript)
    scenes.forEach((scene) => {
      expect(scene.scriptId).toBe('script-1')
    })
  })

  it('sets status to pending on all scenes', () => {
    const scenes = splitIntoScenes(fullScript)
    scenes.forEach((scene) => {
      expect(scene.status).toBe(SceneStatus.PENDING)
    })
  })

  it('preserves original text in each scene', () => {
    const scenes = splitIntoScenes(fullScript)
    expect(scenes[0]!.text).toBe(fullScript.hook)
    expect(scenes[1]!.text).toBe(fullScript.setup)
  })
})
