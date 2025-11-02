import { useMemo, useState } from 'react'
import { useResumeStore } from '../store'
import { Link } from 'react-router-dom'

export const Preview = () => {
  const resume = useResumeStore(s => s.resume)
  const [chromePath, setChromePath] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const renderTemplate = (resume) => {
    const { template, customTemplate } = resume
    const style = `<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: ${customTemplate.fontFamily || 'Inter, system-ui, Arial'}; 
        color: #111; 
        padding: 40px;
        max-width: 820px;
        margin: 0 auto;
        line-height: 1.6;
        background: white;
        ${customTemplate.customCSS || ''}
      }
      .header { 
        border-bottom: 3px solid ${customTemplate.accentColor || '#2563eb'}; 
        padding-bottom: 16px; 
        margin-bottom: 20px; 
      }
      .name { 
        color: ${customTemplate.primaryColor || '#1e40af'}; 
        font-size: 32px; 
        font-weight: 700; 
        margin-bottom: 8px;
      }
      .title { 
        color: #666; 
        font-size: 18px; 
        margin-bottom: 12px;
      }
      .contact { 
        font-size: 14px; 
        color: #555; 
        margin-top: 8px;
      }
      .section { 
        margin-top: 24px; 
      }
      .section h3 { 
        color: ${customTemplate.primaryColor || '#1e40af'}; 
        margin: 0 0 12px 0; 
        font-size: 20px;
        font-weight: 600;
        text-transform: ${template === 'elegant' ? 'uppercase' : 'none'};
        letter-spacing: ${template === 'elegant' ? '0.5px' : '0'};
      }
      .item { 
        border-left: 3px solid ${customTemplate.accentColor || '#2563eb'}; 
        padding-left: 16px; 
        margin: 12px 0; 
      }
      .item strong { 
        font-weight: 600; 
        display: block;
        margin-bottom: 4px;
      }
      .item-title { 
        font-weight: 600; 
        font-size: 16px;
        margin-bottom: 4px;
      }
      .item-meta { 
        color: #666; 
        font-size: 14px; 
        margin-bottom: 8px;
      }
      .item-content { 
        color: #555; 
        font-size: 14px;
        line-height: 1.5;
      }
      .skills-list { 
        display: flex; 
        flex-wrap: wrap; 
        gap: 8px; 
        margin-top: 8px;
      }
      .skill-tag { 
        border: 1px solid #ddd; 
        padding: 6px 12px; 
        border-radius: 6px; 
        font-size: 13px;
        background: #f9fafb;
      }
      .summary { 
        font-size: 15px; 
        color: #555; 
        line-height: 1.6;
        margin-top: 8px;
      }
      ${customTemplate.customCSS || ''}
    </style>`

    const basics = `
      <div class="header">
        <div class="name">${resume.basics.fullName || ''}</div>
        <div class="title">${resume.basics.title || ''}</div>
        <div class="contact">
          ${resume.basics.email || ''} 
          ${resume.basics.phone ? ' | ' + resume.basics.phone : ''} 
          ${resume.basics.location ? ' | ' + resume.basics.location : ''} 
          ${resume.basics.website ? ' | ' + resume.basics.website : ''}
        </div>
      </div>
      ${resume.basics.summary ? `<div class="summary">${resume.basics.summary}</div>` : ''}
    `

    const mapItems = (list, formatter) => list.map(formatter).join('')

    const experience = resume.sections.experience.length > 0 ? `
      <div class="section">
        <h3>Experience</h3>
        ${mapItems(resume.sections.experience, e => `
          <div class="item">
            <div class="item-title">${e.role || ''}</div>
            <div class="item-meta">${e.company || ''} — ${e.period || ''}</div>
            <div class="item-content">${e.summary || ''}</div>
          </div>
        `)}
      </div>` : ''

    const projects = resume.sections.projects.length > 0 ? `
      <div class="section">
        <h3>Projects</h3>
        ${mapItems(resume.sections.projects, p => `
          <div class="item">
            <div class="item-title">${p.name || ''}</div>
            <div class="item-meta">${p.tech || ''}</div>
            <div class="item-content">${p.description || ''}</div>
          </div>
        `)}
      </div>` : ''

    const education = resume.sections.education.length > 0 ? `
      <div class="section">
        <h3>Education</h3>
        ${mapItems(resume.sections.education, e => `
          <div class="item">
            <div class="item-title">${e.degree || ''}</div>
            <div class="item-meta">${e.school || ''} — ${e.period || ''} ${e.score ? '(' + e.score + ')' : ''}</div>
          </div>
        `)}
      </div>` : ''

    const skills = resume.sections.skills.length > 0 ? `
      <div class="section">
        <h3>Skills</h3>
        <div class="skills-list">
          ${mapItems(resume.sections.skills, s => `
            <span class="skill-tag">${s.name || ''}${s.level ? ' (' + s.level + ')' : ''}</span>
          `)}
        </div>
      </div>` : ''

    const certifications = resume.sections.certifications.length > 0 ? `
      <div class="section">
        <h3>Certifications</h3>
        ${mapItems(resume.sections.certifications, c => `
          <div class="item">
            <div class="item-title">${c.name || ''}</div>
            <div class="item-meta">${c.year || ''}</div>
          </div>
        `)}
      </div>` : ''

    const languages = resume.sections.languages.length > 0 ? `
      <div class="section">
        <h3>Languages</h3>
        ${mapItems(resume.sections.languages, l => `
          <div class="item">
            <div class="item-title">${l.name || ''}</div>
            <div class="item-meta">${l.level || ''}</div>
          </div>
        `)}
      </div>` : ''

    const interests = resume.sections.interests.length > 0 ? `
      <div class="section">
        <h3>Interests</h3>
        <div class="skills-list">
          ${mapItems(resume.sections.interests, i => `
            <span class="skill-tag">${i.name || ''}</span>
          `)}
        </div>
      </div>` : ''

    const base = `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name="viewport" content="width=device-width, initial-scale=1"/>${style}</head><body>
      ${basics}
      ${experience}
      ${projects}
      ${education}
      ${skills}
      ${certifications}
      ${languages}
      ${interests}
    </body></html>`

    if (template === 'classic') return base
    if (template === 'minimal') {
      return base.replace('<body>', `<body style="font-size:13px; line-height:1.5">`)
    }
    if (template === 'modern') {
      return base.replace('<body>', `<body style="max-width:820px; margin:0 auto;">`)
    }
    if (template === 'elegant') {
      return base.replace('<style>', `<style> body { letter-spacing: .2px } .name { font-size: 36px }`)
    }
    if (template === 'tech') {
      return base.replace('<style>', `<style> body { background:#fafafa } .item { background:#fff; border:1px solid #eee; padding: 12px; border-radius: 4px; }`)
    }
    if (template === 'custom') return base
    return base
  }

  const renderedHtml = useMemo(() => renderTemplate(resume), [resume])

  const exportTo = async (type) => {
    setIsExporting(true)
    try {
      const endpoint = type === 'pdf' ? '/export/pdf' : '/export/docx'
      const resp = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: renderedHtml, chromePath })
      })
      if (!resp.ok) {
        throw new Error('Export failed')
      }
      const blob = await resp.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `resume.${type}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      alert(`Export failed: ${err.message}`)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link
          to="/"
          className="group flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Preview & Export
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review your resume and export it as PDF or DOCX</p>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 p-6 hover:shadow-xl transition-all duration-300">
        <div className="mb-6">
          <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
            Chrome Executable Path (Optional)
          </label>
          <input
            type="text"
            placeholder="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
            value={chromePath}
            onChange={e => setChromePath(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
          />
          <p className="text-xs text-slate-500 mt-2">
            Only needed if Chrome is not in the default location
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => exportTo('pdf')}
            disabled={isExporting}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Download PDF
              </>
            )}
          </button>
          <button
            onClick={() => exportTo('docx')}
            disabled={isExporting}
            className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isExporting ? (
              <>
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Download DOCX
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/60 overflow-hidden hover:shadow-2xl transition-all duration-300">
        <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 border-b border-slate-200/60 px-6 py-4">
          <h3 className="text-base font-bold text-slate-800">Live Preview</h3>
        </div>
        <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100">
          <iframe
            title="resume-preview"
            srcDoc={renderedHtml}
            className="w-full h-[900px] border border-slate-300 rounded-xl bg-white shadow-inner"
            style={{ minHeight: '900px' }}
          />
        </div>
      </div>
    </div>
  )
}
