/** Pesos para tipos de hook — soma deve ser <= 1 */
export interface HookWeights {
  readonly curiosity: number
  readonly shock: number
  readonly question: number
  readonly promise: number
}
