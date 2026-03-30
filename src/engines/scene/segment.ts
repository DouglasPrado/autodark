import { v4 as uuid } from 'uuid'
import type { Script, Scene } from '../../contracts/index.js'
import { SegmentType, SceneStatus } from '../../contracts/index.js'

interface SegmentEntry {
  type: SegmentType
  text: string | undefined
}

export function splitIntoScenes(script: Script): Scene[] {
  const segments: SegmentEntry[] = [
    { type: SegmentType.HOOK, text: script.hook },
    { type: SegmentType.SETUP, text: script.setup },
    { type: SegmentType.ESCALADA, text: script.escalada },
    { type: SegmentType.TWIST, text: script.twist },
    { type: SegmentType.PAYOFF, text: script.payoff },
    { type: SegmentType.LOOP, text: script.loop },
  ]

  const now = new Date()

  return segments
    .filter((s): s is SegmentEntry & { text: string } => !!s.text)
    .map((segment, index) => ({
      id: uuid(),
      scriptId: script.id,
      order: index,
      text: segment.text,
      duration: 0,
      start: 0,
      end: 0,
      visualQuery: '',
      segmentType: segment.type,
      status: SceneStatus.PENDING,
      createdAt: now,
    }))
}
