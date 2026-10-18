import React, { useLayoutEffect, useRef, useState } from 'react'
import { templates } from '../utils/templates'

// The resume is laid out at A4 width and scaled down to fit narrow screens (phones),
// so it always looks like the downloaded PDF. Printing uses the full-size page.
const PAGE_WIDTH = 794

const ResumePreview = ({ data, template, accentColor, className = '' }) => {
    const Template = (templates.find(t => t.id === template) || templates[0]).component
    const outerRef = useRef(null)
    const innerRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [height, setHeight] = useState()

    useLayoutEffect(() => {
        const outer = outerRef.current
        const inner = innerRef.current
        const observer = new ResizeObserver(() => {
            const nextScale = Math.min(1, outer.clientWidth / PAGE_WIDTH)
            setScale(nextScale)
            setHeight(inner.offsetHeight * nextScale)
        })
        observer.observe(outer)
        observer.observe(inner)
        return () => observer.disconnect()
    }, [])

    return (
        <div ref={outerRef} className={'w-full bg-white overflow-hidden print:overflow-visible print:h-auto! ' + className} style={{ height }}>
            <div ref={innerRef} id='resume-preview' className='origin-top-left print:transform-none! print:w-full!'
                style={{ width: PAGE_WIDTH, transform: `scale(${scale})` }}>
                <Template data={data} accentColor={accentColor} />
            </div>
        </div>
    )
}

export default ResumePreview
