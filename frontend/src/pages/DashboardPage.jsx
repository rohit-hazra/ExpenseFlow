import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../lib/api'
import Header from '../components/Header'
import InputField from '../components/InputField'
import ReportRangeModal from '../components/ReportRangeModal'
import { ChartIcon, LockIcon, MailIcon, UserIcon, WalletIcon } from '../components/Icons'
import { generateExpenseReport } from '../utils/pdfReportGenerator'

const categories = ['Food', 'Travel', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other']
const incomeCategories = ['Salary', 'Freelance', 'Business', 'Interest', 'Gift', 'Other']
const transactionTypes = ['UPI', 'Cash', 'Card', 'Bank Transfer']

const expenseInitialState = {
  title: '',
  amount: '',
  category: categories[0],
  transactionType: transactionTypes[0],
  spentOn: getTodayDateInputValue(),
  description: '',
}

const incomeInitialState = {
  title: '',
  amount: '',
  category: incomeCategories[0],
  transactionType: transactionTypes[0],
  receivedOn: getTodayDateInputValue(),
  description: '',
}

const budgetInitialState = {
  monthlyBudget: 30000,
}

const dashboardSections = [
  { id: 'dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-pie' },
  { id: 'analytics', label: 'Analytics', icon: 'fa-solid fa-chart-column' },
  { id: 'expenses', label: 'Expenses', icon: 'fa-solid fa-receipt' },
  { id: 'income', label: 'Income', icon: 'fa-solid fa-wallet' },
  { id: 'budget', label: 'Budget', icon: 'fa-solid fa-bullseye' },
  { id: 'settings', label: 'Settings', icon: 'fa-solid fa-gear' },
]

const chartEntranceAnimation = {
  duration: 1000,
  easing: 'easeOutQuart',
}

function normalizeIncomeEntry(incomeEntry) {
  return {
    ...incomeEntry,
    id: incomeEntry.id || incomeEntry._id,
  }
}

function DashboardPage({ theme, onToggleTheme, user, onLogout, onUserUpdated }) {
  const navigate = useNavigate()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)
  const [expenses, setExpenses] = useState([])
  const [incomeEntries, setIncomeEntries] = useState([])
  const [budget, setBudget] = useState(budgetInitialState)
  const [expenseFormState, setExpenseFormState] = useState(expenseInitialState)
  const [incomeFormState, setIncomeFormState] = useState(incomeInitialState)
  const [editingExpenseId, setEditingExpenseId] = useState(null)
  const [editingIncomeId, setEditingIncomeId] = useState(null)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [pendingDeletion, setPendingDeletion] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingExpense, setIsSavingExpense] = useState(false)
  const [isSavingIncome, setIsSavingIncome] = useState(false)
  const [isDeletingEntry, setIsDeletingEntry] = useState(false)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)
  const [profileFormState, setProfileFormState] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })
  const [passwordFormState, setPasswordFormState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const todayDateInputValue = getTodayDateInputValue()

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [expensesResponse, incomeResponse, budgetResponse] = await Promise.all([
          api.get('/expenses'),
          api.get('/income'),
          api.get('/budget'),
        ])

        setExpenses(expensesResponse.data.expenses || [])
        setBudget(budgetResponse.data.budget || budgetInitialState)
        setIncomeEntries((incomeResponse.data.incomeEntries || []).map(normalizeIncomeEntry))
      } catch (error) {
        toast.error(error.response?.data?.message || 'Unable to load dashboard data.')
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  useEffect(() => {
    setProfileFormState({
      name: user?.name || '',
      email: user?.email || '',
    })
  }, [user?.name, user?.email])

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) {
        setIsMobileNavOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalIncome = incomeEntries.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalExpense = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const totalBalance = totalIncome - totalExpense
  const currentMonthExpense = expenses
    .filter((item) => isCurrentMonth(item.spentOn))
    .reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const monthlyBudget = Number(budget.monthlyBudget || 0)
  const budgetProgress = monthlyBudget > 0 ? Math.min((currentMonthExpense / monthlyBudget) * 100, 100) : 0
  const budgetRemaining = Math.max(monthlyBudget - currentMonthExpense, 0)
  const overspentAmount = Math.max(currentMonthExpense - monthlyBudget, 0)
  const recentTransactions = buildRecentTransactions(expenses, incomeEntries)
  const spendingByCategory = useMemo(
    () => categories.map((category) => {
      const amount = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
      return { category, amount }
    }).filter((item) => item.amount > 0),
    [expenses],
  )
  const monthlyTrend = useMemo(() => buildMonthlyTrend(expenses, incomeEntries), [expenses, incomeEntries])
  const categoryAnalysis = useMemo(
    () => [...spendingByCategory].sort((left, right) => right.amount - left.amount).slice(0, 6),
    [spendingByCategory],
  )

  const handleLogout = () => {
    onLogout()
    toast.success('Logged out successfully.')
    navigate('/auth?mode=login', { replace: true })
  }

  const openMobileNav = () => {
    setIsMobileNavOpen(true)
  }

  const closeMobileNav = () => {
    setIsMobileNavOpen(false)
  }

  const handleSectionSelect = (sectionId) => {
    setActiveSection(sectionId)
    closeMobileNav()
  }

  const handleExpenseChange = (event) => {
    const { name, value } = event.target
    setExpenseFormState((current) => ({ ...current, [name]: value }))
  }

  const handleIncomeChange = (event) => {
    const { name, value } = event.target
    setIncomeFormState((current) => ({ ...current, [name]: value }))
  }

  const openExpenseModal = (expense = null) => {
    if (expense) {
      setEditingExpenseId(expense._id)
      setExpenseFormState({
        title: expense.title,
        amount: String(expense.amount),
        category: expense.category,
        transactionType: expense.transactionType || transactionTypes[0],
        spentOn: formatDateForInput(expense.spentOn),
        description: expense.description || '',
      })
    } else {
      setEditingExpenseId(null)
      setExpenseFormState(expenseInitialState)
    }

    setShowExpenseModal(true)
  }

  const openIncomeModal = (income = null) => {
    if (income) {
      setEditingIncomeId(income._id || income.id)
      setIncomeFormState({
        title: income.title,
        amount: String(income.amount),
        category: income.category,
        transactionType: income.transactionType || transactionTypes[0],
        receivedOn: formatDateForInput(income.receivedOn),
        description: income.description || '',
      })
    } else {
      setEditingIncomeId(null)
      setIncomeFormState(incomeInitialState)
    }

    setShowIncomeModal(true)
  }

  const closeExpenseModal = () => {
    setShowExpenseModal(false)
    setEditingExpenseId(null)
    setExpenseFormState(expenseInitialState)
  }

  const closeIncomeModal = () => {
    setShowIncomeModal(false)
    setEditingIncomeId(null)
    setIncomeFormState(incomeInitialState)
  }

  const handleExpenseSubmit = async (event) => {
    event.preventDefault()
    setIsSavingExpense(true)

    try {
      const payload = {
        ...expenseFormState,
        amount: Number(expenseFormState.amount),
      }

      if (payload.spentOn > todayDateInputValue) {
        toast.error('Expense date cannot be in the future.')
        return
      }

      if (editingExpenseId) {
        const { data } = await api.put(`/expenses/${editingExpenseId}`, payload)
        setExpenses((current) => current.map((item) => (item._id === editingExpenseId ? data.expense : item)))
        toast.success(data.message)
      } else {
        const { data } = await api.post('/expenses', payload)
        setExpenses((current) => [data.expense, ...current])
        toast.success(data.message)
      }

      closeExpenseModal()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save expense.')
    } finally {
      setIsSavingExpense(false)
    }
  }

  const handleIncomeSubmit = (event) => {
    event.preventDefault()
    setIsSavingIncome(true)

    const payload = {
      ...incomeFormState,
      amount: Number(incomeFormState.amount),
    }

    if (!payload.title.trim() || !Number.isFinite(payload.amount) || payload.amount <= 0) {
      toast.error('Please enter a valid income title and amount.')
      setIsSavingIncome(false)
      return
    }

    if (payload.receivedOn > todayDateInputValue) {
      toast.error('Income date cannot be in the future.')
      setIsSavingIncome(false)
      return
    }

    const request = editingIncomeId
      ? api.put(`/income/${editingIncomeId}`, payload)
      : api.post('/income', payload)

    request
      .then(({ data }) => {
        const savedIncome = normalizeIncomeEntry(data.incomeEntry)

        setIncomeEntries((current) => {
          if (editingIncomeId) {
            return current.map((item) => (item.id === editingIncomeId ? savedIncome : item))
          }

          return [savedIncome, ...current]
        })

        toast.success(data.message)
        closeIncomeModal()
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to save income.')
      })
      .finally(() => {
        setIsSavingIncome(false)
      })
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      const { data } = await api.delete(`/expenses/${expenseId}`)
      setExpenses((current) => current.filter((item) => item._id !== expenseId))
      toast.success(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete expense.')
    }
  }

  const handleDeleteIncome = async (incomeId) => {
    try {
      const { data } = await api.delete(`/income/${incomeId}`)
      setIncomeEntries((current) => current.filter((item) => item.id !== incomeId))
      toast.success(data.message)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete income.')
    }
  }

  const requestDeleteExpense = (expense) => {
    setPendingDeletion({
      type: 'expense',
      id: expense._id,
      title: expense.title || 'this expense',
    })
  }

  const requestDeleteIncome = (income) => {
    setPendingDeletion({
      type: 'income',
      id: income.id,
      title: income.title || 'this income',
    })
  }

  const cancelDeleteEntry = () => {
    if (!isDeletingEntry) {
      setPendingDeletion(null)
    }
  }

  const confirmDeleteEntry = async () => {
    if (!pendingDeletion) {
      return
    }

    setIsDeletingEntry(true)

    try {
      if (pendingDeletion.type === 'expense') {
        await handleDeleteExpense(pendingDeletion.id)
      } else {
        await handleDeleteIncome(pendingDeletion.id)
      }

      setPendingDeletion(null)
    } finally {
      setIsDeletingEntry(false)
    }
  }

  const handleBudgetSubmit = (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const nextBudget = Number(formData.get('monthlyBudget'))

    if (!Number.isFinite(nextBudget) || nextBudget <= 0) {
      toast.error('Please enter a valid monthly budget.')
      return
    }

    api
      .put('/budget', { monthlyBudget: nextBudget })
      .then(({ data }) => {
        setBudget(data.budget || { monthlyBudget: nextBudget })
        toast.success(data.message)
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Unable to update budget.')
      })
  }

  const handleProfileChange = (event) => {
    const { name, value } = event.target
    setProfileFormState((current) => ({ ...current, [name]: value }))
  }

  const handlePasswordChange = (event) => {
    const { name, value } = event.target
    setPasswordFormState((current) => ({ ...current, [name]: value }))
  }

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    const nextName = profileFormState.name.trim()

    if (!nextName) {
      toast.error('Please enter your name.')
      return
    }

    setIsSavingProfile(true)

    try {
      const { data } = await api.patch('/auth/me', {
        name: nextName,
      })

      const updatedUser = data.user || { ...user, name: nextName }
      onUserUpdated?.(updatedUser)
      toast.success(data.message || 'Profile updated successfully.')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update profile.')
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()

    const { currentPassword, newPassword, confirmPassword } = passwordFormState

    if (!currentPassword.trim() || !newPassword.trim()) {
      toast.error('Please fill in both password fields.')
      return
    }

    if (newPassword.trim().length < 6) {
      toast.error('New password must be at least 6 characters long.')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirmation do not match.')
      return
    }

    setIsSavingPassword(true)

    try {
      const { data } = await api.patch('/auth/me/password', {
        currentPassword,
        newPassword,
      })

      toast.success(data.message || 'Password updated successfully.')
      setPasswordFormState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update password.')
    } finally {
      setIsSavingPassword(false)
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1520px] flex-col px-3 pt-22 pb-0 sm:px-4 sm:pt-24 lg:px-5 lg:pt-20 ">
      <Header
        variant="dashboard"
        theme={theme}
        onToggleTheme={onToggleTheme}
        onLogoClick={() => navigate('/dashboard')}
        onPrimaryAction={handleLogout}
        primaryLabel="Logout"
        userName={user?.name}
      />

      <section className="flex flex-1 flex-col gap-5 py-5 sm:py-6 xl:flex-row ">
        <div className="flex items-center justify-between gap-4 rounded-[1.65rem] border border-white/15 bg-white/45 px-4 py-3 backdrop-blur-xl xl:hidden dark:bg-white/8">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Workspace</p>
            <h1 className="mt-1 truncate font-display text-lg font-semibold leading-none sm:text-xl">Dashboard</h1>
          </div>

          <button
            type="button"
            onClick={openMobileNav}
            aria-label="Open dashboard menu"
            aria-expanded={isMobileNavOpen}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/25 bg-white/60 text-[var(--text-primary)] shadow-lg shadow-slate-900/5 transition hover:-translate-y-0.5 dark:bg-white/8"
          >
            <span className="flex flex-col gap-1.5">
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
              <span className="h-0.5 w-5 rounded-full bg-current" />
            </span>
          </button>
        </div>

        {isMobileNavOpen ? (
          <div className="fixed inset-0 z-40 xl:hidden">
            <button
              type="button"
              aria-label="Close dashboard menu"
              onClick={closeMobileNav}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <aside className="glass-panel absolute left-4 right-4 top-24 max-h-[calc(100vh-7rem)] overflow-y-auto rounded-[2rem] border border-white/15 p-4 shadow-2xl shadow-slate-900/20">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Navigation</p>
                  {/* <p className="mt-1 font-display text-xl font-semibold">Choose a section</p> */}
                </div>
                <button
                  type="button"
                  onClick={closeMobileNav}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/65 text-[var(--text-secondary)] dark:bg-white/8"
                >
                  <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
                </button>
              </div>

              <nav className="flex flex-col gap-3">
                {dashboardSections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => handleSectionSelect(section.id)}
                    className={`flex items-center gap-3 rounded-[1.4rem] px-4 py-3.5 text-left text-sm font-semibold transition ${activeSection === section.id
                      ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900'
                      : 'bg-white/55 text-[var(--text-secondary)] hover:bg-white/80 dark:bg-white/8 dark:hover:bg-white/12'
                      }`}
                  >
                    <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${activeSection === section.id
                      ? 'bg-white/15 text-white dark:bg-slate-200 dark:text-slate-900'
                      : 'bg-[linear-gradient(135deg,#f97316,#0ea5e9)] text-white'
                      }`}>
                      <i className={`${section.icon} text-sm`} aria-hidden="true" />
                    </span>
                    <span>
                      <span className="block">{section.label}</span>
                      <span className={`block text-xs font-medium ${activeSection === section.id ? 'text-white/70 dark:text-slate-500' : 'text-[var(--text-muted)]'
                        }`}>
                        {getSectionDescription(section.id)}
                      </span>
                    </span>
                  </button>
                ))}
              </nav>
            </aside>
          </div>
        ) : null}

        <aside className="glass-panel hidden rounded-[2rem] border border-white/15 p-4 shadow-2xl shadow-slate-900/5 backdrop-blur-xl xl:fixed xl:top-28 xl:block xl:h-[calc(100vh-8rem)] xl:w-[280px] xl:overflow-y-auto">
          <nav className="mt-5 flex gap-3 overflow-x-auto pb-1 xl:flex-col">
            {dashboardSections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                className={`flex min-w-[160px] items-center gap-3 rounded-[1.4rem] px-4 py-3.5 text-left text-sm font-semibold transition xl:min-w-0 ${activeSection === section.id
                  ? 'bg-slate-950 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900'
                  : 'bg-white/55 text-[var(--text-secondary)] hover:bg-white/80 dark:bg-white/8 dark:hover:bg-white/12'
                  }`}
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${activeSection === section.id
                  ? 'bg-white/15 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-[linear-gradient(135deg,#f97316,#0ea5e9)] text-white'
                  }`}>
                  <i className={`${section.icon} text-sm`} aria-hidden="true" />
                </span>
                <span>
                  <span className="block">{section.label}</span>
                  <span className={`block text-xs font-medium ${activeSection === section.id ? 'text-white/70 dark:text-slate-500' : 'text-[var(--text-muted)]'
                    }`}>
                    {getSectionDescription(section.id)}
                  </span>
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-5 xl:ml-[304px]">
          {activeSection === 'dashboard' ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <section className="glass-panel rounded-[1.8rem] px-5 py-3 md:col-span-2 xl:col-span-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-display text-xl font-semibold sm:text-2xl">
                      {getDayGreeting()} {user?.name ? `${user.name}` : 'there'}
                    </h2>

                    <p className="mt-1 text-sm text-[var(--text-secondary)]">
                      Know where your money goes and make every rupee count. 💰
                    </p>
                  </div>

                  <div className="rounded-[1.2rem] bg-white/55 px-4 py-2 text-sm text-[var(--text-secondary)] dark:bg-white/8">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">
                      Today
                    </p>

                    <p className="mt-0.5 font-display text-base font-semibold text-[var(--text-primary)] sm:text-lg">
                      {new Date().toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </section>

              <MetricCard
                title="Total balance"
                value={formatCurrency(totalBalance)}
                changeText={totalBalance >= 0 ? 'Healthy cash position' : 'Spending is above income'}
                icon="fa-solid fa-landmark"
                tone={totalBalance >= 0 ? 'emerald' : 'rose'}
              />
              <MetricCard
                title="Total income"
                value={formatCurrency(totalIncome)}
                changeText={`${incomeEntries.length} income records`}
                icon="fa-solid fa-arrow-trend-up"
                tone="cyan"
              />
              <MetricCard
                title="Total expense"
                value={formatCurrency(totalExpense)}
                changeText={`${expenses.length} expense records`}
                icon="fa-solid fa-arrow-trend-down"
                tone="orange"
              />
              <MetricCard
                title="Budget progress"
                value={`${Math.round(budgetProgress)}%`}
                changeText={monthlyBudget > 0 ? `${formatCurrency(budgetRemaining)} left this month` : 'Set a monthly budget'}
                icon="fa-solid fa-gauge-high"
                tone="violet"
              />
            </div>
          ) : null}

          {activeSection === 'dashboard' ? (
            <DashboardOverview
              totalBalance={totalBalance}
              monthlyBudget={monthlyBudget}
              currentMonthExpense={currentMonthExpense}
              budgetRemaining={budgetRemaining}
              expenses={expenses}
              incomeEntries={incomeEntries}
              recentTransactions={recentTransactions}
              isLoading={isLoading}
            />
          ) : null}

          {activeSection === 'analytics' ? (
            <AnalyticsSection
              theme={theme}
              user={user}
              expenses={expenses}
              incomeEntries={incomeEntries}
              budget={budget}
              monthlyTrend={monthlyTrend}
              categoryAnalysis={categoryAnalysis}
            />
          ) : null}

          {activeSection === 'expenses' ? (
            <ExpensesSection
              expenses={expenses}
              isLoading={isLoading}
              onAddExpense={() => openExpenseModal()}
              onEditExpense={openExpenseModal}
              onDeleteExpense={requestDeleteExpense}
            />
          ) : null}

          {activeSection === 'income' ? (
            <IncomeSection
              incomeEntries={incomeEntries}
              isLoading={isLoading}
              onAddIncome={() => openIncomeModal()}
              onEditIncome={openIncomeModal}
              onDeleteIncome={requestDeleteIncome}
            />
          ) : null}

          {activeSection === 'budget' ? (
            <BudgetSection
              monthlyBudget={monthlyBudget}
              currentMonthExpense={currentMonthExpense}
              budgetProgress={budgetProgress}
              budgetRemaining={budgetRemaining}
              overspentAmount={overspentAmount}
              onBudgetSubmit={handleBudgetSubmit}
            />
          ) : null}

          {activeSection === 'settings' ? (
            <SettingsSection
              user={user}
              theme={theme}
              onToggleTheme={onToggleTheme}
              profileFormState={profileFormState}
              passwordFormState={passwordFormState}
              isSavingProfile={isSavingProfile}
              isSavingPassword={isSavingPassword}
              onProfileChange={handleProfileChange}
              onPasswordChange={handlePasswordChange}
              onProfileSubmit={handleProfileSubmit}
              onPasswordSubmit={handlePasswordSubmit}
            />
          ) : null}
        </div>
      </section>

      {showExpenseModal ? (
        <EntryModal
          title={editingExpenseId ? 'Edit expense' : 'Add expense'}
          subtitle="Capture the title, amount, payment method, category, date, and optional description."
          onClose={closeExpenseModal}
        >
          <form className="space-y-4" onSubmit={handleExpenseSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Title" name="title" type="text" placeholder="Groceries, Rent, Cab..." value={expenseFormState.title} onChange={handleExpenseChange} icon={WalletIcon} />
              <InputField label="Amount" name="amount" type="number" placeholder="Enter amount" value={expenseFormState.amount} onChange={handleExpenseChange} icon={ChartIcon} />
              <SelectField label="Transaction type" name="transactionType" value={expenseFormState.transactionType} onChange={handleExpenseChange} options={transactionTypes} />
              <SelectField label="Category" name="category" value={expenseFormState.category} onChange={handleExpenseChange} options={categories} />
              <InputField label="Date" name="spentOn" type="date" value={expenseFormState.spentOn} onChange={handleExpenseChange} icon={MailIcon} max={todayDateInputValue} />
            </div>

            <TextAreaField label="Description (Optional)" name="description" value={expenseFormState.description} onChange={handleExpenseChange} placeholder="Optional description about this expense" />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeExpenseModal}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"

              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingExpense}
                className="rounded-full bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingExpense ? 'Saving...' : editingExpenseId ? 'Update expense' : 'Add expense'}
              </button>
            </div>
          </form>
        </EntryModal>
      ) : null}

      {showIncomeModal ? (
        <EntryModal
          title={editingIncomeId ? 'Edit income' : 'Add income'}
          subtitle="Track incoming money with payment method, category, date, and description."
          onClose={closeIncomeModal}
        >
          <form className="space-y-4" onSubmit={handleIncomeSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <InputField label="Title" name="title" type="text" placeholder="Salary, Freelance, Bonus..." value={incomeFormState.title} onChange={handleIncomeChange} icon={WalletIcon} />
              <InputField label="Amount" name="amount" type="number" placeholder="Enter amount" value={incomeFormState.amount} onChange={handleIncomeChange} icon={ChartIcon} />
              <SelectField label="Transaction type" name="transactionType" value={incomeFormState.transactionType} onChange={handleIncomeChange} options={transactionTypes} />
              <SelectField label="Category" name="category" value={incomeFormState.category} onChange={handleIncomeChange} options={incomeCategories} />
              <InputField label="Date" name="receivedOn" type="date" value={incomeFormState.receivedOn} onChange={handleIncomeChange} icon={MailIcon} max={todayDateInputValue} />
            </div>

            <TextAreaField label="Description (Optional)" name="description" value={incomeFormState.description} onChange={handleIncomeChange} placeholder="Optional description about this income" />

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeIncomeModal}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingIncome}
                className="rounded-full bg-[linear-gradient(135deg,#10b981,#06b6d4)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSavingIncome ? 'Saving...' : editingIncomeId ? 'Update income' : 'Add income'}
              </button>
            </div>
          </form>
        </EntryModal>
      ) : null}

      {pendingDeletion ? (
        <DeleteConfirmationModal
          entryType={pendingDeletion.type}
          entryTitle={pendingDeletion.title}
          isDeleting={isDeletingEntry}
          onCancel={cancelDeleteEntry}
          onConfirm={confirmDeleteEntry}
        />
      ) : null}
    </main>
  )
}

function DashboardOverview({
  totalBalance,
  monthlyBudget,
  currentMonthExpense,
  budgetRemaining,
  expenses,
  incomeEntries,
  recentTransactions,
  isLoading,
}) {
  return (
    <div className="space-y-6 ">
      <div className="grid gap-5 xl:grid-cols-[1.12fr_0.88fr]">
        <CashFlowChartCard expenses={expenses} incomeEntries={incomeEntries} />

        {/* <section className="rounded-[1.8rem] bg-slate-950 p-5 text-white shadow-2xl shadow-slate-900/15">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Cash position</p>
          <p className={`mt-4 font-display text-3xl font-semibold sm:text-4xl ${totalBalance >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
            {formatCurrency(totalBalance)}
          </p>
          <div className="mt-5 space-y-4">
            <ProgressMeter label="Budget used this month" value={currentMonthExpense} maxValue={monthlyBudget || currentMonthExpense || 1} colorClass="from-orange-400 to-rose-500" />
            <div className="rounded-[1.5rem] bg-white/10 p-4">
              <p className="text-sm text-slate-300">Remaining monthly budget</p>
              <p className="mt-2 font-display text-2xl font-semibold text-cyan-300 sm:text-3xl">{formatCurrency(budgetRemaining)}</p>
            </div>
          </div>
        </section> */}

        <section
          className="flex h-[560px] flex-col rounded-[1.8rem] border border-[var(--panel-border)] bg-[var(--panel-bg)] p-5 text-[var(--text-primary)] shadow-2xl shadow-slate-900/15 backdrop-blur-xl sm:p-6"
        >
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
                Recent transactions
              </p>

              <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
                Latest activity
              </h3>
            </div>

            <span className="rounded-full border border-[var(--panel-border)] bg-white/40 px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] backdrop-blur-md dark:bg-white/8">
              Combined income and expense feed
            </span>
          </div>

          {isLoading ? (
            <EmptyState text="Loading transactions..." />
          ) : recentTransactions.length === 0 ? (
            <EmptyState text="No transactions yet. Start by adding income or an expense." />
          ) : (
            <div className="scrollbar-hide flex-1 space-y-4 overflow-y-auto pr-2">
              {recentTransactions.map((transaction) => (
                <TransactionCard
                  key={transaction.id}
                  transaction={transaction}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}


function CashFlowChartCard({ expenses, incomeEntries }) {
  const chartRef = useRef(null)
  const chartInstanceRef = useRef(null)

  const [openDropdown, setOpenDropdown] = useState(false)

  const [selectedRange, setSelectedRange] = useState({
    label: 'Last 6 Months',
    months: 6,
  })
  const buildDailyTrendForMonth = (expenses, incomes) => {
    const endDate = new Date()

    const startDate = new Date()

    startDate.setDate(endDate.getDate() - 30)

    const data = []

    for (
      let date = new Date(startDate);
      date <= endDate;
      date.setDate(date.getDate() + 1)
    ) {
      const currentDate = new Date(date)

      const income = incomes
        .filter((item) => {
          const itemDate = new Date(item.receivedOn)

          return (
            itemDate.getDate() === currentDate.getDate() &&
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          )
        })
        .reduce((sum, item) => sum + item.amount, 0)

      const expense = expenses
        .filter((item) => {
          const itemDate = new Date(item.spentOn)

          return (
            itemDate.getDate() === currentDate.getDate() &&
            itemDate.getMonth() === currentDate.getMonth() &&
            itemDate.getFullYear() === currentDate.getFullYear()
          )
        })
        .reduce((sum, item) => sum + item.amount, 0)

      data.push({
        label: `${currentDate.getDate()} ${currentDate.toLocaleString(
          'default',
          { month: 'short' }
        )}`,
        income,
        expense,
      })
    }

    return data
  }

  const buildWeeklyTrendForThreeMonths = (expenses, incomes) => {
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)

    const startDate = new Date()
    startDate.setMonth(endDate.getMonth() - 3)
    startDate.setHours(0, 0, 0, 0)

    const data = []

    for (
      let current = new Date(startDate);
      current <= endDate;
      current.setDate(current.getDate() + 7)
    ) {
      const weekStart = new Date(current)
      weekStart.setHours(0, 0, 0, 0)

      const weekEnd = new Date(current)
      weekEnd.setDate(weekEnd.getDate() + 6)
      weekEnd.setHours(23, 59, 59, 999)

      if (weekEnd > endDate) {
        weekEnd.setTime(endDate.getTime())
      }

      const income = incomes
        .filter((item) => {
          const date = new Date(item.receivedOn)

          return date >= weekStart && date <= weekEnd
        })
        .reduce((sum, item) => sum + item.amount, 0)

      const expense = expenses
        .filter((item) => {
          const date = new Date(item.spentOn)

          return date >= weekStart && date <= weekEnd
        })
        .reduce((sum, item) => sum + item.amount, 0)

      data.push({
        label: `${weekEnd.getDate()} ${weekEnd.toLocaleString(
          'default',
          { month: 'short' }
        )}`,
        income,
        expense,
      })
    }

    return data
  }

  const end = new Date()
  const start = new Date()
  start.setMonth(end.getMonth() - (selectedRange.months - 1))
  const startMonth = `${start.getFullYear()}-${String(
    start.getMonth() + 1
  ).padStart(2, '0')}`
  const endMonth = `${end.getFullYear()}-${String(
    end.getMonth() + 1
  ).padStart(2, '0')}`

  const chartData = useMemo(() => {
    if (selectedRange.months === 1) {
      return buildDailyTrendForMonth(expenses, incomeEntries)
    }

    if (selectedRange.months === 3) {
      return buildWeeklyTrendForThreeMonths(expenses, incomeEntries)
    }

    return buildMonthlyTrendForRange(
      expenses,
      incomeEntries,
      startMonth,
      endMonth
    )
  }, [expenses, incomeEntries, selectedRange.months, startMonth, endMonth])

  useEffect(() => {

    if (!chartRef.current || typeof window === 'undefined' || !window.Chart) {
      return undefined
    }

    // Destroy previous instance safely
    chartInstanceRef.current?.destroy()
    chartInstanceRef.current = null

    const ctx = chartRef.current.getContext('2d')

    const styles = getComputedStyle(document.documentElement)

    const textMuted =
      styles.getPropertyValue('--text-muted').trim() || '#64748b'

    const isDarkTheme = document.documentElement.classList.contains('dark')

    const gridColor = isDarkTheme
      ? 'rgba(148,163,184,0.10)'
      : 'rgba(148,163,184,0.12)'

    // Gradient Fill
    const incomeGradient = ctx.createLinearGradient(0, 0, 0, 400)

    incomeGradient.addColorStop(0, 'rgba(16,185,129,0.25)')
    incomeGradient.addColorStop(0.5, 'rgba(16,185,129,0.10)')
    incomeGradient.addColorStop(1, 'rgba(16,185,129,0)')

    const expenseGradient = ctx.createLinearGradient(0, 0, 0, 400)

    expenseGradient.addColorStop(0, 'rgba(244,63,94,0.20)')
    expenseGradient.addColorStop(0.5, 'rgba(244,63,94,0.08)')
    expenseGradient.addColorStop(1, 'rgba(244,63,94,0)')

    // Vertical hover line
    const verticalLinePlugin = {
      id: 'verticalLinePlugin',

      afterDraw(chart) {
        if (chart.tooltip?._active?.length) {
          const ctx = chart.ctx
          const activePoint = chart.tooltip._active[0]

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(activePoint.element.x, chart.chartArea.top)
          ctx.lineTo(activePoint.element.x, chart.chartArea.bottom)
          ctx.lineWidth = 1
          ctx.strokeStyle = isDarkTheme
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(15,23,42,0.12)'

          ctx.stroke()
          ctx.restore()
        }
      },
    }

    chartInstanceRef.current = new window.Chart(ctx, {
      type: 'line',
      data: {
        labels: chartData.map((month) => month.label),
        datasets: [
          {
            label: 'Income',
            data: chartData.map((month) => month.income),
            borderColor: '#10b981',
            backgroundColor: incomeGradient,
            fill: true,
            tension: 0.45,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointHitRadius: 20,
            pointBackgroundColor: '#10b981',
            // pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
          {
            label: 'Expenses',
            data: chartData.map((month) => month.expense),
            borderColor: '#f43f5e',
            backgroundColor: expenseGradient,
            fill: true,
            tension:
              selectedRange.months === 3
                ? 0.25
                : 0.35,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 3,
            pointBackgroundColor: '#f43f5e',
            // pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
          },
        ],
      },

      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 120,
        animation: chartEntranceAnimation,
        animations: {
          y: {
            from: (context) => {
              const yScale = context.chart.scales.y
              return yScale.getPixelForValue(0)
            },
          },
        },

        interaction: {
          mode: 'index',
          intersect: false,
        },

        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            enabled: true,
            backgroundColor: isDarkTheme ? '#0f172a' : '#ffffff',
            titleColor: isDarkTheme ? '#cbd5e1' : '#64748b',
            bodyColor: isDarkTheme ? '#f8fafc' : '#0f172a',
            borderColor: isDarkTheme
              ? 'rgba(255,255,255,0.08)'
              : '#e2e8f0',
            borderWidth: 1,
            padding: 16,
            displayColors: true,
            cornerRadius: 22,
            titleFont: {
              size: 13,
              weight: '700',
            },
            bodyFont: {
              size: 14,
              weight: '600',
            },
            callbacks: {
              label(context) {
                return ` ${context.dataset.label}   ${formatCurrency(
                  context.raw
                )}`
              },
            },
          },
        },

        scales: {
          x: {
            offset: false,

            ticks: {
              color: textMuted,

              autoSkip: true,

              maxTicksLimit:
                selectedRange.months === 1
                  ? 8
                  : selectedRange.months === 3
                    ? 6
                    : 12,

              font: {
                size: 11,
                weight: '600',
              },
            },

            grid: {
              display: false,
            },

            border: {
              display: false,
            },
          },

          y: {
            beginAtZero: true,

            suggestedMax:
              chartData.every(
                (item) => item.income === 0 && item.expense === 0
              )
                ? 200
                : undefined,

            ticks: {
              stepSize:
                chartData.every(
                  (item) => item.income === 0 && item.expense === 0
                )
                  ? 20
                  : undefined,

              color: textMuted,

              padding: 12,

              font: {
                size: 13,
              },

              callback(value) {
                const amount = Number(value)

                if (amount >= 1000) {
                  return `₹${Math.round(amount / 1000)}k`
                }

                return `₹${amount}`
              },
            },

            grid: {
              color: gridColor,
              drawBorder: false,
            },

            border: {
              display: false,
            },
          },
        },
      },

      plugins: [verticalLinePlugin],
    })

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy()
        chartInstanceRef.current = null
      }
    }
  }, [chartData])

  const ranges = [
    {
      label: 'Last Month',
      months: 1,
    },
    {
      label: 'Last 3 Months',
      months: 3,
    },
    {
      label: 'Last 6 Months',
      months: 6,
    },
    {
      label: 'Last 12 Months',
      months: 12,
    },
  ]

  const applyRange = (range) => {
    setSelectedRange(range)
    setOpenDropdown(false)
  }

  return (
    <section className="glass-panel overflow-hidden rounded-[2rem] border border-white/20 p-5 shadow-[0_10px_40px_rgba(15,23,42,0.06)] sm:p-6 dark:border-white/10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            {selectedRange.months}-Month Cash Flow
          </h2>

          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Visualize your complete monthly income vs expense cash flow
          </p>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpenDropdown((prev) => !prev)}
            className="
      flex items-center justify-between gap-2.5
      min-w-[160px]
      rounded-xl
      border border-white/15
      bg-white/60
      px-4 py-2.5
      text-xs font-extrabold
      text-[var(--text-primary)]
      shadow-sm
      backdrop-blur-xl
      transition-all duration-200
      hover:bg-white/80
      dark:bg-white/[0.06]
      dark:hover:bg-white/[0.09]
    "
          >
            <span>{selectedRange.label}</span>

            <svg
              className={`h-3.5 w-3.5 text-[var(--text-secondary)] transition-transform duration-200 ${openDropdown ? 'rotate-180' : ''
                }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {openDropdown && (
            <div
              className="
        absolute right-0 top-14 z-50
        w-48
        rounded-2xl
        border border-white/10
        bg-white/92
        p-1.5
        shadow-[0_20px_60px_rgba(15,23,42,0.18)]
        backdrop-blur-2xl
        dark:bg-slate-900/95
      "
            >
              {ranges.map((range) => (
                <button
                  key={range.label}
                  onClick={() => applyRange(range)}
                  className={`
            w-full
            rounded-xl
            px-3.5 py-2.5
            text-left
            text-xs
            font-semibold
            transition-all duration-150

            ${selectedRange.label === range.label
                      ? 'bg-indigo-100 text-indigo-700 font-bold dark:bg-indigo-500/20 dark:text-indigo-300'
                      : 'text-[var(--text-secondary)] hover:bg-black/[0.04] hover:text-[var(--text-primary)] dark:hover:bg-white/[0.06]'
                    }
          `}
                >
                  {range.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {chartData.length === 0 ? (
        <div className="pt-6">
          <EmptyState text="Add income or expense entries to see your cash flow chart." />
        </div>
      ) : (
        <div className="h-[360px] rounded-[1.8rem] bg-white/40 p-4 backdrop-blur-xl sm:h-[420px] dark:bg-white/[0.04]">
          <canvas ref={chartRef} />
        </div>
      )}
    </section>
  )
}

function AnalyticsSection({
  theme,
  user,
  expenses,
  incomeEntries,
  budget,
  monthlyTrend,
  categoryAnalysis,
}) {
  const incomeExpenseChartRef = useRef(null)
  const categoryChartRef = useRef(null)
  const incomeExpenseChartInstanceRef = useRef(null)
  const categoryChartInstanceRef = useRef(null)
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)
  const [selectedMonths, setSelectedMonths] = useState(6)

  const categoryColors = [
    '#f97316',
    '#06b6d4',
    '#10b981',
    '#8b5cf6',
    '#ec4899',
    '#f59e0b',
  ]

  const totalCategorySpend = categoryAnalysis.reduce(
    (sum, item) => sum + item.amount,
    0
  )

  const openReportModal = () => setIsReportModalOpen(true)
  const closeReportModal = () => setIsReportModalOpen(false)

  const handleDownloadReport = () => {
    try {
      generateExpenseReport({
        user,
        expenses,
        incomeEntries,
        budget,
        selectedMonths,
      })

      closeReportModal()
      toast.success('Your PDF report is downloading.')
    } catch (error) {
      toast.error(error?.message || 'Unable to generate the PDF report.')
    }
  }

  useEffect(() => {
    if (!incomeExpenseChartRef.current || typeof window === 'undefined' || !window.Chart) {
      return undefined
    }

    const { textMuted, textPrimary } = getChartThemeColors(theme)

    const gridColor = theme === 'dark'
      ? 'rgba(148, 163, 184, 0.18)'
      : 'rgba(148, 163, 184, 0.24)'

    incomeExpenseChartInstanceRef.current?.destroy()
    incomeExpenseChartInstanceRef.current = null

    const ctx = incomeExpenseChartRef.current.getContext('2d')

    incomeExpenseChartInstanceRef.current = new window.Chart(ctx, {
      type: 'bar',
      data: {
        labels: monthlyTrend.map((month) => month.label),
        datasets: [
          {
            label: 'Income',
            data: monthlyTrend.map((month) => month.income),
            backgroundColor: 'rgba(16, 185, 129, 0.78)',
            borderRadius: 14,
          },
          {
            label: 'Expense',
            data: monthlyTrend.map((month) => month.expense),
            backgroundColor: 'rgba(249, 115, 22, 0.78)',
            borderRadius: 14,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 120,
        animation: {
          ...chartEntranceAnimation,
          delay: (context) => {
            if (context.type !== 'data') {
              return 0
            }

            return context.dataIndex * 70 + context.datasetIndex * 120
          },
        },
        plugins: {
          legend: {
            labels: {
              color: textPrimary,
              usePointStyle: true,
              pointStyle: 'circle',
            },
          },
        },
        scales: {
          x: {
            ticks: { color: textMuted },
            grid: { display: false },
          },
          y: {
            beginAtZero: true,
            ticks: {
              color: textMuted,
              callback: (value) => formatCurrency(value),
            },
            grid: { color: gridColor },
          },
        },

      },
    })

    return () => {
      incomeExpenseChartInstanceRef.current?.destroy()
      incomeExpenseChartInstanceRef.current = null
    }
  }, [monthlyTrend, theme])

  useEffect(() => {
    if (
      !categoryChartRef.current ||
      typeof window === 'undefined' ||
      !window.Chart ||
      categoryAnalysis.length === 0
    ) {
      return undefined
    }

    const { textMuted, textPrimary } = getChartThemeColors(theme)

    categoryChartInstanceRef.current?.destroy()
    categoryChartInstanceRef.current = null

    const ctx = categoryChartRef.current.getContext('2d')

    categoryChartInstanceRef.current = new window.Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: categoryAnalysis.map((item) => item.category),
        datasets: [
          {
            data: categoryAnalysis.map((item) => item.amount),
            backgroundColor: categoryColors,
            borderWidth: 0,
            hoverOffset: 12,
            spacing: 4,
            borderRadius: 2,
            radius: '85%',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1,
        resizeDelay: 120,
        cutout: '55%', // bigger center hole
        animation: {
          ...chartEntranceAnimation,
          animateRotate: true,
          animateScale: true,
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: '#111827',
            padding: 12,
            cornerRadius: 12,
            callbacks: {
              label: (context) =>
                `${context.label}: ${formatCurrency(context.raw)}`,
            },
          },
        },
      },
      plugins: [
        {
          id: 'centerText',
          beforeDraw(chart) {
            const { width, height, ctx } = chart

            ctx.restore()

            const total = categoryAnalysis.reduce(
              (sum, item) => sum + item.amount,
              0
            )

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            ctx.fillStyle = textPrimary
            ctx.font = '600 24px Inter'
            ctx.fillText(
              formatCurrency(total),
              width / 2,
              height / 2 - 8
            )

            ctx.fillStyle = textMuted
            ctx.font = '500 12px Inter'
            ctx.fillText(
              'Total Spent',
              width / 2,
              height / 2 + 18
            )

            ctx.save()
          },
        },
      ],
    })

    return () => {
      categoryChartInstanceRef.current?.destroy()
      categoryChartInstanceRef.current = null
    }
  }, [categoryAnalysis, theme])

  return (
    <div className="space-y-6 ">
      <section className="glass-panel rounded-[1.6rem] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Reports
            </p>

            <h3 className="mt-1 text-lg font-semibold">
              Download Financial Report
            </h3>

            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Export a PDF summary of your income, expenses and budget.
            </p>
          </div>

          <button
            type="button"
            onClick={openReportModal}
            className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-[linear-gradient(135deg,#f97316,#0ea5e9)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-file-pdf" aria-hidden="true" />
            Download Report
          </button>
        </div>
      </section>

      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
              Analytics
            </p>

            <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
              Monthly income vs expense
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
              Compare how much money came in and went out across your last six months.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <span className="rounded-full bg-white/60 px-4 py-2 text-xs font-semibold text-[var(--text-secondary)] dark:bg-white/8">
              Last 6 Months trend
            </span>
          </div>
        </div>

        <div className="h-[380px] rounded-[1.8rem] bg-gradient-to-br from-white/70 via-white/50 to-white/30 p-5 shadow-inner dark:from-white/10 dark:via-white/5 dark:to-white/5">
          <canvas ref={incomeExpenseChartRef} />
        </div>
      </section>

      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Category analysis
          </p>

          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Expense breakdown by category
          </h2>

          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            See which categories are taking the biggest share of your spending.
          </p>
        </div>

        {categoryAnalysis.length === 0 ? (
          <EmptyState text="Add some expenses to unlock category analysis." />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="flex h-[260px] items-center justify-center rounded-[1.8rem] bg-gradient-to-br from-white/70 to-white/40 p-4 shadow-inner dark:from-white/10 dark:to-white/5 sm:h-[320px] lg:h-[340px]">
              <div className="relative h-full w-full max-w-[320px] p-3">
                <canvas ref={categoryChartRef} />
              </div>
            </div>

            <div className="space-y-3">
              {categoryAnalysis.map((item, index) => {
                const percentage = (
                  (item.amount / totalCategorySpend) *
                  100
                ).toFixed(1)

                return (
                  <div
                    key={item.category}
                    className="rounded-[1.4rem] border border-white/20 bg-white/55 px-4 py-4 dark:bg-white/8"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{
                            backgroundColor:
                              categoryColors[index % categoryColors.length],
                          }}
                        />

                        <p className="font-semibold">
                          {item.category}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <p className="text-sm font-semibold text-[var(--text-secondary)]">
                          {formatCurrency(item.amount)}
                        </p>

                        <span className="min-w-[52px] text-right text-sm font-semibold text-[var(--text-muted)]">
                          {percentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      <ReportRangeModal
        isOpen={isReportModalOpen}
        selectedMonths={selectedMonths}
        onSelectMonths={setSelectedMonths}
        onCancel={closeReportModal}
        onDownload={handleDownloadReport}
      />
    </div>
  )
}

function ExpensesSection({ expenses, isLoading, onAddExpense, onEditExpense, onDeleteExpense }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMethod, setSelectedMethod] = useState('All')

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      expense.category === selectedCategory

    const matchesMethod =
      selectedMethod === 'All' ||
      expense.transactionType === selectedMethod

    return matchesSearch && matchesCategory && matchesMethod
  })

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.spentOn) - new Date(a.spentOn)
  )
  return (
    <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Manage every expense</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Review your expense list, edit or delete entries, and add a new expense from the action button.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddExpense}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#f97316,#ec4899)] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-sm"
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          Add expense
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search expenses by title or category..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-sky-400 dark:border-white/10 dark:bg-white/8"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-5 py-3 text-sm font-semibold text-violet-600 transition-all duration-200 hover:bg-violet-100 hover:shadow-md dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300 dark:hover:bg-violet-500/20 dark:hover:border-violet-500/40"
        >
          <i className="fa-solid fa-filter" />
          Filter Transactions
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-[1.6rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/8">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="themed-select w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
              >
                <option value="All">All Categories</option>

                {[...new Set(expenses.map((e) => e.category))].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Payment Method
              </label>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="themed-select w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
              >
                <option value="All">All Methods</option>

                {[...new Set(expenses.map((expense) => expense.transactionType))].map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedMethod('All')
                  setSearchQuery('')
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 hover:border-red-500 dark:border-white/10 dark:bg-white/8 dark:text-slate-300"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <EmptyState text="Loading expenses..." />
      ) : expenses.length === 0 ? (
        <EmptyState text="No expenses yet. Add your first one to start tracking your spending." />
      ) : sortedExpenses.length === 0 ? (
        <EmptyState text="No expenses match the selected filters." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedExpenses.map((expense) => (
            <article
              key={expense._id}
              className="group rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 dark:border-white/10 dark:bg-white/8 dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-orange-500/10 text-lg text-orange-500">
                    <i className="fa-solid fa-receipt" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-orange-500/12 px-3 py-1 text-xs font-semibold text-orange-700 dark:text-orange-300">
                        {expense.category}
                      </span>

                      <span className="rounded-full bg-sky-500/12 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                        {expense.transactionType || transactionTypes[0]}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {expense.title}
                    </h3>

                    {/* <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {formatReadableDate(expense.spentOn)}
                    </p> */}

                    {/* {expense.description && (
                      <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                        {expense.description}
                      </p>
                    )} */}

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      Description: {expense.description?.trim() || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Amount
                  </p>

                  <p className="mt-1 font-display text-2xl font-bold text-rose-500">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <i className="fa-regular fa-calendar" />
                  {formatReadableDate(expense.spentOn)}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditExpense(expense)}
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-300"
                  >
                    <i className="fa-solid fa-pen" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteExpense(expense)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300"
                  >
                    <i className="fa-solid fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function IncomeSection({ incomeEntries, isLoading, onAddIncome, onEditIncome, onDeleteIncome }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedMethod, setSelectedMethod] = useState('All')

  const filteredIncome = incomeEntries.filter((income) => {
    const matchesSearch =
      income.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.category?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCategory =
      selectedCategory === 'All' ||
      income.category === selectedCategory

    const matchesMethod =
      selectedMethod === 'All' ||
      income.transactionType === selectedMethod

    return matchesSearch && matchesCategory && matchesMethod
  })

  const sortedIncome = [...filteredIncome].sort(
    (a, b) => new Date(b.receivedOn) - new Date(a.receivedOn)
  )
  return (
    <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Track money coming in</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            This section mirrors the expense workflow, so income entries are just as easy to add, edit, and remove.
          </p>
        </div>
        <button
          type="button"
          onClick={onAddIncome}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-[linear-gradient(135deg,#10b981,#06b6d4)] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-sm"
        >
          <i className="fa-solid fa-plus" aria-hidden="true" />
          Add income
        </button>
      </div>

      <div className="mb-6 flex flex-col gap-3 lg:flex-row">
        <div className="relative flex-1">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search income by title or category..."
            className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-sm outline-none focus:border-emerald-400 dark:border-white/10 dark:bg-white/8"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((prev) => !prev)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-600 transition-all duration-200 hover:bg-emerald-100 hover:shadow-md dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20 dark:hover:border-emerald-500/40"
        >
          <i className="fa-solid fa-filter" />
          Filter Transactions
        </button>
      </div>

      {showFilters && (
        <div className="mb-6 rounded-[1.6rem] border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/8">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Category
              </label>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="themed-select w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
              >
                <option value="All">All Categories</option>

                {[...new Set(incomeEntries.map((income) => income.category))].map(
                  (category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  )
                )}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Payment Method
              </label>

              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="themed-select w-full rounded-xl border border-slate-200 bg-white px-4 py-3 dark:border-white/10 dark:bg-white/8"
              >
                <option value="All">All Methods</option>

                {[...new Set(incomeEntries.map((income) => income.transactionType))].map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory('All')
                  setSelectedMethod('All')
                  setSearchQuery('')
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/8 dark:text-slate-300"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <EmptyState text="Loading income..." />
      ) : incomeEntries.length === 0 ? (
        <EmptyState text="No income records yet. Add salary, freelance, or other incoming funds here." />
      ) : sortedIncome.length === 0 ? (
        <EmptyState text="No income records match the selected filters." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedIncome.map((income) => (
            <article
              key={income.id}
              className="group rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-orange-500/10 dark:border-white/10 dark:bg-white/8 dark:shadow-none"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg text-emerald-500">
                    <i className="fa-solid fa-arrow-trend-up" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                        {income.category}
                      </span>

                      <span className="rounded-full bg-sky-500/12 px-3 py-1 text-xs font-semibold text-sky-700 dark:text-sky-300">
                        {income.transactionType || transactionTypes[0]}
                      </span>
                    </div>

                    <h3 className="mt-3 text-lg font-semibold">
                      {income.title}
                    </h3>

                    {/* <p className="mt-1 text-sm text-[var(--text-muted)]">
                      {formatReadableDate(income.receivedOn)}
                    </p> */}

                    <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
                      Description: {income.description?.trim() || 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                    Amount
                  </p>

                  <p className="mt-1 font-display text-2xl font-bold text-emerald-500">
                    {formatCurrency(income.amount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-white/10">
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <i className="fa-regular fa-calendar" />
                  {formatReadableDate(income.receivedOn)}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onEditIncome(income)}
                    className="inline-flex items-center gap-2 rounded-xl border border-sky-300/30 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-700 transition hover:bg-sky-500/20 dark:text-sky-300"
                  >
                    <i className="fa-solid fa-pen" />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteIncome(income)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-300/30 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-500/20 dark:text-rose-300"
                  >
                    <i className="fa-solid fa-trash" />
                    Delete
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

function BudgetSection({
  monthlyBudget,
  currentMonthExpense,
  budgetProgress,
  budgetRemaining,
  overspentAmount,
  onBudgetSubmit,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">Set monthly budget</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
          Define your target once and keep an eye on progress throughout the month.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onBudgetSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-[var(--text-primary)]">Monthly budget</span>
            <input
              required
              type="number"
              name="monthlyBudget"
              defaultValue={monthlyBudget}
              className="w-full rounded-[1.3rem] border border-white/20 bg-white/70 px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:ring-4 focus:ring-sky-400/20 dark:bg-white/8"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-[linear-gradient(135deg,#8b5cf6,#0ea5e9)] px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5 sm:px-5 sm:py-3 sm:text-sm"
          >
            Save budget
          </button>
        </form>
      </section>

      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Budget progress</p>
        <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">This month at a glance</h2>

        <div className="mt-6 space-y-5">
          <ProgressMeter label="Budget used" value={currentMonthExpense} maxValue={monthlyBudget || currentMonthExpense || 1} colorClass="from-violet-500 to-sky-500" />

          <div className="grid gap-4 sm:grid-cols-3">
            <BudgetInfoCard label="Budget target" value={formatCurrency(monthlyBudget)} tone="violet" />
            <BudgetInfoCard label="Spent this month" value={formatCurrency(currentMonthExpense)} tone="orange" />
            <BudgetInfoCard
              label={overspentAmount > 0 ? 'Overspent' : 'Remaining'}
              value={formatCurrency(overspentAmount > 0 ? overspentAmount : budgetRemaining)}
              tone={overspentAmount > 0 ? 'rose' : 'emerald'}
            />
          </div>

          <div className="rounded-[1.5rem] bg-slate-950 p-4 text-white sm:p-5 dark:bg-slate-900">
            <p className="text-sm text-slate-400">Progress note</p>
            <p className="mt-2 text-base leading-7 text-slate-200">
              {monthlyBudget <= 0
                ? 'Add a monthly budget to unlock progress tracking.'
                : budgetProgress >= 100
                  ? `You have reached ${Math.round(budgetProgress)}% of your budget and are now overspending.`
                  : `You have used ${Math.round(budgetProgress)}% of your budget and still have room to spend carefully.`}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

function SettingsSection({
  user,
  theme,
  onToggleTheme,
  profileFormState,
  passwordFormState,
  isSavingProfile,
  isSavingPassword,
  onProfileChange,
  onPasswordChange,
  onProfileSubmit,
  onPasswordSubmit,
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.92fr]">
      <section className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Account information
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Profile settings
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Keep your account information current and update your password securely.
          </p>
        </div>

        <form className="mt-6 space-y-5" onSubmit={onProfileSubmit}>
          <div className="grid gap-4">
            <InputField
              label="Name"
              name="name"
              type="text"
              placeholder="Enter your name"
              value={profileFormState.name}
              onChange={onProfileChange}
              icon={UserIcon}
            />

            <label className="block space-y-2">
              {/* <span className="text-xs font-semibold text-[var(--text-primary)] sm:text-sm">Email</span> */}
              {/* <input
                type="email"
                value={profileFormState.email}
                disabled
                className="w-full rounded-[1.2rem] border border-white/20 bg-white/55 px-4 py-3 text-sm text-[var(--text-muted)] outline-none dark:bg-white/8 sm:py-3.5"
              /> */}

              <div className="relative">
                <MailIcon className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]" />

                <input
                  type="email"
                  value={profileFormState.email}
                  disabled
                  className="w-full rounded-[1.2rem] border border-white/20 bg-white/55 py-3 pl-12 pr-4 text-sm text-[var(--text-muted)] outline-none dark:bg-white/8 sm:py-3.5"
                />
              </div>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="rounded-full bg-[linear-gradient(135deg,#0ea5e9,#2563eb)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingProfile ? 'Saving...' : 'Save profile'}
            </button>
          </div>
        </form>

        <div className="mt-5">
          <h3 className="font-display text-xl font-semibold text-[var(--text-primary)] sm:text-2xl">
            Password change
          </h3>
          <p className="mt-1 text-sm leading-6 text-[var(--text-secondary)]">
            Enter your current password first, then set a new one to secure your account.
          </p>
        </div>

        <form className="mt-5 space-y-4" onSubmit={onPasswordSubmit}>
          <div className="grid gap-4">
            <InputField
              label="Current password"
              name="currentPassword"
              type="password"
              placeholder="Enter current password"
              value={passwordFormState.currentPassword}
              onChange={onPasswordChange}
              icon={LockIcon}
            />
            <InputField
              label="New password"
              name="newPassword"
              type="password"
              placeholder="Enter new password"
              value={passwordFormState.newPassword}
              onChange={onPasswordChange}
              icon={LockIcon}
            />
            <InputField
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter new password"
              value={passwordFormState.confirmPassword}
              onChange={onPasswordChange}
              icon={LockIcon}
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingPassword}
              className="rounded-full bg-[linear-gradient(135deg,#f97316,#ec4899)] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSavingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-5">
        <div className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Appearance preference
          </p>
          <h2 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">
            Theme mode
          </h2>
          <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">
            Switch between light and dark mode for your preferred viewing experience.
          </p>

          <div className="mt-6 flex items-center justify-between rounded-[1.5rem] bg-white/55 px-4 py-4 dark:bg-white/8">
            <div>
              <p className="text-sm font-semibold text-[var(--text-primary)]">Dark mode</p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                {theme === 'dark' ? 'Currently enabled' : 'Currently disabled'}
              </p>
            </div>

            <button
              type="button"
              onClick={onToggleTheme}
              aria-label="Toggle theme"
              className={`relative inline-flex h-11 w-20 items-center rounded-full transition ${theme === 'dark' ? 'bg-slate-950' : 'bg-sky-500'
                }`}
            >
              <span
                className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm shadow-lg transition-transform ${theme === 'dark' ? 'translate-x-10' : 'translate-x-1'
                  }`}
              >
                <i
                  className={`fa-solid ${theme === 'dark'
                    ? 'fa-moon text-slate-900'
                    : 'fa-sun text-amber-500'
                    }`}
                  aria-hidden="true"
                />
              </span>
            </button>
          </div>
        </div>

        <div className="glass-panel rounded-[1.8rem] p-5 sm:p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">
            Profile snapshot
          </p>
          <div className="mt-5 space-y-3">
            <div className="rounded-[1.4rem] bg-white/55 px-4 py-4 dark:bg-white/8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Name</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{user?.name || 'N/A'}</p>
            </div>
            <div className="rounded-[1.4rem] bg-white/55 px-4 py-4 dark:bg-white/8">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Email</p>
              <p className="mt-1 text-sm font-semibold text-[var(--text-primary)]">{user?.email || 'N/A'}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function MetricCard({ title, value, changeText, icon, tone }) {
  const toneStyles = {
    emerald: 'from-emerald-500/18 to-emerald-300/0 text-emerald-600 dark:text-emerald-300',
    rose: 'from-rose-500/18 to-rose-300/0 text-rose-600 dark:text-rose-300',
    cyan: 'from-sky-500/18 to-cyan-300/0 text-sky-600 dark:text-sky-300',
    orange: 'from-orange-500/18 to-amber-300/0 text-orange-600 dark:text-orange-300',
    violet: 'from-violet-500/18 to-sky-300/0 text-violet-600 dark:text-violet-300',
  }

  return (
    <div className="glass-panel rounded-[1.7rem] p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-muted)] sm:text-sm">{title}</p>
          <p className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{value}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">{changeText}</p>
        </div>
        <span className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${toneStyles[tone]}`}>
          <i className={`${icon} text-base`} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}

function TransactionCard({ transaction }) {
  const isIncome = transaction.type === 'income'
  const transactionType = transaction.transactionType || 'UPI'

  return (
    <article className="rounded-[1.5rem] border border-[var(--panel-border)] bg-white/40 p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-white/60 hover:shadow-md dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${isIncome
              ? 'bg-[linear-gradient(135deg,#10b981,#06b6d4)]'
              : 'bg-[linear-gradient(135deg,#f97316,#ec4899)]'
              }`}
          >
            <i
              className={`${isIncome
                ? 'fa-solid fa-arrow-trend-up'
                : 'fa-solid fa-arrow-trend-down'
                } text-sm`}
              aria-hidden="true"
            />
          </span>

          <div>
            <h4 className="font-display text-lg font-semibold sm:text-xl">
              {transaction.title}
            </h4>

            <p className="mt-1 text-sm text-[var(--text-muted)]">
              {transaction.category} | {transactionType} |{" "}
              {formatReadableDate(transaction.date)}
            </p>
          </div>
        </div>

        <p
          className={`font-display text-xl font-semibold sm:text-2xl ${isIncome ? 'text-emerald-400' : 'text-rose-400'
            }`}
        >
          {isIncome ? '+' : '-'}
          {formatCurrency(transaction.amount)}
        </p>
      </div>

      {transaction.description ? (
        <p className="mt-3 text-sm leading-7 text-[var(--text-primary)]">
          {transaction.description}
        </p>
      ) : null}
    </article>
  )
}

function ProgressMeter({ label, value, maxValue, colorClass }) {
  const progress = Math.min((value / maxValue) * 100, 100)

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-sm text-[var(--text-secondary)]">{label}</p>
        <p className="text-sm font-semibold text-[var(--text-primary)]">{Math.round(progress)}%</p>
      </div>
      <div className="h-3 rounded-full bg-slate-200/80 dark:bg-slate-800">
        <div className={`h-3 rounded-full bg-gradient-to-r ${colorClass}`} style={{ width: `${progress}%` }} />
      </div>
      <div className="mt-2 text-sm text-[var(--text-muted)]">
        {formatCurrency(value)} / {formatCurrency(maxValue)}
      </div>
    </div>
  )
}

function BudgetInfoCard({ label, value, tone }) {
  const toneClasses = {
    violet: 'bg-violet-500/10 text-violet-700 dark:text-violet-300',
    orange: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    emerald: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    rose: 'bg-rose-500/10 text-rose-700 dark:text-rose-300',
  }

  return (
    <div className={`rounded-[1.4rem] p-4 ${toneClasses[tone]}`}>
      <p className="text-xs sm:text-sm">{label}</p>
      <p className="mt-2 font-display text-xl font-semibold sm:text-2xl">{value}</p>
    </div>
  )
}

function EntryModal({ title, subtitle, onClose, children }) {
  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center bg-slate-950/55 px-4 pt-24 pb-8 backdrop-blur-sm">
      <div className="glass-panel max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.8rem] bg-white/90 p-5 shadow-2xl shadow-slate-950/20 sm:p-6 dark:bg-slate-950/40">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--text-muted)]">Entry form</p>
            <h3 className="mt-2 font-display text-2xl font-semibold sm:text-3xl">{title}</h3>
            <p className="mt-2 text-sm leading-7 text-slate-700 dark:text-[var(--text-secondary)]">
              {subtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 dark:border-white/10 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
          >
            <i className="fa-solid fa-xmark text-lg" aria-hidden="true" />
          </button>
        </div>

        {children}
      </div>
    </div>
  )
}

function DeleteConfirmationModal({ entryType, entryTitle, isDeleting, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-md rounded-[1.8rem] bg-white/95 p-5 shadow-2xl shadow-slate-950/20 sm:p-6 dark:bg-slate-950/80">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          </span>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">
              Confirm deletion
            </p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-[var(--text-primary)]">
              Delete this {entryType}?
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">
              Are you sure you want to delete "{entryTitle}"? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-70 dark:border-white/10 dark:bg-white/8 dark:text-slate-300 dark:hover:bg-white/15 dark:hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/20 transition hover:-translate-y-0.5 hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isDeleting ? 'Deleting...' : 'Yes, delete'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ text }) {
  return (
    <div className="rounded-[1.6rem] bg-white/55 px-4 py-10 text-center text-sm text-[var(--text-secondary)] dark:bg-white/8">
      {text}
    </div>
  )
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="themed-select w-full rounded-[1.3rem] border border-white/20 bg-white/70 px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition focus:border-transparent focus:ring-4 focus:ring-sky-400/20 dark:bg-white/8"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function TextAreaField({ label, name, value, onChange, placeholder }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-[var(--text-primary)]">{label}</span>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        rows="4"
        placeholder={placeholder}
        className="w-full rounded-[1.3rem] border border-white/20 bg-white/70 px-4 py-3.5 text-sm text-[var(--text-primary)] outline-none transition placeholder:text-[var(--text-muted)] focus:border-transparent focus:ring-4 focus:ring-sky-400/20 dark:bg-white/8"
      />
    </label>
  )
}

function buildRecentTransactions(expenses, incomeEntries) {
  const expenseTransactions = expenses.map((expense) => ({
    id: expense._id,
    type: 'expense',
    title: expense.title,
    amount: Number(expense.amount || 0),
    category: expense.category,
    transactionType: expense.transactionType || transactionTypes[0],
    date: expense.spentOn,
    description: expense.description || '',
  }))

  const incomeTransactions = incomeEntries.map((income) => ({
    id: income.id || income._id,
    type: 'income',
    title: income.title,
    amount: Number(income.amount || 0),
    category: income.category,
    transactionType: income.transactionType || transactionTypes[0],
    date: income.receivedOn,
    description: income.description || '',
  }))

  return [...expenseTransactions, ...incomeTransactions].sort(
    (left, right) => new Date(right.date).getTime() - new Date(left.date).getTime(),
  )
}

function buildMonthlyTrend(expenses, incomeEntries) {
  const months = []
  const now = new Date()

  for (let index = 5; index >= 0; index -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - index, 1)
    const label = date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' })
    const month = date.getMonth()
    const year = date.getFullYear()

    const income = incomeEntries
      .filter((item) => {
        const itemDate = new Date(item.receivedOn)
        return itemDate.getMonth() === month && itemDate.getFullYear() === year
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expense = expenses
      .filter((item) => {
        const itemDate = new Date(item.spentOn)
        return itemDate.getMonth() === month && itemDate.getFullYear() === year
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    months.push({ label, income, expense })
  }

  return months
}

function buildMonthlyTrendForRange(expenses, incomeEntries, startMonth, endMonth) {
  if (!startMonth || !endMonth) {
    return []
  }

  const [startYear, startMonthIndex] = startMonth.split('-').map(Number)
  const [endYear, endMonthIndex] = endMonth.split('-').map(Number)
  const startDate = new Date(startYear, startMonthIndex - 1, 1)
  const endDate = new Date(endYear, endMonthIndex - 1, 1)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || startDate > endDate) {
    return []
  }

  const months = []
  const cursor = new Date(startDate)

  while (cursor <= endDate) {
    const month = cursor.getMonth()
    const year = cursor.getFullYear()

    const income = incomeEntries
      .filter((item) => {
        const itemDate = new Date(item.receivedOn)
        return itemDate.getMonth() === month && itemDate.getFullYear() === year
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    const expense = expenses
      .filter((item) => {
        const itemDate = new Date(item.spentOn)
        return itemDate.getMonth() === month && itemDate.getFullYear() === year
      })
      .reduce((sum, item) => sum + Number(item.amount || 0), 0)

    months.push({
      label: cursor.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
      income,
      expense,
    })

    cursor.setMonth(cursor.getMonth() + 1)
  }

  return months
}

function getSectionDescription(sectionId) {
  const descriptions = {
    dashboard: 'Main analytics',
    analytics: 'Charts and insights',
    expenses: 'Edit and review',
    income: 'Track earnings',
    budget: 'Monthly progress',
    settings: 'Profile and theme',
  }

  return descriptions[sectionId]
}

function getDayGreeting() {
  const currentHour = new Date().getHours()

  if (currentHour < 12) {
    return '☀️ Good morning,'
  }

  if (currentHour < 17) {
    return ' 🌤️ Good afternoon,'
  }

  if (currentHour < 21) {
    return '🌆 Good afternoon,'
  }

  return '🌙 Good night,'
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(amount || 0))
}

function getChartThemeColors(theme) {
  return theme === 'dark'
    ? {
      textPrimary: '#eef2ff',
      textMuted: '#8fa1ca',
    }
    : {
      textPrimary: '#172033',
      textMuted: '#6f7a95',
    }
}

function formatReadableDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateForInput(date) {
  return formatDateInputValue(new Date(date))
}

function getTodayDateInputValue() {
  return formatDateInputValue(new Date())
}

function formatDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function isCurrentMonth(date) {
  const now = new Date()
  const target = new Date(date)

  return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear()
}

export default DashboardPage
