import { useRef, useState } from 'react'
import { BadgeCheck, Briefcase, ChevronDown, ChevronUp, CircleUserRound, FileText, FolderKanban, GraduationCap, GripVertical, Heart, Languages, Link2, Mail, MapPin, Phone, Plus, RefreshCw, Sparkles, Trash2, WandSparkles } from 'lucide-react'
import { AiTextButton } from './AiAssist'
import { ResumeCanvas } from './ResumeCanvas'
import { SECTION_FIELDS, SECTION_META, selectActiveResume, useResumeStore } from '../store'

const icons = { experience: Briefcase, projects: FolderKanban, education: GraduationCap, skills: WandSparkles, certifications: BadgeCheck, languages: Languages, interests: Heart }

function Field({ field, value, onChange, context }) {
  const ref = useRef(null)
  return <label className={field.multiline ? 'field full' : 'field'}><span>{field.label}</span>{field.multiline ? <div className="textarea-wrap"><textarea ref={ref} rows={4} value={value || ''} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} /><AiTextButton value={value || ''} onApply={onChange} textareaRef={ref} context={context} /></div> : <input value={value || ''} placeholder={field.placeholder} onChange={e => onChange(e.target.value)} />}</label>
}

function SectionEditor({ sectionKey, active, onToggle }) {
  const items = useResumeStore(s => selectActiveResume(s)?.data.sections[sectionKey] || [])
  const addItem = useResumeStore(s => s.addItem)
  const updateItem = useResumeStore(s => s.updateItem)
  const removeItem = useResumeStore(s => s.removeItem)
  const moveItem = useResumeStore(s => s.moveItem)
  const fields = SECTION_FIELDS[sectionKey]
  const Icon = icons[sectionKey]

  return <section className={`editor-section ${active ? 'expanded' : ''}`} id={`section-${sectionKey}`}>
    <button type="button" className="editor-section-head" onClick={onToggle}><span className="section-icon"><Icon size={17} /></span><span><strong>{SECTION_META[sectionKey].label}</strong><small>{items.length} {items.length === 1 ? 'entry' : 'entries'}</small></span><ChevronDown size={18} /></button>
    {active && <div className="editor-section-body">
      {items.map((item, index) => <article className="entry-card" key={item.id}><div className="entry-top"><span className="drag-handle"><GripVertical size={16} /></span><strong>{item[fields[0].name] || `Untitled ${SECTION_META[sectionKey].label.toLowerCase()}`}</strong><div className="entry-actions"><button title="Move up" disabled={index === 0} onClick={() => moveItem(sectionKey, index, index - 1)}><ChevronUp size={15} /></button><button title="Move down" disabled={index === items.length - 1} onClick={() => moveItem(sectionKey, index, index + 1)}><ChevronDown size={15} /></button><button className="danger-icon" title="Delete" onClick={() => removeItem(sectionKey, item.id)}><Trash2 size={15} /></button></div></div><div className="fields-grid">{fields.map(field => <Field key={field.name} field={field} value={item[field.name]} context={`${SECTION_META[sectionKey].label}: ${item[fields[0].name] || ''}`} onChange={value => updateItem(sectionKey, item.id, { [field.name]: value })} />)}</div></article>)}
      <button className="add-entry" onClick={() => addItem(sectionKey, Object.fromEntries(fields.map(field => [field.name, ''])))}><Plus size={16} /> Add {SECTION_META[sectionKey].label.toLowerCase()} entry</button>
    </div>}
  </section>
}

export const Builder = () => {
  const resume = useResumeStore(selectActiveResume)
  const setBasics = useResumeStore(s => s.setBasics)
  const syncProfileToResume = useResumeStore(s => s.syncProfileToResume)
  const renameResume = useResumeStore(s => s.renameResume)
  const [openSections, setOpenSections] = useState(['basics', 'experience'])
  const summaryRef = useRef(null)
  if (!resume) return null

  const basics = resume.data.basics
  const completed = [basics.fullName, basics.title, basics.email, basics.summary, resume.data.sections.experience.length, resume.data.sections.education.length, resume.data.sections.skills.length].filter(Boolean).length
  const completion = Math.round((completed / 7) * 100)
  const toggle = key => setOpenSections(current => current.includes(key) ? current.filter(item => item !== key) : [...current, key])

  return <div className="builder-layout">
    <div className="builder-panel">
      <div className="editor-titlebar"><div><span className="eyebrow">Content editor</span><input className="resume-name-input" value={resume.name} onChange={e => renameResume(resume.id, e.target.value)} aria-label="Resume name" /><p>Tailor the story. Your changes appear in the live page.</p></div><div className="score-ring" style={{ '--score': `${completion * 3.6}deg` }}><span>{completion}%</span><small>Complete</small></div></div>
      <div className="profile-sync"><div className="section-icon"><CircleUserRound size={18} /></div><div><strong>Using this person’s master profile</strong><p>Refresh identity fields without changing tailored experience.</p></div><button className="button secondary compact" onClick={syncProfileToResume}><RefreshCw size={14} /> Sync details</button></div>

      <section className={`editor-section ${openSections.includes('basics') ? 'expanded' : ''}`} id="section-basics">
        <button type="button" className="editor-section-head" onClick={() => toggle('basics')}><span className="section-icon"><FileText size={17} /></span><span><strong>Profile & summary</strong><small>Your header and professional introduction</small></span><ChevronDown size={18} /></button>
        {openSections.includes('basics') && <div className="editor-section-body"><div className="fields-grid basics-grid">
          <label className="field"><span>Full name</span><input value={basics.fullName} onChange={e => setBasics({ fullName: e.target.value })} placeholder="Your full name" /></label>
          <label className="field"><span>Professional headline</span><input value={basics.title} onChange={e => setBasics({ title: e.target.value })} placeholder="Your current or target role" /></label>
          <label className="field icon-field"><span>Email</span><div><Mail size={15} /><input type="email" value={basics.email} onChange={e => setBasics({ email: e.target.value })} placeholder="name@example.com" /></div></label>
          <label className="field icon-field"><span>Phone</span><div><Phone size={15} /><input value={basics.phone} onChange={e => setBasics({ phone: e.target.value })} placeholder="+91 98765 43210" /></div></label>
          <label className="field icon-field"><span>Location</span><div><MapPin size={15} /><input value={basics.location} onChange={e => setBasics({ location: e.target.value })} placeholder="City, Country" /></div></label>
          <label className="field icon-field"><span>Portfolio</span><div><Link2 size={15} /><input value={basics.website} onChange={e => setBasics({ website: e.target.value })} placeholder="portfolio.com" /></div></label>
          <label className="field icon-field"><span>LinkedIn</span><div><Link2 size={15} /><input value={basics.linkedin || ''} onChange={e => setBasics({ linkedin: e.target.value })} placeholder="linkedin.com/in/yourname" /></div></label>
          <label className="field icon-field"><span>GitHub</span><div><Link2 size={15} /><input value={basics.github || ''} onChange={e => setBasics({ github: e.target.value })} placeholder="github.com/yourname" /></div></label>
          <label className="field full"><span>Professional summary</span><div className="textarea-wrap"><textarea ref={summaryRef} rows={5} value={basics.summary} onChange={e => setBasics({ summary: e.target.value })} placeholder="Write a focused summary of your experience and value…" /><div className="field-hint"><span>{basics.summary.length} characters</span><AiTextButton value={basics.summary} onApply={value => setBasics({ summary: value })} textareaRef={summaryRef} context={`${basics.title} professional summary`} /></div></div></label>
        </div></div>}
      </section>

      {Object.keys(SECTION_META).map(key => <SectionEditor key={key} sectionKey={key} active={openSections.includes(key)} onToggle={() => toggle(key)} />)}
      <div className="editor-tip"><Sparkles size={17} /><div><strong>Tailor for the role</strong><p>Mirror the language of the job description, but keep every claim truthful and specific.</p></div></div>
    </div>
    <aside className="live-preview-panel"><div className="preview-label"><span><i /> Live preview</span><small>A4 · {resume.design.template}</small></div><ResumeCanvas resume={resume} scale={0.66} /></aside>
  </div>
}
