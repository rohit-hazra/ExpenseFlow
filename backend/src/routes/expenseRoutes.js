import { Router } from 'express'
import { createExpense, deleteExpense, getExpenses, updateExpense } from '../controllers/expenseController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.get('/', getExpenses)
router.post('/', createExpense)
router.put('/:id', updateExpense)
router.delete('/:id', deleteExpense)

export default router
