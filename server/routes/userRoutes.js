import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Resume from '../models/Resume.js'
import protect from '../middleware/auth.js'

const router = express.Router()

const createToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' })
const publicUser = (user) => ({ _id: user._id, name: user.name, email: user.email })

// POST /api/users/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body
        if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' })
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' })

        if (await User.findOne({ email: email.toLowerCase() })) {
            return res.status(400).json({ message: 'An account with this email already exists' })
        }
        const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) })
        res.status(201).json({ message: 'Account created successfully', token: createToken(user._id), user: publicUser(user) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// POST /api/users/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email: (email || '').toLowerCase() })
        if (!user || !(await user.comparePassword(password || ''))) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }
        res.json({ message: 'Login successful', token: createToken(user._id), user: publicUser(user) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/users/data
router.get('/data', protect, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
        if (!user) return res.status(404).json({ message: 'User not found' })
        res.json({ user: publicUser(user) })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/users/resumes
router.get('/resumes', protect, async (req, res) => {
    try {
        const resumes = await Resume.find({ userId: req.userId }).sort({ updatedAt: -1 })
        res.json({ resumes })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
