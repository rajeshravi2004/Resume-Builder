import { DEFAULT_DESIGN, SECTION_META } from './store'

export const TEMPLATE_PRESETS = [
  { id: 'executive', name: 'Executive', description: 'Confident typography with a restrained accent.', category: 'Professional', patch: { primaryColor: '#172554', accentColor: '#c2410c', textColor: '#1f2937', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Inter, Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 10.5, nameSize: 33 } },
  { id: 'nordic', name: 'Nordic', description: 'Airy, minimal and exceptionally readable.', category: 'Minimal', patch: { primaryColor: '#18332f', accentColor: '#2f766d', textColor: '#26302e', fontFamily: 'Arial, sans-serif', headingFont: 'Georgia, serif', layout: 'one-column', headerAlign: 'left', fontSize: 10.3, nameSize: 35, sectionSpacing: 19 } },
  { id: 'column', name: 'Column', description: 'Structured sidebar for skills-led careers.', category: 'Modern', patch: { primaryColor: '#172554', accentColor: '#2563eb', textColor: '#202938', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Inter, Arial, sans-serif', layout: 'two-column', sidebarSide: 'left', sidebarWidth: 31, fontSize: 10.2, nameSize: 31 } },
  { id: 'editorial', name: 'Editorial', description: 'Classic serif voice for senior profiles.', category: 'Distinctive', patch: { primaryColor: '#292524', accentColor: '#9f1239', textColor: '#292524', fontFamily: 'Georgia, serif', headingFont: 'Georgia, serif', layout: 'one-column', headerAlign: 'center', fontSize: 10.7, nameSize: 37 } },
  { id: 'compact', name: 'Compact', description: 'Dense, ATS-friendly layout for deep experience.', category: 'ATS', patch: { primaryColor: '#111827', accentColor: '#4b5563', textColor: '#1f2937', fontFamily: 'Arial, sans-serif', headingFont: 'Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 9.6, nameSize: 28, sectionSpacing: 12, itemSpacing: 7, pageMargin: 26 } },
  { id: 'signature', name: 'Signature', description: 'Warm, elegant styling for creative leadership.', category: 'Creative', patch: { primaryColor: '#3f2d2a', accentColor: '#b45309', textColor: '#332e2b', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Georgia, serif', layout: 'two-column', sidebarSide: 'right', sidebarWidth: 29, fontSize: 10.4, nameSize: 36 } },
  { id: 'ats-standard', name: 'ATS Standard', description: 'No-nonsense structure built for parsing reliability.', category: 'ATS', patch: { primaryColor: '#111827', accentColor: '#374151', textColor: '#111827', fontFamily: 'Arial, sans-serif', headingFont: 'Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 10, nameSize: 29, pageMargin: 29, sectionSpacing: 13 } },
  { id: 'swiss', name: 'Swiss', description: 'Grid-led clarity with crisp red accents.', category: 'Modern', patch: { primaryColor: '#171717', accentColor: '#dc2626', textColor: '#262626', fontFamily: 'Arial, sans-serif', headingFont: 'Arial, sans-serif', layout: 'two-column', sidebarSide: 'left', sidebarWidth: 28, headerAlign: 'left', fontSize: 10.3, nameSize: 34 } },
  { id: 'leadership', name: 'Leadership', description: 'Measured authority for directors and executives.', category: 'Executive', patch: { primaryColor: '#2b2118', accentColor: '#8a6a3f', textColor: '#302b26', fontFamily: 'Georgia, serif', headingFont: 'Georgia, serif', layout: 'one-column', headerAlign: 'center', fontSize: 10.8, nameSize: 38, sectionSpacing: 18 } },
  { id: 'scholar', name: 'Scholar', description: 'Traditional academic typography for research CVs.', category: 'Academic', patch: { primaryColor: '#1e293b', accentColor: '#475569', textColor: '#1e293b', fontFamily: 'Times New Roman, serif', headingFont: 'Times New Roman, serif', layout: 'one-column', headerAlign: 'center', fontSize: 10.8, nameSize: 34, itemSpacing: 9 } },
  { id: 'blueprint', name: 'Blueprint', description: 'Technical hierarchy with a precise blue system.', category: 'Engineering', patch: { primaryColor: '#0f3b66', accentColor: '#0284c7', textColor: '#203246', fontFamily: 'Trebuchet MS, sans-serif', headingFont: 'Trebuchet MS, sans-serif', layout: 'two-column', sidebarSide: 'right', sidebarWidth: 30, fontSize: 10.1, nameSize: 32 } },
  { id: 'monochrome', name: 'Monochrome', description: 'Pure black and white with refined spacing.', category: 'Minimal', patch: { primaryColor: '#18181b', accentColor: '#71717a', textColor: '#27272a', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Inter, Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 10.4, nameSize: 35, sectionSpacing: 20 } },
]

const esc = value => String(value ?? '')
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

const lines = value => esc(value).replace(/\r?\n/g, '<br>')

const contact = basics => [
  basics.email,
  basics.phone,
  basics.location,
  basics.website,
  basics.linkedin,
].filter(Boolean).map(item => `<span>${esc(item)}</span>`).join('')

const renderItem = (section, item, variant) => {
  if (section === 'experience') return `<article class="resume-item ${variant}"><div class="item-head"><div><h3>${esc(item.role)}</h3><div class="organization">${esc(item.company)}</div></div><div class="period">${esc(item.period)}</div></div>${item.summary ? `<div class="description">${lines(item.summary)}</div>` : ''}</article>`
  if (section === 'projects') return `<article class="resume-item ${variant}"><div class="item-head"><h3>${esc(item.name)}</h3><div class="period">${esc(item.tech)}</div></div>${item.description ? `<div class="description">${lines(item.description)}</div>` : ''}</article>`
  if (section === 'education') return `<article class="resume-item ${variant}"><div class="item-head"><div><h3>${esc(item.degree)}</h3><div class="organization">${esc(item.school)}</div></div><div class="period">${esc(item.period)}</div></div>${item.score ? `<div class="description">${esc(item.score)}</div>` : ''}</article>`
  if (section === 'skills') return `<article class="skill-row ${variant}"><strong>${esc(item.name)}</strong><span>${esc(item.level)}</span></article>`
  if (section === 'certifications') return `<article class="simple-row ${variant}"><strong>${esc(item.name)}</strong><span>${esc(item.year)}</span></article>`
  if (section === 'languages') return `<article class="simple-row ${variant}"><strong>${esc(item.name)}</strong><span>${esc(item.level)}</span></article>`
  return `<span class="tag">${esc(item.name)}</span>`
}

const renderSection = (resume, key, design) => {
  const settings = design.sectionSettings[key] || { title: SECTION_META[key]?.label || key, variant: 'standard' }
  const items = resume.data.sections[key] || []
  if (settings.hidden || items.length === 0) return ''
  return `<section class="resume-section section-${key}"><div class="section-title"><span>${esc(settings.title)}</span></div><div class="section-content ${settings.variant || 'standard'}">${items.map(item => renderItem(key, item, settings.variant || 'standard')).join('')}</div></section>`
}

export const getMergedDesign = resume => {
  const preset = TEMPLATE_PRESETS.find(item => item.id === resume?.design?.template)
  return {
    ...DEFAULT_DESIGN,
    ...(preset?.patch || {}),
    ...(resume?.design || {}),
    sectionOrder: resume?.design?.sectionOrder || DEFAULT_DESIGN.sectionOrder,
    sectionSettings: { ...DEFAULT_DESIGN.sectionSettings, ...(resume?.design?.sectionSettings || {}) },
  }
}

export const renderFullResumeHtml = resume => {
  if (!resume) return '<!doctype html><html><body></body></html>'
  const design = getMergedDesign(resume)
  const basics = resume.data.basics || {}
  const order = design.sectionOrder.filter(key => SECTION_META[key])
  const sideKeys = ['skills', 'education', 'certifications', 'languages', 'interests']
  const main = order.filter(key => !sideKeys.includes(key)).map(key => renderSection(resume, key, design)).join('')
  const side = order.filter(key => sideKeys.includes(key)).map(key => renderSection(resume, key, design)).join('')
  const all = order.map(key => renderSection(resume, key, design)).join('')
  const photo = design.showPhoto && design.photoUrl ? `<img class="profile-photo" src="${esc(design.photoUrl)}" alt="" />` : ''
  const twoColumn = design.layout === 'two-column'
  const body = twoColumn
    ? `<div class="columns ${design.sidebarSide === 'right' ? 'sidebar-right' : ''}"><aside>${side}</aside><main>${main}</main></div>`
    : `<main>${all}</main>`

  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  @page { size: A4; margin: ${design.pageMargin}px; }
  * { box-sizing: border-box; }
  html, body { margin: 0; padding: 0; background: #fff; }
  body { color: ${design.textColor}; font-family: ${design.fontFamily}; font-size: ${design.fontSize}px; line-height: ${design.lineHeight}; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .resume-page { width: 210mm; min-height: 297mm; margin: 0 auto; padding: ${design.pageMargin}px; background: #fff; overflow: hidden; }
  @media print { .resume-page { width: auto; min-height: auto; padding: 0; overflow: visible; } }
  .resume-header { display: flex; align-items: ${design.headerAlign === 'center' ? 'center' : 'flex-start'}; flex-direction: ${design.headerAlign === 'center' ? 'column' : 'row'}; gap: 16px; text-align: ${design.headerAlign}; padding-bottom: 15px; margin-bottom: ${design.sectionSpacing}px; border-bottom: 2px solid ${design.accentColor}; }
  .profile-photo { width: 72px; height: 72px; object-fit: cover; border-radius: 3px; filter: grayscale(15%); }
  .identity { flex: 1; }
  h1 { margin: 0; color: ${design.primaryColor}; font-family: ${design.headingFont}; font-size: ${design.nameSize}px; line-height: 1.05; letter-spacing: -0.035em; font-weight: 750; }
  .headline { margin-top: 5px; color: ${design.accentColor}; font-size: 1.12em; font-weight: 650; letter-spacing: .02em; }
  .contact { display: flex; flex-wrap: wrap; justify-content: ${design.headerAlign === 'center' ? 'center' : 'flex-start'}; gap: 3px 13px; margin-top: 9px; color: #4b5563; font-size: .88em; }
  .contact span + span::before { content: '•'; color: ${design.accentColor}; margin-right: 13px; }
  .summary { margin: 0 0 ${design.sectionSpacing}px; color: #374151; font-size: 1.02em; }
  .columns { display: grid; grid-template-columns: ${design.sidebarWidth}% 1fr; gap: 26px; }
  .columns.sidebar-right { grid-template-columns: 1fr ${design.sidebarWidth}%; }
  .columns.sidebar-right aside { order: 2; }
  .columns.sidebar-right main { order: 1; }
  aside { padding-right: 20px; border-right: 1px solid #d1d5db; }
  .sidebar-right aside { padding-right: 0; padding-left: 20px; border-right: 0; border-left: 1px solid #d1d5db; }
  .resume-section { margin-bottom: ${design.sectionSpacing}px; break-inside: avoid; }
  .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: ${design.primaryColor}; font-family: ${design.headingFont}; font-size: 1.08em; font-weight: 800; text-transform: uppercase; letter-spacing: .11em; }
  .section-title::after { content: ''; flex: 1; height: 1px; background: color-mix(in srgb, ${design.accentColor} 45%, white); }
  .resume-item { margin-bottom: ${design.itemSpacing}px; break-inside: avoid; }
  .resume-item:last-child, .simple-row:last-child, .skill-row:last-child { margin-bottom: 0; }
  .item-head { display: flex; align-items: baseline; justify-content: space-between; gap: 14px; }
  .item-head h3 { margin: 0; color: ${design.primaryColor}; font-size: 1.03em; line-height: 1.35; font-weight: 750; }
  .organization { color: ${design.accentColor}; font-weight: 650; }
  .period { color: #6b7280; font-size: .88em; text-align: right; white-space: nowrap; }
  .description { margin-top: 3px; color: #374151; }
  .section-content.timeline .resume-item { border-left: 2px solid ${design.accentColor}; padding-left: 10px; }
  .section-content.compact .resume-item { margin-bottom: 6px; }
  .skill-row, .simple-row { display: flex; flex-direction: column; gap: 1px; margin-bottom: ${Math.max(5, design.itemSpacing - 2)}px; }
  .skill-row strong, .simple-row strong { color: ${design.primaryColor}; }
  .skill-row span, .simple-row span { color: #4b5563; }
  .tag { display: inline-block; margin: 0 5px 5px 0; padding: 2px 7px; color: ${design.primaryColor}; background: color-mix(in srgb, ${design.accentColor} 10%, white); border: 1px solid color-mix(in srgb, ${design.accentColor} 25%, white); border-radius: 2px; }
  ${design.template === 'editorial' ? `.section-title { text-transform:none; letter-spacing:0; font-size:1.35em; font-style:italic; } .resume-header { border-bottom-width:1px; }` : ''}
  ${design.template === 'nordic' ? `.section-title::after { display:none; } .section-title { letter-spacing:.16em; }` : ''}
  ${design.template === 'compact' ? `.description { text-align:justify; } .resume-header { padding-bottom:10px; }` : ''}
  ${design.customCSS || ''}
</style></head>
<body><div class="resume-page">
  <header class="resume-header">${photo}<div class="identity"><h1>${esc(basics.fullName || 'Your name')}</h1><div class="headline">${esc(basics.title)}</div><div class="contact">${contact(basics)}</div></div></header>
  ${basics.summary ? `<div class="summary">${lines(basics.summary)}</div>` : ''}
  ${body}
</div></body></html>`
}

export const renderThumbnailResumeHtml = resume => renderFullResumeHtml(resume).replace('</style>', '.resume-page{transform-origin:top left}</style>')

export const renderTemplateSkeletonHtml = templateId => {
  const preset = TEMPLATE_PRESETS.find(item => item.id === templateId) || TEMPLATE_PRESETS[0]
  const sample = { data: { basics: { fullName: '{{fullName}}', title: '{{title}}', email: '{{email}}', phone: '{{phone}}', location: '{{location}}', website: '{{website}}', linkedin: '{{linkedin}}', summary: '{{summary}}' }, sections: Object.fromEntries(Object.keys(SECTION_META).map(key => [key, []])) }, design: { ...DEFAULT_DESIGN, ...preset.patch, template: templateId } }
  return renderFullResumeHtml(sample)
}
