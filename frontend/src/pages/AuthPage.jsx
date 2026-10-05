import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Header from '../components/Header'
import InputField from '../components/InputField'
import { LockIcon, MailIcon, UserIcon, WalletIcon } from '../components/Icons'

const registerInitialState = {
  name: '',
  email: '',
  password: '',
}

const loginInitialState = {
  email: '',
  password: '',
}

function AuthPage({ theme, onToggleTheme, onSessionSaved, isAuthenticated }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [registerForm, setRegisterForm] = useState(registerInitialState)
  const [loginForm, setLoginForm] = useState(loginInitialState)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login'

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const changeMode = (nextMode) => {
    setSearchParams({ mode: nextMode })
  }

  const handleRegisterChange = (event) => {
    const { name, value } = event.target
    setRegisterForm((current) => ({ ...current, [name]: value }))
  }

  const handleLoginChange = (event) => {
    const { name, value } = event.target
    setLoginForm((current) => ({ ...current, [name]: value }))
  }

  const handleRegisterSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/auth/register', registerForm)
      onSessionSaved(data.token, data.user)
      toast.success(data.message)
      navigate('/dashboard', { replace: true, state: { from: location } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create account.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const { data } = await api.post('/auth/login', loginForm)
      onSessionSaved(data.token, data.user)
      toast.success(data.message)
      navigate('/dashboard', { replace: true, state: { from: location } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to login.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1500px] flex-col px-4 pt-22 pb-0 sm:px-5 sm:pt-24 lg:px-6 lg:pt-20">
      <Header
        variant="auth"
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={() => navigate('/')}
        onPrimaryAction={() => navigate('/')}
        primaryLabel="Back Home"
      />

      <section className="flex flex-1 items-center justify-center py-8 sm:py-12">
        <div className="w-full max-w-xl">
          <div className="glass-panel rounded-[1.8rem] p-4 shadow-2xl shadow-slate-900/10 sm:p-7">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--text-muted)] sm:text-sm">Account access</p>
                <h1 className="mt-2 font-display text-xl font-semibold sm:text-2xl lg:text-3xl">
                  {mode === 'register' ? 'Create your account' : 'Welcome back'}
                </h1>
              </div>

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(135deg,#f97316,#ec4899,#06b6d4)] text-white shadow-xl shadow-pink-400/20 sm:mx-0 sm:h-14 sm:w-14">
                <WalletIcon className="text-xl sm:text-2xl" />
              </div>
            </div>

            {mode === 'register' ? (
              <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                <InputField label="Name" name="name" type="text" placeholder="Enter your full name" value={registerForm.name} onChange={handleRegisterChange} icon={UserIcon} />
                <InputField label="Email" name="email" type="email" placeholder="Enter your email" value={registerForm.email} onChange={handleRegisterChange} icon={MailIcon} />
                <InputField label="Password" name="password" type="password" placeholder="Create a password" value={registerForm.password} onChange={handleRegisterChange} icon={LockIcon} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-[1.3rem] bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sky-400/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : 'Create account'}
                </button>
              </form>
            ) : (
              <form className="space-y-4" onSubmit={handleLoginSubmit}>
                <InputField label="Email" name="email" type="email" placeholder="Enter your email" value={loginForm.email} onChange={handleLoginChange} icon={MailIcon} />
                <InputField label="Password" name="password" type="password" placeholder="Enter your password" value={loginForm.password} onChange={handleLoginChange} icon={LockIcon} />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-[1.3rem] bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-sky-400/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Logging in...' : 'Login'}
                </button>
              </form>
            )}

            <p className="mt-5 text-center text-xs leading-6 text-[var(--text-muted)] sm:text-sm">
              {mode === 'register' ? 'Already have an account?' : 'Need a new account?'}{' '}
              <button
                type="button"
                onClick={() => changeMode(mode === 'register' ? 'login' : 'register')}
                className="font-semibold text-[var(--text-primary)] underline decoration-2 underline-offset-4"
              >
                {mode === 'register' ? 'Login here' : 'Register here'}
              </button>
            </p>
          </div>
        </div>
      </section>

    </main>
  )
}


export default AuthPage
