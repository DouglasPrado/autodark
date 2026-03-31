export interface MetricsWriter {
  write: (line: string) => void
}

export interface MetricsCollector {
  recordPipelineDuration(pipelineId: string, durationMs: number): void
  recordStepDuration(pipelineId: string, step: string, durationMs: number): void
  recordOutcome(pipelineId: string, status: string): void
  recordThroughput(videosPerDay: number): void
  recordError(pipelineId: string, step: string, error: string): void
  calculateFailureRate(failed: number, total: number): number
}

function emit(writer: MetricsWriter, data: Record<string, unknown>): void {
  writer.write(JSON.stringify({ timestamp: new Date().toISOString(), ...data }))
}

export function createMetricsCollector(writer: MetricsWriter): MetricsCollector {
  return {
    recordPipelineDuration(pipelineId, durationMs) {
      emit(writer, { metric: 'pipeline_duration_ms', pipelineId, value: durationMs })
    },

    recordStepDuration(pipelineId, step, durationMs) {
      emit(writer, { metric: 'step_duration_ms', pipelineId, step, value: durationMs })
    },

    recordOutcome(pipelineId, status) {
      emit(writer, { metric: 'pipeline_outcome', pipelineId, status })
    },

    recordThroughput(videosPerDay) {
      emit(writer, { metric: 'throughput_videos_per_day', value: videosPerDay })
    },

    recordError(pipelineId, step, error) {
      emit(writer, { metric: 'pipeline_error', pipelineId, step, error })
    },

    calculateFailureRate(failed, total) {
      if (total === 0) return 0
      return Math.round((failed / total) * 100)
    },
  }
}
