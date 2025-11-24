import { useCallback, useMemo, useRef } from 'react'
import {
  Area,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
} from 'recharts'
import { toPng } from 'html-to-image'
import type {
  ChartPoint,
  LineStyle,
  Timeframe,
  Variation,
  VariationFieldKey,
} from '../types/chart'
import { CustomTooltip } from './CustomTooltip'
import styles from './ChartCard.module.css'
type ChartCardProps = {
  data: ChartPoint[]
  variations: Variation[]
  selectedIds: string[]
  lineStyle: LineStyle
  timeframe: Timeframe
  fieldForVariation: (variationId: string) => VariationFieldKey
}

const getValue = (
  point: ChartPoint,
  variationId: string,
  fieldForVariation: (variationId: string) => VariationFieldKey,
) =>
  point[fieldForVariation(variationId) as keyof ChartPoint] as
    | number
    | null
    | undefined

const buildDomain = (
  data: ChartPoint[],
  selectedIds: string[],
  fieldForVariation: (variationId: string) => VariationFieldKey,
) => {
  let min = Infinity
  let max = -Infinity

  data.forEach((point) => {
    selectedIds.forEach((id) => {
      const value = getValue(point, id, fieldForVariation)
      if (typeof value === 'number') {
        min = Math.min(min, value)
        max = Math.max(max, value)
      }
    })
  })

  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return [0, 5]
  }

  if (min === max) {
    const padding = Math.max(1, min * 0.2)
    return [Math.max(0, min - padding), max + padding]
  }

  const padding = (max - min) * 0.15
  return [Math.max(0, min - padding), max + padding]
}

const filterData = (
  data: ChartPoint[],
  selectedIds: string[],
  fieldForVariation: (variationId: string) => VariationFieldKey,
) =>
  data.filter((point) =>
    selectedIds.some(
      (id) => typeof getValue(point, id, fieldForVariation) === 'number',
    ),
  )

export function ChartCard({
  data,
  variations,
  selectedIds,
  lineStyle,
  timeframe,
  fieldForVariation,
}: ChartCardProps) {
  const chartRef = useRef<HTMLDivElement>(null)

  const filteredData = useMemo(
    () => filterData(data, selectedIds, fieldForVariation),
    [data, selectedIds, fieldForVariation],
  )

  const domain = useMemo(
    () => buildDomain(filteredData, selectedIds, fieldForVariation),
    [filteredData, selectedIds, fieldForVariation],
  )

  const visibleVariations = useMemo(
    () => variations.filter((variation) => selectedIds.includes(variation.id)),
    [variations, selectedIds],
  )

  const handleExport = useCallback(async () => {
    if (!chartRef.current) return
    const backgroundColor =
      getComputedStyle(document.documentElement).getPropertyValue(
        '--color-app-bg',
      ) || '#ffffff'
    try {
      const dataUrl = await toPng(chartRef.current, {
        pixelRatio: 2,
        backgroundColor: backgroundColor.trim() || undefined,
      })
      const link = document.createElement('a')
      link.download = `conversion-${timeframe}-${Date.now()}.png`
      link.href = dataUrl
      link.click()
    } catch (error) {
      console.error('Failed to export chart', error)
      window.alert('Export failed. Please try again.')
    }
  }, [timeframe])

  if (!filteredData.length) {
    return (
      <div className={styles.card}>
        <div className={styles.emptyState}>No data available.</div>
      </div>
    )
  }

  return (
    <div className={styles.card}>
      <div className={styles.toolbar}>
        <p className={styles.title}>Conversion rate chart</p>
        <button
          type="button"
          className={styles.toolbarButton}
          onClick={handleExport}
        >
          Export PNG
        </button>
      </div>
      <div ref={chartRef}>
        <ResponsiveContainer width="100%" height={420}>
          <ComposedChart data={filteredData}>
          <CartesianGrid
            strokeDasharray="4 8"
            stroke="var(--color-grid)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            minTickGap={16}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
          />
          <YAxis
            domain={domain}
            tickFormatter={(value: number) => `${Math.round(value)}%`}
            tickLine={false}
            axisLine={false}
            width={72}
            tick={{ fill: 'var(--color-muted)', fontSize: 12 }}
          />
            <Tooltip<number, string>
              cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1 }}
              content={(tooltipProps) => (
                <CustomTooltip
                  {...tooltipProps}
                  variations={variations}
                  visibleIds={selectedIds}
                  fieldForVariation={fieldForVariation}
                />
              )}
            />
            {lineStyle === 'area' && (
            <defs>
              {visibleVariations.map((variation) => (
                <linearGradient
                  key={variation.id}
                  id={`gradient-${variation.id}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor={variation.color} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={variation.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
          )}
            {visibleVariations.map((variation) => {
              const dataKey = fieldForVariation(variation.id)
              const color = variation.color

              if (lineStyle === 'area') {
                return (
                  <Area
                    key={variation.id}
                    type="monotone"
                    dataKey={dataKey}
                    stroke={color}
                    fill={`url(#gradient-${variation.id})`}
                    strokeWidth={2}
                    dot={false}
                  />
                )
              }

              return (
                <Line
                  key={variation.id}
                  type={lineStyle === 'smooth' ? 'monotone' : 'linear'}
                  dataKey={dataKey}
                  stroke={color}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              )
            })}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

