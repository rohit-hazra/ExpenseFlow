import { Router } from 'express'
import { createIncomeEntry, deleteIncomeEntry, getIncomeEntries, updateIncomeEntry } from '../controllers/incomeController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.get('/', getIncomeEntries)
router.post('/', createIncomeEntry)
router.put('/:id', updateIncomeEntry)
router.delete('/:id', deleteIncomeEntry)

export default router
