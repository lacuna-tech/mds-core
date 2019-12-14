import { now, yesterday, hours, days } from '@mds-core/mds-utils'

import { isArray } from 'util'
import { GetTimeBinsParams, HourOrDay } from './types'

export function getTimeBins({
  start_time = yesterday(),
  end_time = now(),
  bin_size = 3600000
}: Partial<GetTimeBinsParams>) {
  const interval = end_time - start_time

  return [...Array(Math.floor(interval / bin_size))].map((_, idx) => ({
    start: start_time + idx * bin_size,
    end: start_time + (idx + 1) * bin_size
  }))
}

export function convertBinSizeFromEnglishToMs(bin_size_english: HourOrDay) {
  const timeToMs = {
    hour: hours(1),
    day: days(1)
  }
  const bin_size = timeToMs[bin_size_english]
  return bin_size
}

export function normalizeToArray<T>(elementToNormalize: T | T[] | undefined): T[] {
  let normalizedArray: T[]
  if (elementToNormalize === undefined) {
    normalizedArray = []
  } else if (isArray(elementToNormalize)) {
    normalizedArray = elementToNormalize
  } else {
    normalizedArray = [elementToNormalize]
  }
  return normalizedArray
}

export function getBinSize(binSizeFromQuery: HourOrDay | HourOrDay[] | undefined) {
  if (binSizeFromQuery === undefined) {
    return [convertBinSizeFromEnglishToMs('hour')]
  }
  const bin_size_english = normalizeToArray<HourOrDay>(binSizeFromQuery)
  const bin_size = bin_size_english.map(currBinSizeEnglish => convertBinSizeFromEnglishToMs(currBinSizeEnglish))
  return bin_size
}
