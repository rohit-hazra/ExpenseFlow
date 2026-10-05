import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import Footer from '../components/Footer'
import Header from '../components/Header'
import { ChartIcon, ShieldIcon, WalletIcon } from '../components/Icons'

const heroStats = [
  { label: 'Users', value: '10,000+' },
  { label: 'Expenses Managed', value: '₹5 Crore+' },
  { label: 'Satisfaction Rate', value: '98%' },
  { label: 'Rating', value: '4.9/5' },
]

const featureCards = [
  {
    title: 'Expense Tracking',
    text: 'Log every payment clearly with categories, notes, and transaction methods.',
    icon: WalletIcon,
  },
  {
    title: 'Income Management',
    text: 'Keep salaries, freelance work, and one-time earnings organized in one place.',
    icon: ChartIcon,
  },
  {
    title: 'Budget Planning',
    text: 'Set monthly targets, watch progress, and stay in control before the month ends.',
    icon: ShieldIcon,
  },
  {
    title: 'Financial Reports',
    text: 'Download polished reports that summarize income, spending, and performance.',
    icon: ChartIcon,
  },
  {
    title: 'Analytics Dashboard',
    text: 'Review charts, category breakdowns, and monthly trends without visual clutter.',
    icon: ChartIcon,
  },
  {
    title: 'Secure Cloud Sync',
    text: 'Access your account data securely from any device with a private login flow.',
    icon: ShieldIcon,
  },
]

const steps = [
  {
    step: '01',
    title: 'Create Account',
    text: 'Start with a clean, secure sign-up flow built for quick onboarding.',
  },
  {
    step: '02',
    title: 'Add Transactions',
    text: 'Capture income and expenses with date, category, and payment method.',
  },
  {
    step: '03',
    title: 'Monitor Analytics',
    text: 'Use dashboards and charts to spot patterns and compare month to month.',
  },
  {
    step: '04',
    title: 'Achieve Goals',
    text: 'Track progress against your budget and make smarter financial decisions.',
  },
]

const testimonials = [
  {
    name: 'Ananya Sharma',
    role: 'Freelancer',
    quote: 'It feels calm, fast, and easy to use. I finally understand where my money goes.',
  },
  {
    name: 'Rahul Mehta',
    role: 'Working Professional',
    quote: 'The analytics and budget view help me stay consistent every month.',
  },
  {
    name: 'Priya Nair',
    role: 'Small Business Owner',
    quote: 'The reports are clean enough to review at a glance and useful enough to act on.',
  },
]

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For simple personal tracking.',
    features: ['Income and expense logging', 'Basic dashboard', 'Theme support'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '₹499/mo',
    description: 'Best for everyday budgeting.',
    features: ['Advanced analytics', 'Budget insights', 'PDF reports', 'Priority support'],
    featured: true,
  },
  {
    name: 'Business',
    price: 'Custom',
    description: 'For teams and heavier usage.',
    features: ['Multi-user access', 'Reporting workflows', 'Custom onboarding'],
    featured: false,
  },
]

function FloatingStat({ label, value, isDarkThemeTheme }) {
  return (
    <div className={`rounded-[1.4rem] border px-4 py-3 backdrop-blur-xl ${isDarkThemeTheme ? 'border-white/15 bg-white/10' : 'border-slate-200 bg-white/85 shadow-[0_12px_30px_rgba(15,23,42,0.08)]'}`}>
      <p className={`text-[10px] font-semibold uppercase tracking-[0.26em] ${isDarkThemeTheme ? 'text-white/55' : 'text-slate-500'}`}>{label}</p>
      <p className={`mt-1 font-display text-lg font-semibold ${isDarkThemeTheme ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
  )
}

function SectionTitle({ theme, eyebrow, title, text }) {
  const isDarkThemeTheme = theme === 'dark'
  const headingClass = isDarkThemeTheme ? 'text-white' : 'text-slate-900'
  const copyClass = isDarkThemeTheme ? 'text-slate-300' : 'text-slate-600'
  const eyebrowClass = isDarkThemeTheme ? 'text-cyan-300/80' : 'text-indigo-600/80'

  return (
    <div className="mx-auto max-w-3xl text-center">
      <p className={`text-xs font-semibold uppercase tracking-[0.34em] sm:text-sm ${eyebrowClass}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl ${headingClass}`}>{title}</h2>
      <p className={`mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${copyClass}`}>{text}</p>
    </div>
  )
}

function LandingPage({ theme, onToggleTheme }) {
  const navigate = useNavigate()
  const isDarkThemeTheme = theme === 'dark'

  const pageText = isDarkThemeTheme ? 'text-white' : 'text-slate-900'
  const mutedText = isDarkThemeTheme ? 'text-slate-300' : 'text-slate-600'
  const sectionBorder = isDarkThemeTheme ? 'border-white/10' : 'border-slate-200'
  const sectionCard = isDarkThemeTheme
    ? 'border-white/10 bg-white/8 shadow-2xl shadow-slate-950/10'
    : 'border-slate-200 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)]'
  const sectionSurface = isDarkThemeTheme
    ? 'border-white/10 bg-white/8'
    : 'border-slate-200 bg-white'
  const sectionBackdrop = isDarkThemeTheme
    ? 'bg-[linear-gradient(135deg,rgba(139,92,246,0.22),rgba(14,165,233,0.16))]'
    : 'bg-[linear-gradient(135deg,rgba(237,233,254,0.95),rgba(224,242,254,0.95))]'

  const heroSectionClass = isDarkThemeTheme
    ? 'border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(99,102,241,0.35),transparent_30%),radial-gradient(circle_at_top_right,rgba(14,165,233,0.22),transparent_24%),linear-gradient(180deg,#07111f_0%,#0b1220_48%,#0f172a_100%)] shadow-[0_30px_80px_rgba(2,6,23,0.35)]'
    : 'border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(224,231,255,0.9),transparent_28%),radial-gradient(circle_at_top_right,rgba(207,250,254,0.75),transparent_24%),linear-gradient(180deg,#f8fbff_0%,#eef4ff_42%,#f7fbff_100%)] shadow-[0_30px_80px_rgba(15,23,42,0.08)]'

  const heroGlowLeft = isDarkThemeTheme ? 'bg-violet-500/20' : 'bg-violet-300/25'
  const heroGlowRight = isDarkThemeTheme ? 'bg-cyan-400/18' : 'bg-cyan-300/25'
  const heroGlowBottom = isDarkThemeTheme ? 'bg-fuchsia-500/14' : 'bg-fuchsia-300/20'
  const heroBadgeClass = isDarkThemeTheme
    ? 'border-white/15 bg-white/10 text-cyan-200'
    : 'border-slate-200 bg-white/75 text-slate-700 shadow-[0_12px_30px_rgba(15,23,42,0.06)]'
  const heroTitleClass = isDarkThemeTheme ? 'text-white' : 'text-slate-900'
  const heroTextClass = isDarkThemeTheme ? 'text-slate-300' : 'text-slate-600'
  const heroPrimaryButton = isDarkThemeTheme
    ? 'bg-[linear-gradient(135deg,#8b5cf6,#0ea5e9)] text-white shadow-xl shadow-violet-500/25'
    : 'bg-[linear-gradient(135deg,#7c3aed,#0ea5e9)] text-white shadow-xl shadow-violet-300/30'
  const heroSecondaryButton = isDarkThemeTheme
    ? 'border-white/15 bg-white/10 text-white hover:bg-white/15'
    : 'border-slate-200 bg-white/85 text-slate-800 hover:bg-white'
  const heroStatCard = isDarkThemeTheme
    ? 'border-white/10 bg-white/10 text-white'
    : 'border-slate-200 bg-white/85 text-slate-900 shadow-[0_12px_30px_rgba(15,23,42,0.08)]'
  const heroPreviewShell = isDarkThemeTheme
    ? 'border-white/15 bg-white/10 shadow-2xl shadow-slate-950/30'
    : 'border-slate-200 bg-white/85 shadow-[0_24px_60px_rgba(15,23,42,0.12)]'
  const heroPreviewInner = isDarkThemeTheme
    ? 'border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(15,23,42,0.72))]'
    : 'border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(241,245,249,0.95))]'
  const heroPreviewText = isDarkThemeTheme ? 'text-white' : 'text-slate-900'
  const heroMutedText = isDarkThemeTheme ? 'text-slate-300' : 'text-slate-600'
  const heroGridCard = isDarkThemeTheme ? 'border-white/10 bg-white/8' : 'border-slate-200 bg-white'
  const panelBase = isDarkThemeTheme
    ? 'border-white/15 bg-white/10 text-white'
    : 'border-slate-200 bg-white text-slate-900 shadow-[0_16px_40px_rgba(15,23,42,0.08)]'

  const goToAuth = (mode) => {
    navigate(`/auth?mode=${mode}`)
  }


  const [rating, setRating] = useState(0)

  const [feedbackForm, setFeedbackForm] = useState({
    name: '',
    email: '',
    category: 'General Feedback',
    message: '',
  })

  const handleFeedbackSubmit = (e) => {
    e.preventDefault()

    if (!feedbackForm.email.trim()) {
      toast.error('Please enter your email')
      return
    }

    if (!feedbackForm.message.trim()) {
      toast.error('Please enter your feedback')
      return
    }

    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }

    // API call goes here later

    toast.success('Thank you for your feedback!')

    setFeedbackForm({
      name: '',
      email: '',
      category: 'General Feedback',
      message: '',
    })

    setRating(0)
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1550px] flex-col px-4 pt-[5.6rem] pb-0 sm:px-5 sm:pt-[6rem] lg:px-6 lg:pt-[5.7rem]">
      <Header
        variant="home"
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        onPrimaryAction={() => goToAuth('login')}
        primaryLabel="Login"
      />

      <section
        className={`relative grid items-center gap-8 overflow-hidden rounded-[2.2rem] border px-5 py-6 sm:px-7 sm:py-8 lg:min-h-[87vh] lg:grid-cols-[1.03fr_0.97fr] lg:px-10 lg:py-6 ${heroSectionClass}`}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className={`absolute left-[-8rem] top-16 h-72 w-72 rounded-full blur-3xl ${heroGlowLeft}`} />
          <div className={`absolute right-[-7rem] top-24 h-80 w-80 rounded-full blur-3xl ${heroGlowRight}`} />
          <div className={`absolute bottom-[-8rem] left-1/2 h-80 w-80 -translate-x-1/2 rounded-full blur-3xl ${heroGlowBottom}`} />
        </div>

        <div className="relative z-10 space-y-8 text-center lg:text-left">
          <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] backdrop-blur-xl lg:mx-0 ${heroBadgeClass}`}>
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Smart Financial Management
          </div>

          <div className="space-y-5">
            <h1 className={`mx-auto max-w-4xl text-balance font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:mx-0 lg:max-w-3xl lg:text-[4.8rem] ${heroTitleClass}`}>
              Track Every Rupee.
              <span className="block bg-[linear-gradient(135deg,#c084fc,#38bdf8,#22d3ee)] bg-clip-text text-transparent">
                Build Better Financial Habits.
              </span>
            </h1>

            <p className={`mx-auto max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 lg:mx-0 ${heroTextClass}`}>
              Manage expenses, monitor income, set budgets, and visualize your financial growth with powerful analytics designed to keep everything clear, calm, and actionable.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:justify-center lg:justify-start">
            <button
              type="button"
              onClick={() => goToAuth('register')}
              className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition hover:-translate-y-0.5 ${heroPrimaryButton}`}
            >
              <i className="fa-solid fa-arrow-right" aria-hidden="true" />
              Get Started
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className={`inline-flex items-center justify-center gap-2 rounded-full border px-6 py-3.5 text-sm font-semibold backdrop-blur-xl transition ${heroSecondaryButton}`}
            >
              <i className="fa-solid fa-star" aria-hidden="true" />
              Explore Features
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:max-w-[44rem]">
            {heroStats.map((item) => (
              <div
                key={item.label}
                className={`rounded-[1.2rem] border p-3 text-center backdrop-blur-xl ${heroStatCard}`}
              >
                <p
                  className={`text-[9px] font-semibold uppercase tracking-[0.18em] ${isDarkThemeTheme ? 'text-slate-400' : 'text-slate-500'
                    }`}
                >
                  {item.label}
                </p>

                <p
                  className={`mt-1 font-display text-lg sm:text-xl font-semibold ${heroPreviewText}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-center">
          <div className="relative mx-auto w-full max-w-[700px]">
            {/* Glow Effects */}
            <div className="absolute -left-12 top-10 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -right-12 bottom-10 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />

            {/* Main Mockup */}
            <div
              className={`relative overflow-hidden rounded-[2rem] border p-4 backdrop-blur-2xl ${isDarkThemeTheme
                ? 'border-white/10 bg-white/5'
                : 'border-slate-200 bg-white/80'
                }`}
            >
              {/* Browser Header */}
              {/* <div
                className={`flex items-center gap-2 border-b pb-4 ${isDarkThemeTheme ? 'border-white/10' : 'border-slate-200'
                  }`}
              >
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-yellow-400" />
                <span className="h-3 w-3 rounded-full bg-green-400" />

                <div
                  className={`ml-4 rounded-full px-4 py-1 text-xs ${isDarkThemeTheme
                    ? 'bg-white/5 text-slate-400'
                    : 'bg-slate-100 text-slate-500'
                    }`}
                >
                  expenseflow.app/dashboard
                </div>
              </div> */}

              {/* Dashboard Screenshot Area */}
              <div className="mt-4 overflow-hidden rounded-[1.5rem]">
                <img
                  src={
                    isDarkThemeTheme
                      ? "/src/assets/dashboard-dark.png"
                      : "/src/assets/dashboard-light.png"
                  }
                  alt="ExpenseFlow Dashboard"
                  className="w-full rounded-[1.5rem] object-cover transition-all duration-300"
                />
              </div>
            </div>

            {/* Floating Card */}
            <div
              className={`absolute right-2 top-6 sm:right-4 sm:top-10 lg:-right-6 lg:top-12 rounded-[1.3rem] border px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl ${isDarkThemeTheme
                ? 'border-white/10 bg-white/5'
                : 'border-white bg-white/90'
                }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                Monthly Savings
              </p>
              <p className="mt-1 text-lg font-semibold text-emerald-400">
                +₹35,700
              </p>
            </div>

            {/* Floating Card */}
            <div
              className={`absolute left-2 bottom-6 sm:left-4 sm:bottom-10 lg:-left-6 lg:bottom-12 rounded-[1.3rem] border px-3 py-2 sm:px-4 sm:py-3 backdrop-blur-xl ${isDarkThemeTheme
                ? 'border-white/10 bg-white/5'
                : 'border-white bg-white/90'
                }`}
            >
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400">
                Budget Health
              </p>
              <p className="mt-1 text-lg font-semibold text-cyan-400">
                67.5% Used
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="features"
        className={`mt-6 rounded-[2rem] border px-5 pt-[120px] pb-8 sm:px-6 lg:px-8 ${isDarkThemeTheme
            ? 'border-white/10 bg-white/5'
            : 'border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'
          }`}
      >
        <SectionTitle
          theme={theme}
          eyebrow="Features"
          title="Everything you need to keep financial tracking clean and dependable."
          text="Built to feel premium and trustworthy, with the right balance of visual polish and practical information."
        />

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map(({ title, text, icon: Icon }) => (
            <article
              key={title}
              className={`rounded-[1.8rem] border p-5 backdrop-blur-xl transition hover:-translate-y-1 ${sectionCard}`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#0ea5e9)] text-white">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className={`mt-5 font-display text-xl font-semibold ${pageText}`}>{title}</h3>
              <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mt-6 rounded-[2rem] border px-5 py-8 sm:px-6 lg:px-8 ${isDarkThemeTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'}`}
      >
        <SectionTitle
          theme={theme}
          eyebrow="How it works"
          title="Four simple steps from setup to better financial habits."
          text="A straightforward flow keeps the experience easy for new users and efficient for regular use."
        />

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {steps.map((item) => (
            <article key={item.step} className={`rounded-[1.8rem] border p-5 backdrop-blur-xl ${sectionCard}`}>
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{item.step}</p>
              <h3 className={`mt-4 font-display text-xl font-semibold ${pageText}`}>{item.title}</h3>
              <p className={`mt-3 text-sm leading-7 ${mutedText}`}>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mt-6 rounded-[2rem] border px-5 py-8 sm:px-6 lg:px-8 ${isDarkThemeTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'}`}
      >
        <SectionTitle
          theme={theme}
          eyebrow="Testimonials"
          title="People value clarity, consistency, and confidence."
          text="Real users appreciate a smoother way to understand spending and progress."
        />

        <div className="mt-8 grid gap-4 overflow-x-auto pb-2 sm:grid-cols-3 sm:overflow-visible">
          {testimonials.map((item) => (
            <article key={item.name} className={`min-w-[280px] rounded-[1.8rem] border p-5 backdrop-blur-xl ${sectionCard}`}>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#8b5cf6,#0ea5e9)] text-sm font-bold text-white">
                  {item.name
                    .split(' ')
                    .map((part) => part[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <p className={`font-semibold ${pageText}`}>{item.name}</p>
                  <p className={`text-sm ${mutedText}`}>{item.role}</p>
                </div>
              </div>
              <p className={`mt-4 text-sm leading-7 ${mutedText}`}>“{item.quote}”</p>
            </article>
          ))}
        </div>
      </section>

      <section
        className={`mt-6 rounded-[2rem] border px-5 py-8 sm:px-6 lg:px-8 ${isDarkThemeTheme ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'}`}
      >
        <SectionTitle
          theme={theme}
          eyebrow="Pricing"
          title="Choose the plan that matches your pace."
          text="Simple pricing cards help users quickly understand what they get and which tier is the best fit."
        />

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`rounded-[2rem] border p-6 backdrop-blur-xl transition hover:-translate-y-1 ${plan.featured
                ? 'border-cyan-300/30 bg-[linear-gradient(180deg,rgba(14,165,233,0.16),rgba(139,92,246,0.12))] shadow-2xl shadow-cyan-500/10'
                : sectionCard
                }`}
            >
              {plan.featured ? (
                <span className="inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-xs font-semibold text-cyan-300">
                  Most popular
                </span>
              ) : (
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${isDarkThemeTheme ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}>
                  {plan.name}
                </span>
              )}
              <h3 className={`mt-4 font-display text-2xl font-semibold ${pageText}`}>{plan.name}</h3>
              <p className={`mt-2 text-sm leading-7 ${mutedText}`}>{plan.description}</p>
              <p className={`mt-5 font-display text-4xl font-semibold ${pageText}`}>{plan.price}</p>
              <ul className={`mt-5 space-y-3 text-sm ${mutedText}`}>
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <i className="fa-solid fa-check mt-1 text-cyan-300" aria-hidden="true" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-6 pb-10 sm:pb-12">
        <div className={`rounded-[2.2rem] border px-6 py-10 text-center shadow-2xl backdrop-blur-xl sm:px-8 sm:py-12 ${sectionBackdrop}`}>
          <h2 className={`mx-auto mt-1 max-w-3xl font-display text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl ${pageText}`}>
            Take Control of Your Money Today
          </h2>
          <p className={`mx-auto mt-4 max-w-2xl text-sm leading-7 sm:text-base sm:leading-8 ${mutedText}`}>
            Start tracking your income, expenses, and budget with a premium experience built to help you feel more in control every month.
          </p>
          <button
            type="button"
            onClick={() => goToAuth('register')}
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#22d3ee,#8b5cf6)] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-arrow-right-to-bracket" aria-hidden="true" />
            Start Tracking Free
          </button>
        </div>
      </section>



      <section
        className={`mt-6 rounded-[2rem] border px-5 py-8 sm:px-6 lg:px-8 ${isDarkThemeTheme
          ? 'border-white/10 bg-white/5'
          : 'border-slate-200 bg-white/85 shadow-[0_18px_45px_rgba(15,23,42,0.06)]'
          }`}
      >
        <SectionTitle
          theme={theme}
          eyebrow="Feedback"
          title="Help Us Improve ExpenseFlow"
          text="Share your experience, suggest new features, or tell us what can be improved. Your feedback helps us build a better product for everyone."
        />

        <div className="mx-auto mt-8 max-w-4xl">
          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDarkThemeTheme ? 'text-slate-200' : 'text-slate-700'
                    }`}
                >
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={feedbackForm.name}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Enter your name"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${isDarkThemeTheme
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                    }`}
                />
              </div>

              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isDarkThemeTheme ? 'text-slate-200' : 'text-slate-700'
                    }`}
                >
                  Email Address
                </label>
                <input
                  type="email"
                  value={feedbackForm.email}
                  onChange={(e) =>
                    setFeedbackForm((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-4 py-3 outline-none transition ${isDarkThemeTheme
                    ? 'border-white/10 bg-white/5 text-white'
                    : 'border-slate-200 bg-white text-slate-900'
                    }`}
                />
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isDarkThemeTheme ? 'text-slate-200' : 'text-slate-700'
                  }`}
              >
                Feedback Type
              </label>

              <select
                value={feedbackForm.category}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                className="themed-select w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
              >
                <option>General Feedback</option>
                <option>Feature Request</option>
                <option>Bug Report</option>
                <option>UI / UX Suggestion</option>
                <option>Performance Issue</option>
              </select>
            </div>

            <div>
              <label
                className={`mb-3 block text-sm font-medium ${isDarkThemeTheme ? 'text-slate-200' : 'text-slate-700'
                  }`}
              >
                Rate Your Experience
              </label>

              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="transition hover:scale-110"
                  >
                    <i
                      className={`fa-solid fa-star text-3xl ${star <= rating
                        ? 'text-amber-400'
                        : isDarkThemeTheme
                          ? 'text-slate-600'
                          : 'text-slate-300'
                        }`}
                    />
                  </button>
                ))}

                {rating > 0 && (
                  <span
                    className={`ml-3 text-sm ${isDarkThemeTheme ? 'text-slate-300' : 'text-slate-600'
                      }`}
                  >
                    {rating}/5
                  </span>
                )}
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isDarkThemeTheme ? 'text-slate-200' : 'text-slate-700'
                  }`}
              >
                What would you like us to improve?
              </label>

              <textarea
                rows="6"
                value={feedbackForm.message}
                onChange={(e) =>
                  setFeedbackForm((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                placeholder="Tell us what can be improved, what features you'd like, or share your overall experience..."
                className={`w-full rounded-xl border px-4 py-3 outline-none transition ${isDarkThemeTheme
                  ? 'border-white/10 bg-white/5 text-white'
                  : 'border-slate-200 bg-white text-slate-900'
                  }`}
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(135deg,#22d3ee,#8b5cf6)] px-7 py-3.5 text-sm font-semibold text-white shadow-xl shadow-cyan-500/20 transition hover:-translate-y-0.5"
              >
                <i className="fa-solid fa-paper-plane" />
                Submit Feedback
              </button>

            </div>
            <p
              className={`mt-4 text-center text-sm ${isDarkThemeTheme ? 'text-slate-400' : 'text-slate-500'
                }`}
            >
              We read every feedback submission and use it to improve the product experience.
            </p>
          </form>
        </div>
      </section>

      <Footer
        variant="home"
        onPrimaryAction={() => goToAuth('register')}
        onSecondaryAction={() => goToAuth('login')}
      />
    </main>
  )
}

export default LandingPage
