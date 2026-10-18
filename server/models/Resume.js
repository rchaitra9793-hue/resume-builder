import mongoose from 'mongoose'

const resumeSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Resume' },
    public: { type: Boolean, default: false },
    template: { type: String, default: 'classic' },
    accent_color: { type: String, default: '#3B82F6' },
    professional_summary: { type: String, default: '' },
    skills: [{ type: String }],
    personal_info: {
        image: { type: String, default: '' },
        image_original: { type: String, default: '' }, // photo before background removal
        remove_bg: { type: Boolean, default: false },
        image_bg: { type: String, default: '' },       // photo background color ('' = accent color)
        full_name: { type: String, default: '' },
        profession: { type: String, default: '' },
        email: { type: String, default: '' },
        phone: { type: String, default: '' },
        location: { type: String, default: '' },
        linkedin: { type: String, default: '' },
        website: { type: String, default: '' },
    },
    experience: [{
        company: String,
        position: String,
        start_date: String,
        end_date: String,
        description: String,
        is_current: Boolean,
    }],
    project: [{
        name: String,
        // Written as { type: String } because a bare `type` key would make Mongoose treat the whole object as a String
        type: { type: String },
        description: String,
    }],
    education: [{
        institution: String,
        degree: String,
        field: String,
        graduation_date: String,
        gpa: String,
    }],
}, { timestamps: true, minimize: false })

const Resume = mongoose.model('Resume', resumeSchema)

export default Resume
