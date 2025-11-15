import { useResumeStore } from '../../store'

const sectionConfig = [
  {
    key: 'experience',
    label: 'Experience',
    variants: [
      { id: 'cards', label: 'Cards (default)' },
      { id: 'list', label: 'Bullet List' },
      { id: 'paragraph', label: 'Paragraphs' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    variants: [
      { id: 'cards', label: 'Cards (default)' },
      { id: 'list', label: 'Bullet List' },
      { id: 'paragraph', label: 'Paragraphs' },
    ],
  },
  {
    key: 'education',
    label: 'Education',
    variants: [
      { id: 'cards', label: 'Cards (default)' },
      { id: 'list', label: 'Inline List' },
    ],
  },
  {
    key: 'skills',
    label: 'Skills',
    variants: [
      { id: 'tags', label: 'Tags (chips)' },
      { id: 'list', label: 'List' },
      { id: 'paragraph', label: 'Inline paragraph' },
    ],
  },
  {
    key: 'certifications',
    label: 'Certifications',
    variants: [
      { id: 'cards', label: 'Cards' },
      { id: 'list', label: 'List' },
    ],
  },
  {
    key: 'languages',
    label: 'Languages',
    variants: [
      { id: 'list', label: 'List (default)' },
      { id: 'tags', label: 'Tags' },
    ],
  },
  {
    key: 'interests',
    label: 'Interests',
    variants: [
      { id: 'tags', label: 'Tags (chips)' },
      { id: 'list', label: 'List' },
    ],
  },
]

export const LayoutEditor = () => {
  const customTemplate = useResumeStore(s => s.resume.customTemplate)
  const setSectionLayout = useResumeStore(s => s.setSectionLayout)

  const layouts = customTemplate.sectionLayouts || {}

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 bg-linear-to-r from-slate-50 to-blue-50 border-b border-slate-200">
        <h3 className="text-base font-semibold text-slate-900">Layout & Section Editor</h3>
        <p className="text-xs text-slate-500 mt-1">
          Choose how each section should look in the <span className="font-semibold">Custom</span> template.
        </p>
      </div>
      <div className="p-6 space-y-5">
        {sectionConfig.map(section => {
          const cfg = layouts[section.key] || {}
          return (
            <div
              key={section.key}
              className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-3 border-b border-slate-100 last:border-none"
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-slate-900">{section.label}</h4>
                  {cfg.hidden && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3">
                  <label className="text-[11px] uppercase tracking-wide text-slate-400">
                    Section title
                  </label>
                  <input
                    value={cfg.title ?? section.label}
                    onChange={e => setSectionLayout(section.key, { title: e.target.value })}
                    className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-wide text-slate-400 mb-1">
                    Variant
                  </label>
                  <select
                    value={cfg.variant || section.variants[0].id}
                    onChange={e => setSectionLayout(section.key, { variant: e.target.value })}
                    className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400"
                  >
                    {section.variants.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setSectionLayout(section.key, { hidden: !cfg.hidden })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                    cfg.hidden
                      ? 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  }`}
                >
                  {cfg.hidden ? 'Show' : 'Hide'}
                </button>
              </div>
            </div>
          )
        })}
        <p className="text-[11px] text-slate-500 mt-2">
          These options only affect the <span className="font-semibold">Custom</span> template. Switch to it on the
          Templates page to see the full effect in Preview.
        </p>
      </div>
    </div>
  )
}


