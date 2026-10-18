import React, { useState } from 'react'
import { Briefcase, Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../utils/api'

const inputClass = 'px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none disabled:bg-gray-100'

const ExperienceForm = ({ data, onChange }) => {
    const [generatingIndex, setGeneratingIndex] = useState(-1)

    const addExperience = () => onChange([...data, { company: '', position: '', start_date: '', end_date: '', description: '', is_current: false }])
    const removeExperience = (index) => onChange(data.filter((_, i) => i !== index))
    const updateExperience = (index, field, value) => {
        const updated = [...data]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    const enhanceDescription = async (index) => {
        const exp = data[index]
        setGeneratingIndex(index)
        try {
            const { enhancedContent } = await api.post('/ai/enhance-job-desc', { content: exp.description, position: exp.position, company: exp.company })
            updateExperience(index, 'description', enhancedContent)
            toast.success('Description enhanced')
        } catch (error) {
            toast.error(error.message)
        } finally {
            setGeneratingIndex(-1)
        }
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Professional Experience</h3>
                    <p className='text-sm text-gray-500'>Add your job experience</p>
                </div>
                <button onClick={addExperience} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                    <Plus className='size-4' /> Add Experience
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <Briefcase className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No work experience added yet.</p>
                    <p className='text-sm'>Click "Add Experience" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {data.map((experience, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4>Experience #{index + 1}</h4>
                                <button onClick={() => removeExperience(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                    <Trash2 className='size-4' />
                                </button>
                            </div>

                            <div className='grid md:grid-cols-2 gap-3'>
                                <input value={experience.company || ''} onChange={e => updateExperience(index, 'company', e.target.value)} type='text' placeholder='Company Name' className={inputClass} />
                                <input value={experience.position || ''} onChange={e => updateExperience(index, 'position', e.target.value)} type='text' placeholder='Job Title' className={inputClass} />
                                <input value={experience.start_date || ''} onChange={e => updateExperience(index, 'start_date', e.target.value)} type='month' className={inputClass} />
                                <input value={experience.is_current ? '' : experience.end_date || ''} onChange={e => updateExperience(index, 'end_date', e.target.value)} type='month' disabled={experience.is_current} className={inputClass} />
                            </div>

                            <label className='flex items-center gap-2'>
                                <input type='checkbox' checked={!!experience.is_current} onChange={e => updateExperience(index, 'is_current', e.target.checked)} className='rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                                <span className='text-sm text-gray-700'>Currently working here</span>
                            </label>

                            <div className='space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <label className='text-sm font-medium text-gray-700'>Job Description</label>
                                    <button onClick={() => enhanceDescription(index)} disabled={generatingIndex === index || !experience.position || !experience.company}
                                        title={!experience.position || !experience.company ? 'Add a company and job title first' : ''}
                                        className='flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                                        {generatingIndex === index ? <Loader2 className='w-3 h-3 animate-spin' /> : <Sparkles className='w-3 h-3' />}
                                        Enhance with AI
                                    </button>
                                </div>
                                <textarea value={experience.description || ''} onChange={e => updateExperience(index, 'description', e.target.value)} rows={4}
                                    className='w-full text-sm px-3 py-2 rounded-lg resize-none border border-gray-300 focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none'
                                    placeholder='Describe your key responsibilities and achievements...' />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ExperienceForm
