import { useMemo, useState } from 'react'
import { useResumeStore } from '../store'
import { Link } from 'react-router-dom'
import { renderFullResumeHtml } from '../renderResumeHtml'

export const Preview = () => {
  const resume = useResumeStore(s => s.resume)
  const [chromePath, setChromePath] = useState('')
  const [isExporting, setIsExporting] = useState(false)

  const renderedHtml = useMemo(() => renderFullResumeHtml(resume), [resume])

  const exportTo = async (type) => {
    setIsExporting(true)
    try {
      const endpoint = type === 'pdf' ? '/export/pdf' : '/export/docx'
      const apiUrl = import.meta.env.PROD ? '/api' : 'http://localhost:4000'
      const resp = await fetch(`${apiUrl}${endpoint}`, {
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

  const downloadHtml = () => {
    const blob = new Blob([renderedHtml], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resume.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Preview & Export
          </h2>
          <p className="text-sm text-slate-500 mt-1">Review your resume and export it as PDF or DOCX.</p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 3h6v6" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14L21 3" />
          </svg>
          Edit Resume
        </Link>
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
          <button
            type="button"
            onClick={downloadHtml}
            className="group flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-800 rounded-xl font-semibold text-sm hover:bg-slate-200 hover:scale-105 active:scale-95 transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v16h16V8.5L14.5 4H4z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 4v4h4" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 13h6m-6 4h6" />
            </svg>
            Download HTML
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
