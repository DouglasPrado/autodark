/** Tipo de segmento do template de roteiro */
export const SegmentType = {
  HOOK: 'hook',
  SETUP: 'setup',
  ESCALADA: 'escalada',
  TWIST: 'twist',
  PAYOFF: 'payoff',
  LOOP: 'loop',
} as const

export type SegmentType = (typeof SegmentType)[keyof typeof SegmentType]
