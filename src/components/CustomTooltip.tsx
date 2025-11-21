import type { TooltipProps } from 'recharts'
import type { Variation, VariationFieldKey } from '../types/chart'
import styles from './CustomTooltip.module.css'

type CustomTooltipProps = TooltipProps<number, string> & {
  variations: Variation[]
  visibleIds: string[]
  fieldForVariation: (variationId: string) => VariationFieldKey
}

export function CustomTooltip({
  active,
  payload,
  label,
  variations,
  visibleIds,
  fieldForVariation,
}: CustomTooltipProps) {
  if (!active || !payload?.length) {
    return null
  }

  const visibleVariations = variations.filter((variation) =>
    visibleIds.includes(variation.id),
  )

  const dateLabel =
    (payload[0]?.payload?.tooltipLabel as string | undefined) ?? label

  return (
    <div className={styles.tooltip}>
      <div className={styles.title}>{dateLabel}</div>
      {visibleVariations.map((variation) => {
        const field = fieldForVariation(variation.id)
        const point = payload.find((item) => item.dataKey === field)
        const value =
          typeof point?.value === 'number'
            ? `${Number(point.value).toFixed(2)}%`
            : '—'

        return (
          <div className={styles.row} key={variation.id}>
            <span className={styles.label}>
              <span
                className={styles.swatch}
                style={{ backgroundColor: variation.color }}
              />
              {variation.name}
            </span>
            <span>{value}</span>
          </div>
        )
      })}
    </div>
  )
}

