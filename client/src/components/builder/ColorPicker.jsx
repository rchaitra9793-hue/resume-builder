import React, { useState } from 'react'
import { CheckIcon, PaletteIcon } from 'lucide-react'
import { accentColors } from '../../utils/templates'

const ColorPicker = ({ selectedColor, onChange }) => {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='relative'>
            <button onClick={() => setIsOpen(o => !o)} className='flex items-center gap-1 text-sm text-purple-600 bg-linear-to-br from-purple-50 to-purple-100 ring-purple-300 hover:ring transition-all px-3 py-2 rounded-lg'>
                <PaletteIcon size={16} /> <span className='max-sm:hidden'>Accent</span>
            </button>
            {isOpen && (
                <>
                    <div className='fixed inset-0 z-10' onClick={() => setIsOpen(false)} />
                    <div className='grid grid-cols-4 w-60 gap-2 absolute top-full left-0 p-3 mt-2 z-20 bg-white rounded-md border border-gray-200 shadow-sm'>
                        {accentColors.map(color => (
                            <div key={color.value} onClick={() => { onChange(color.value); setIsOpen(false) }} className='relative cursor-pointer group flex flex-col items-center'>
                                <div className='w-12 h-12 rounded-full border-2 border-transparent group-hover:border-black/25 transition-colors flex items-center justify-center' style={{ backgroundColor: color.value }}>
                                    {selectedColor === color.value && <CheckIcon className='size-5 text-white' />}
                                </div>
                                <p className='text-xs text-center mt-1 text-gray-600'>{color.name}</p>
                            </div>
                        ))}
                        <label className='relative cursor-pointer group flex flex-col items-center'>
                            <div className='w-12 h-12 rounded-full border-2 border-transparent group-hover:border-black/25' style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }} />
                            <p className='text-xs text-center mt-1 text-gray-600'>Custom</p>
                            <input type='color' value={selectedColor || '#3B82F6'} onChange={e => onChange(e.target.value)} className='absolute inset-0 opacity-0 cursor-pointer' />
                        </label>
                    </div>
                </>
            )}
        </div>
    )
}

export default ColorPicker
