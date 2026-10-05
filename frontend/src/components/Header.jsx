import ThemeToggle from './ThemeToggle'
import { WalletIcon } from './Icons'

function Header({
  variant = 'home',
  theme,
  onToggleTheme,
  onPrimaryAction,
  primaryLabel,
  onSecondaryAction,
  secondaryLabel,
  onLogoClick,
  userName,
}) {
  const isHome = variant === 'home'
  const isDashboard = variant === 'dashboard'
  const isStickyVariant = isHome || isDashboard || variant === 'auth'

  const isLogout = primaryLabel?.toLowerCase().includes('logout')

  return (
    <header
      className={`${isStickyVariant
        ? 'glass-panel fixed top-3 left-1/2 z-50 w-[calc(100%-1rem)] max-w-[1550px] -translate-x-1/2 rounded-[2rem] border border-white/15 shadow-2xl shadow-slate-900/10 backdrop-blur-xl'
        : ''
        } px-3 py-3 sm:px-5`}
    >
      <div className="flex items-center justify-between gap-3">
        {/* Logo Section */}
        <button
          type="button"
          onClick={onLogoClick}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ec4899,#06b6d4)] text-white shadow-lg shadow-orange-400/30">
            <WalletIcon className="text-lg" />
          </span>

          <span className="min-w-0 overflow-hidden">
            <span className="block truncate font-display text-base font-semibold sm:text-xl">
              ExpenseFlow
            </span>

            {/* <span className="block truncate text-[10px] text-[var(--text-muted)] sm:text-xs">
              {isHome
                ? 'Spend clearly. Save confidently.'
                : isDashboard
                  ? `Welcome back${userName ? `, ${userName}` : ''}.`
                  : 'Secure access to your expense space'}
            </span> */}
          </span>
        </button>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {secondaryLabel ? (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="hidden rounded-full border border-white/25 bg-white/45 px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] transition hover:bg-white/70 dark:bg-white/8 sm:inline-flex"
            >
              {secondaryLabel}
            </button>
          ) : null}

          {primaryLabel ? (
            <button
              type="button"
              onClick={onPrimaryAction}
              className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-white shadow-lg transition hover:-translate-y-0.5 sm:px-5 sm:py-2.5 sm:text-sm ${isLogout
                ? 'bg-[linear-gradient(135deg,#ef4444,#dc2626)] shadow-red-500/25 hover:shadow-red-500/40'
                : 'bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] shadow-sky-500/25 hover:shadow-sky-500/40'
                }`}
            >
              {isLogout ? <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /> : null}
              {primaryLabel}
            </button>
          ) : null}

          <ThemeToggle
            theme={theme}
            onToggleTheme={onToggleTheme}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
