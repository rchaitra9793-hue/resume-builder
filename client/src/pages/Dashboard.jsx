import { FilePenLineIcon, LoaderCircleIcon, PencilIcon, PlusIcon, TrashIcon, UploadCloudIcon, XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api, { getUser } from '../utils/api'

const colors = ['#9333ea', '#d97706', '#dc2626', '#0284c7', '#16a34a']

const Dashboard = () => {

  const navigate = useNavigate()
  const user = getUser()
  const [allResumes, setAllResumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editId, setEditId] = useState(null)
  const [title, setTitle] = useState('')

  useEffect(() => {
    api.get('/users/resumes')
      .then(data => setAllResumes(data.resumes))
      .catch(error => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [])

  const closeModal = () => { setShowCreate(false); setEditId(null); setTitle('') }

  const createResume = async (e) => {
    e.preventDefault()
    try {
      const { resume } = await api.post('/resumes/create', { title })
      closeModal()
      navigate(`/app/builder/${resume._id}`)
    } catch (error) {
      toast.error(error.message)
    }
  }

  const uploadResume = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      try {
        const data = JSON.parse(reader.result)
        const { resume } = await api.post('/resumes/create', { ...data, title: data.title || file.name.replace(/\.json$/i, '') })
        navigate(`/app/builder/${resume._id}`)
      } catch (error) {
        toast.error(error instanceof SyntaxError ? 'Please upload a resume JSON file exported from this app.' : error.message)
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const renameResume = async (e) => {
    e.preventDefault()
    try {
      const { resume } = await api.put(`/resumes/update/${editId}`, { title })
      setAllResumes(prev => prev.map(r => r._id === resume._id ? resume : r))
      toast.success('Title updated')
      closeModal()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const removeResume = async (id) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return
    try {
      const data = await api.delete(`/resumes/delete/${id}`)
      setAllResumes(prev => prev.filter(r => r._id !== id))
      toast.success(data.message)
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-linear-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>Welcome, {user?.name}</p>
        <div className='flex gap-4'>
          <button onClick={() => setShowCreate(true)} className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-indigo-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
            <PlusIcon className="size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-indigo-300 to-indigo-500 text-white rounded-full"/>
            <p className='text-sm group-hover:text-indigo-600 transition-all duration-300'>Create Resume</p>
          </button>
          <label className='w-full bg-white sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 text-slate-600 border border-dashed border-slate-300 group hover:border-purple-500 hover:shadow-lg transition-all duration-300 cursor-pointer'>
            <UploadCloudIcon className="size-11 transition-all duration-300 p-2.5 bg-linear-to-br from-purple-300 to-purple-500 text-white rounded-full"/>
            <p className='text-sm group-hover:text-purple-600 transition-all duration-300'>Upload Existing</p>
            <input type='file' accept='.json,application/json' hidden onChange={uploadResume} />
          </label>
        </div>

        <hr className='border-slate-300 my-6 sm:w-76.25' />

        {loading ? (
          <LoaderCircleIcon className='size-7 animate-spin text-slate-400' />
        ) : allResumes.length === 0 ? (
          <p className='text-sm text-slate-500'>No resumes yet. Click “Create Resume” to get started.</p>
        ) : (
          <div className='grid grid-cols-2 sm:flex flex-wrap gap-4'>
            {allResumes.map((resume, index) => {
              const baseColor = colors[index % colors.length]
              return (
                <div key={resume._id} onClick={() => navigate(`/app/builder/${resume._id}`)}
                  className='relative w-full sm:max-w-36 h-48 flex flex-col items-center justify-center rounded-lg gap-2 border group hover:shadow-lg transition-all duration-300 cursor-pointer'
                  style={{ background: `linear-gradient(135deg, ${baseColor}10, ${baseColor}40)`, borderColor: baseColor + '40' }}>
                  <FilePenLineIcon className='size-7 group-hover:scale-105 transition-all' style={{ color: baseColor }} />
                  <p className='text-sm group-hover:scale-105 transition-all px-2 text-center' style={{ color: baseColor }}>{resume.title}</p>
                  <p className='absolute bottom-1 text-[11px] transition-all duration-300 px-2 text-center' style={{ color: baseColor + '90' }}>
                    Updated on {new Date(resume.updatedAt).toLocaleDateString()}
                  </p>
                  <div onClick={e => e.stopPropagation()} className='absolute top-1 right-1 group-hover:flex items-center hidden'>
                    <TrashIcon onClick={() => removeResume(resume._id)} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                    <PencilIcon onClick={() => { setEditId(resume._id); setTitle(resume.title) }} className='size-7 p-1.5 hover:bg-white/50 rounded text-slate-700 transition-colors' />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {(showCreate || editId) && (
          <form onSubmit={showCreate ? createResume : renameResume} onClick={closeModal}
            className='fixed inset-0 bg-black/70 backdrop-blur z-10 flex items-center justify-center'>
            <div onClick={e => e.stopPropagation()} className='relative bg-slate-50 border shadow-md rounded-lg w-full max-w-sm p-6 mx-4'>
              <h2 className='text-xl font-bold mb-4'>{showCreate ? 'Create a Resume' : 'Edit Resume Title'}</h2>
              <input autoFocus type='text' value={title} onChange={e => setTitle(e.target.value)} placeholder='Enter resume title'
                className='w-full px-4 py-2 mb-4 border border-slate-300 rounded focus:border-green-600 outline-none' required />
              <button className='w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors'>
                {showCreate ? 'Create Resume' : 'Update'}
              </button>
              <XIcon onClick={closeModal} className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors' />
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default Dashboard
