import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { produce } from 'immer'

const DEFAULT_RESUME = {
  basics: {
    fullName: 'RAJESH R',
    title: 'Full Stack Developer & AI Enthusiast',
    email: 'ravirajesh988@gmail.com',
    phone: '+91-8883761709',
    location: 'Tamilnadu, India',
    website: 'https://github.com/rajeshravi2004/portfolio',
    summary:
      'Passionate Junior Full Stack Developer with strong foundation in modern web technologies and AI/ML. Specialized in responsive web apps using React, Node.js, and Python; experienced in healthcare tech and AI applications.',
  },
  sections: {
    experience: [
      { id: 'exp1', role: 'Junior Full Stack Developer', company: 'Carescribe Healthcare Private Limited', period: 'July 2025 - Present, Chennai', summary: 'Built CareScribe, a full-stack medical transcription platform; implemented PostgreSQL, Express, Node.js, React, WebSockets, Cloud Storage, Pub/Sub; Swagger docs and API key security; integrated Python chat APIs.' },
      { id: 'exp2', role: 'Fullstack Internship Developer', company: 'Carescribe Healthcare Private Limited', period: 'Mar 2025 - Jun 2025, Chennai', summary: 'Developed healthcare application with Node.js and React; OPD/IPD/discharge summary features from conversations; integrated LLM and prompt engineering; worked with React, Node.js, Python, PostgreSQL, GCP, Docker, Kubernetes, PubSub, WebSockets.' },
      { id: 'exp3', role: 'AI/ML Internship Scholar', company: 'AIIRF-EDII', period: 'Jun 2024 - Jul 2024, Chidambaram', summary: 'Learned clusters, regression, deep learning; hands-on with ML algorithms and data processing.' },
      { id: 'exp4', role: 'UI/UX Internship Scholar', company: 'AIIRF-EDII', period: 'Jun 2023 - Jul 2023, Chidambaram', summary: 'App landing templates, project management; better understanding of UI/UX principles.' }
    ],
    projects: [
      { id: 'proj1', name: 'AI Assistant with Document Analysis', tech: 'FastAPI, Google Gemini AI, Python, React, FAISS, LangChain', description: 'AI chatbot with general and doc analysis modes; uploads (PDF, DOCX, TXT, CSV, XLSX); FAISS vector search; session-based chat; auth and real-time indexing; responsive UI.' }
    ],
    education: [
      { id: 'edu1', degree: 'BE Information Technology', school: 'Annamalai University', period: '2021 - 2025', score: 'CGPA: 8.45/10' },
      { id: 'edu2', degree: 'Higher Secondary', school: 'DVC Higher Secondary School', period: '2020 - 2021', score: '89.9%' },
      { id: 'edu3', degree: 'Matriculation', school: 'DVC Higher Secondary School', period: '2018 - 2019', score: '92.0%' }
    ],
    skills: [
      { id: 'sk1', name: 'Frontend', level: 'React, JavaScript, HTML5, CSS3, Tailwind CSS' },
      { id: 'sk2', name: 'Backend', level: 'Node.js, Express.js, Python, FastAPI, REST, WebSockets, PostgreSQL' },
      { id: 'sk3', name: 'Cloud & DevOps', level: 'GCP, Docker, Kubernetes, Cloud Storage, Pub/Sub, API Security' },
      { id: 'sk4', name: 'AI & ML', level: 'Gemini, LangChain, LLM Integration, Prompt Engineering, FAISS, Chat APIs' }
    ],
    certifications: [
      { id: 'cert1', name: 'Diploma in Computer Application (DCA)', year: '2021' },
      { id: 'cert2', name: 'Typewriting English Junior', year: '2019' }
    ],
    languages: [
      { id: 'lang1', name: 'English', level: 'Professional' },
      { id: 'lang2', name: 'Tamil', level: 'Native' },
      { id: 'lang3', name: 'Hindi', level: 'Conversational' }
    ],
    interests: [
      { id: 'in1', name: 'AI and Machine Learning research' },
      { id: 'in2', name: 'Open source contributions' },
      { id: 'in3', name: 'Healthcare technology innovation' },
      { id: 'in4', name: 'Continuous learning and skill development' },
      { id: 'in5', name: 'Problem-solving challenges' },
    ],
  },
  template: 'classic',
  customTemplate: {
    primaryColor: '#1e40af',
    accentColor: '#2563eb',
    fontFamily: 'Inter, system-ui, Arial',
    layout: 'one-column',
    customCSS: '',
    sectionLayouts: {
      experience: { variant: 'cards', hidden: false, title: 'Experience' },
      projects: { variant: 'cards', hidden: false, title: 'Projects' },
      education: { variant: 'cards', hidden: false, title: 'Education' },
      skills: { variant: 'tags', hidden: false, title: 'Skills' },
      certifications: { variant: 'cards', hidden: false, title: 'Certifications' },
      languages: { variant: 'list', hidden: false, title: 'Languages' },
      interests: { variant: 'tags', hidden: false, title: 'Interests' },
    },
  },
  uploadedTemplateHtml: '',
}

const buildSectionIndexes = sections =>
  Object.fromEntries(
    Object.keys(sections).map(key => [
      key,
      Object.fromEntries(sections[key].map((item, index) => [item.id, index])),
    ]),
  )

const emptyResumeFromDefault = () => ({
  basics: {
    fullName: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: '',
  },
  sections: Object.fromEntries(
    Object.keys(DEFAULT_RESUME.sections).map(key => [key, []]),
  ),
  template: DEFAULT_RESUME.template,
  customTemplate: { ...DEFAULT_RESUME.customTemplate },
  uploadedTemplateHtml: '',
})

export const useResumeStore = create(
  persist(
    (set, get) => ({
      resume: DEFAULT_RESUME,
      sectionIndexes: buildSectionIndexes(DEFAULT_RESUME.sections),

      reset: () =>
        set({
          resume: DEFAULT_RESUME,
          sectionIndexes: buildSectionIndexes(DEFAULT_RESUME.sections),
        }),

      clear: () => {
        const cleared = emptyResumeFromDefault()
        set({
          resume: cleared,
          sectionIndexes: buildSectionIndexes(cleared.sections),
        })
      },

      loadFromJson: incoming =>
        set(
          produce(state => {
            if (!incoming || typeof incoming !== 'object') return
            const next = {
              basics: {
                ...emptyResumeFromDefault().basics,
                ...(incoming.basics || {}),
              },
              sections: Object.fromEntries(
                Object.keys(emptyResumeFromDefault().sections).map(key => {
                  const list = Array.isArray(incoming.sections?.[key])
                    ? incoming.sections[key]
                    : []
                  const normalized = list.map(item => ({
                    ...item,
                    id: item.id || crypto.randomUUID(),
                  }))
                  return [key, normalized]
                }),
              ),
              template: incoming.template || DEFAULT_RESUME.template,
              customTemplate: {
                ...DEFAULT_RESUME.customTemplate,
                ...(incoming.customTemplate || {}),
                sectionLayouts: {
                  ...DEFAULT_RESUME.customTemplate.sectionLayouts,
                  ...(incoming.customTemplate?.sectionLayouts || {}),
                },
              },
              uploadedTemplateHtml: incoming.uploadedTemplateHtml || '',
            }
            state.resume = next
            state.sectionIndexes = buildSectionIndexes(next.sections)
          }),
        ),

      setBasics: basics =>
        set(
          produce(state => {
            state.resume.basics = { ...state.resume.basics, ...basics }
          }),
        ),

      addItem: (section, item) =>
        set(
          produce(state => {
            const id = crypto.randomUUID()
            state.resume.sections[section].push({ id, ...item })
            const idx = state.resume.sections[section].length - 1
            state.sectionIndexes[section][id] = idx
          }),
        ),

      updateItem: (section, id, patch) =>
        set(
          produce(state => {
            const index = state.sectionIndexes[section][id]
            if (index === undefined) return
            const list = state.resume.sections[section]
            list[index] = { ...list[index], ...patch }
          }),
        ),

      removeItem: (section, id) =>
        set(
          produce(state => {
            const index = state.sectionIndexes[section][id]
            if (index === undefined) return
            const arr = state.resume.sections[section]
            arr.splice(index, 1)
            delete state.sectionIndexes[section][id]
            for (let i = index; i < arr.length; i++) {
              state.sectionIndexes[section][arr[i].id] = i
            }
          }),
        ),

      reorder: (section, fromIndex, toIndex) =>
        set(
          produce(state => {
            const arr = state.resume.sections[section]
            if (
              fromIndex < 0 ||
              fromIndex >= arr.length ||
              toIndex < 0 ||
              toIndex >= arr.length
            )
              return
            const [moved] = arr.splice(fromIndex, 1)
            arr.splice(toIndex, 0, moved)
            state.sectionIndexes[section] = Object.fromEntries(
              arr.map((x, i) => [x.id, i]),
            )
          }),
        ),

      setTemplate: template =>
        set(
          produce(state => {
            state.resume.template = template
          }),
        ),

      setCustomTemplate: patch =>
        set(
          produce(state => {
            state.resume.customTemplate = {
              ...state.resume.customTemplate,
              ...patch,
            }
          }),
        ),

      setSectionLayout: (section, patch) =>
        set(
          produce(state => {
            const layouts = state.resume.customTemplate.sectionLayouts || {}
            const prev = layouts[section] || {}
            state.resume.customTemplate.sectionLayouts = {
              ...layouts,
              [section]: { ...prev, ...patch },
            }
          }),
        ),

      setUploadedTemplateHtml: html =>
        set(
          produce(state => {
            state.resume.uploadedTemplateHtml = html || ''
          }),
        ),

      clearUploadedTemplateHtml: () =>
        set(
          produce(state => {
            state.resume.uploadedTemplateHtml = ''
            if (state.resume.template === 'uploaded') {
              state.resume.template = DEFAULT_RESUME.template
            }
          }),
        ),
    }),
    {
      name: 'resume-builder',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)

