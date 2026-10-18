import React from 'react'
import { GraduationCap, Plus, Trash2 } from 'lucide-react'

const inputClass = 'px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none'

const EducationForm = ({ data, onChange }) => {

    const addEducation = () => onChange([...data, { institution: '', degree: '', field: '', graduation_date: '', gpa: '' }])
    const removeEducation = (index) => onChange(data.filter((_, i) => i !== index))
    const updateEducation = (index, field, value) => {
        const updated = [...data]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Education</h3>
                    <p className='text-sm text-gray-500'>Add your education details</p>
                </div>
                <button onClick={addEducation} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                    <Plus className='size-4' /> Add Education
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <GraduationCap className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No education added yet.</p>
                    <p className='text-sm'>Click "Add Education" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4'>
                    {data.map((education, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4>Education #{index + 1}</h4>
                                <button onClick={() => removeEducation(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                    <Trash2 className='size-4' />
                                </button>
                            </div>

                            <div className='grid md:grid-cols-2 gap-3'>
                                <input value={education.institution || ''} onChange={e => updateEducation(index, 'institution', e.target.value)} type='text' placeholder='Institution Name' className={inputClass} />
                                <input value={education.degree || ''} onChange={e => updateEducation(index, 'degree', e.target.value)} type='text' placeholder="Degree (e.g., Bachelor's, Master's)" className={inputClass} />
                                <input value={education.field || ''} onChange={e => updateEducation(index, 'field', e.target.value)} type='text' placeholder='Field of Study' className={inputClass} />
                                <input value={education.graduation_date || ''} onChange={e => updateEducation(index, 'graduation_date', e.target.value)} type='month' className={inputClass} />
                            </div>
                            <input value={education.gpa || ''} onChange={e => updateEducation(index, 'gpa', e.target.value)} type='text' placeholder='GPA (optional)' className={inputClass} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default EducationForm
