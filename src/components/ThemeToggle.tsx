import styles from './ThemeToggle.module.css'

type Theme = 'light' | 'dark'

type ThemeToggleProps = {
  value: Theme
  onToggle: (value: Theme) => void
}

export function ThemeToggle({ value, onToggle }: ThemeToggleProps) {
  const nextValue = value === 'light' ? 'dark' : 'light'

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => onToggle(nextValue)}
    >
      <span aria-hidden>{value === 'light' ? '🌞' : '🌙'}</span>
      <span>{value === 'light' ? 'Light' : 'Dark'} mode</span>
    </button>
  )
}



