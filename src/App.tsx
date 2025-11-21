import { useEffect, useMemo, useState } from 'react'
import { ChartCard } from './components/ChartCard'
import { SegmentedControl } from './components/SegmentedControl'
import { ThemeToggle } from './components/ThemeToggle'
import { VariationSelector } from './components/VariationSelector'
import { dailyPoints, variationField, variations, weeklyPoints } from './data/abData'
import type { LineStyle, Timeframe } from './types/chart'
import styles from './App.module.css'

type Theme = 'light' | 'dark'

const timeframeOptions: { label: string; value: Timeframe }[] = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
]

const lineStyleOptions: { label: string; value: LineStyle }[] = [
  { label: 'Line', value: 'line' },
  { label: 'Smooth', value: 'smooth' },
  { label: 'Area', value: 'area' },
]

function App() {
  const [selectedVariations, setSelectedVariations] = useState<string[]>(
    variations.map((variation) => variation.id),
  )
  const [timeframe, setTimeframe] = useState<Timeframe>('day')
  const [lineStyle, setLineStyle] = useState<LineStyle>('smooth')
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const chartData = useMemo(
    () => (timeframe === 'day' ? dailyPoints : weeklyPoints),
    [timeframe],
  )

  const toggleVariation = (variationId: string) => {
    setSelectedVariations((current) => {
      if (current.includes(variationId)) {
        if (current.length === 1) return current
        return current.filter((id) => id !== variationId)
      }
      return [...current, variationId]
    })
  }

  return (
    <div className={styles.app}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headlineGroup}>
            <p className={styles.kicker}>Experiment health</p>
            <h1 className={styles.title}>Conversion rate overview</h1>
            <p className={styles.subtitle}>
              Track how each variation performs over time. Switch between daily
              and weekly views, adjust the visual style, and focus on the
              variants that matter most.
            </p>
          </div>
          <ThemeToggle value={theme} onToggle={setTheme} />
        </header>

        <div className={styles.controlBar}>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Timeframe</span>
            <SegmentedControl
              options={timeframeOptions}
              value={timeframe}
              onChange={setTimeframe}
              ariaLabel="Timeframe selector"
            />
          </div>
          <div className={styles.controlGroup}>
            <span className={styles.controlLabel}>Line style</span>
            <SegmentedControl
              options={lineStyleOptions}
              value={lineStyle}
              onChange={setLineStyle}
              ariaLabel="Line style selector"
            />
          </div>
        </div>

        <section className={styles.selectorSection}>
          <span className={styles.sectionTitle}>Variations</span>
          <VariationSelector
            variations={variations}
            selectedIds={selectedVariations}
            onToggle={toggleVariation}
          />
        </section>

        <ChartCard
          data={chartData}
          variations={variations}
          selectedIds={selectedVariations}
          lineStyle={lineStyle}
          fieldForVariation={variationField}
        />
      </div>
    </div>
  )
}

export default App
