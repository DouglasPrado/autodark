import type { Scene } from '../../contracts/index.js'
import { MAX_SCENE_DURATION } from '../../utils/constants.js'
import { v4 as uuid } from 'uuid'

const WORDS_PER_SECOND = 2.5

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length
}

function estimateRawDuration(text: string): number {
  return wordCount(text) / WORDS_PER_SECOND
}

function splitText(text: string, maxDuration: number): string[] {
  const words = text.split(/\s+/).filter(Boolean)
  const maxWords = Math.floor(maxDuration * WORDS_PER_SECOND)

  if (words.length <= maxWords) return [text]

  const chunks: string[] = []
  for (let i = 0; i < words.length; i += maxWords) {
    chunks.push(words.slice(i, i + maxWords).join(' '))
  }
  return chunks
}

export function estimateDurations(scenes: Scene[]): Scene[] {
  const result: Scene[] = []
  let currentTime = 0

  for (const scene of scenes) {
    const rawDuration = estimateRawDuration(scene.text)

    if (rawDuration <= MAX_SCENE_DURATION) {
      const duration = Math.round(rawDuration * 100) / 100 || 0.5
      const capped = Math.min(duration, MAX_SCENE_DURATION)
      result.push({
        ...scene,
        order: result.length,
        duration: capped,
        start: Math.round(currentTime * 100) / 100,
        end: Math.round((currentTime + capped) * 100) / 100,
      })
      currentTime += capped
    } else {
      const chunks = splitText(scene.text, MAX_SCENE_DURATION)
      for (const chunk of chunks) {
        const chunkDuration = Math.min(estimateRawDuration(chunk), MAX_SCENE_DURATION)
        const capped = Math.round(chunkDuration * 100) / 100 || 0.5
        result.push({
          ...scene,
          id: result.length === 0 ? scene.id : uuid(),
          order: result.length,
          text: chunk,
          duration: capped,
          start: Math.round(currentTime * 100) / 100,
          end: Math.round((currentTime + capped) * 100) / 100,
        })
        currentTime += capped
      }
    }
  }

  return result
}
