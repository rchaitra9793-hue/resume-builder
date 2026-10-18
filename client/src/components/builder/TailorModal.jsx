import React, { useState } from 'react'
import { CheckIcon, Loader2, Sparkles, WandSparkles, X } from 'lucide-react'
import api from '../../utils/api'

// Paste a job description -> AI updates title, summary, experience, projects and skills
const TailorModal = ({ resume, onApply, onClose }) => {
    const [jobDescription, setJobDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [missing, setMissing] = useState(null)

    const tailor = async () => {
        setLoading(true)
        setError('')
        try {
            const result = await api.post('/ai/tailor', { resume, jobDescription })
            const applyDescriptions = (items = [], updates = []) => items.map((item, i) => {
                const match = updates.find(u => u.index === i)
                return match?.description ? { ...item, description: match.description } : item
            })
            onApply({
                ...resume,
                personal_info: { ...resume.personal_info, profession: result.profession || resume.personal_info?.profession },
                professional_summary: result.professional_summary || resume.professional_summary,
                skills: result.skills?.length ? result.skills : resume.skills,
                experience: applyDescriptions(resume.experience, result.experience),
                project: applyDescriptions(resume.project, result.project),
            })
            setMissing(result.missing_requirements || [])
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div onClick={() => !loading && onClose()} className='fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 print:hidden'>
            <div onClick={e => e.stopPropagation()} className='bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto'>
                <div className='flex items-center justify-between px-6 py-4 border-b border-gray-100'>
                    <h2 className='flex items-center gap-2 text-lg font-semibold text-gray-900'>
                        <WandSparkles className='size-5 text-purple-600' /> Tailor Resume to a Job
                    </h2>
                    <button onClick={onClose} disabled={loading} className='p-1 rounded text-gray-400 hover:text-gray-600'><X className='size-5' /></button>
                </div>

                {missing === null ? (
                    <div className='p-6 space-y-4'>
                        <p className='text-sm text-gray-600'>
                            Paste the job description. AI will rewrite your profession, summary, experience and project
                            descriptions and update your skills to match it, then show which requirements you're missing.
                        </p>
                        <textarea value={jobDescription} onChange={e => setJobDescription(e.target.value)} rows={10} disabled={loading}
                            placeholder='Paste the full job description here...'
                            className='w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-purple-500 focus:border-purple-500 outline-none resize-y' />
                        {error && <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3'>{error}</p>}
                        <button onClick={tailor} disabled={loading || jobDescription.trim().length < 30}
                            className='w-full flex items-center justify-center gap-2 h-11 rounded-lg text-white text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:opacity-50'>
                            {loading ? <><Loader2 className='size-4 animate-spin' /> Generating for all sections...</> : <><Sparkles className='size-4' /> Generate for all sections</>}
                        </button>
                    </div>
                ) : (
                    <div className='p-6 space-y-4'>
                        <div className='flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200'>
                            <CheckIcon className='size-5 text-green-600 shrink-0 mt-0.5' />
                            <p className='text-sm text-green-800'>Done! Review the preview, then click <b>Save Changes</b> to keep it.</p>
                        </div>
                        {missing.length > 0 && (
                            <div>
                                <h3 className='text-sm font-semibold text-gray-800 mb-1'>Requirements your resume doesn't show yet</h3>
                                <p className='text-xs text-gray-500 mb-2'>Add these only if they're true for you (as a project, course or experience point).</p>
                                <ul className='space-y-1.5'>
                                    {missing.map((req, i) => (
                                        <li key={i} className='flex items-start gap-2 text-sm text-gray-700'><span className='mt-1.5 size-1.5 rounded-full bg-amber-500 shrink-0' />{req}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button onClick={onClose} className='w-full h-10 rounded-lg bg-gray-900 text-white text-sm hover:bg-gray-800'>Close</button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default TailorModal
