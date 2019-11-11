import { GetTimeBinsParams } from './types'

export function getTimeBins(params: GetTimeBinsParams) {
  const { start_time, end_time, bin_size } = params
  const interval = end_time - start_time

  const bins = new Array(Math.floor(interval / bin_size))

  return bins.map((_, idx) => ({
    start: start_time + idx * bin_size,
    end: start_time + (idx + 1) * bin_size
  }))
}
