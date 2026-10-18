import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, DownloadIcon, LoaderCircleIcon } from 'lucide-react'
import ResumePreview from '../components/ResumePreview'
import api from '../utils/api'

const Preview = () => {
  const { resumeId } = useParams()
  const [resume, setResume] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/resumes/public/${resumeId}`)
      .then(data => setResume(data.resume))
      .catch(() => setResume(null))
      .finally(() => setLoading(false))
  }, [resumeId])

  if (loading) {
    return <div className='flex items-center justify-center h-screen'><LoaderCircleIcon className='size-8 animate-spin text-slate-400' /></div>
  }

  if (!resume) {
    return (
      <div className='flex flex-col items-center justify-center h-screen gap-4'>
        <p className='text-3xl text-slate-400 font-medium'>Resume not found</p>
        <Link to='/' className='inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9'>
          <ArrowLeftIcon className='size-4' /> Go to home page
        </Link>
      </div>
    )
  }

  return (
    <div className='bg-slate-100 min-h-screen print:bg-white'>
      <div className='max-w-3xl mx-auto py-10 print:py-0'>
        <div className='flex justify-end mb-3 px-4 print:hidden'>
          <button onClick={() => window.print()} className='flex items-center gap-2 px-4 py-2 text-xs bg-linear-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
            <DownloadIcon className='size-4' /> Download
          </button>
        </div>
        <ResumePreview data={resume} template={resume.template} accentColor={resume.accent_color} className='py-4 shadow print:shadow-none' />
      </div>
    </div>
  )
}

export default Preview
