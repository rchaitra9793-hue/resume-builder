import jwt from 'jsonwebtoken'

// Verifies the JWT sent in the Authorization header and sets req.userId
const protect = (req, res, next) => {
    const header = req.headers.authorization || ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : header
    if (!token) return res.status(401).json({ message: 'Unauthorized' })

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = decoded.userId
        next()
    } catch {
        return res.status(401).json({ message: 'Session expired, please login again' })
    }
}

export default protect
