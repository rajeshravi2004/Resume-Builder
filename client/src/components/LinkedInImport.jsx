import { useMemo, useState } from 'react'
import { ArrowRight, Check, FileText, ImportIcon, Link2, LoaderCircle, Search, ShieldCheck, X } from 'lucide-react'
import { requestAi } from '../lib/api'

const normalizeUrl = value => {
  const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`
  const parsed = new URL(withProtocol)
  if (!/(^|\.)linkedin\.com$/i.test(parsed.hostname) || !/^\/in\/[^/]+/i.test(parsed.pathname)) throw new Error('Enter a LinkedIn profile URL such as linkedin.com/in/username.')
  return `${parsed.origin}${parsed.pathname}`
}

export function LinkedInImport({ profiles, onClose, onApply }) {
  const [target, setTarget] = useState('new')
  const [url, setUrl] = useState('')
  const [parsed, setParsed] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const summary = useMemo(() => parsed ? [
    `${parsed.sections.experience?.length || 0} roles`,
    `${parsed.sections.education?.length || 0} education`,
    `${parsed.sections.skills?.length ? parsed.sections.skills[0].level.split(',').filter(Boolean).length : 0} skills`,
  ] : [], [parsed])

  const extractProfile = async event => {
    event.preventDefault()
    setBusy(true); setError('')
    try {
      const linkedinUrl = normalizeUrl(url)
      const result = await requestAi({ type: 'linkedin', url: linkedinUrl })
      setUrl(linkedinUrl)
      setParsed(result)
    } catch (reason) { setError(reason.message || 'The profile could not be imported.') }
    finally { setBusy(false) }
  }

  return <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-scrim" onClick={onClose} aria-label="Close" /><div className="modal-card linkedin-modal">
    <div className="modal-head"><div><span className="linkedin-kicker"><ImportIcon size={16} /> LinkedIn AI import</span><h2>Paste a profile. Get a resume.</h2><p>AI reads the publicly available profile, structures verified details, and lets you review them before anything is saved.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19} /></button></div>
    {!parsed ? <form onSubmit={extractProfile}>
      <div className="privacy-note"><ShieldCheck size={16} /><span><strong>Accuracy guardrails.</strong> Missing or private information stays blank. AI is instructed never to invent experience or achievements.</span></div>
      <label className="linkedin-url-field"><span>LinkedIn profile URL</span><div><Link2 size={17} /><input autoFocus type="text" inputMode="url" value={url} onChange={event => setUrl(event.target.value)} placeholder="https://www.linkedin.com/in/username" /></div></label>
      <div className="linkedin-process"><span><Search size={16} /></span><div><strong>What happens next</strong><p>The configured LLM searches the exact public profile, extracts resume-ready fields, then opens a review screen. Private profiles may return limited data.</p></div></div>
      {error && <div className="form-message error">{error}</div>}
      <button className="button primary wide" disabled={busy || !url.trim()}>{busy ? <><LoaderCircle className="spin" size={16} /> Reading public profile...</> : <><ArrowRight size={16} /> Import with AI</>}</button>
    </form> : <>
      <div className="import-review"><div className="import-avatar">{parsed.basics.fullName.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</div><div><span className="eyebrow">AI extraction ready</span><h3>{parsed.basics.fullName}</h3><p>{parsed.basics.title || 'Professional profile'}</p></div></div>
      <div className="import-facts">{summary.map(item => <span key={item}><Check size={14} />{item}</span>)}</div>
      {parsed.verification?.warnings?.length > 0 && <div className="import-warnings"><strong>Review notes</strong>{parsed.verification.warnings.map(warning => <p key={warning}>{warning}</p>)}</div>}
      <div className="import-preview-grid"><label>Name<input value={parsed.basics.fullName} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, fullName: event.target.value } })} /></label><label>Headline<input value={parsed.basics.title} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, title: event.target.value } })} /></label><label>Email<input value={parsed.basics.email} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, email: event.target.value } })} /></label><label>Location<input value={parsed.basics.location} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, location: event.target.value } })} /></label></div>
      <label className="import-target">Add to<select value={target} onChange={event => setTarget(event.target.value)}><option value="new">Create a new person</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
      <div className="modal-actions"><button className="button secondary" onClick={() => setParsed(null)}>Try another URL</button><button className="button primary" disabled={!parsed.basics.fullName.trim()} onClick={() => onApply(parsed, target)}><FileText size={16} /> Create editable resume</button></div>
    </>}
  </div></div>
}
