import { useResumeStore } from '../store'
import { useState } from 'react'
import { Link } from 'react-router-dom'

const SectionList = ({ sectionKey, fields, sectionTitle }) => {
  const items = useResumeStore(s => s.resume.sections[sectionKey])
  const addItem = useResumeStore(s => s.addItem)
  const updateItem = useResumeStore(s => s.updateItem)
  const removeItem = useResumeStore(s => s.removeItem)
  const reorder = useResumeStore(s => s.reorder)

  const [draft, setDraft] = useState({})
  const [isExpanded, setIsExpanded] = useState(true)

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300">
      <div
        className="px-6 py-4 bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/30 border-b border-slate-200/60 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{sectionTitle}</h3>
          <svg
            className={`w-4 h-4 text-slate-400 transition-all duration-300 ${isExpanded ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {isExpanded && (
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fields.map(f => (
              <div key={f.name}>
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  {f.label || f.name}
                </label>
                <input
                  type={f.type || 'text'}
                  placeholder={f.placeholder || f.name}
                  value={draft[f.name] || ''}
                  onChange={e => setDraft({ ...draft, [f.name]: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              addItem(sectionKey, draft)
              setDraft({})
            }}
            className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add {sectionTitle}
            </span>
          </button>

          {items.length > 0 && (
            <div className="mt-6 space-y-3 pt-6 border-t border-slate-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Added Items ({items.length})
              </h4>
              {items.map((it, idx) => (
                <div key={it.id} className="bg-gradient-to-br from-slate-50 to-white border border-slate-200/60 rounded-xl p-4 space-y-3 hover:border-blue-300 transition-all duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fields.map(f => (
                      <div key={f.name}>
                        <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                          {f.label || f.name}
                        </label>
                        <input
                          type={f.type || 'text'}
                          value={it[f.name] || ''}
                          onChange={e => updateItem(sectionKey, it.id, { [f.name]: e.target.value })}
                          className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 transition-all text-slate-800"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => removeItem(sectionKey, it.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <button
                      disabled={idx === 0}
                      onClick={() => reorder(sectionKey, idx, idx - 1)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                      </svg>
                      Up
                    </button>
                    <button
                      disabled={idx === items.length - 1}
                      onClick={() => reorder(sectionKey, idx, idx + 1)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                      Down
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export const Builder = () => {
  const resume = useResumeStore(s => s.resume)
  const setBasics = useResumeStore(s => s.setBasics)

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <Link
            to="/"
            className="group flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <svg className="w-4 h-4 text-slate-600 group-hover:text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
              Build Your Resume
            </h2>
            <p className="text-sm text-slate-500 mt-1">Fill in your details to create a professional resume</p>
          </div>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="px-6 py-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border-b border-slate-200/60">
          <h3 className="text-base font-bold text-slate-800">Basic Information</h3>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Full Name</label>
              <input
                placeholder="John Doe"
                value={resume.basics.fullName}
                onChange={e => setBasics({ fullName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Title</label>
              <input
                placeholder="Software Engineer"
                value={resume.basics.title}
                onChange={e => setBasics({ title: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Email</label>
              <input
                type="email"
                placeholder="john@example.com"
                value={resume.basics.email}
                onChange={e => setBasics({ email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={resume.basics.phone}
                onChange={e => setBasics({ phone: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Location</label>
              <input
                placeholder="New York, NY"
                value={resume.basics.location}
                onChange={e => setBasics({ location: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Website</label>
              <input
                type="url"
                placeholder="https://johndoe.com"
                value={resume.basics.website}
                onChange={e => setBasics({ website: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Professional Summary</label>
            <textarea
              placeholder="Write a brief summary about yourself..."
              value={resume.basics.summary}
              onChange={e => setBasics({ summary: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 focus:bg-white transition-all duration-200 resize-none"
            />
          </div>
        </div>
      </div>

      <SectionList
        sectionKey="experience"
        sectionTitle="Experience"
        fields={[
          { name: 'role', label: 'Job Title', placeholder: 'Senior Developer' },
          { name: 'company', label: 'Company', placeholder: 'Tech Corp' },
          { name: 'period', label: 'Period', placeholder: '2020 - Present' },
          { name: 'summary', label: 'Description', placeholder: 'Key responsibilities and achievements...' }
        ]}
      />

      <SectionList
        sectionKey="projects"
        sectionTitle="Projects"
        fields={[
          { name: 'name', label: 'Project Name', placeholder: 'Project Name' },
          { name: 'tech', label: 'Technologies', placeholder: 'React, Node.js, MongoDB' },
          { name: 'description', label: 'Description', placeholder: 'Project description...' }
        ]}
      />

      <SectionList
        sectionKey="education"
        sectionTitle="Education"
        fields={[
          { name: 'degree', label: 'Degree', placeholder: 'Bachelor of Science' },
          { name: 'school', label: 'School/University', placeholder: 'University Name' },
          { name: 'period', label: 'Period', placeholder: '2016 - 2020' },
          { name: 'score', label: 'Score/GPA', placeholder: '3.8 GPA' }
        ]}
      />

      <SectionList
        sectionKey="skills"
        sectionTitle="Skills"
        fields={[
          { name: 'name', label: 'Skill Name', placeholder: 'JavaScript' },
          { name: 'level', label: 'Proficiency Level', placeholder: 'Expert' }
        ]}
      />

      <SectionList
        sectionKey="certifications"
        sectionTitle="Certifications"
        fields={[
          { name: 'name', label: 'Certification Name', placeholder: 'AWS Certified Solutions Architect' },
          { name: 'year', label: 'Year', placeholder: '2023', type: 'number' }
        ]}
      />

      <SectionList
        sectionKey="languages"
        sectionTitle="Languages"
        fields={[
          { name: 'name', label: 'Language', placeholder: 'English' },
          { name: 'level', label: 'Proficiency', placeholder: 'Native' }
        ]}
      />

      <SectionList
        sectionKey="interests"
        sectionTitle="Interests"
        fields={[{ name: 'name', label: 'Interest', placeholder: 'Photography' }]}
      />
    </div>
  )
}
