import express from 'express'
import { Type } from '@google/genai'
import protect from '../middleware/auth.js'
import { generate } from '../config/ai.js'

const router = express.Router()

const TRUTH_RULE = 'Never invent employers, job titles, dates, degrees, numbers or achievements that are not supported by the input.'

const handleError = (res, error) => {
    console.error('[ai]', error.message)
    let message = error.message || 'AI request failed'
    if (error.status === 429 || /quota|rate/i.test(message)) message = 'Free AI limit reached for now. Please wait a minute and try again.'
    else if (/api key/i.test(message) && error.status !== 503) message = 'Your GEMINI_API_KEY is invalid. Check server/.env.'
    res.status(error.status && error.status < 600 ? error.status : 500).json({ message })
}

// POST /api/ai/enhance-summary  { content }
router.post('/enhance-summary', protect, async (req, res) => {
    try {
        const { content } = req.body
        if (!content?.trim()) return res.status(400).json({ message: 'Write a short summary first, then enhance it.' })
        const enhancedContent = await generate({
            system: `You are an expert resume writer. Rewrite the professional summary into 3-4 compelling, ATS-friendly sentences that highlight skills, experience and career goals. No first person "I". ${TRUTH_RULE} Return only the summary text, no quotes or headings.`,
            prompt: content,
        })
        res.json({ enhancedContent })
    } catch (error) {
        handleError(res, error)
    }
})

// POST /api/ai/enhance-job-desc  { content, position, company }
router.post('/enhance-job-desc', protect, async (req, res) => {
    try {
        const { content, position, company } = req.body
        if (!content?.trim()) return res.status(400).json({ message: 'Write a short description first, then enhance it.' })
        const enhancedContent = await generate({
            system: `You are an expert resume writer. Rewrite the job description as 3-5 concise lines, each on its own line, starting with a strong action verb and focused on responsibilities, impact and technologies. Make it ATS-friendly. ${TRUTH_RULE} Return only the lines, no bullets symbols, quotes or headings.`,
            prompt: `Position: ${position || 'N/A'}\nCompany: ${company || 'N/A'}\n\nDescription:\n${content}`,
        })
        res.json({ enhancedContent })
    } catch (error) {
        handleError(res, error)
    }
})

const itemUpdates = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: { index: { type: Type.INTEGER }, description: { type: Type.STRING } },
        required: ['index', 'description'],
    },
}

// POST /api/ai/tailor  { resume, jobDescription }  -> updates for every section
router.post('/tailor', protect, async (req, res) => {
    try {
        const { resume, jobDescription } = req.body
        if (!jobDescription?.trim() || !resume) return res.status(400).json({ message: 'Paste a job description first.' })

        const content = {
            profession: resume.personal_info?.profession || '',
            professional_summary: resume.professional_summary || '',
            skills: resume.skills || [],
            experience: (resume.experience || []).map((e, index) => ({
                index, company: e.company, position: e.position, description: e.description,
            })),
            project: (resume.project || []).map((p, index) => ({ index, name: p.name, type: p.type, description: p.description })),
            education: (resume.education || []).map(e => ({ degree: e.degree, field: e.field, institution: e.institution })),
        }

        const result = await generate({
            system: `You are an expert resume writer and ATS specialist. Tailor the candidate's resume to the job description.
- profession: a job title aligned to the target role.
- professional_summary: 3-4 sentences aligned to the role, no first person "I".
- experience / project: one entry per existing item (same index). 3-5 lines each separated by "\\n", starting with action verbs, using the job's keywords where the candidate's background supports them. Return an empty array if there are no items.
- skills: keep relevant existing skills and add the key skills, tools and requirements from the job description, most relevant first, 8-16 short items.
- missing_requirements: important requirements in the job description that the resume does not show yet, as short phrases.
${TRUTH_RULE}`,
            prompt: `JOB DESCRIPTION:\n${jobDescription}\n\nCURRENT RESUME (JSON):\n${JSON.stringify(content)}`,
            schema: {
                type: Type.OBJECT,
                properties: {
                    profession: { type: Type.STRING },
                    professional_summary: { type: Type.STRING },
                    skills: { type: Type.ARRAY, items: { type: Type.STRING } },
                    experience: itemUpdates,
                    project: itemUpdates,
                    missing_requirements: { type: Type.ARRAY, items: { type: Type.STRING } },
                },
                required: ['profession', 'professional_summary', 'skills', 'experience', 'project', 'missing_requirements'],
            },
        })
        res.json(result)
    } catch (error) {
        handleError(res, error)
    }
})

export default router
