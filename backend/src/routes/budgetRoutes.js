import { Router } from 'express'
import { getBudget, updateBudget } from '../controllers/budgetController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)
router.get('/', getBudget)
router.put('/', updateBudget)

export default router
