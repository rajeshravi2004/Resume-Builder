import { useRef, useState } from 'react'
import { Check, Sparkles, WandSparkles, X } from 'lucide-react'
import { requestAi } from '../lib/api'

const quickActions = [
  { id: 'strengthen', label: 'Strengthen impact', prompt: 'Rewrite this resume text with stronger action verbs and outcome-focused language. Do not invent metrics or facts.' },
  { id: 'concise', label: 'Make concise', prompt: 'Make this resume text concise, direct, and easy to scan while preserving every factual claim.' },
  { id: 'ats', label: 'ATS polish', prompt: 'Improve this resume text for ATS clarity and relevant professional keywords without keyword stuffing or inventing details.' },
  { id: 'grammar', label: 'Fix grammar', prompt: 'Correct grammar, spelling, and clarity while keeping the original voice and meaning.' },
]

export function AiTextButton({ value, onApply, textareaRef, context = 'resume content' }) {
  const [open, setOpen] = useState(false)
  const [instruction, setInstruction] = useState('')
  const [result, setResult] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const selection = useRef({ start: 0, end: 0 })

  const launch = () => {
    const node = textareaRef?.current
    selection.current = node ? { start: node.selectionStart, end: node.selectionEnd } : { start: 0, end: 0 }
    setResult(''); setError(''); setOpen(true)
  }

  const run = async prompt => {
    const { start, end } = selection.current
    const selected = end > start ? value.slice(start, end) : value
    if (!selected.trim()) { setError('Add some text first, then ask AI to improve it.'); return }
    setBusy(true); setError('')
    try {
      const data = await requestAi({ type: 'refine', text: selected, instruction: prompt, context })
      setResult(data.text || '')
    } catch (err) { setError(err.message) }
    finally { setBusy(false) }
  }

  const apply = () => {
    const { start, end } = selection.current
    onApply(end > start ? `${value.slice(0, start)}${result}${value.slice(end)}` : result)
    setOpen(false)
  }

  return <>
    <button type="button" className="ai-field-button" onClick={launch}><Sparkles size={14} /> Refine with AI</button>
    {open && <div className="modal-layer ai-modal" role="dialog" aria-modal="true"><button className="modal-scrim" onClick={() => setOpen(false)} aria-label="Close" /><div className="modal-card"><div className="modal-head"><div><span className="ai-kicker"><Sparkles size={14} /> AI writing partner</span><h2>Refine this text</h2><p>{selection.current.end > selection.current.start ? 'Only your selected text will be replaced.' : 'The full field will be refined.'}</p></div><button className="icon-button" onClick={() => setOpen(false)}><X size={19} /></button></div>
      <div className="quick-ai-grid">{quickActions.map(action => <button disabled={busy} key={action.id} onClick={() => run(action.prompt)}><WandSparkles size={15} /> {action.label}</button>)}</div>
      <div className="ai-custom"><label>Or give a specific instruction<textarea value={instruction} onChange={e => setInstruction(e.target.value)} rows={2} placeholder="e.g. Make it sound more senior and emphasise collaboration" /></label><button className="button dark compact" disabled={busy || !instruction.trim()} onClick={() => run(instruction)}>{busy ? 'Refining…' : 'Run instruction'}</button></div>
      {error && <div className="form-message error">{error}</div>}
      {result && <div className="ai-result"><div><span>Suggested version</span><small>Review before replacing</small></div><textarea readOnly rows={6} value={result} /><button className="button primary wide" onClick={apply}><Check size={16} /> Use this version</button></div>}
    </div></div>}
  </>
}
