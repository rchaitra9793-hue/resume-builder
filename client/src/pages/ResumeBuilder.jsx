import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeftIcon, Briefcase, ChevronLeft, ChevronRight, DownloadIcon, EyeIcon, EyeOffIcon, FileText, FolderIcon,
  GraduationCap, Loader2, Share2Icon, Sparkles, User, WandSparkles
} from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/builder/TemplateSelector'
import ColorPicker from '../components/builder/ColorPicker'
import PersonalInfoForm from '../components/builder/PersonalInfoForm'
import SummaryForm from '../components/builder/SummaryForm'
import ExperienceForm from '../components/builder/ExperienceForm'
import EducationForm from '../components/builder/EducationForm'
import ProjectForm from '../components/builder/ProjectForm'
import SkillsForm from '../components/builder/SkillsForm'
import TailorModal from '../components/builder/TailorModal'

const sections = [
  { id: 'personal', name: 'Personal Info', icon: User },
  { id: 'summary', name: 'Summary', icon: FileText },
  { id: 'experience', name: 'Experience', icon: Briefcase },
  { id: 'education', name: 'Education', icon: GraduationCap },
  { id: 'projects', name: 'Projects', icon: FolderIcon },
  { id: 'skills', name: 'Skills', icon: Sparkles },
]

const ResumeBuilder = () => {
  const { resumeId } = useParams()
  const [resumeData, setResumeData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showTailor, setShowTailor] = useState(false)

  useEffect(() => {
    api.get(`/resumes/get/${resumeId}`)
      .then(data => {
        setResumeData(data.resume)
        document.title = data.resume.title
      })
      .catch(error => toast.error(error.message))
      .finally(() => setLoading(false))
  }, [resumeId])

  if (loading) {
    return <div className='flex items-center justify-center h-[70vh]'><Loader2 className='size-8 animate-spin text-slate-400' /></div>
  }

  if (!resumeData) {
    return (
      <div className='flex flex-col items-center justify-center h-[70vh] gap-4'>
        <p className='text-2xl text-slate-500'>Resume not found</p>
        <Link to='/app' className='bg-green-500 hover:bg-green-600 text-white rounded-full px-6 h-9 flex items-center'>Back to Dashboard</Link>
      </div>
    )
  }

  const activeSection = sections[activeSectionIndex]
  const update = (field, value) => setResumeData(prev => ({ ...prev, [field]: value }))

  const saveResume = async () => {
    setSaving(true)
    try {
      const data = await api.put(`/resumes/update/${resumeId}`, resumeData)
      setResumeData(data.resume)
      toast.success(data.message)
    } catch (error) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  const changeResumeVisibility = async () => {
    try {
      const data = await api.put(`/resumes/update/${resumeId}`, { public: !resumeData.public })
      update('public', data.resume.public)
      toast.success(data.resume.public ? 'Resume is now public' : 'Resume is now private')
    } catch (error) {
      toast.error(error.message)
    }
  }

  const handleShare = () => {
    const resumeUrl = `${window.location.origin}/view/${resumeId}`
    if (navigator.share) navigator.share({ url: resumeUrl, text: 'My Resume' }).catch(() => {})
    else navigator.clipboard.writeText(resumeUrl).then(() => toast.success('Link copied to clipboard'))
  }

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-6 print:hidden'>
        <Link to='/app' className='inline-flex gap-2 items-center text-slate-500 hover:text-slate-700 transition-all'>
          <ArrowLeftIcon className='size-4' /> Back to Dashboard
        </Link>
      </div>

      <div className='max-w-7xl mx-auto px-4 pb-8 print:p-0'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* Left panel - form */}
          <div className='relative lg:col-span-5 min-w-0 rounded-lg overflow-hidden print:hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 pt-1 sm:pt-1'>
              {/* Progress bar */}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200' />
              <hr className='absolute top-0 left-0 h-1 bg-linear-to-r from-green-500 to-green-600 border-none transition-all duration-1000'
                style={{ width: `${(activeSectionIndex * 100) / (sections.length - 1)}%` }} />

              {/* Section navigation */}
              <div className='flex flex-wrap justify-between items-center gap-y-1 mb-6 border-b border-gray-300 py-1'>
                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={template => update('template', template)} />
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={color => update('accent_color', color)} />
                </div>
                <div className='flex items-center'>
                  {activeSectionIndex !== 0 && (
                    <button onClick={() => setActiveSectionIndex(i => Math.max(i - 1, 0))}
                      className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all'>
                      <ChevronLeft className='size-4' /> Previous
                    </button>
                  )}
                  <button onClick={() => setActiveSectionIndex(i => Math.min(i + 1, sections.length - 1))}
                    disabled={activeSectionIndex === sections.length - 1}
                    className='flex items-center gap-1 p-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all disabled:opacity-50'>
                    Next <ChevronRight className='size-4' />
                  </button>
                </div>
              </div>

              {/* Form content */}
              <div className='space-y-6'>
                {activeSection.id === 'personal' && (
                  <PersonalInfoForm data={resumeData.personal_info || {}} onChange={data => update('personal_info', data)} accentColor={resumeData.accent_color} />
                )}
                {activeSection.id === 'summary' && (
                  <SummaryForm data={resumeData.professional_summary} onChange={data => update('professional_summary', data)} />
                )}
                {activeSection.id === 'experience' && (
                  <ExperienceForm data={resumeData.experience || []} onChange={data => update('experience', data)} />
                )}
                {activeSection.id === 'education' && (
                  <EducationForm data={resumeData.education || []} onChange={data => update('education', data)} />
                )}
                {activeSection.id === 'projects' && (
                  <ProjectForm data={resumeData.project || []} onChange={data => update('project', data)} />
                )}
                {activeSection.id === 'skills' && (
                  <SkillsForm data={resumeData.skills || []} onChange={data => update('skills', data)} />
                )}
              </div>

              <button onClick={saveResume} disabled={saving}
                className='flex items-center gap-2 bg-linear-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-md px-6 py-2 mt-6 text-sm disabled:opacity-60'>
                {saving && <Loader2 className='size-4 animate-spin' />} Save Changes
              </button>
            </div>
          </div>

          {/* Right panel - preview */}
          <div className='lg:col-span-7 max-lg:mt-6 min-w-0'>
            <div className='relative w-full'>
              <div className='flex flex-wrap items-center justify-end gap-2 mb-3 print:hidden'>
                <button onClick={() => setShowTailor(true)}
                  className='flex items-center gap-2 px-4 py-2 text-xs bg-linear-to-br from-indigo-100 to-indigo-200 text-indigo-600 rounded-lg ring-indigo-300 hover:ring transition-colors'>
                  <WandSparkles className='size-4' /> Tailor to Job
                </button>
                {resumeData.public && (
                  <button onClick={handleShare}
                    className='flex items-center gap-2 px-4 py-2 text-xs bg-linear-to-br from-blue-100 to-blue-200 text-blue-600 rounded-lg ring-blue-300 hover:ring transition-colors'>
                    <Share2Icon className='size-4' /> Share
                  </button>
                )}
                <button onClick={changeResumeVisibility}
                  className='flex items-center gap-2 px-4 py-2 text-xs bg-linear-to-br from-purple-100 to-purple-200 text-purple-600 ring-purple-300 rounded-lg hover:ring transition-colors'>
                  {resumeData.public ? <EyeIcon className='size-4' /> : <EyeOffIcon className='size-4' />}
                  {resumeData.public ? 'Public' : 'Private'}
                </button>
                <button onClick={() => window.print()}
                  className='flex items-center gap-2 px-6 py-2 text-xs bg-linear-to-br from-green-100 to-green-200 text-green-600 rounded-lg ring-green-300 hover:ring transition-colors'>
                  <DownloadIcon className='size-4' /> Download
                </button>
              </div>
              <div className='border border-gray-200 rounded-lg overflow-hidden bg-white print:border-0'>
                <ResumePreview data={resumeData} template={resumeData.template} accentColor={resumeData.accent_color} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {showTailor && (
        <TailorModal resume={resumeData} onApply={setResumeData} onClose={() => setShowTailor(false)} />
      )}
    </div>
  )
}

export default ResumeBuilder
