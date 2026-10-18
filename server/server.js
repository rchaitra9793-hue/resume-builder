import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import connectDB from './config/db.js'
import userRouter from './routes/userRoutes.js'
import resumeRouter from './routes/resumeRoutes.js'
import aiRouter from './routes/aiRoutes.js'

if (!process.env.JWT_SECRET) {
    console.error('JWT_SECRET is not set. Add it to server/.env (or Render environment variables).')
    process.exit(1)
}

const app = express()
const PORT = process.env.PORT || 3000

// CLIENT_URL: comma-separated list of allowed frontend URLs, e.g. https://my-resume.vercel.app
// When it's not set (local development) every origin is allowed.
const allowedOrigins = (process.env.CLIENT_URL || '')
    .split(',')
    .map(url => url.trim().replace(/\/$/, ''))
    .filter(Boolean)

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) return callback(null, true)
        callback(new Error(`Origin ${origin} is not allowed by CORS`))
    },
}))
// Larger limit so profile photos (sent as base64) fit in the request
app.use(express.json({ limit: '5mb' }))

app.get('/', (req, res) => res.send('Resume Builder API is running'))
// Used by Render's health check and by the frontend to wake the server up
app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/users', userRouter)
app.use('/api/resumes', resumeRouter)
app.use('/api/ai', aiRouter)

// JSON errors instead of HTML (e.g. CORS rejections, body too large)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    const status = err.status || (err.message?.includes('CORS') ? 403 : 500)
    res.status(status).json({ message: err.type === 'entity.too.large' ? 'Upload is too large' : err.message })
})

await connectDB()
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
