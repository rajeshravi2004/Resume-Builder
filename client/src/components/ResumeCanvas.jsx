import { useMemo, useState } from 'react'
import { renderFullResumeHtml } from '../renderResumeHtml'

export function ResumeCanvas({ resume, scale = 0.72, className = '', id }) {
  const html = useMemo(() => renderFullResumeHtml(resume), [resume])
  const [height, setHeight] = useState(1123)
  const pages = Math.max(1, Math.ceil(height / 1123))
  const measure = event => {
    requestAnimationFrame(() => {
      const documentHeight = event.currentTarget.contentDocument?.documentElement?.scrollHeight || 1123
      setHeight(Math.max(1123, documentHeight))
    })
  }
  return <div className={`resume-canvas ${className}`} style={{ '--resume-scale': scale, height: `${height * scale}px` }}><iframe id={id} title="Live resume preview" srcDoc={html} onLoad={measure} style={{ height: `${height}px` }} />{pages > 1 && <span className="page-count">{pages} pages</span>}</div>
}
