import { useResumeStore } from '../store'
import { CustomTemplateEditor } from './custom/CustomTemplateEditor'
import { LayoutEditor } from './custom/LayoutEditor'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { renderThumbnailResumeHtml, renderTemplateSkeletonHtml } from '../renderResumeHtml'

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
    return renderThumbnailResumeHtml(previewResume)
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

export const Templates = () => {
  const current = useResumeStore(s => s.resume.template)
  const setTemplate = useResumeStore(s => s.setTemplate)
  const resume = useResumeStore(s => s.resume)
  const uploadedTemplateHtml = useResumeStore(s => s.resume.uploadedTemplateHtml)
  const setUploadedTemplateHtml = useResumeStore(s => s.setUploadedTemplateHtml)
  const clearUploadedTemplateHtml = useResumeStore(s => s.clearUploadedTemplateHtml)
  const [uploadedText, setUploadedText] = useState('')

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-linear-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Choose a Template
          </h2>
          <p className="text-sm text-slate-500 mt-1">Select a template that matches your style, or create your own custom design.</p>
        </div>
        <Link
          to="/preview"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Preview
        </Link>
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
            <div className={`h-1.5 bg-linear-to-r ${template.color} rounded-t-2xl`}></div>
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{template.name}</h3>
                  <p className="text-xs text-slate-500 mt-1">{template.description}</p>
                </div>
                {current === template.id && (
                  <div className="w-6 h-6 bg-linear-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
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
                    ? 'bg-linear-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {current === template.id ? '✓ Selected' : 'Select Template'}
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation()
                  const html = renderTemplateSkeletonHtml(template.id)
                  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `${template.id}-template.html`
                  a.click()
                  URL.revokeObjectURL(url)
                }}
                className="w-full mt-2 py-2.5 rounded-xl font-semibold text-xs border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200"
              >
                Download HTML Template
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 space-y-8">
        <div className="bg-linear-to-br from-blue-50/80 via-indigo-50/80 to-purple-50/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-200/60 shadow-lg space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Custom Template Editor</h3>
            <p className="text-sm text-slate-600">
              Configure colors, fonts, and layout structure for the <span className="font-semibold">Custom</span>{' '}
              template.
            </p>
          </div>
          <CustomTemplateEditor />
          <LayoutEditor />
        </div>

        <div className="bg-linear-to-br from-slate-50 via-slate-50 to-slate-100 rounded-2xl p-6 border border-slate-200/70 shadow-lg">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Upload HTML Template</h3>
              <p className="text-sm text-slate-600 mt-1">
                Paste or upload an HTML resume template from the web and let your current resume data fill it.
              </p>
            </div>
            {uploadedTemplateHtml && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                Uploaded template active
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">
                Paste HTML
              </label>
              <textarea
                value={uploadedText || uploadedTemplateHtml || ''}
                onChange={e => {
                  setUploadedText(e.target.value)
                }}
                rows={10}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 bg-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                placeholder="Paste the full HTML of your resume template here..."
              />
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    const html = uploadedText.trim()
                    if (!html) return
                    setUploadedTemplateHtml(html)
                    setTemplate('uploaded')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Use Pasted HTML
                </button>
                <button
                  onClick={() => {
                    clearUploadedTemplateHtml()
                    setUploadedText('')
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
                >
                  Clear Uploaded Template
                </button>
                <button
                  type="button"
                  disabled={!uploadedTemplateHtml}
                  onClick={() => {
                    if (!uploadedTemplateHtml) return
                    const blob = new Blob([uploadedTemplateHtml], { type: 'text/html;charset=utf-8' })
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = url
                    a.download = 'resume-template.html'
                    a.click()
                    URL.revokeObjectURL(url)
                  }}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border ${
                    uploadedTemplateHtml
                      ? 'border-slate-300 bg-white text-slate-800 hover:bg-slate-50'
                      : 'border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed'
                  } transition-colors`}
                >
                  Download Current HTML
                </button>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <h4 className="font-semibold text-slate-800">Placeholders</h4>
              <p>
                Use the following tokens in your HTML. They will be replaced with your current resume data:
              </p>
              <ul className="grid grid-cols-2 gap-x-6 gap-y-1 font-mono text-[11px] bg-white border border-slate-200 rounded-xl p-3">
                <li>{'{{fullName}}'}</li>
                <li>{'{{title}}'}</li>
                <li>{'{{email}}'}</li>
                <li>{'{{phone}}'}</li>
                <li>{'{{location}}'}</li>
                <li>{'{{website}}'}</li>
                <li>{'{{summary}}'}</li>
              </ul>

              <h4 className="font-semibold text-slate-800 mt-3">Repeating sections</h4>
              <p>
                Wrap section blocks with <code className="px-1 py-0.5 bg-slate-100 rounded">{'{#section}'}</code> and{' '}
                <code className="px-1 py-0.5 bg-slate-100 rounded">{'{/section}'}</code> tags. Supported sections:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <span className="font-mono text-[11px]">{'{#experience} ... {/experience}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007brole}} { \u007bcompany}} { \u007bperiod}} { \u007bsummary}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#projects} ... {/projects}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bname}} { \u007btech}} { \u007bdescription}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#education} ... {/education}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bdegree}} { \u007bschool}} { \u007bperiod}} { \u007bscore}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#skills} ... {/skills}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bname}} { \u007blevel}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#certifications} ... {/certifications}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bname}} { \u007byear}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#languages} ... {/languages}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bname}} { \u007blevel}}'}</span>
                </li>
                <li>
                  <span className="font-mono text-[11px]">{'{#interests} ... {/interests}'}</span> with{' '}
                  <span className="font-mono text-[11px]">{'{\u007bname}}'}</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 mt-2">
                You can grab any HTML resume template online, drop your placeholders into it once, and then reuse it with any data.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
