import cors from 'cors'
import express from 'express'
import budgetRoutes from './routes/budgetRoutes.js'
import authRoutes from './routes/authRoutes.js'
import expenseRoutes from './routes/expenseRoutes.js'
import incomeRoutes from './routes/incomeRoutes.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  }),
)
app.use(express.json())

app.get('/api/health', (_req, res) => {
  res.status(200).json({ message: 'ExpenseFlow API is running.' })
})

app.use('/api/auth', authRoutes)
app.use('/api/budget', budgetRoutes)
app.use('/api/expenses', expenseRoutes)
app.use('/api/income', incomeRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Something went wrong.' })
})

export default app
