import ClassicTemplate from '../assets/templates/ClassicTemplate'
import ModernTemplate from '../assets/templates/ModernTemplate'
import MinimalTemplate from '../assets/templates/MinimalTemplate'
import MinimalImageTemplate from '../assets/templates/MinimalImageTemplate'

export const templates = [
    { id: 'classic', name: 'Classic', component: ClassicTemplate, preview: 'A clean, traditional resume format with clear sections and professional typography' },
    { id: 'modern', name: 'Modern', component: ModernTemplate, preview: 'Sleek design with strategic use of color and modern font choices' },
    { id: 'minimal-image', name: 'Minimal Image', component: MinimalImageTemplate, preview: 'Minimal design with a single image and clean typography' },
    { id: 'minimal', name: 'Minimal', component: MinimalTemplate, preview: 'Ultra-clean design that puts your content front and center' },
]

export const accentColors = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Indigo', value: '#6366F1' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Gray', value: '#6B7280' },
    { name: 'Black', value: '#1F2937' },
]
