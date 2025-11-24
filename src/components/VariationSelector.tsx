import clsx from 'clsx'
import type { Variation } from '../types/chart'
import styles from './VariationSelector.module.css'

type VariationSelectorProps = {
  variations: Variation[]
  selectedIds: string[]
  onToggle: (variationId: string) => void
}

export function VariationSelector({
  variations,
  selectedIds,
  onToggle,
}: VariationSelectorProps) {
  const isLastSelected = (variationId: string) =>
    selectedIds.length === 1 && selectedIds.includes(variationId)

  return (
    <div className={styles.selector} role="group" aria-label="Variation filter">
      {variations.map((variation) => {
        const checked = selectedIds.includes(variation.id)
        const disabled = isLastSelected(variation.id)

        return (
          <label
            key={variation.id}
            className={clsx(styles.option, {
              [styles.checked]: checked,
              [styles.disabled]: disabled && checked,
            })}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => onToggle(variation.id)}
              disabled={disabled && checked}
            />
            <span
              className={styles.indicator}
              style={{ backgroundColor: variation.color }}
              aria-hidden
            />
            <span>{variation.name}</span>
          </label>
        )
      })}
    </div>
  )
}



