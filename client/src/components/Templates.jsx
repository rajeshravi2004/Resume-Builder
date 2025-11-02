import { useResumeStore } from '../store'
import { CustomTemplateEditor } from './custom/CustomTemplateEditor'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'

const templateList = [
  { id: 'classic', name: 'Classic', description: 'Traditional and professional', color: 'from-blue-500 to-blue-600' },
  { id: 'minimal', name: 'Minimal', description: 'Clean and simple design', color: 'from-slate-400 to-slate-600' },
  { id: 'modern', name: 'Modern', description: 'Contemporary and sleek', color: 'from-purple-500 to-purple-600' },
  { id: 'elegant', name: 'Elegant', description: 'Sophisticated and refined', color: 'from-indigo-500 to-indigo-600' },
  { id: 'tech', name: 'Tech', description: 'Tech-focused and vibrant', color: 'from-emerald-500 to-emerald-600' },
]

const PreviewThumbnail = ({ templateId, resume }) => {
  const html = useMemo(() => {
    const previewResume = {
      ...resume,
      template: templateId,
      basics: {
        ...resume.basics,
        fullName: resume.basics.fullName || 'John Doe',
        title: resume.basics.title || 'Software Engineer',
        email: resume.basics.email || 'john@example.com',
        phone: resume.basics.phone || '+1 (555) 123-4567',
        location: resume.basics.location || 'New York, NY',
        website: resume.basics.website || 'johndoe.com',
        summary: resume.basics.summary || 'Experienced software engineer with a passion for building scalable applications.'
      }
    }
    return renderTemplatePreview(previewResume)
  }, [templateId, resume])

  return (
    <div className="w-full h-64 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-inner">
      <iframe
        title={`preview-${templateId}`}
        srcDoc={html}
        className="w-full h-full transform scale-50 origin-top-left pointer-events-none"
        style={{ width: '200%', height: '200%' }}
      />
    </div>
  )
}

const renderTemplatePreview = (resume) => {
  const { template, customTemplate } = resume
  const style = `<style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${customTemplate.fontFamily || 'Inter, system-ui, Arial'}; 
      color: #111; 
      font-size: 10px;
      padding: 12px;
      line-height: 1.4;
    }
    .header { border-bottom: 2px solid ${customTemplate.accentColor || '#2563eb'}; padding-bottom: 6px; margin-bottom: 8px; }
    .name { color: ${customTemplate.primaryColor || '#1e40af'}; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .title { color: #666; font-size: 9px; margin-bottom: 4px; }
    .contact { font-size: 8px; color: #555; }
    .section { margin-top: 10px; }
    .section h3 { color: ${customTemplate.primaryColor || '#1e40af'}; margin: 0 0 4px 0; font-size: 11px; font-weight: 600; }
    .item { border-left: 2px solid ${customTemplate.accentColor || '#2563eb'}; padding-left: 6px; margin: 4px 0; font-size: 9px; }
    .item strong { font-weight: 600; }
    .summary { font-size: 9px; color: #555; margin-top: 4px; }
  </style>`

  const basics = `
    <div class="header">
      <div class="name">${resume.basics.fullName || 'John Doe'}</div>
      <div class="title">${resume.basics.title || 'Software Engineer'}</div>
      <div class="contact">${resume.basics.email || ''} | ${resume.basics.phone || ''} | ${resume.basics.location || ''}</div>
    </div>
    <div class="summary">${(resume.basics.summary || '').substring(0, 100)}...</div>
  `

  const experience = resume.sections.experience.length > 0 ? `
    <div class="section">
      <h3>Experience</h3>
      ${resume.sections.experience.slice(0, 2).map(e => 
        `<div class="item"><strong>${e.role || 'Role'}</strong> at ${e.company || 'Company'}<div>${(e.summary || '').substring(0, 60)}...</div></div>`
      ).join('')}
    </div>` : ''

  const education = resume.sections.education.length > 0 ? `
    <div class="section">
      <h3>Education</h3>
      ${resume.sections.education.slice(0, 1).map(e => 
        `<div class="item"><strong>${e.degree || 'Degree'}</strong>, ${e.school || 'School'}</div>`
      ).join('')}
    </div>` : ''

  const skills = resume.sections.skills.length > 0 ? `
    <div class="section">
      <h3>Skills</h3>
      <div class="item">${resume.sections.skills.slice(0, 3).map(s => s.name || 'Skill').join(', ')}</div>
    </div>` : ''

  const base = `<!DOCTYPE html><html><head><meta charset='utf-8'/>${style}</head><body>
    ${basics}
    ${experience}
    ${education}
    ${skills}
  </body></html>`

  if (template === 'classic') return base
  if (template === 'minimal') return base.replace('<body>', `<body style="font-size:9px; line-height:1.4">`)
  if (template === 'modern') return base.replace('<body>', `<body style="max-width:100%; margin:0 auto;">`)
  if (template === 'elegant') return base.replace('<style>', `<style> body { letter-spacing: .1px } .name { font-size: 15px } .section h3 { text-transform: uppercase; font-size: 10px; }`)
  if (template === 'tech') return base.replace('<style>', `<style> body { background:#fafafa } .item { background:#fff; border:1px solid #eee; padding: 4px 6px; }`)
  if (template === 'custom') return base
  return base
}

export const Templates = () => {
  const current = useResumeStore(s => s.resume.template)
  const setTemplate = useResumeStore(s => s.setTemplate)
  const resume = useResumeStore(s => s.resume)

  return (
    <div className="space-y-8">
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
            Choose a Template
          </h2>
          <p className="text-sm text-slate-500 mt-1">Select a template that matches your style, or create your own</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {templateList.map(template => (
          <div
            key={template.id}
            className={`group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border-2 transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
              current === template.id
                ? 'border-blue-500 ring-4 ring-blue-500/20 shadow-blue-500/10'
                : 'border-slate-200/60 hover:border-blue-300'
            }`}
            onClick={() => setTemplate(template.id)}
          >
            <div className={`h-1.5 bg-gradient-to-r ${template.color} rounded-t-2xl`}></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                </div>
                {current === template.id && (
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              <PreviewThumbnail templateId={template.id} resume={resume} />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setTemplate(template.id)
                }}
                className={`w-full mt-4 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  current === template.id
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {current === template.id ? '✓ Selected' : 'Select Template'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <div className="bg-gradient-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-lg">
          <h3 className="text-lg font-bold text-slate-800 mb-2">Custom Template Editor</h3>
          <p className="text-sm text-slate-600 mb-6">Create and customize your own template with advanced styling options</p>
          <CustomTemplateEditor />
        </div>
      </div>
    </div>
  )
}
