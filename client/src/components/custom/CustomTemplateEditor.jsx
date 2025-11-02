import { useResumeStore } from '../../store'
import { useState } from 'react'

const fontOptions = [
  'Inter, system-ui, Arial',
  'Georgia, serif',
  'Times New Roman, serif',
  'Arial, sans-serif',
  'Helvetica, Arial, sans-serif',
  'Roboto, sans-serif',
  'Lato, sans-serif',
  'Montserrat, sans-serif',
  'Open Sans, sans-serif',
  'Playfair Display, serif',
]

export const CustomTemplateEditor = () => {
  const ct = useResumeStore(s => s.resume.customTemplate)
  const setCustomTemplate = useResumeStore(s => s.setCustomTemplate)
  const setTemplate = useResumeStore(s => s.setTemplate)
  const currentTemplate = useResumeStore(s => s.resume.template)
  
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [customCSS, setCustomCSS] = useState('')

  const handleApply = () => {
    setTemplate('custom')
    if (customCSS) {
      setCustomTemplate({ ...ct, customCSS })
    }
  }

  const handleReset = () => {
    setCustomTemplate({
      primaryColor: '#1e40af',
      accentColor: '#2563eb',
      fontFamily: 'Inter, system-ui, Arial',
      layout: 'one-column',
      customCSS: ''
    })
    setCustomCSS('')
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Custom Template Editor</h3>
            <p className="text-sm text-gray-600 mt-1">Personalize your resume with custom colors, fonts, and styles</p>
          </div>
          {currentTemplate === 'custom' && (
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
              Active
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Primary Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={ct.primaryColor}
                onChange={e => setCustomTemplate({ primaryColor: e.target.value })}
                className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={ct.primaryColor}
                onChange={e => setCustomTemplate({ primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="#1e40af"
              />
            </div>
            <p className="text-xs text-gray-500">Used for headings and accents</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={ct.accentColor}
                onChange={e => setCustomTemplate({ accentColor: e.target.value })}
                className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={ct.accentColor}
                onChange={e => setCustomTemplate({ accentColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                placeholder="#2563eb"
              />
            </div>
            <p className="text-xs text-gray-500">Used for borders and highlights</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Font Family
            </label>
            <select
              value={ct.fontFamily}
              onChange={e => setCustomTemplate({ fontFamily: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {fontOptions.map(font => (
                <option key={font} value={font}>
                  {font.split(',')[0]}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500">Choose a font that matches your style</p>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Layout
            </label>
            <select
              value={ct.layout}
              onChange={e => setCustomTemplate({ layout: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="one-column">One Column</option>
              <option value="two-column">Two Column</option>
            </select>
            <p className="text-xs text-gray-500">Resume layout structure</p>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <span className="font-medium text-gray-900">Advanced CSS Editor</span>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom CSS
                </label>
                <textarea
                  value={customCSS || ct.customCSS || ''}
                  onChange={e => {
                    setCustomCSS(e.target.value)
                    setCustomTemplate({ ...ct, customCSS: e.target.value })
                  }}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm"
                  placeholder="/* Add your custom CSS here */&#10;.name { font-size: 36px; }&#10;.section { margin-top: 30px; }"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Write custom CSS to further customize your template. Use classes like .name, .section, .item, etc.
                </p>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">Available CSS Classes:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs font-mono text-blue-800">
                  <div>.name</div>
                  <div>.title</div>
                  <div>.header</div>
                  <div>.section</div>
                  <div>.item</div>
                  <div>.item-title</div>
                  <div>.item-meta</div>
                  <div>.item-content</div>
                  <div>.skill-tag</div>
                  <div>.summary</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
          >
            Apply Custom Template
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Reset
          </button>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-green-900 mb-1">Preview & Export</h4>
              <p className="text-xs text-green-800">
                After applying your custom template, go to the Preview page to see how it looks and export your resume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
