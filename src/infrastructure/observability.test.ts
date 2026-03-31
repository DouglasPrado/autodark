import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  createMetricsCollector,
  type MetricsCollector,
} from './observability.js'

describe('MetricsCollector', () => {
  let collector: MetricsCollector
  let output: string[]

  beforeEach(() => {
    output = []
    collector = createMetricsCollector({
      write: (line) => output.push(line),
    })
  })

  it('records pipeline execution duration', () => {
    collector.recordPipelineDuration('pipe-1', 45000)
    const parsed = JSON.parse(output[0]!)
    expect(parsed.metric).toBe('pipeline_duration_ms')
    expect(parsed.pipelineId).toBe('pipe-1')
    expect(parsed.value).toBe(45000)
  })

  it('records step duration', () => {
    collector.recordStepDuration('pipe-1', 'content', 5000)
    const parsed = JSON.parse(output[0]!)
    expect(parsed.metric).toBe('step_duration_ms')
    expect(parsed.step).toBe('content')
    expect(parsed.value).toBe(5000)
  })

  it('records pipeline outcome (success/failure)', () => {
    collector.recordOutcome('pipe-1', 'completed')
    const parsed = JSON.parse(output[0]!)
    expect(parsed.metric).toBe('pipeline_outcome')
    expect(parsed.status).toBe('completed')
  })

  it('records throughput (videos per day)', () => {
    collector.recordThroughput(12)
    const parsed = JSON.parse(output[0]!)
    expect(parsed.metric).toBe('throughput_videos_per_day')
    expect(parsed.value).toBe(12)
  })

  it('records error with step context', () => {
    collector.recordError('pipe-1', 'render', 'FFmpeg timeout')
    const parsed = JSON.parse(output[0]!)
    expect(parsed.metric).toBe('pipeline_error')
    expect(parsed.step).toBe('render')
    expect(parsed.error).toBe('FFmpeg timeout')
  })

  it('calculates failure rate', () => {
    const rate = collector.calculateFailureRate(2, 50)
    expect(rate).toBe(4)
  })

  it('returns 0 failure rate when no pipelines', () => {
    expect(collector.calculateFailureRate(0, 0)).toBe(0)
  })

  it('includes timestamp in all metrics', () => {
    collector.recordThroughput(5)
    const parsed = JSON.parse(output[0]!)
    expect(parsed.timestamp).toBeDefined()
  })
})
