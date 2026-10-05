import bcrypt from 'bcryptjs'
import User from '../models/User.js'
import generateToken from '../utils/generateToken.js'

function sanitizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    monthlyBudget: user.monthlyBudget ?? 30000,
  }
}

export async function registerUser(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Name, email, and password are required.' })
    }

    if (password.trim().length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const existingUser = await User.findOne({ email: normalizedEmail })

    if (existingUser) {
      return res.status(409).json({ message: 'An account with this email already exists.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    })

    return res.status(201).json({
      message: 'Account created successfully.',
      token: generateToken(user._id),
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to register user.' })
  }
}

export async function loginUser(req, res) {
  try {
    const { email, password } = req.body

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({ message: 'Email and password are required.' })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const user = await User.findOne({ email: normalizedEmail })

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password.' })
    }

    return res.status(200).json({
      message: 'Login successful.',
      token: generateToken(user._id),
      user: sanitizeUser(user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to login user.' })
  }
}

export function getCurrentUser(req, res) {
    return res.status(200).json({
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        monthlyBudget: req.user.monthlyBudget ?? 30000,
      },
    })
}

export async function updateProfile(req, res) {
  try {
    const { name } = req.body

    if (!name?.trim()) {
      return res.status(400).json({ message: 'Name is required.' })
    }

    req.user.name = name.trim()
    await req.user.save()

    return res.status(200).json({
      message: 'Profile updated successfully.',
      user: sanitizeUser(req.user),
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update profile.' })
  }
}

export async function updatePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword?.trim() || !newPassword?.trim()) {
      return res.status(400).json({ message: 'Current password and new password are required.' })
    }

    if (newPassword.trim().length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long.' })
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, req.user.password)

    if (!isCurrentPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect.' })
    }

    req.user.password = await bcrypt.hash(newPassword.trim(), 10)
    await req.user.save()

    return res.status(200).json({
      message: 'Password updated successfully.',
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Failed to update password.' })
  }
}
