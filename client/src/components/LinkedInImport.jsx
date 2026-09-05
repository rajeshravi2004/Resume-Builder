import { useMemo, useState } from 'react'
import { ArrowRight, Check, FileText, ImportIcon, LoaderCircle, LockKeyhole, Upload, X } from 'lucide-react'
import { parseLinkedInText, textFromImportFile } from '../lib/linkedinImport'

export function LinkedInImport({ profiles, onClose, onApply }) {
  const [target, setTarget] = useState('new')
  const [text, setText] = useState('')
  const [parsed, setParsed] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const summary = useMemo(() => parsed ? [
    `${parsed.sections.experience?.length || 0} roles`,
    `${parsed.sections.education?.length || 0} education`,
    `${parsed.sections.skills?.length ? parsed.sections.skills[0].level.split(',').length : 0} skills`,
  ] : [], [parsed])

  const parse = value => {
    const result = parseLinkedInText(value)
    if (!result.basics.fullName || result.sourceLength < 40) throw new Error('Not enough profile information was found. Paste the full profile or upload its PDF.')
    setParsed(result)
  }
  const readFile = async input => {
    const file = input?.target?.files?.[0] || input
    if (!file) return
    setBusy(true); setError('')
    try { const value = await textFromImportFile(file); setText(value); parse(value) }
    catch (reason) { setError(reason.message || 'This file could not be read.') }
    finally { setBusy(false) }
  }

  return <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-scrim" onClick={onClose} aria-label="Close" /><div className="modal-card linkedin-modal">
    <div className="modal-head"><div><span className="linkedin-kicker"><ImportIcon size={16} /> LinkedIn import</span><h2>Turn a profile into a resume.</h2><p>Upload your LinkedIn PDF or paste the profile text. Everything is parsed in this browser.</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div>
    <div className="privacy-note"><LockKeyhole size={16} /><span><strong>Private by design.</strong> The file is not sent to LinkedIn or an external scraping service.</span></div>
    {!parsed ? <>
      <div className="linkedin-steps"><strong>Fastest route:</strong> LinkedIn profile → More → Save to PDF → drop it here.</div>
      <label className={`linkedin-upload ${busy ? 'busy' : ''}`} onDragOver={event => event.preventDefault()} onDrop={event => { event.preventDefault(); readFile(event.dataTransfer.files?.[0]) }}><input type="file" accept=".pdf,.txt,.json,.csv" onChange={readFile} disabled={busy} />{busy ? <LoaderCircle className="spin" size={24} /> : <Upload size={24} />}<strong>{busy ? 'Reading your profile...' : 'Drop a LinkedIn PDF or choose a file'}</strong><span>PDF, TXT, JSON or CSV</span></label>
      <div className="import-divider"><span>or paste copied profile text</span></div>
      <textarea className="linkedin-paste" rows={9} value={text} onChange={event => setText(event.target.value)} placeholder={'Your name\nProfessional headline\nLocation\n\nExperience\nRole\nCompany\n2023 - Present\nAchievement...'} />
      {error && <div className="form-message error">{error}</div>}
      <button className="button primary wide" disabled={busy || text.trim().length < 40} onClick={() => { try { setError(''); parse(text) } catch (reason) { setError(reason.message) } }}><ArrowRight size={16} /> Extract profile</button>
    </> : <>
      <div className="import-review"><div className="import-avatar">{parsed.basics.fullName.split(/\s+/).map(part => part[0]).slice(0, 2).join('')}</div><div><span className="eyebrow">Ready to review</span><h3>{parsed.basics.fullName}</h3><p>{parsed.basics.title || 'Professional profile'}</p></div></div>
      <div className="import-facts">{summary.map(item => <span key={item}><Check size={14} />{item}</span>)}</div>
      <div className="import-preview-grid"><label>Name<input value={parsed.basics.fullName} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, fullName: event.target.value } })} /></label><label>Headline<input value={parsed.basics.title} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, title: event.target.value } })} /></label><label>Email<input value={parsed.basics.email} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, email: event.target.value } })} /></label><label>Location<input value={parsed.basics.location} onChange={event => setParsed({ ...parsed, basics: { ...parsed.basics, location: event.target.value } })} /></label></div>
      <label className="import-target">Add to<select value={target} onChange={event => setTarget(event.target.value)}><option value="new">Create a new person</option>{profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}</select></label>
      <div className="modal-actions"><button className="button secondary" onClick={() => setParsed(null)}>Back</button><button className="button primary" onClick={() => onApply(parsed, target)}><FileText size={16} /> Create editable resume</button></div>
    </>}
  </div></div>
}
