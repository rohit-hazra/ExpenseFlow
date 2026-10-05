import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import api, { setAuthToken } from './lib/api'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './pages/ProtectedRoute'

const THEME_STORAGE_KEY = 'expenseflow-theme'
const TOKEN_STORAGE_KEY = 'expenseflow-token'

function getStoredValue(storageKey) {
  if (typeof window === 'undefined') {
    return null
  }

  return localStorage.getItem(storageKey)
}

function App() {
  const storedTheme = getStoredValue(THEME_STORAGE_KEY)
  const storedToken = getStoredValue(TOKEN_STORAGE_KEY)

  const [theme, setTheme] = useState(() => {
    if (typeof window === 'undefined') {
      return 'light'
    }

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return storedTheme ?? (prefersDark ? 'dark' : 'light')
  })
  const [authState, setAuthState] = useState({
    token: storedToken,
    user: null,
    isChecking: true,
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.style.colorScheme = theme
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  useEffect(() => {
    async function restoreSession() {
      if (!storedToken) {
        setAuthToken(null)
        setAuthState({ token: null, user: null, isChecking: false })
        return
      }

      try {
        setAuthToken(storedToken)
        const { data } = await api.get('/auth/me')
        setAuthState({ token: storedToken, user: data.user, isChecking: false })
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY)
        setAuthToken(null)
        setAuthState({ token: null, user: null, isChecking: false })
      }
    }

    restoreSession()
  }, [])

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))
  }

  const saveSession = (token, user) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, token)
    setAuthToken(token)
    setAuthState({ token, user, isChecking: false })
  }

  const updateUser = (nextUser) => {
    setAuthState((current) => ({
      ...current,
      user: nextUser,
    }))
  }

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    setAuthToken(null)
    setAuthState({ token: null, user: null, isChecking: false })
  }

  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2800,
          className:
            '!rounded-2xl !border !border-white/20 !bg-slate-950 !px-4 !py-3 !text-white dark:!bg-white dark:!text-slate-900',
        }}
      />

      <div className="min-h-screen overflow-x-hidden bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-300">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_10%_20%,rgba(253,186,116,0.34),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(56,189,248,0.30),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(244,114,182,0.22),transparent_26%)] dark:bg-[radial-gradient(circle_at_10%_20%,rgba(251,146,60,0.16),transparent_24%),radial-gradient(circle_at_85%_10%,rgba(34,211,238,0.18),transparent_24%),radial-gradient(circle_at_50%_78%,rgba(236,72,153,0.14),transparent_26%)]" />

        <Routes>
          <Route path="/" element={<LandingPage theme={theme} onToggleTheme={toggleTheme} />} />
          <Route
            path="/auth"
            element={
              <AuthPage
                theme={theme}
                onToggleTheme={toggleTheme}
                onSessionSaved={saveSession}
                isAuthenticated={Boolean(authState.token)}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute isChecking={authState.isChecking} isAuthenticated={Boolean(authState.token)}>
                <DashboardPage
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  user={authState.user}
                  onUserUpdated={updateUser}
                  onLogout={clearSession}
                />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
