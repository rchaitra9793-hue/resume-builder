import mongoose from 'mongoose'

const connectDB = async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/resume-builder'
    try {
        await mongoose.connect(uri)
        console.log('MongoDB connected')
    } catch (error) {
        console.error('MongoDB connection failed. Is MongoDB running? ', error.message)
        process.exit(1)
    }
}

export default connectDB
