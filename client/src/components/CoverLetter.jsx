import { useEffect, useMemo, useRef, useState } from 'react'
import { Download, FileText, LoaderCircle, Printer, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { selectActiveResume, useResumeStore } from '../store'
import { exportResume } from '../lib/api'
import { createCoverLetterDraft, getCoverLetter, renderCoverLetterHtml } from '../lib/coverLetter'
import '../coverLetter.css'

function LetterPreview({ html, frame }) {
  const container = useRef(null)
  const [scale, setScale] = useState(0.6)
  const [height, setHeight] = useState(1123)
  useEffect(() => {
    const observer = new ResizeObserver(entries => setScale(Math.min(1, entries[0].contentRect.width / 794)))
    observer.observe(container.current)
    return () => observer.disconnect()
  }, [])
  return <div className="letter-paper-container" ref={container} style={{ height: height * scale }}><iframe ref={frame} title="Live cover letter preview" srcDoc={html} sandbox="allow-same-origin allow-modals" style={{ width: 794, height, transform: `scale(${scale})` }} onLoad={event => { const doc = event.currentTarget.contentDocument; setHeight(Math.max(1123, doc?.body?.scrollHeight || 0)) }} /></div>
}

export function CoverLetter() {
  const resume = useResumeStore(selectActiveResume)
  const setCoverLetter = useResumeStore(state => state.setCoverLetter)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const frame = useRef(null)
  const html = useMemo(() => renderCoverLetterHtml(resume), [resume])
  if (!resume) return <div className="letter-empty"><FileText size={32} /><h1>Create a cover letter</h1><p>Create or select a resume first. Your letter will use its contact details and be saved alongside it.</p><Link className="button primary" to="/">Open workspace</Link></div>
  const letter = getCoverLetter(resume)
  const update = patch => setCoverLetter(resume.id, { ...letter, ...patch })
  const hasBody = Boolean(letter.body.trim())
  const runExport = async type => {
    setBusy(type); setError('')
    try { await exportResume(type, html, `${resume.data.basics.fullName || resume.name}-cover-letter${letter.company ? `-${letter.company}` : ''}`, { ...resume, documentType: 'cover-letter', coverLetter: letter }) }
    catch (err) { setError(`${type.toUpperCase()} export failed: ${err.message}`) }
    finally { setBusy('') }
  }
  const field = (key, label, placeholder = '', multiline = false) => <label className={multiline ? 'letter-field full' : 'letter-field'}><span>{label}</span>{multiline ? <textarea rows={3} value={letter[key]} onChange={event => update({ [key]: event.target.value })} placeholder={placeholder} maxLength={2000} /> : <input type={key === 'date' ? 'date' : 'text'} value={letter[key]} onChange={event => update({ [key]: event.target.value })} placeholder={placeholder} maxLength={250} />}</label>
  return <div className="letter-page">
    <section className="letter-editor">
      <span className="eyebrow">Complete your application</span><h1>A letter that opens doors.</h1><p className="letter-intro">Create a tailored cover letter for <strong>{resume.name}</strong>. It saves automatically with this resume.</p>
      <div className="letter-sender"><FileText size={18} /><div><strong>{resume.data.basics.fullName || 'Add your name'}</strong><small>Contact details come from your resume.</small></div><Link to="/editor">Edit details</Link></div>
      <div className="letter-fields">
        {field('company', 'Company', 'Acme Inc.')}{field('role', 'Position', 'Product Designer')}
        {field('recipient', 'Recipient', 'Hiring Manager')}{field('date', 'Date')}
        {field('address', 'Company address (optional)', 'City, country', true)}
        {field('subject', 'Subject (optional)', letter.role ? `Application for ${letter.role}` : 'Application for…')}{field('greeting', 'Greeting', 'Dear Hiring Manager,')}
      </div>
      <div className="letter-body-heading"><label htmlFor="letter-body">Your letter</label><button className="button secondary compact" disabled={hasBody} onClick={() => update({ body: createCoverLetterDraft(resume, letter) })}><Sparkles size={14} /> Start from resume</button></div>
      <p className="letter-hint">{hasBody ? 'Make it your own: explain why this company and add your most relevant achievements.' : 'Write your letter or create an editable starter using the facts in your resume.'}</p>
      <textarea id="letter-body" className="letter-body" rows={15} value={letter.body} onChange={event => update({ body: event.target.value })} placeholder="Tell the hiring team why you are interested and how your experience fits the role…" maxLength={20000} />
      <div className="letter-word-count">{letter.body.trim() ? letter.body.trim().split(/\s+/).length : 0} words · Aim for 250–400 words</div>
      <div className="letter-fields">{field('closing', 'Sign-off', 'Sincerely,')}</div>
      <div className="letter-downloads"><button className="button primary" disabled={!hasBody || Boolean(busy)} onClick={() => runExport('pdf')}>{busy === 'pdf' ? <LoaderCircle size={16} className="spin" /> : <Download size={16} />} Download PDF</button><button className="button secondary" disabled={!hasBody || Boolean(busy)} onClick={() => runExport('docx')}>{busy === 'docx' ? <LoaderCircle size={16} className="spin" /> : <FileText size={16} />} Word</button><button className="button secondary" disabled={!hasBody} onClick={() => { frame.current?.contentWindow?.focus(); frame.current?.contentWindow?.print() }}><Printer size={16} /> Print</button></div>
      {error && <div role="alert" className="form-message error">{error}</div>}
    </section>
    <section className="letter-preview"><div className="preview-label"><span><i /> Live cover letter</span><small>A4 · Matching resume colours</small></div><LetterPreview html={html} frame={frame} /><p>Your signature and contact details stay in sync with the selected resume.</p></section>
  </div>
}
