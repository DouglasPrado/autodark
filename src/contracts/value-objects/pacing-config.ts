/** Configuração de pacing aplicada a uma scene */
export interface PacingConfig {
  readonly maxDuration: number
  readonly patternInterrupt: boolean
  readonly zoomEffect: boolean
  readonly transitionType: string
}
