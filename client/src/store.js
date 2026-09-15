import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'

const uid = () => globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`

export const SECTION_META = {
  experience: { label: 'Experience', icon: 'Briefcase' },
  projects: { label: 'Projects', icon: 'FolderKanban' },
  education: { label: 'Education', icon: 'GraduationCap' },
  skills: { label: 'Skills', icon: 'WandSparkles' },
  certifications: { label: 'Certifications', icon: 'BadgeCheck' },
  languages: { label: 'Languages', icon: 'Languages' },
  interests: { label: 'Interests', icon: 'Heart' },
}

export const SECTION_FIELDS = {
  experience: [
    { name: 'role', label: 'Job title', placeholder: 'Senior Product Designer' },
    { name: 'company', label: 'Company', placeholder: 'Acme Inc.' },
    { name: 'period', label: 'Dates & location', placeholder: '2022 — Present · Chennai' },
    { name: 'summary', label: 'Impact & achievements', placeholder: 'Led a cross-functional team…', multiline: true, ai: true },
  ],
  projects: [
    { name: 'name', label: 'Project', placeholder: 'Project name' },
    { name: 'tech', label: 'Tools / technologies', placeholder: 'React, Node.js, PostgreSQL' },
    { name: 'description', label: 'Description', placeholder: 'What you built and the outcome…', multiline: true, ai: true },
  ],
  education: [
    { name: 'degree', label: 'Degree', placeholder: 'B.E. Information Technology' },
    { name: 'school', label: 'Institution', placeholder: 'Annamalai University' },
    { name: 'period', label: 'Dates', placeholder: '2021 — 2025' },
    { name: 'score', label: 'Score', placeholder: 'CGPA 8.45 / 10' },
  ],
  skills: [
    { name: 'name', label: 'Category', placeholder: 'Engineering' },
    { name: 'level', label: 'Skills', placeholder: 'React, TypeScript, Node.js' },
  ],
  certifications: [
    { name: 'name', label: 'Certification', placeholder: 'AWS Solutions Architect' },
    { name: 'year', label: 'Issuer / year', placeholder: 'Amazon · 2025' },
  ],
  languages: [
    { name: 'name', label: 'Language', placeholder: 'English' },
    { name: 'level', label: 'Proficiency', placeholder: 'Professional' },
  ],
  interests: [{ name: 'name', label: 'Interest', placeholder: 'Open source' }],
}

export const DEFAULT_DESIGN = {
  template: 'executive',
  primaryColor: '#172554',
  accentColor: '#c2410c',
  textColor: '#1f2937',
  fontFamily: 'Inter, Arial, sans-serif',
  headingFont: 'Inter, Arial, sans-serif',
  fontSize: 10.5,
  nameSize: 32,
  lineHeight: 1.48,
  pageMargin: 32,
  sectionSpacing: 16,
  itemSpacing: 10,
  layout: 'one-column',
  sidebarSide: 'left',
  sidebarWidth: 31,
  headerAlign: 'left',
  showPhoto: false,
  photoUrl: '',
  sectionOrder: Object.keys(SECTION_META),
  sectionSettings: Object.fromEntries(
    Object.entries(SECTION_META).map(([key, value]) => [key, {
      title: value.label,
      hidden: false,
      variant: key === 'skills' || key === 'interests' ? 'compact' : 'standard',
    }]),
  ),
  contactIcons: false,
  sectionIcons: false,
  customCSS: '',
  generatedLabel: '',
}

const sampleBasics = {
  fullName: 'Rajesh Ravi',
  title: 'Full Stack Developer',
  email: 'rajesh@example.com',
  phone: '+91 98765 43210',
  location: 'Chennai, India',
  website: 'rajeshravi.dev',
  linkedin: 'linkedin.com/in/rajeshravi',
  github: 'github.com/rajeshravi2004',
  summary: 'Full stack developer building reliable, human-centred web products across healthcare and applied AI. Experienced in taking ideas from API design through polished React interfaces and production deployment.',
}

const sampleSections = {
  experience: [
    { id: 'exp-1', role: 'Junior Full Stack Developer', company: 'CareScribe Healthcare', period: 'Jul 2025 — Present · Chennai', summary: 'Built and shipped clinical documentation workflows with React, Node.js and PostgreSQL. Improved real-time collaboration using WebSockets and productionised AI-assisted transcription services.' },
    { id: 'exp-2', role: 'Full Stack Engineering Intern', company: 'CareScribe Healthcare', period: 'Mar 2025 — Jun 2025 · Chennai', summary: 'Developed OPD, IPD and discharge-summary experiences, integrated LLM services, and contributed reusable API documentation and containerised deployments.' },
  ],
  projects: [
    { id: 'project-1', name: 'Document Intelligence Assistant', tech: 'FastAPI · React · FAISS · LangChain', description: 'Created a session-based assistant that searches PDF, DOCX, spreadsheet and text uploads with semantic retrieval and source-aware responses.' },
  ],
  education: [{ id: 'edu-1', degree: 'B.E. Information Technology', school: 'Annamalai University', period: '2021 — 2025', score: 'CGPA 8.45 / 10' }],
  skills: [
    { id: 'skill-1', name: 'Frontend', level: 'React, JavaScript, HTML, CSS, Tailwind' },
    { id: 'skill-2', name: 'Backend & Data', level: 'Node.js, Express, Python, FastAPI, PostgreSQL' },
    { id: 'skill-3', name: 'Cloud & AI', level: 'GCP, Docker, Kubernetes, LLM integration, FAISS' },
  ],
  certifications: [{ id: 'cert-1', name: 'Diploma in Computer Application', year: '2021' }],
  languages: [{ id: 'lang-1', name: 'Tamil', level: 'Native' }, { id: 'lang-2', name: 'English', level: 'Professional' }],
  interests: [{ id: 'interest-1', name: 'Healthcare technology' }, { id: 'interest-2', name: 'Open source' }],
}

export const createBlankResumeData = (basics = {}) => ({
  basics: { fullName: '', title: '', email: '', phone: '', location: '', website: '', linkedin: '', github: '', summary: '', ...basics },
  sections: Object.fromEntries(Object.keys(SECTION_META).map(key => [key, []])),
})

const seedWorkspace = () => {
  const profileId = 'profile-rajesh'
  const resumeId = 'resume-product'
  return {
    profiles: [{ id: profileId, name: 'Rajesh Ravi', headline: 'Full Stack Developer', email: sampleBasics.email, phone: sampleBasics.phone, location: sampleBasics.location, website: sampleBasics.website, linkedin: sampleBasics.linkedin, github: sampleBasics.github, createdAt: new Date().toISOString() }],
    resumes: [{ id: resumeId, profileId, name: 'Full Stack Developer', targetRole: 'Product engineering roles', status: 'Draft', updatedAt: new Date().toISOString(), data: { basics: sampleBasics, sections: sampleSections }, design: DEFAULT_DESIGN }],
    activeProfileId: profileId,
    activeResumeId: resumeId,
  }
}

const touch = resume => { resume.updatedAt = new Date().toISOString() }

export const useResumeStore = create(
  persist(
    (set, get) => ({
      ...seedWorkspace(),
      cloudStatus: 'local',
      lastCloudSave: null,

      activeResume: () => get().resumes.find(item => item.id === get().activeResumeId),
      setActiveResume: id => set(state => ({ activeResumeId: id, activeProfileId: state.resumes.find(r => r.id === id)?.profileId || state.activeProfileId })),
      setActiveProfile: id => set({ activeProfileId: id }),
      addProfile: values => {
        const id = uid()
        set(produce(state => {
          state.profiles.push({ id, name: values.name || 'Untitled person', headline: values.headline || '', email: values.email || '', phone: values.phone || '', location: values.location || '', website: values.website || '', linkedin: values.linkedin || '', github: values.github || '', createdAt: new Date().toISOString() })
          state.activeProfileId = id
        }))
        return id
      },
      updateProfile: (id, patch) => set(produce(state => {
        const profile = state.profiles.find(item => item.id === id)
        if (profile) Object.assign(profile, patch)
      })),
      removeProfile: id => set(produce(state => {
        state.profiles = state.profiles.filter(item => item.id !== id)
        state.resumes = state.resumes.filter(item => item.profileId !== id)
        if (state.activeProfileId === id) state.activeProfileId = state.profiles[0]?.id || null
        if (!state.resumes.some(item => item.id === state.activeResumeId)) state.activeResumeId = state.resumes[0]?.id || null
      })),
      addResume: (profileId, values = {}) => {
        const id = uid()
        const profile = get().profiles.find(item => item.id === profileId)
        const profileBasics = profile ? { fullName: profile.name, title: profile.headline, email: profile.email, phone: profile.phone, location: profile.location, website: profile.website, linkedin: profile.linkedin, github: profile.github } : {}
        set(produce(state => {
          state.resumes.unshift({ id, profileId, name: values.name || 'Untitled resume', targetRole: values.targetRole || '', status: 'Draft', updatedAt: new Date().toISOString(), data: createBlankResumeData(profileBasics), design: { ...DEFAULT_DESIGN, sectionOrder: [...DEFAULT_DESIGN.sectionOrder], sectionSettings: structuredClone(DEFAULT_DESIGN.sectionSettings) } })
          state.activeResumeId = id
          state.activeProfileId = profileId
        }))
        return id
      },
      duplicateResume: id => {
        const source = get().resumes.find(item => item.id === id)
        if (!source) return null
        const newId = uid()
        set(produce(state => {
          state.resumes.unshift({ ...structuredClone(source), id: newId, name: `${source.name} — Copy`, status: 'Draft', updatedAt: new Date().toISOString() })
          state.activeResumeId = newId
          state.activeProfileId = source.profileId
        }))
        return newId
      },
      removeResume: id => set(produce(state => {
        state.resumes = state.resumes.filter(item => item.id !== id)
        if (state.activeResumeId === id) state.activeResumeId = state.resumes[0]?.id || null
      })),
      renameResume: (id, name) => set(produce(state => {
        const resume = state.resumes.find(item => item.id === id)
        if (resume) { resume.name = name; touch(resume) }
      })),
      updateResumeMeta: (id, patch) => set(produce(state => {
        const resume = state.resumes.find(item => item.id === id)
        if (resume) { Object.assign(resume, patch); touch(resume) }
      })),
      setCoverLetter: (id, patch) => set(produce(state => {
        const resume = state.resumes.find(item => item.id === id)
        if (resume) { resume.coverLetter = { ...resume.coverLetter, ...patch }; touch(resume) }
      })),
      setBasics: patch => set(produce(state => {
        const resume = state.resumes.find(item => item.id === state.activeResumeId)
        if (resume) { Object.assign(resume.data.basics, patch); touch(resume) }
      })),
      syncProfileToResume: () => set(produce(state => {
        const resume = state.resumes.find(item => item.id === state.activeResumeId)
        const profile = state.profiles.find(item => item.id === resume?.profileId)
        if (!resume || !profile) return
        Object.assign(resume.data.basics, { fullName: profile.name, title: profile.headline, email: profile.email, phone: profile.phone, location: profile.location, website: profile.website, linkedin: profile.linkedin, github: profile.github })
        touch(resume)
      })),
      addItem: (section, item = {}) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (!resume) return
        resume.data.sections[section].push({ id: uid(), ...item })
        touch(resume)
      })),
      updateItem: (section, id, patch) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        const item = resume?.data.sections[section]?.find(value => value.id === id)
        if (item) { Object.assign(item, patch); touch(resume) }
      })),
      removeItem: (section, id) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (!resume) return
        resume.data.sections[section] = resume.data.sections[section].filter(item => item.id !== id)
        touch(resume)
      })),
      moveItem: (section, from, to) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        const list = resume?.data.sections[section]
        if (!list || to < 0 || to >= list.length) return
        const [item] = list.splice(from, 1)
        list.splice(to, 0, item)
        touch(resume)
      })),
      setDesign: patch => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (resume) { Object.assign(resume.design, patch); touch(resume) }
      })),
      applyTemplate: (template, designPatch = {}) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (resume) { Object.assign(resume.design, { template, ...designPatch }); touch(resume) }
      })),
      setSectionSetting: (section, patch) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (!resume) return
        resume.design.sectionSettings[section] = { ...resume.design.sectionSettings[section], ...patch }
        touch(resume)
      })),
      moveSection: (from, to) => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        const order = resume?.design.sectionOrder
        if (!order || to < 0 || to >= order.length) return
        const [section] = order.splice(from, 1)
        order.splice(to, 0, section)
        touch(resume)
      })),
      importResume: incoming => set(produce(state => {
        const resume = state.resumes.find(value => value.id === state.activeResumeId)
        if (!resume || !incoming) return
        const candidate = incoming.data || incoming
        if (candidate.basics) resume.data.basics = { ...resume.data.basics, ...candidate.basics }
        if (candidate.sections) {
          for (const key of Object.keys(SECTION_META)) {
            if (Array.isArray(candidate.sections[key])) resume.data.sections[key] = candidate.sections[key].map(item => ({ ...item, id: item.id || uid() }))
          }
        }
        if (incoming.design) resume.design = { ...resume.design, ...incoming.design }
        if (incoming.coverLetter && typeof incoming.coverLetter === 'object') resume.coverLetter = { ...incoming.coverLetter }
        touch(resume)
      })),
      replaceWorkspace: workspace => set({ profiles: workspace.profiles || [], resumes: workspace.resumes || [], activeProfileId: workspace.activeProfileId || workspace.profiles?.[0]?.id || null, activeResumeId: workspace.activeResumeId || workspace.resumes?.[0]?.id || null }),
      setCloudStatus: (cloudStatus, lastCloudSave = get().lastCloudSave) => set({ cloudStatus, lastCloudSave }),
      resetWorkspace: () => set(seedWorkspace()),
    }),
    {
      name: 'resume-studio-workspace',
      version: 2,
      storage: createJSONStorage(() => localStorage),
      partialize: state => ({ profiles: state.profiles, resumes: state.resumes, activeProfileId: state.activeProfileId, activeResumeId: state.activeResumeId }),
    },
  ),
)

export const selectActiveResume = state => state.resumes.find(item => item.id === state.activeResumeId) || null
export const selectActiveProfile = state => state.profiles.find(item => item.id === state.activeProfileId) || null
