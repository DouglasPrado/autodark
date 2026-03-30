/** Roteiro estruturado seguindo template HOOK→SETUP→ESCALADA→TWIST→PAYOFF→LOOP */
export interface Script {
  readonly id: string
  readonly ideaId: string
  readonly template: string
  readonly hook: string
  readonly setup: string
  readonly escalada: string
  readonly twist?: string
  readonly payoff?: string
  readonly loop?: string
  readonly estimatedDuration: number
  readonly createdAt: Date
}
