import express from 'express'
import mongoose from 'mongoose'
import Resume from '../models/Resume.js'
import protect from '../middleware/auth.js'

const router = express.Router()

// Fields the client is allowed to set
const editableFields = ['title', 'public', 'template', 'accent_color', 'professional_summary', 'skills',
    'personal_info', 'experience', 'project', 'education']

const pickEditable = (data = {}) => Object.fromEntries(
    Object.entries(data).filter(([key]) => editableFields.includes(key))
)

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

// POST /api/resumes/create
router.post('/create', protect, async (req, res) => {
    try {
        const resume = await Resume.create({ ...pickEditable(req.body), userId: req.userId })
        res.status(201).json({ message: 'Resume created successfully', resume })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// PUT /api/resumes/update/:id
router.put('/update/:id', protect, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Resume not found' })
        const resume = await Resume.findOneAndUpdate(
            { _id: req.params.id, userId: req.userId },
            pickEditable(req.body),
            { returnDocument: 'after', runValidators: true }
        )
        if (!resume) return res.status(404).json({ message: 'Resume not found' })
        res.json({ message: 'Saved successfully', resume })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// DELETE /api/resumes/delete/:id
router.delete('/delete/:id', protect, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Resume not found' })
        await Resume.findOneAndDelete({ _id: req.params.id, userId: req.userId })
        res.json({ message: 'Resume deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/resumes/get/:id  (owner only)
router.get('/get/:id', protect, async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Resume not found' })
        const resume = await Resume.findOne({ _id: req.params.id, userId: req.userId })
        if (!resume) return res.status(404).json({ message: 'Resume not found' })
        res.json({ resume })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// GET /api/resumes/public/:id  (anyone, only if the resume is public)
router.get('/public/:id', async (req, res) => {
    try {
        if (!isValidId(req.params.id)) return res.status(404).json({ message: 'Resume not found' })
        const resume = await Resume.findOne({ _id: req.params.id, public: true })
        if (!resume) return res.status(404).json({ message: 'Resume not found' })
        res.json({ resume })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
