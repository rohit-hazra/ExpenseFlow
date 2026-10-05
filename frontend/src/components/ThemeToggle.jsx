import { MoonIcon, SunIcon } from './Icons'

function ThemeToggle({ theme, onToggleTheme }) {
  const isDarkTheme = theme === 'dark'

  return (
    <button
      type="button"
      onClick={onToggleTheme}
      aria-label={isDarkTheme ? 'Switch to light mode' : 'Switch to dark mode'}
      className="group inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/60 text-[var(--text-primary)] shadow-lg shadow-slate-200/30 transition hover:-translate-y-0.5 dark:bg-white/8 dark:shadow-slate-950/20"
    >
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(135deg,#f59e0b,#ec4899,#38bdf8)] text-white">
        <SunIcon className={`absolute h-[18px] w-[18px] transition-all ${isDarkTheme ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`} />
        <MoonIcon className={`absolute h-[18px] w-[18px] transition-all ${isDarkTheme ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`} />
      </span>
    </button>
  )
}

export default ThemeToggle
