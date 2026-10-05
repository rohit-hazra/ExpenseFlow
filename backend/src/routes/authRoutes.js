import { Router } from 'express'
import {
  getCurrentUser,
  loginUser,
  registerUser,
  updatePassword,
  updateProfile,
} from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddleware.js'

const router = Router()

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/me', authMiddleware, getCurrentUser)
router.patch('/me', authMiddleware, updateProfile)
router.patch('/me/password', authMiddleware, updatePassword)

export default router
