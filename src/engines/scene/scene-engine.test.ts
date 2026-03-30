import { describe, it, expect } from 'vitest'
import { createSceneEngine } from './index.js'
import type { Script } from '../../contracts/index.js'
import { SceneStatus } from '../../contracts/index.js'
import { MAX_SCENE_DURATION } from '../../utils/constants.js'

const mockScript: Script = {
  id: 'script-1',
  ideaId: 'idea-1',
  template: 'HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP',
  hook: 'Você sabia que existem cidades inteiras abandonadas debaixo da terra?',
  setup: 'Em 1963 um homem derrubou uma parede em sua casa e descobriu uma cidade subterrânea com mais de mil anos.',
  escalada: 'A cidade tinha capacidade para abrigar vinte mil pessoas e possuía ventilação, água corrente e até capelas.',
  twist: 'Mas o mais perturbador é que ninguém sabe por que os habitantes desapareceram de repente.',
  payoff: 'Até hoje arqueólogos encontram novos túneis que levam a lugares desconhecidos.',
  loop: 'E essa não é a única cidade secreta que existe por aí.',
  estimatedDuration: 50,
  createdAt: new Date(),
}

describe('SceneEngine (facade)', () => {
  it('processes script into ready scenes with durations and queries', () => {
    const engine = createSceneEngine()
    const scenes = engine.process(mockScript)

    expect(scenes.length).toBeGreaterThanOrEqual(6)
    scenes.forEach((scene) => {
      expect(scene.duration).toBeGreaterThan(0)
      expect(scene.duration).toBeLessThanOrEqual(MAX_SCENE_DURATION)
      expect(scene.visualQuery).toBeTruthy()
      expect(scene.status).toBe(SceneStatus.PENDING)
      expect(scene.start).toBeDefined()
      expect(scene.end).toBeGreaterThan(scene.start)
    })
  })

  it('scenes have sequential timestamps', () => {
    const engine = createSceneEngine()
    const scenes = engine.process(mockScript)

    for (let i = 1; i < scenes.length; i++) {
      expect(scenes[i]!.start).toBe(scenes[i - 1]!.end)
    }
  })

  it('total duration is reasonable', () => {
    const engine = createSceneEngine()
    const scenes = engine.process(mockScript)
    const totalDuration = scenes[scenes.length - 1]!.end
    expect(totalDuration).toBeGreaterThan(5)
    expect(totalDuration).toBeLessThan(120)
  })
})
