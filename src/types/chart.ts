export type Timeframe = 'day' | 'week'

export type LineStyle = 'line' | 'smooth' | 'area'

export interface Variation {
  id: string
  name: string
  color: string
}

export type VariationFieldKey = `rate_${string}`

export type ChartPoint = {
  dateKey: string
  label: string
  tooltipLabel: string
} & {
  [key in VariationFieldKey]?: number | null
}

