import raw from '../../data.json'
import type {
  ChartPoint,
  Variation,
  VariationFieldKey,
} from '../types/chart'

const COLOR_PALETTE = ['#5E5CE6', '#22B3B8', '#F97316', '#A855F7', '#EC4899']

type RawVariation = {
  id?: number
  name: string
}

type RawEntry = {
  date: string
  visits: Record<string, number>
  conversions: Record<string, number>
}

type RawDataFile = {
  variations: RawVariation[]
  data: RawEntry[]
}

const dataset = raw as RawDataFile

export const variations: Variation[] = dataset.variations.map((item, index) => ({
  id: (item.id ?? 0).toString(),
  name: item.name,
  color: COLOR_PALETTE[index % COLOR_PALETTE.length],
}))

export const variationField = (variationId: string): VariationFieldKey =>
  `rate_${variationId}`

const dayLabelFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const tooltipDayFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

const tooltipRangeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
})

const toDate = (value: string) => new Date(`${value}T00:00:00`)

const calcRate = (visits?: number, conversions?: number) => {
  if (!visits || visits <= 0 || typeof conversions !== 'number') {
    return null
  }
  return Number(((conversions / visits) * 100).toFixed(2))
}

const buildDailyPoints = (): ChartPoint[] =>
  dataset.data.map((entry) => {
    const d = toDate(entry.date)
    const point: ChartPoint = {
      dateKey: entry.date,
      label: dayLabelFormatter.format(d),
      tooltipLabel: tooltipDayFormatter.format(d),
    }

    variations.forEach((variation) => {
      const visits = entry.visits?.[variation.id]
      const conversions = entry.conversions?.[variation.id]
      point[variationField(variation.id)] = calcRate(visits, conversions)
    })

    return point
  })

type WeekBucket = {
  start: Date
  end: Date
  visits: Record<string, number>
  conversions: Record<string, number>
}

const startOfWeek = (date: Date) => {
  const clone = new Date(date)
  const day = clone.getDay()
  const diff = (day + 6) % 7 // Monday as first day
  clone.setDate(clone.getDate() - diff)
  clone.setHours(0, 0, 0, 0)
  return clone
}

const buildWeeklyPoints = (): ChartPoint[] => {
  const buckets = new Map<string, WeekBucket>()

  dataset.data.forEach((entry) => {
    const currentDate = toDate(entry.date)
    const bucketStart = startOfWeek(currentDate)
    const key = bucketStart.toISOString()

    if (!buckets.has(key)) {
      buckets.set(key, {
        start: new Date(bucketStart),
        end: new Date(currentDate),
        visits: {},
        conversions: {},
      })
    }

    const bucket = buckets.get(key)!
    if (currentDate > bucket.end) {
      bucket.end = new Date(currentDate)
    }

    variations.forEach((variation) => {
      const visits = entry.visits?.[variation.id] ?? 0
      const conversions = entry.conversions?.[variation.id] ?? 0
      bucket.visits[variation.id] = (bucket.visits[variation.id] ?? 0) + visits
      bucket.conversions[variation.id] =
        (bucket.conversions[variation.id] ?? 0) + conversions
    })
  })

  const formatRangeLabel = (start: Date, end: Date) => {
    const startLabel = tooltipRangeFormatter.format(start)
    const endLabel = tooltipRangeFormatter.format(end)
    return `${startLabel} – ${endLabel}`
  }

  return [...buckets.values()]
    .sort((a, b) => a.start.getTime() - b.start.getTime())
    .map((bucket) => {
      const point: ChartPoint = {
        dateKey: bucket.start.toISOString(),
        label: formatRangeLabel(bucket.start, bucket.end),
        tooltipLabel: `Week of ${formatRangeLabel(bucket.start, bucket.end)}`,
      }

      variations.forEach((variation) => {
        point[variationField(variation.id)] = calcRate(
          bucket.visits[variation.id],
          bucket.conversions[variation.id],
        )
      })

      return point
    })
}

export const dailyPoints = buildDailyPoints()
export const weeklyPoints = buildWeeklyPoints()

