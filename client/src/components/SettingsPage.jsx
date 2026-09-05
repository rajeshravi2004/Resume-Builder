import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, Cloud, Database, Download, KeyRound, LogOut, Save, Trash2, Upload, UserRound } from 'lucide-react'
import { getSystemStatus } from '../lib/api'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import { useResumeStore } from '../store'
import { ConfirmModal, NoticeModal } from './AppModal'

const downloadWorkspace = state => {
  const payload = JSON.stringify({ profiles: state.profiles, resumes: state.resumes, activeProfileId: state.activeProfileId, activeResumeId: state.activeResumeId }, null, 2)
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'resume-studio-workspace.json'; anchor.click(); URL.revokeObjectURL(url)
}

export const SettingsPage = () => {
  const profiles = useResumeStore(s => s.profiles)
  const resumes = useResumeStore(s => s.resumes)
  const updateProfile = useResumeStore(s => s.updateProfile)
  const removeProfile = useResumeStore(s => s.removeProfile)
  const replaceWorkspace = useResumeStore(s => s.replaceWorkspace)
  const [selected, setSelected] = useState(profiles[0]?.id)
  const profile = profiles.find(item => item.id === selected)
  const [draft, setDraft] = useState(profile || {})
  const [status, setStatus] = useState({ ok: false, aiConfigured: false })
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const fileRef = useRef(null)

  useEffect(() => { getSystemStatus().then(setStatus).catch(() => {}) }, [])
  useEffect(() => { setDraft(profile || {}) }, [profile])

  const importWorkspace = event => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result)
        if (!Array.isArray(data.profiles) || !Array.isArray(data.resumes)) throw new Error()
        replaceWorkspace(data)
      } catch { setNotice('This file is not a valid Resume Studio workspace backup. Your current data was not changed.') }
    }
    reader.readAsText(file); event.target.value = ''
  }

  return <div className="settings-page"><div className="settings-heading"><span className="eyebrow">Workspace settings</span><h1>Profiles, data and integrations.</h1><p>Manage reusable people records and confirm production services are connected.</p></div>
    <div className="settings-grid"><nav className="settings-nav"><h3>People</h3>{profiles.map(item => <button className={selected === item.id ? 'active' : ''} key={item.id} onClick={() => setSelected(item.id)}><span>{item.name?.slice(0, 2).toUpperCase()}</span><div><strong>{item.name}</strong><small>{resumes.filter(resume => resume.profileId === item.id).length} resumes</small></div></button>)}</nav>
      <div className="settings-content">
        {profile && <section className="settings-card"><div className="settings-card-head"><span className="settings-icon"><UserRound size={19} /></span><div><h2>Master profile</h2><p>These details can seed any new resume for this person.</p></div></div><div className="fields-grid"><label className="field"><span>Full name</span><input value={draft.name || ''} onChange={e => setDraft({ ...draft, name: e.target.value })} /></label><label className="field"><span>Headline</span><input value={draft.headline || ''} onChange={e => setDraft({ ...draft, headline: e.target.value })} /></label><label className="field"><span>Email</span><input value={draft.email || ''} onChange={e => setDraft({ ...draft, email: e.target.value })} /></label><label className="field"><span>Phone</span><input value={draft.phone || ''} onChange={e => setDraft({ ...draft, phone: e.target.value })} /></label><label className="field"><span>Location</span><input value={draft.location || ''} onChange={e => setDraft({ ...draft, location: e.target.value })} /></label><label className="field"><span>Website</span><input value={draft.website || ''} onChange={e => setDraft({ ...draft, website: e.target.value })} /></label><label className="field full"><span>LinkedIn</span><input value={draft.linkedin || ''} onChange={e => setDraft({ ...draft, linkedin: e.target.value })} /></label></div><div className="settings-actions"><button className="button secondary danger-text" onClick={() => setDeleteOpen(true)}><Trash2 size={15} /> Delete person</button><button className="button primary" onClick={() => updateProfile(profile.id, draft)}><Save size={15} /> Save profile</button></div></section>}

        <section className="settings-card"><div className="settings-card-head"><span className="settings-icon"><Cloud size={19} /></span><div><h2>Integrations</h2><p>Environment-backed connections keep credentials outside the browser.</p></div></div><div className="integration-list"><div><span className={`integration-logo supabase ${isSupabaseConfigured ? 'ready' : ''}`}><Database size={20} /></span><div><strong>Supabase</strong><small>Authentication and cloud workspace persistence</small></div><span className={`connection-pill ${isSupabaseConfigured ? 'connected' : ''}`}>{isSupabaseConfigured ? <><CheckCircle2 size={13} /> Connected</> : 'Needs setup'}</span></div><div><span className={`integration-logo openai ${status.aiConfigured ? 'ready' : ''}`}><KeyRound size={20} /></span><div><strong>OpenAI</strong><small>AI writing refinement and editable template generation</small></div><span className={`connection-pill ${status.aiConfigured ? 'connected' : ''}`}>{status.aiConfigured ? <><CheckCircle2 size={13} /> Connected</> : 'Needs API key'}</span></div></div><div className="config-note"><strong>Production configuration</strong><p>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to the client environment. Add <code>OPENAI_API_KEY</code> only to the server environment. See <code>.env.example</code> and <code>supabase/schema.sql</code>.</p></div>{isSupabaseConfigured && <button className="button secondary" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> Sign out</button>}</section>

        <section className="settings-card"><div className="settings-card-head"><span className="settings-icon"><Database size={19} /></span><div><h2>Workspace backup</h2><p>Move all people, resumes and design settings as one JSON file.</p></div></div><div className="backup-actions"><button className="button secondary" onClick={() => downloadWorkspace(useResumeStore.getState())}><Download size={15} /> Download backup</button><button className="button secondary" onClick={() => fileRef.current?.click()}><Upload size={15} /> Restore backup</button><input ref={fileRef} hidden type="file" accept="application/json" onChange={importWorkspace} /></div></section>
      </div></div>
    {deleteOpen && profile && <ConfirmModal title={`Delete ${profile.name}?`} description="This will also remove every resume belonging to this person. This cannot be undone." confirmLabel="Delete person and resumes" onClose={() => setDeleteOpen(false)} onConfirm={() => { removeProfile(profile.id); setDeleteOpen(false) }} />}
    {notice && <NoticeModal title="Backup could not be restored" description={notice} onClose={() => setNotice('')} />}
  </div>
}
