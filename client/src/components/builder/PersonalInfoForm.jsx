import React, { useState } from 'react'
import { BriefcaseBusiness, Globe, Linkedin, Loader2, Mail, MapPin, Phone, User } from 'lucide-react'
import toast from 'react-hot-toast'
import { removeImageBackground, resizeImage } from '../../utils/image'

const fields = [
    { key: 'full_name', label: 'Full Name', icon: User, type: 'text', required: true },
    { key: 'email', label: 'Email Address', icon: Mail, type: 'email', required: true },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel' },
    { key: 'location', label: 'Location', icon: MapPin, type: 'text' },
    { key: 'profession', label: 'Profession', icon: BriefcaseBusiness, type: 'text' },
    { key: 'linkedin', label: 'LinkedIn Profile', icon: Linkedin, type: 'url' },
    { key: 'website', label: 'Personal Website', icon: Globe, type: 'url' },
]

const photoBackgrounds = [
    { name: 'Accent', value: '' },
    { name: 'None', value: 'transparent' },
    { name: 'White', value: '#FFFFFF' },
    { name: 'Light Gray', value: '#E5E7EB' },
    { name: 'Sky', value: '#BFDBFE' },
    { name: 'Mint', value: '#BBF7D0' },
    { name: 'Lavender', value: '#DDD6FE' },
    { name: 'Pink', value: '#FBCFE8' },
    { name: 'Peach', value: '#FED7AA' },
    { name: 'Yellow', value: '#FEF08A' },
    { name: 'Navy', value: '#1E3A8A' },
]

const PersonalInfoForm = ({ data, onChange, accentColor }) => {
    const [removing, setRemoving] = useState(false)
    const [progress, setProgress] = useState(null)

    const handleChange = (field, value) => onChange({ ...data, [field]: value })

    const handleImage = async (e) => {
        const file = e.target.files?.[0]
        e.target.value = ''
        if (!file) return
        try {
            const image = await resizeImage(file)
            onChange({ ...data, image, image_original: image, remove_bg: false })
        } catch (error) {
            toast.error(error.message)
        }
    }

    const toggleRemoveBackground = async () => {
        const original = data.image_original || data.image
        if (data.remove_bg) {
            onChange({ ...data, image: original, image_original: original, remove_bg: false })
            return
        }
        setRemoving(true)
        setProgress(null)
        try {
            const image = await removeImageBackground(original, setProgress)
            onChange({ ...data, image, image_original: original, remove_bg: true })
            toast.success('Background removed')
        } catch (error) {
            toast.error(error.message || 'Could not remove the background')
        } finally {
            setRemoving(false)
        }
    }

    const swatchColor = (value) => value === '' ? accentColor + '70' : value

    return (
        <div>
            <h3 className='text-lg font-semibold text-gray-900'>Personal Information</h3>
            <p className='text-sm text-gray-600'>Get Started with the personal information</p>

            <div className='flex items-center gap-4 mt-5'>
                <label className='cursor-pointer shrink-0'>
                    {data.image ? (
                        <img src={data.image} alt='user' title='Change photo'
                            className='w-16 h-16 rounded-full object-cover ring ring-slate-300 hover:opacity-80'
                            style={{ background: data.remove_bg ? swatchColor(data.image_bg || '') : undefined }} />
                    ) : (
                        <div className='inline-flex items-center gap-2 text-slate-600 hover:text-slate-700'>
                            <User className='size-10 p-2.5 border rounded-full' />
                            upload user image
                        </div>
                    )}
                    <input type='file' accept='image/jpeg, image/png, image/webp' hidden onChange={handleImage} disabled={removing} />
                </label>

                {data.image && (
                    <div className='flex flex-col gap-1.5 text-sm'>
                        <p className='text-gray-700'>Remove Background</p>
                        <div className='flex items-center gap-3'>
                            <button type='button' role='switch' aria-checked={!!data.remove_bg} onClick={toggleRemoveBackground} disabled={removing}
                                className={`relative w-9 h-5 rounded-full transition-colors disabled:opacity-60 ${data.remove_bg ? 'bg-green-600' : 'bg-slate-300'}`}>
                                <span className={`absolute top-0.5 left-0.5 size-4 bg-white rounded-full shadow transition-transform ${data.remove_bg ? 'translate-x-4' : ''}`} />
                            </button>
                            <button type='button' onClick={() => onChange({ ...data, image: '', image_original: '', remove_bg: false })} disabled={removing}
                                className='text-xs text-red-500 hover:underline'>Remove image</button>
                        </div>
                    </div>
                )}
            </div>

            {removing && (
                <p className='flex items-center gap-2 mt-3 text-xs text-slate-500'>
                    <Loader2 className='size-4 animate-spin' />
                    {progress?.stage === 'download' && progress.percent < 100
                        ? `Downloading free AI model (first time only)... ${progress.percent}%`
                        : `Removing background and centering your photo...${progress?.stage === 'compute' ? ` ${progress.percent}%` : ''}`}
                </p>
            )}

            {data.image && data.remove_bg && !removing && (
                <div className='mt-4'>
                    <p className='text-sm font-medium text-gray-600 mb-2'>Photo background color</p>
                    <div className='flex flex-wrap items-center gap-2'>
                        {photoBackgrounds.map(bg => {
                            const selected = (data.image_bg || '') === bg.value
                            return (
                                <button key={bg.name} type='button' title={bg.name} onClick={() => handleChange('image_bg', bg.value)}
                                    className={`size-7 rounded-full border border-slate-300 transition-transform hover:scale-110 ${selected ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                    style={bg.value === 'transparent'
                                        ? { background: 'repeating-conic-gradient(#e5e7eb 0% 25%, #fff 0% 50%) 50% / 10px 10px' }
                                        : { background: swatchColor(bg.value) }} />
                            )
                        })}
                        <label title='Custom color' className='relative size-7 rounded-full border border-slate-300 cursor-pointer hover:scale-110 transition-transform'
                            style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                            <input type='color' value={data.image_bg?.startsWith('#') ? data.image_bg : '#BFDBFE'} onChange={e => handleChange('image_bg', e.target.value)}
                                className='absolute inset-0 opacity-0 cursor-pointer' />
                        </label>
                    </div>
                </div>
            )}

            {fields.map(field => (
                <div key={field.key} className='space-y-1 mt-5'>
                    <label className='flex items-center gap-2 text-sm font-medium text-gray-600'>
                        <field.icon className='size-4' />
                        {field.label}
                        {field.required && <span className='text-red-500'>*</span>}
                    </label>
                    <input type={field.type} value={data[field.key] || ''} onChange={e => handleChange(field.key, e.target.value)}
                        className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors text-sm'
                        placeholder={`Enter your ${field.label.toLowerCase()}`} required={field.required} />
                </div>
            ))}
        </div>
    )
}

export default PersonalInfoForm
