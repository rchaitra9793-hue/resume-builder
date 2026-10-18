import React from 'react'
import { FolderIcon, Plus, Trash2 } from 'lucide-react'

const inputClass = 'w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none'

const ProjectForm = ({ data, onChange }) => {

    const addProject = () => onChange([...data, { name: '', type: '', description: '' }])
    const removeProject = (index) => onChange(data.filter((_, i) => i !== index))
    const updateProject = (index, field, value) => {
        const updated = [...data]
        updated[index] = { ...updated[index], [field]: value }
        onChange(updated)
    }

    return (
        <div>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Projects</h3>
                    <p className='text-sm text-gray-500'>Add your projects</p>
                </div>
                <button onClick={addProject} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors'>
                    <Plus className='size-4' /> Add Project
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <FolderIcon className='w-12 h-12 mx-auto mb-3 text-gray-300' />
                    <p>No projects added yet.</p>
                    <p className='text-sm'>Click "Add Project" to get started.</p>
                </div>
            ) : (
                <div className='space-y-4 mt-6'>
                    {data.map((project, index) => (
                        <div key={index} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                            <div className='flex justify-between items-start'>
                                <h4>Project #{index + 1}</h4>
                                <button onClick={() => removeProject(index)} className='text-red-500 hover:text-red-700 transition-colors'>
                                    <Trash2 className='size-4' />
                                </button>
                            </div>

                            <div className='grid gap-3'>
                                <input value={project.name || ''} onChange={e => updateProject(index, 'name', e.target.value)} type='text' placeholder='Project Name' className={inputClass} />
                                <input value={project.type || ''} onChange={e => updateProject(index, 'type', e.target.value)} type='text' placeholder='Project Type' className={inputClass} />
                                <textarea rows={4} value={project.description || ''} onChange={e => updateProject(index, 'description', e.target.value)} placeholder='Describe your project...' className={inputClass + ' resize-none'} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProjectForm
