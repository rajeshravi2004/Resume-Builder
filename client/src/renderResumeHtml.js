import { DEFAULT_DESIGN, SECTION_META } from './store'

export const TEMPLATE_PRESETS = [
  { id: 'executive', name: 'Executive', description: 'Confident typography with a restrained accent.', category: 'Professional', patch: { primaryColor: '#172554', accentColor: '#c2410c', textColor: '#1f2937', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Inter, Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 10.5, nameSize: 33 } },
  { id: 'iconic', name: 'Iconic', description: 'Real contact and section icons for portfolio-forward resumes.', category: 'Modern', patch: { primaryColor: '#14213d', accentColor: '#0a66c2', textColor: '#1f2937', fontFamily: 'Inter, Arial, sans-serif', headingFont: 'Inter, Arial, sans-serif', layout: 'one-column', headerAlign: 'left', fontSize: 10.3, nameSize: 33, sectionSpacing: 15, itemSpacing: 9, contactIcons: true, sectionIcons: true } },
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

const iconSvg = {
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#ea4335" d="M3 6.8A2.8 2.8 0 0 1 5.8 4h12.4A2.8 2.8 0 0 1 21 6.8v10.4a2.8 2.8 0 0 1-2.8 2.8H5.8A2.8 2.8 0 0 1 3 17.2V6.8Z"/><path fill="#fff" d="M5.4 7.1v10.1h13.2V7.1L12 12.2 5.4 7.1Z"/><path fill="#fbbc04" d="M5.4 7.1 12 12.2 5.4 17.2V7.1Z"/><path fill="#34a853" d="M18.6 7.1 12 12.2l6.6 5V7.1Z"/><path fill="#4285f4" d="M5.4 7.1 12 12.2l6.6-5H5.4Z"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.4 3.8 9.5 8c.3.6.2 1.3-.3 1.8l-1.1 1.1a13 13 0 0 0 5 5l1.1-1.1c.5-.5 1.2-.6 1.8-.3l4.2 2.1c.7.3 1 1.1.8 1.8l-.7 2.2c-.2.7-.9 1.1-1.6 1.1A16.4 16.4 0 0 1 2.3 5.3c0-.7.4-1.4 1.1-1.6l2.2-.7c.7-.2 1.5.1 1.8.8Z"/></svg>',
  location: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a7 7 0 0 0-7 7c0 5.2 7 12 7 12s7-6.8 7-12a7 7 0 0 0-7-7Zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5Z"/></svg>',
  portfolio: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Zm2.5-.2a.2.2 0 0 0-.2.2v3h11.4v-3a.2.2 0 0 0-.2-.2h-11Zm-.2 5.5v7.7c0 .1.1.2.2.2h11c.1 0 .2-.1.2-.2v-7.7H6.3Z"/></svg>',
  linkedin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#0a66c2" d="M4.98 3.5a2.48 2.48 0 1 1 0 4.96 2.48 2.48 0 0 1 0-4.96ZM3 9h4v12H3V9Zm6.3 0h3.8v1.7h.1c.5-1 1.8-2 3.7-2 4 0 4.7 2.6 4.7 6V21h-4v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z"/></svg>',
  github: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a9.7 9.7 0 0 0-3.1 18.9c.5.1.7-.2.7-.5v-1.8c-2.9.6-3.5-1.2-3.5-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.6 1.1 1.6 1.1.9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.3-.3-4.7-1.1-4.7-5a3.9 3.9 0 0 1 1-2.7c-.1-.3-.4-1.4.1-2.8 0 0 .9-.3 2.8 1a9.6 9.6 0 0 1 5.1 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.5.1 2.8.7.8 1 1.7 1 2.7 0 3.9-2.4 4.7-4.7 5 .4.3.7.9.7 1.8v2.7c0 .3.2.6.7.5A9.7 9.7 0 0 0 12 2.5Z"/></svg>',
  experience: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 6V5a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1h2.5A2.5 2.5 0 0 1 21 8.5v9A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5v-9A2.5 2.5 0 0 1 5.5 6H8Zm2 0h4V5a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v1Z"/></svg>',
  projects: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6a3 3 0 0 1 3-3h3.5l2 2H18a3 3 0 0 1 3 3v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V6Z"/></svg>',
  education: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 2 8l10 5 8-4v6h2V8L12 3Zm-6 9v3.2c0 1.8 2.7 3.8 6 3.8s6-2 6-3.8V12l-6 3-6-3Z"/></svg>',
  skills: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.2 5.8L20 10l-5.8 2.2L12 18l-2.2-5.8L4 10l5.8-2.2L12 2Zm6.5 12 1.1 2.9 2.9 1.1-2.9 1.1-1.1 2.9-1.1-2.9-2.9-1.1 2.9-1.1 1.1-2.9Z"/></svg>',
  certifications: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 2.2 2.1 3-.4.5 3 2.7 1.5-1.4 2.8 1.4 2.8-2.7 1.5-.5 3-3-.4L12 20l-2.2-2.1-3 .4-.5-3-2.7-1.5L5 11 3.6 8.2l2.7-1.5.5-3 3 .4L12 2Zm-1 12.3 5-5-1.4-1.4L11 11.5 9.4 9.9 8 11.3l3 3Z"/></svg>',
  languages: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h9a3 3 0 0 1 3 3v2h1a3 3 0 0 1 3 3v8l-3.3-2H11a3 3 0 0 1-3-3v-1H4a3 3 0 0 1-3-3V4h3Zm8.2 3H10l-.5 1.3H7.8L7.3 7H5.1l2.7 6h1.9l2.5-6Zm2.8 4h-5v2h5v-2Z"/></svg>',
  interests: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-4.9-8-11.2A4.8 4.8 0 0 1 12 6a4.8 4.8 0 0 1 8 3.8C20 16.1 12 21 12 21Z"/></svg>',
}

const contact = (basics, design) => [
  { key: 'email', value: basics.email },
  { key: 'phone', value: basics.phone },
  { key: 'location', value: basics.location },
  { key: 'linkedin', value: basics.linkedin },
  { key: 'github', value: basics.github },
  { key: 'portfolio', value: basics.website },
].filter(item => item.value).map(item => {
  const icon = design.contactIcons ? `<span class="contact-icon contact-icon-${item.key}">${iconSvg[item.key]}</span>` : ''
  return `<span class="contact-item contact-${item.key}">${icon}<span>${esc(item.value)}</span></span>`
}).join('')

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
  const icon = design.sectionIcons ? `<span class="section-icon-mark section-icon-${key}">${iconSvg[key] || ''}</span>` : ''
  return `<section class="resume-section section-${key}"><div class="section-title">${icon}<span>${esc(settings.title)}</span></div><div class="section-content ${settings.variant || 'standard'}">${items.map(item => renderItem(key, item, settings.variant || 'standard')).join('')}</div></section>`
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
  .contact { display: flex; flex-wrap: wrap; justify-content: ${design.headerAlign === 'center' ? 'center' : 'flex-start'}; gap: ${design.contactIcons ? '5px 10px' : '3px 13px'}; margin-top: 9px; color: #4b5563; font-size: .88em; }
  .contact-item { display: inline-flex; align-items: center; gap: 4px; }
  .contact-icon { display: inline-flex; width: 11px; height: 11px; flex: 0 0 11px; align-items: center; justify-content: center; color: ${design.accentColor}; }
  .contact-icon svg { width: 100%; height: 100%; display: block; fill: currentColor; }
  .contact span + span::before { ${design.contactIcons ? 'content: none;' : `content: '•'; color: ${design.accentColor}; margin-right: 13px;`} }
  .summary { margin: 0 0 ${design.sectionSpacing}px; color: #374151; font-size: 1.02em; }
  .columns { display: grid; grid-template-columns: ${design.sidebarWidth}% 1fr; gap: 26px; }
  .columns.sidebar-right { grid-template-columns: 1fr ${design.sidebarWidth}%; }
  .columns.sidebar-right aside { order: 2; }
  .columns.sidebar-right main { order: 1; }
  aside { padding-right: 20px; border-right: 1px solid #d1d5db; }
  .sidebar-right aside { padding-right: 0; padding-left: 20px; border-right: 0; border-left: 1px solid #d1d5db; }
  .resume-section { margin-bottom: ${design.sectionSpacing}px; break-inside: avoid; }
  .section-title { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: ${design.primaryColor}; font-family: ${design.headingFont}; font-size: 1.08em; font-weight: 800; text-transform: uppercase; letter-spacing: .11em; }
  .section-icon-mark { display: inline-flex; width: 16px; height: 16px; flex: 0 0 16px; align-items: center; justify-content: center; border-radius: 3px; background: color-mix(in srgb, ${design.accentColor} 12%, white); color: ${design.accentColor}; }
  .section-icon-mark svg { width: 11px; height: 11px; fill: currentColor; }
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
  ${design.template === 'iconic' ? `.resume-header { border-bottom-width: 1px; } .contact { padding-top: 1px; } .contact-item { padding: 2px 6px 2px 0; color: #344054; } .contact-github .contact-icon svg { fill: #181717; } .section-title { letter-spacing: .08em; } .section-title::after { background: color-mix(in srgb, ${design.accentColor} 28%, white); } .item-head h3 { font-size: 1em; }` : ''}
  ${design.customCSS || ''}
</style></head>
<body><div class="resume-page">
  <header class="resume-header">${photo}<div class="identity"><h1>${esc(basics.fullName || 'Your name')}</h1><div class="headline">${esc(basics.title)}</div><div class="contact">${contact(basics, design)}</div></div></header>
  ${basics.summary ? `<div class="summary">${lines(basics.summary)}</div>` : ''}
  ${body}
</div></body></html>`
}

export const renderThumbnailResumeHtml = resume => renderFullResumeHtml(resume).replace('</style>', '.resume-page{transform-origin:top left}</style>')

export const getResumeStyles = (resume, { includeCustom = true } = {}) => {
  if (!resume) return ''
  const source = includeCustom
    ? resume
    : { ...resume, design: { ...(resume.design || {}), customCSS: '' } }
  return renderFullResumeHtml(source).match(/<style>([\s\S]*?)<\/style>/)?.[1]?.trim() || ''
}

export const renderTemplateSkeletonHtml = templateId => {
  const preset = TEMPLATE_PRESETS.find(item => item.id === templateId) || TEMPLATE_PRESETS[0]
  const sample = { data: { basics: { fullName: '{{fullName}}', title: '{{title}}', email: '{{email}}', phone: '{{phone}}', location: '{{location}}', website: '{{website}}', linkedin: '{{linkedin}}', github: '{{github}}', summary: '{{summary}}' }, sections: Object.fromEntries(Object.keys(SECTION_META).map(key => [key, []])) }, design: { ...DEFAULT_DESIGN, ...preset.patch, template: templateId } }
  return renderFullResumeHtml(sample)
}
