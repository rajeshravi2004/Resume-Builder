import { useMemo, useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, FileSearch, KeyRound, ShieldCheck, Target, WandSparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { analyzeResume } from '../lib/ats'
import { selectActiveResume, useResumeStore } from '../store'

const tone = score => score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'weak'

export function ScoreRing({ score, size = 'large' }) {
  return <div className={`score-ring ${size} ${tone(score)}`} style={{ '--score': score }}><div><strong>{score}</strong><small>/100</small></div></div>
}

export const AtsChecker = () => {
  const resume = useResumeStore(selectActiveResume)
  const navigate = useNavigate()
  const [jobDescription, setJobDescription] = useState('')
  const report = useMemo(() => analyzeResume(resume, jobDescription), [resume, jobDescription])
  const failed = report.checks.filter(check => !check.pass)

  return <div className="ats-page">
    <section className="ats-heading"><div><span className="eyebrow">ATS intelligence</span><h1>Know what gets through.</h1><p>A transparent, live check of content quality, parser safety and job-description match.</p></div><button className="button secondary" onClick={() => navigate('/design')}><WandSparkles size={16} /> Compare templates</button></section>
    <section className="ats-overview">
      <div className="ats-score-card"><ScoreRing score={report.overall} /><div><span className={`score-label ${tone(report.overall)}`}>{report.overall >= 85 ? 'Interview ready' : report.overall >= 70 ? 'Strong foundation' : 'Needs attention'}</span><h2>{resume.name}</h2><p>{jobDescription.trim() ? 'Score includes this job description.' : 'Add a job description for role-specific keyword matching.'}</p></div></div>
      <div className="ats-breakdown">
        <div><span><FileSearch size={17} /> Content quality</span><strong>{report.contentScore}</strong><i><b style={{ width: `${report.contentScore}%` }} /></i></div>
        <div><span><ShieldCheck size={17} /> Parser safety</span><strong>{report.formatScore}</strong><i><b style={{ width: `${report.formatScore}%` }} /></i></div>
        <div><span><KeyRound size={17} /> Keyword match</span><strong>{report.keywordScore ?? '—'}</strong><i><b style={{ width: `${report.keywordScore || 0}%` }} /></i></div>
      </div>
    </section>
    <div className="ats-grid">
      <section className="ats-panel job-panel"><div className="ats-panel-head"><span><Target size={18} /></span><div><h2>Target job</h2><p>Paste the vacancy to find important missing terms.</p></div></div><textarea rows={11} value={jobDescription} onChange={event => setJobDescription(event.target.value)} placeholder="Paste the complete job description here..." /><div className="job-hint"><span>{jobDescription.length.toLocaleString()} characters</span><button className="text-button" disabled={!jobDescription} onClick={() => setJobDescription('')}>Clear</button></div>
        {jobDescription && <div className="keyword-summary"><div><strong>{report.matchedKeywords.length}</strong><span>matched</span></div><div><strong>{report.missingKeywords.length}</strong><span>missing</span></div></div>}
        {report.missingKeywords.length > 0 && <div className="keyword-list"><small>Missing keywords to review</small><div>{report.missingKeywords.map(keyword => <span key={keyword}>{keyword}</span>)}</div><p>Only add terms that truthfully describe your experience.</p></div>}
      </section>
      <section className="ats-panel"><div className="ats-panel-head"><span><CheckCircle2 size={18} /></span><div><h2>Priority fixes</h2><p>{failed.length ? `${failed.length} improvements can raise the score.` : 'Core checks look healthy.'}</p></div></div><div className="ats-checks">{report.checks.map(check => <button key={check.id} onClick={() => { navigate('/editor'); setTimeout(() => document.getElementById(`section-${check.section}`)?.scrollIntoView({ behavior: 'smooth' }), 150) }}><span className={check.pass ? 'pass' : 'warn'}>{check.pass ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}</span><div><strong>{check.label}</strong><p>{check.pass ? `${check.points}/${check.max} points earned` : check.detail}</p></div><ChevronRight size={16} /></button>)}</div>
        {report.formatRisks.length > 0 && <div className="format-risks"><small>Template observations</small>{report.formatRisks.map(risk => <p key={risk}><AlertTriangle size={14} />{risk}</p>)}</div>}
      </section>
    </div>
  </div>
}
