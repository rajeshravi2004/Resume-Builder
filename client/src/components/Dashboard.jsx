import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, FilePlus2, FileText, ImportIcon, MoreHorizontal, Plus, Search, Sparkles, Trash2, UserPlus, Users, X } from 'lucide-react'
import { useResumeStore } from '../store'
import { analyzeResume } from '../lib/ats'
import { ConfirmModal } from './AppModal'
import { LinkedInImport } from './LinkedInImport'

const initials = name => name?.split(/\s+/).map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'NP'
const relativeDate = value => {
  const days = Math.floor((Date.now() - new Date(value).getTime()) / 86400000)
  if (days <= 0) return 'Edited today'
  if (days === 1) return 'Edited yesterday'
  return `Edited ${days} days ago`
}

function Modal({ title, description, onClose, children }) {
  return <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-scrim" onClick={onClose} aria-label="Close" /><div className="modal-card"><div className="modal-head"><div><h2>{title}</h2><p>{description}</p></div><button className="icon-button" onClick={onClose}><X size={19} /></button></div>{children}</div></div>
}

export const Dashboard = () => {
  const navigate = useNavigate()
  const profiles = useResumeStore(s => s.profiles)
  const resumes = useResumeStore(s => s.resumes)
  const addProfile = useResumeStore(s => s.addProfile)
  const addResume = useResumeStore(s => s.addResume)
  const importResume = useResumeStore(s => s.importResume)
  const updateProfile = useResumeStore(s => s.updateProfile)
  const duplicateResume = useResumeStore(s => s.duplicateResume)
  const removeResume = useResumeStore(s => s.removeResume)
  const setActiveResume = useResumeStore(s => s.setActiveResume)
  const [search, setSearch] = useState('')
  const [filterProfile, setFilterProfile] = useState('all')
  const [modal, setModal] = useState(null)
  const [profileForm, setProfileForm] = useState({ name: '', headline: '', email: '' })
  const [resumeForm, setResumeForm] = useState({ profileId: profiles[0]?.id || '', name: '', targetRole: '' })
  const [menu, setMenu] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => resumes.filter(resume => {
    const profile = profiles.find(item => item.id === resume.profileId)
    const matchesProfile = filterProfile === 'all' || resume.profileId === filterProfile
    const haystack = `${resume.name} ${resume.targetRole} ${profile?.name}`.toLowerCase()
    return matchesProfile && haystack.includes(search.toLowerCase())
  }), [resumes, profiles, filterProfile, search])

  const openResume = id => { setActiveResume(id); navigate('/editor') }
  const createProfile = event => {
    event.preventDefault()
    const id = addProfile(profileForm)
    setResumeForm({ profileId: id, name: '', targetRole: '' })
    setModal('resume')
  }
  const createResume = event => {
    event.preventDefault()
    const id = addResume(resumeForm.profileId, resumeForm)
    setModal(null)
    openResume(id)
  }
  const applyLinkedIn = (data, target) => {
    let profileId = target
    if (target === 'new') profileId = addProfile({ name: data.basics.fullName, headline: data.basics.title, email: data.basics.email, phone: data.basics.phone, location: data.basics.location, linkedin: data.basics.linkedin })
    else updateProfile(profileId, { name: data.basics.fullName, headline: data.basics.title, email: data.basics.email, phone: data.basics.phone, location: data.basics.location, linkedin: data.basics.linkedin })
    const id = addResume(profileId, { name: `${data.basics.title || 'Professional'} resume`, targetRole: data.basics.title })
    importResume(data)
    setModal(null)
    openResume(id)
  }

  return <div className="dashboard-page">
    <section className="dashboard-hero">
      <div><span className="eyebrow">Your career workspace</span><h1>Good morning, <em>{profiles[0]?.name?.split(' ')[0] || 'there'}.</em></h1><p>Manage every person and every tailored resume from one calm, professional workspace.</p></div>
      <div className="hero-actions"><button className="button linkedin-button" onClick={() => setModal('linkedin')}><ImportIcon size={17} /> Import LinkedIn</button><button className="button secondary" onClick={() => setModal('profile')}><UserPlus size={17} /> Add person</button><button className="button primary" onClick={() => setModal('resume')} disabled={!profiles.length}><FilePlus2 size={17} /> New resume</button></div>
    </section>

    <section className="metric-strip">
      <div><span className="metric-icon indigo"><Users size={18} /></span><p><strong>{profiles.length}</strong><small>People</small></p></div>
      <div><span className="metric-icon amber"><FileText size={18} /></span><p><strong>{resumes.length}</strong><small>Resumes</small></p></div>
      <div><span className="metric-icon green"><Sparkles size={18} /></span><p><strong>AI ready</strong><small>Writing & design</small></p></div>
    </section>

    <section className="profiles-section">
      <div className="section-heading"><div><h2>People</h2><p>Master identities that can power multiple resumes.</p></div><button className="text-button with-icon" onClick={() => setModal('profile')}><Plus size={15} /> Add person</button></div>
      <div className="profile-row">
        <button onClick={() => setFilterProfile('all')} className={`profile-pill ${filterProfile === 'all' ? 'active' : ''}`}><span className="avatar neutral"><Users size={18} /></span><span><strong>Everyone</strong><small>{resumes.length} resumes</small></span></button>
        {profiles.map((profile, index) => <button key={profile.id} onClick={() => setFilterProfile(profile.id)} className={`profile-pill ${filterProfile === profile.id ? 'active' : ''}`}><span className={`avatar tone-${index % 4}`}>{initials(profile.name)}</span><span><strong>{profile.name}</strong><small>{resumes.filter(item => item.profileId === profile.id).length} resumes</small></span></button>)}
        <button className="add-profile-pill" onClick={() => setModal('profile')}><Plus size={17} /> Add person</button>
      </div>
    </section>

    <section className="resume-library">
      <div className="library-head"><div><h2>Resume library</h2><p>{filtered.length} {filtered.length === 1 ? 'document' : 'documents'} in this view</p></div><div className="library-tools"><label className="search-field"><Search size={16} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search resumes" /></label><button className="button primary compact" onClick={() => setModal('resume')} disabled={!profiles.length}><Plus size={16} /> New</button></div></div>
      {filtered.length ? <div className="resume-grid">{filtered.map((resume, index) => {
        const profile = profiles.find(item => item.id === resume.profileId)
        const atsScore = analyzeResume(resume).overall
        return <article className="resume-card" key={resume.id} onClick={() => openResume(resume.id)}>
          <div className={`resume-cover cover-${index % 4}`}><div className="paper-mini"><div className="paper-name">{profile?.name}</div><div className="paper-role">{resume.data.basics.title || resume.name}</div><i /><i /><i className="short" /><b>{initials(profile?.name)}</b></div><span className="status-badge">{resume.status}</span><span className={`card-ats-score ats-${atsScore >= 80 ? 'high' : atsScore >= 60 ? 'mid' : 'low'}`}>ATS {atsScore}</span></div>
          <div className="resume-card-body"><div className="card-title-line"><div><h3>{resume.name}</h3><p>{profile?.name} · {resume.targetRole || 'General resume'}</p></div><button className="icon-button" onClick={event => { event.stopPropagation(); setMenu(menu === resume.id ? null : resume.id) }}><MoreHorizontal size={18} /></button>{menu === resume.id && <div className="card-menu"><button onClick={event => { event.stopPropagation(); const id = duplicateResume(resume.id); setMenu(null); openResume(id) }}><Copy size={15} /> Duplicate</button><button className="danger" onClick={event => { event.stopPropagation(); setDeleteTarget(resume); setMenu(null) }}><Trash2 size={15} /> Delete</button></div>}</div><div className="card-meta"><span>{relativeDate(resume.updatedAt)}</span><span>{resume.design.template}</span></div></div>
        </article>
      })}<button className="new-resume-card" onClick={() => setModal('resume')}><span><Plus size={22} /></span><strong>Create another resume</strong><small>Start from a person’s master details</small></button></div> : <div className="empty-state"><span><Search size={24} /></span><h3>No resumes found</h3><p>Try another search or create a new tailored resume.</p></div>}
    </section>

    {modal === 'profile' && <Modal title="Add a person" description="Create a reusable identity for this workspace." onClose={() => setModal(null)}><form onSubmit={createProfile} className="modal-form"><label>Full name<input autoFocus required value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} placeholder="e.g. Priya Sharma" /></label><label>Professional headline<input value={profileForm.headline} onChange={e => setProfileForm({ ...profileForm, headline: e.target.value })} placeholder="e.g. Product Designer" /></label><label>Email address<input type="email" value={profileForm.email} onChange={e => setProfileForm({ ...profileForm, email: e.target.value })} placeholder="priya@example.com" /></label><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancel</button><button className="button primary">Continue to resume</button></div></form></Modal>}
    {modal === 'resume' && <Modal title="Create a new resume" description="Choose whose details to use, then tailor it for an opportunity." onClose={() => setModal(null)}><form onSubmit={createResume} className="modal-form"><label>Person<select required value={resumeForm.profileId} onChange={e => setResumeForm({ ...resumeForm, profileId: e.target.value })}>{profiles.map(profile => <option value={profile.id} key={profile.id}>{profile.name}</option>)}</select></label><label>Resume name<input autoFocus required value={resumeForm.name} onChange={e => setResumeForm({ ...resumeForm, name: e.target.value })} placeholder="e.g. Senior Frontend — Acme" /></label><label>Target role or company<input value={resumeForm.targetRole} onChange={e => setResumeForm({ ...resumeForm, targetRole: e.target.value })} placeholder="e.g. Senior Frontend Engineer" /></label><div className="modal-actions"><button type="button" className="button secondary" onClick={() => setModal(null)}>Cancel</button><button className="button primary">Create resume</button></div></form></Modal>}
    {modal === 'linkedin' && <LinkedInImport profiles={profiles} onClose={() => setModal(null)} onApply={applyLinkedIn} />}
    {deleteTarget && <ConfirmModal title="Delete this resume?" description={`“${deleteTarget.name}” will be removed from this workspace. This cannot be undone.`} confirmLabel="Delete resume" onClose={() => setDeleteTarget(null)} onConfirm={() => { removeResume(deleteTarget.id); setDeleteTarget(null) }} />}
  </div>
}
