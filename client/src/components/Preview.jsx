import { useMemo, useState } from 'react'
import { CheckCircle2, Download, FileCode2, FileText, LoaderCircle, Printer, ShieldCheck } from 'lucide-react'
import { exportResume } from '../lib/api'
import { renderFullResumeHtml } from '../renderResumeHtml'
import { selectActiveResume, useResumeStore } from '../store'
import { ResumeCanvas } from './ResumeCanvas'

const downloadBlob = (content, type, name) => {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = name; anchor.click(); URL.revokeObjectURL(url)
}

export const Preview = () => {
  const resume = useResumeStore(selectActiveResume)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const html = useMemo(() => renderFullResumeHtml(resume), [resume])
  if (!resume) return null

  const runExport = async type => {
    setBusy(type); setError('')
    try { await exportResume(type, html, resume.name, resume) }
    catch (err) { setError(`${type.toUpperCase()} export failed: ${err.message}`) }
    finally { setBusy('') }
  }

  const print = () => {
    const frame = document.getElementById('final-resume-frame')
    frame?.contentWindow?.focus(); frame?.contentWindow?.print()
  }

  return <div className="export-page">
    <aside className="export-panel"><div><span className="eyebrow">Ready to share</span><h1>Export with confidence.</h1><p>Your document uses the same A4 layout in preview, PDF and DOCX.</p></div>
      <div className="export-card"><h2>Download</h2><button className="export-option" disabled={busy} onClick={() => runExport('pdf')}><span className="file-icon pdf"><FileText size={20} /></span><span><strong>PDF document</strong><small>Best for applications and sharing</small></span>{busy === 'pdf' ? <LoaderCircle className="spin" size={19} /> : <Download size={18} />}</button><button className="export-option" disabled={busy} onClick={() => runExport('docx')}><span className="file-icon docx"><FileText size={20} /></span><span><strong>Word document</strong><small>Editable Microsoft Word format</small></span>{busy === 'docx' ? <LoaderCircle className="spin" size={19} /> : <Download size={18} />}</button><button className="export-option" onClick={print}><span className="file-icon print"><Printer size={20} /></span><span><strong>Print or save locally</strong><small>Use your browser’s print dialog</small></span><Printer size={18} /></button></div>
      <div className="export-card compact-card"><h2>Source & backup</h2><button className="small-export" onClick={() => downloadBlob(html, 'text/html;charset=utf-8', `${resume.name}.html`)}><FileCode2 size={16} /> HTML</button><button className="small-export" onClick={() => downloadBlob(JSON.stringify(resume, null, 2), 'application/json', `${resume.name}.json`)}><ShieldCheck size={16} /> JSON backup</button></div>
      {error && <div className="form-message error">{error}</div>}
      <div className="quality-list"><h3>Export check</h3><p><CheckCircle2 size={16} /> Selectable, searchable text</p><p><CheckCircle2 size={16} /> A4 print dimensions</p><p><CheckCircle2 size={16} /> Consistent colours and spacing</p></div>
    </aside>
    <section className="final-preview"><div className="preview-label"><span><i /> Final preview</span><small>A4 · 100%</small></div><ResumeCanvas id="final-resume-frame" resume={resume} scale={1} className="final-resume-canvas" /></section>
  </div>
}
