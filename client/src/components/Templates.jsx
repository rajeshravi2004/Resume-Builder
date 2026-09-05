import { useState } from 'react'
import { AlignCenter, AlignLeft, ArrowDown, ArrowUp, Check, ChevronDown, Code2, Columns2, Eye, EyeOff, LayoutTemplate, LoaderCircle, Palette, PanelLeft, PanelRight, RotateCcw, Sparkles, WandSparkles } from 'lucide-react'
import { requestAi } from '../lib/api'
import { projectedTemplateScore } from '../lib/ats'
import { getMergedDesign, TEMPLATE_PRESETS } from '../renderResumeHtml'
import { DEFAULT_DESIGN, SECTION_META, selectActiveResume, useResumeStore } from '../store'
import { ResumeCanvas } from './ResumeCanvas'

const fonts = [
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Trebuchet', value: 'Trebuchet MS, sans-serif' },
  { label: 'Garamond', value: 'Garamond, Georgia, serif' },
]

function Control({ label, children, hint }) { return <div className="design-control"><div><label>{label}</label>{hint && <small>{hint}</small>}</div>{children}</div> }

function Segmented({ value, onChange, options }) { return <div className="segmented">{options.map(({ value: id, label, icon: Icon }) => <button key={id} className={value === id ? 'active' : ''} onClick={() => onChange(id)}>{Icon && <Icon size={15} />}{label}</button>)}</div> }

export const Templates = () => {
  const resume = useResumeStore(selectActiveResume)
  const setDesign = useResumeStore(s => s.setDesign)
  const applyTemplate = useResumeStore(s => s.applyTemplate)
  const setSectionSetting = useResumeStore(s => s.setSectionSetting)
  const moveSection = useResumeStore(s => s.moveSection)
  const [tab, setTab] = useState('templates')
  const [advanced, setAdvanced] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [aiPrompt, setAiPrompt] = useState('A calm, modern resume for a senior product engineer. Navy and warm copper, highly readable, with a compact sidebar.')
  const [aiBusy, setAiBusy] = useState(false)
  const [aiError, setAiError] = useState('')
  if (!resume) return null
  const design = getMergedDesign(resume)

  const generateDesign = async () => {
    setAiBusy(true); setAiError('')
    try {
      const result = await requestAi({ type: 'design', prompt: aiPrompt, currentDesign: design })
      if (result.design) { setDesign({ ...result.design, template: 'custom', generatedLabel: result.name || 'AI-generated design' }); setAiOpen(false); setTab('custom') }
    } catch (error) { setAiError(error.message) }
    finally { setAiBusy(false) }
  }

  return <div className="design-layout">
    <section className="design-panel">
      <div className="design-title"><div><span className="eyebrow">Design studio</span><h1>Make it unmistakably yours.</h1><p>Start with a professionally composed system, then tune every detail.</p></div><button className="ai-design-button" onClick={() => setAiOpen(true)}><Sparkles size={16} /> Design with AI</button></div>
      <div className="design-tabs"><button className={tab === 'templates' ? 'active' : ''} onClick={() => setTab('templates')}><LayoutTemplate size={16} /> Templates</button><button className={tab === 'custom' ? 'active' : ''} onClick={() => setTab('custom')}><Palette size={16} /> Customise</button><button className={tab === 'sections' ? 'active' : ''} onClick={() => setTab('sections')}><Columns2 size={16} /> Sections</button></div>

      {tab === 'templates' && <div className="template-picker"><div className="panel-intro"><h2>Curated templates</h2><p>Each score combines your content with the template's parser safety.</p></div><div className="template-grid">{TEMPLATE_PRESETS.map(preset => { const score = projectedTemplateScore(resume, preset); return <button key={preset.id} className={`template-card ${design.template === preset.id ? 'active' : ''}`} onClick={() => applyTemplate(preset.id, preset.patch)}><div className="template-art" style={{ '--p': preset.patch.primaryColor, '--a': preset.patch.accentColor, '--side': preset.patch.layout === 'two-column' ? '31%' : '0%' }}><span className={`template-ats ats-${score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low'}`}>{score} ATS</span><div className="template-art-head"><i /><b /></div><div className="template-art-body"><span /><span /><span className="short" /><em /><em /></div></div><div className="template-card-copy"><span><strong>{preset.name}</strong><small>{preset.category}</small></span>{design.template === preset.id && <Check size={16} />}</div><p>{preset.description}</p></button> })}</div></div>}

      {tab === 'custom' && <div className="custom-controls"><div className="panel-intro split"><div><h2>Style system</h2><p>Changes apply immediately to this resume.</p></div><button className="text-button with-icon" onClick={() => setDesign({ ...DEFAULT_DESIGN, template: 'executive' })}><RotateCcw size={14} /> Reset</button></div>
        <div className="control-group"><h3>Colour</h3><div className="color-controls"><label><span>Primary</span><div><input type="color" value={design.primaryColor} onChange={e => setDesign({ primaryColor: e.target.value, template: 'custom' })} /><input value={design.primaryColor} onChange={e => setDesign({ primaryColor: e.target.value, template: 'custom' })} /></div></label><label><span>Accent</span><div><input type="color" value={design.accentColor} onChange={e => setDesign({ accentColor: e.target.value, template: 'custom' })} /><input value={design.accentColor} onChange={e => setDesign({ accentColor: e.target.value, template: 'custom' })} /></div></label><label><span>Body text</span><div><input type="color" value={design.textColor} onChange={e => setDesign({ textColor: e.target.value, template: 'custom' })} /><input value={design.textColor} onChange={e => setDesign({ textColor: e.target.value, template: 'custom' })} /></div></label></div></div>
        <div className="control-group"><h3>Typography</h3><Control label="Body typeface"><select value={design.fontFamily} onChange={e => setDesign({ fontFamily: e.target.value, template: 'custom' })}>{fonts.map(font => <option value={font.value} key={font.label}>{font.label}</option>)}</select></Control><Control label="Heading typeface"><select value={design.headingFont} onChange={e => setDesign({ headingFont: e.target.value, template: 'custom' })}>{fonts.map(font => <option value={font.value} key={font.label}>{font.label}</option>)}</select></Control><Control label="Body size" hint={`${design.fontSize}px`}><input type="range" min="8.5" max="13" step="0.1" value={design.fontSize} onChange={e => setDesign({ fontSize: Number(e.target.value), template: 'custom' })} /></Control><Control label="Name size" hint={`${design.nameSize}px`}><input type="range" min="24" max="46" value={design.nameSize} onChange={e => setDesign({ nameSize: Number(e.target.value), template: 'custom' })} /></Control><Control label="Line height" hint={design.lineHeight}><input type="range" min="1.2" max="1.8" step="0.02" value={design.lineHeight} onChange={e => setDesign({ lineHeight: Number(e.target.value), template: 'custom' })} /></Control></div>
        <div className="control-group"><h3>Page & layout</h3><Control label="Structure"><Segmented value={design.layout} onChange={value => setDesign({ layout: value, template: 'custom' })} options={[{ value: 'one-column', label: 'Single', icon: AlignLeft }, { value: 'two-column', label: 'Columns', icon: Columns2 }]} /></Control>{design.layout === 'two-column' && <><Control label="Sidebar side"><Segmented value={design.sidebarSide} onChange={value => setDesign({ sidebarSide: value, template: 'custom' })} options={[{ value: 'left', label: 'Left', icon: PanelLeft }, { value: 'right', label: 'Right', icon: PanelRight }]} /></Control><Control label="Sidebar width" hint={`${design.sidebarWidth}%`}><input type="range" min="25" max="40" value={design.sidebarWidth} onChange={e => setDesign({ sidebarWidth: Number(e.target.value), template: 'custom' })} /></Control></>}<Control label="Header alignment"><Segmented value={design.headerAlign} onChange={value => setDesign({ headerAlign: value, template: 'custom' })} options={[{ value: 'left', label: 'Left', icon: AlignLeft }, { value: 'center', label: 'Centre', icon: AlignCenter }]} /></Control><Control label="Profile photo"><Segmented value={design.showPhoto ? 'show' : 'hide'} onChange={value => setDesign({ showPhoto: value === 'show', template: 'custom' })} options={[{ value: 'hide', label: 'No photo', icon: EyeOff }, { value: 'show', label: 'Show', icon: Eye }]} /></Control>{design.showPhoto && <Control label="Photo URL"><input className="design-text-input" value={design.photoUrl || ''} onChange={e => setDesign({ photoUrl: e.target.value, template: 'custom' })} placeholder="https://…" /></Control>}<Control label="Page margin" hint={`${design.pageMargin}px`}><input type="range" min="20" max="56" value={design.pageMargin} onChange={e => setDesign({ pageMargin: Number(e.target.value), template: 'custom' })} /></Control><Control label="Section spacing" hint={`${design.sectionSpacing}px`}><input type="range" min="8" max="30" value={design.sectionSpacing} onChange={e => setDesign({ sectionSpacing: Number(e.target.value), template: 'custom' })} /></Control></div>
        <button className="advanced-toggle" onClick={() => setAdvanced(!advanced)}><span><Code2 size={16} /> Advanced CSS</span><ChevronDown size={17} className={advanced ? 'rotate' : ''} /></button>{advanced && <div className="advanced-css"><textarea rows={8} value={design.customCSS || ''} onChange={e => setDesign({ customCSS: e.target.value, template: 'custom' })} placeholder="/* Optional print-safe CSS overrides */&#10;.section-title { letter-spacing: .14em; }" /><p>Use resume classes such as <code>.resume-header</code>, <code>.section-title</code>, <code>.resume-item</code>, and <code>.description</code>.</p></div>}
      </div>}

      {tab === 'sections' && <div className="section-designer"><div className="panel-intro"><h2>Section layout</h2><p>Rename, reorder, hide, and change the presentation of each section.</p></div>{design.sectionOrder.map((key, index) => { const setting = design.sectionSettings[key] || {}; return <div className="section-design-row" key={key}><div className="reorder-buttons"><button disabled={index === 0} onClick={() => moveSection(index, index - 1)}><ArrowUp size={14} /></button><button disabled={index === design.sectionOrder.length - 1} onClick={() => moveSection(index, index + 1)}><ArrowDown size={14} /></button></div><div className="section-design-main"><input value={setting.title || SECTION_META[key].label} onChange={e => setSectionSetting(key, { title: e.target.value })} /><select value={setting.variant || 'standard'} onChange={e => setSectionSetting(key, { variant: e.target.value })}><option value="standard">Standard</option><option value="timeline">Timeline</option><option value="compact">Compact</option></select></div><button className={`visibility-button ${setting.hidden ? 'hidden' : ''}`} onClick={() => setSectionSetting(key, { hidden: !setting.hidden })}>{setting.hidden ? <EyeOff size={16} /> : <Eye size={16} />}</button></div> })}</div>}
    </section>
    <aside className="design-preview"><div className="preview-label"><span><i /> Design preview</span><small>{design.generatedLabel || TEMPLATE_PRESETS.find(item => item.id === design.template)?.name || 'Custom'}</small></div><ResumeCanvas resume={resume} scale={0.72} /></aside>

    {aiOpen && <div className="modal-layer" role="dialog" aria-modal="true"><button className="modal-scrim" onClick={() => setAiOpen(false)} /><div className="modal-card ai-design-modal"><div className="ai-orb"><Sparkles size={23} /></div><span className="eyebrow">AI design director</span><h2>Describe the resume you want.</h2><p>AI will create a complete, editable design system—colour, typography, spacing and layout. Your content stays unchanged.</p><textarea rows={5} value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} /><div className="prompt-chips"><button onClick={() => setAiPrompt('Minimal black and white ATS resume for a finance professional, compact and conservative.')}>Finance / ATS</button><button onClick={() => setAiPrompt('Elegant editorial resume for a creative director, warm neutral colours and serif headings.')}>Creative leader</button><button onClick={() => setAiPrompt('Modern two-column resume for a software engineer, crisp blue palette and dense skills sidebar.')}>Tech / modern</button></div>{aiError && <div className="form-message error">{aiError}</div>}<button className="button primary wide" disabled={aiBusy || !aiPrompt.trim()} onClick={generateDesign}>{aiBusy ? <><LoaderCircle size={17} className="spin" /> Creating your design…</> : <><WandSparkles size={17} /> Generate editable design</>}</button></div></div>}
  </div>
}
