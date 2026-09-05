import { createElement, lazy, Suspense, useEffect, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { FileText, LayoutDashboard, Palette, Download, Settings, ChevronDown, Cloud, CloudOff, Menu, X, Sparkles } from 'lucide-react'
import { Dashboard } from './components/Dashboard'
import { getAdminStatus, isSupabaseConfigured, loadCloudWorkspace, saveCloudWorkspace, supabase } from './lib/supabase'
import { selectActiveProfile, selectActiveResume, useResumeStore } from './store'

const Builder = lazy(() => import('./components/Builder').then(module => ({ default: module.Builder })))
const Templates = lazy(() => import('./components/Templates').then(module => ({ default: module.Templates })))
const Preview = lazy(() => import('./components/Preview').then(module => ({ default: module.Preview })))
const SettingsPage = lazy(() => import('./components/SettingsPage').then(module => ({ default: module.SettingsPage })))

const navItems = [
  { to: '/', label: 'Workspace', icon: LayoutDashboard, end: true },
  { to: '/editor', label: 'Content', icon: FileText },
  { to: '/design', label: 'Design studio', icon: Palette },
  { to: '/export', label: 'Preview & export', icon: Download },
]

function AuthGate({ children }) {
  const [session, setSession] = useState(undefined)
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ email: '', password: '' })
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) { setSession(null); return }
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next))
    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return <div className="app-loader"><div className="brand-mark">R</div><p>Opening your workspace…</p></div>
  if (!isSupabaseConfigured || session) return children

  const submit = async event => {
    event.preventDefault()
    setBusy(true); setMessage('')
    const { error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
      : await supabase.auth.signUp({ email: form.email, password: form.password })
    setBusy(false)
    if (error) setMessage(error.message)
    else if (mode === 'signup') setMessage('Account created. Check your email if confirmation is enabled.')
  }

  const signInWithGoogle = async () => {
    setBusy(true); setMessage('')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) { setMessage(error.message); setBusy(false) }
  }

  return <div className="auth-screen">
    <div className="auth-story">
      <div className="brand-lockup"><span className="brand-mark">R</span><span>Resume Studio</span></div>
      <div className="auth-copy"><span className="eyebrow light">Professional career workspace</span><h1>Every person.<br />Every opportunity.<br /><em>One workspace.</em></h1><p>Build tailored, beautifully typeset resumes without losing the master profile behind them.</p></div>
      <div className="auth-proof"><Sparkles size={18} /><span>AI writing partner · Custom design system · PDF & DOCX</span></div>
    </div>
    <div className="auth-panel"><form className="auth-card" onSubmit={submit}>
      <div><span className="eyebrow">Welcome to Resume Studio</span><h2>{mode === 'signin' ? 'Sign in to continue' : 'Create your workspace'}</h2><p>Your profiles and resumes stay private to your account.</p></div>
      <button type="button" className="google-button" disabled={busy} onClick={signInWithGoogle}><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.32 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.63-2.36l-3.24-2.54c-.9.6-2.05.96-3.39.96-2.61 0-4.82-1.77-5.61-4.14H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.92A6 6 0 0 1 6.08 12c0-.67.11-1.32.31-1.92V7.46H3.04A10 10 0 0 0 2 12c0 1.61.38 3.14 1.04 4.54l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.78.5 3.82 1.5l2.88-2.87A9.65 9.65 0 0 0 12 2a10 10 0 0 0-8.96 5.46l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg>Continue with Google</button>
      <div className="auth-divider"><span>or use email</span></div>
      <label>Email address<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@company.com" /></label>
      <label>Password<input required minLength={6} type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" /></label>
      {message && <div className="form-message">{message}</div>}
      <button className="button primary wide" disabled={busy}>{busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}</button>
      <button type="button" className="text-button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage('') }}>{mode === 'signin' ? 'New here? Create an account' : 'Already have an account? Sign in'}</button>
    </form></div>
  </div>
}

function CloudSync() {
  const hydrated = useRef(false)
  useEffect(() => {
    if (!isSupabaseConfigured) return
    let unsubscribe
    let timer
    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user
      if (!user) return
      useResumeStore.getState().setCloudStatus('syncing')
      try {
        const cloud = await loadCloudWorkspace(user.id)
        if (cloud?.data) {
          useResumeStore.getState().replaceWorkspace(cloud.data)
        } else {
          const local = useResumeStore.getState()
          await saveCloudWorkspace(user.id, { profiles: local.profiles, resumes: local.resumes, activeProfileId: local.activeProfileId, activeResumeId: local.activeResumeId })
        }
        useResumeStore.getState().setCloudStatus('saved', cloud?.updated_at || new Date().toISOString())
      } catch {
        useResumeStore.getState().setCloudStatus('error')
      }
      hydrated.current = true
      unsubscribe = useResumeStore.subscribe((state, previous) => {
        if (!hydrated.current) return
        if (state.profiles === previous.profiles && state.resumes === previous.resumes && state.activeProfileId === previous.activeProfileId && state.activeResumeId === previous.activeResumeId) return
        clearTimeout(timer)
        useResumeStore.getState().setCloudStatus('syncing')
        timer = setTimeout(async () => {
          const current = useResumeStore.getState()
          try {
            await saveCloudWorkspace(user.id, { profiles: current.profiles, resumes: current.resumes, activeProfileId: current.activeProfileId, activeResumeId: current.activeResumeId })
            useResumeStore.getState().setCloudStatus('saved', new Date().toISOString())
          } catch { useResumeStore.getState().setCloudStatus('error') }
        }, 900)
      })
    })
    return () => { clearTimeout(timer); unsubscribe?.() }
  }, [])
  return null
}

function WorkspaceShell() {
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const profile = useResumeStore(selectActiveProfile)
  const resume = useResumeStore(selectActiveResume)
  const profiles = useResumeStore(s => s.profiles)
  const resumes = useResumeStore(s => s.resumes)
  const setActiveResume = useResumeStore(s => s.setActiveResume)
  const cloudStatus = useResumeStore(s => s.cloudStatus)
  const isEditor = ['/editor', '/design', '/export'].includes(location.pathname)

  useEffect(() => {
    if (isSupabaseConfigured) getAdminStatus().then(setIsAdmin)
  }, [])

  const chooseResume = id => { setActiveResume(id); if (location.pathname === '/') navigate('/editor') }

  return <div className="workspace-shell">
    <CloudSync />
    <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
      <div className="sidebar-brand"><span className="brand-mark">R</span><div><strong>Resume Studio</strong><small>Career workspace</small></div><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)}><X size={19} /></button></div>
      <nav className="main-nav">
        <span className="nav-label">Workspace</span>
        {navItems.map(({ to, label, icon, end }) => <NavLink key={to} to={to} end={end} onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{createElement(icon, { size: 18 })}<span>{label}</span></NavLink>)}
      </nav>
      <div className="sidebar-bottom">
        <NavLink to="/settings" onClick={() => setMobileOpen(false)} className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}><Settings size={18} /><span>Settings</span></NavLink>
        <div className="cloud-state">{isSupabaseConfigured ? (cloudStatus === 'error' ? <CloudOff size={15} /> : <Cloud size={15} />) : <CloudOff size={15} />}<span>{isSupabaseConfigured ? (cloudStatus === 'syncing' ? 'Saving changes…' : cloudStatus === 'error' ? 'Cloud sync issue' : 'Saved to Supabase') : 'Local workspace'}</span></div>
      </div>
    </aside>
    <div className="workspace-main">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>{isEditor && resume ? <div className="resume-switcher"><div className="mini-avatar">{profile?.name?.slice(0, 2).toUpperCase() || 'RS'}</div><div><small>{profile?.name}</small><select value={resume.id} onChange={e => chooseResume(e.target.value)}>{resumes.map(item => <option key={item.id} value={item.id}>{profiles.find(p => p.id === item.profileId)?.name} · {item.name}</option>)}</select></div><ChevronDown size={14} /></div> : <div><strong>Resume Studio</strong><small className="topbar-subtitle">Build work worth reading</small></div>}</div>
        <div className="topbar-actions">{isAdmin && <span className="admin-badge">Admin</span>}{isEditor && <><span className="autosave-dot"><i /> Autosaved</span><button className="button primary compact" onClick={() => navigate('/export')}><Download size={15} /> Export</button></>}</div>
      </header>
      <main className={isEditor ? 'page-content editor-page' : 'page-content'}><Suspense fallback={<div className="route-loader"><span className="brand-mark">R</span><p>Preparing your workspace…</p></div>}><Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/editor" element={resume ? <Builder /> : <Navigate to="/" />} />
        <Route path="/design" element={resume ? <Templates /> : <Navigate to="/" />} />
        <Route path="/export" element={resume ? <Preview /> : <Navigate to="/" />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes></Suspense></main>
    </div>
    {mobileOpen && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />}
  </div>
}

export default function App() {
  return <BrowserRouter><AuthGate><WorkspaceShell /></AuthGate></BrowserRouter>
}
