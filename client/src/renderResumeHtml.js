const baseStyleFull = (template, customTemplate) => `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${customTemplate.fontFamily || 'Inter, system-ui, Arial'}; 
      color: #111; 
      padding: 40px;
      max-width: 820px;
      margin: 0 auto;
      line-height: 1.6;
      background: white;
      ${customTemplate.customCSS || ''}
    }
    .header { 
      border-bottom: 3px solid ${customTemplate.accentColor || '#2563eb'}; 
      padding-bottom: 16px; 
      margin-bottom: 20px; 
    }
    .name { 
      color: ${customTemplate.primaryColor || '#1e40af'}; 
      font-size: 32px; 
      font-weight: 700; 
      margin-bottom: 8px;
    }
    .title { 
      color: #666; 
      font-size: 18px; 
      margin-bottom: 12px;
    }
    .contact { 
      font-size: 14px; 
      color: #555; 
      margin-top: 8px;
    }
    .section { 
      margin-top: 24px; 
    }
    .section h3 { 
      color: ${customTemplate.primaryColor || '#1e40af'}; 
      margin: 0 0 12px 0; 
      font-size: 20px;
      font-weight: 600;
      text-transform: ${template === 'elegant' ? 'uppercase' : 'none'};
      letter-spacing: ${template === 'elegant' ? '0.5px' : '0'};
    }
    .item { 
      border-left: 3px solid ${customTemplate.accentColor || '#2563eb'}; 
      padding-left: 16px; 
      margin: 12px 0; 
    }
    .item strong { 
      font-weight: 600; 
      display: block;
      margin-bottom: 4px;
    }
    .item-title { 
      font-weight: 600; 
      font-size: 16px;
      margin-bottom: 4px;
    }
    .item-meta { 
      color: #666; 
      font-size: 14px; 
      margin-bottom: 8px;
    }
    .item-content { 
      color: #555; 
      font-size: 14px;
      line-height: 1.5;
    }
    .skills-list { 
      display: flex; 
      flex-wrap: wrap; 
      gap: 8px; 
      margin-top: 8px;
    }
    .skill-tag { 
      border: 1px solid #ddd; 
      padding: 6px 12px; 
      border-radius: 6px; 
      font-size: 13px;
      background: #f9fafb;
    }
    .summary { 
      font-size: 15px; 
      color: #555; 
      line-height: 1.6;
      margin-top: 8px;
    }
    ${customTemplate.customCSS || ''}
  </style>`

const baseStyleThumbnail = (template, customTemplate) => `
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: ${customTemplate.fontFamily || 'Inter, system-ui, Arial'}; 
      color: #111; 
      font-size: 10px;
      padding: 12px;
      line-height: 1.4;
    }
    .header { border-bottom: 2px solid ${customTemplate.accentColor || '#2563eb'}; padding-bottom: 6px; margin-bottom: 8px; }
    .name { color: ${customTemplate.primaryColor || '#1e40af'}; font-size: 14px; font-weight: 700; margin-bottom: 2px; }
    .title { color: #666; font-size: 9px; margin-bottom: 4px; }
    .contact { font-size: 8px; color: #555; }
    .section { margin-top: 10px; }
    .section h3 { color: ${customTemplate.primaryColor || '#1e40af'}; margin: 0 0 4px 0; font-size: 11px; font-weight: 600; }
    .item { border-left: 2px solid ${customTemplate.accentColor || '#2563eb'}; padding-left: 6px; margin: 4px 0; font-size: 9px; }
    .item strong { font-weight: 600; }
    .summary { font-size: 9px; color: #555; margin-top: 4px; }
  </style>`

const replaceAllTokens = (input, map) => {
  let output = input
  for (const [token, value] of Object.entries(map)) {
    if (!token) continue
    output = output.split(token).join(value ?? '')
  }
  return output
}

const repeatSection = (html, sectionKey, items, renderItem) => {
  if (!Array.isArray(items) || items.length === 0) return html
  const startToken = `{{#${sectionKey}}}`
  const endToken = `{{/${sectionKey}}}`
  const start = html.indexOf(startToken)
  const end = html.indexOf(endToken)
  if (start === -1 || end === -1 || end <= start) return html
  const before = html.slice(0, start)
  const after = html.slice(end + endToken.length)
  const block = html.slice(start + startToken.length, end)
  const rendered = items.map(item => renderItem(block, item)).join('')
  return before + rendered + after
}

const mapItems = (list, formatter, limit) => {
  const slice = typeof limit === 'number' ? list.slice(0, limit) : list
  return slice.map(formatter).join('')
}

const buildBasics = (resume, opts) => {
  const summaryLimit = opts?.summaryLimit
  const fullName = resume.basics.fullName || ''
  const title = resume.basics.title || ''
  const email = resume.basics.email || ''
  const phone = resume.basics.phone || ''
  const location = resume.basics.location || ''
  const website = resume.basics.website || ''

  let summary = resume.basics.summary || ''
  if (summaryLimit && summary.length > summaryLimit) {
    summary = `${summary.substring(0, summaryLimit)}...`
  }

  const basics = `
    <div class="header">
      <div class="name">${fullName}</div>
      <div class="title">${title}</div>
      <div class="contact">
        ${email}
        ${phone ? ' | ' + phone : ''}
        ${location ? ' | ' + location : ''}
        ${website ? ' | ' + website : ''}
      </div>
    </div>
    ${summary ? `<div class="summary">${summary}</div>` : ''}
  `
  return basics
}

const renderUploadedTemplateHtml = resume => {
  let html = resume.uploadedTemplateHtml || ''
  if (!html) return ''

  html = repeatSection(
    html,
    'experience',
    resume.sections.experience,
    (block, item) =>
      replaceAllTokens(block, {
        '{{role}}': item.role || '',
        '{{company}}': item.company || '',
        '{{period}}': item.period || '',
        '{{summary}}': item.summary || '',
      }),
  )

  html = repeatSection(
    html,
    'projects',
    resume.sections.projects,
    (block, item) =>
      replaceAllTokens(block, {
        '{{name}}': item.name || '',
        '{{tech}}': item.tech || '',
        '{{description}}': item.description || '',
      }),
  )

  html = repeatSection(
    html,
    'education',
    resume.sections.education,
    (block, item) =>
      replaceAllTokens(block, {
        '{{degree}}': item.degree || '',
        '{{school}}': item.school || '',
        '{{period}}': item.period || '',
        '{{score}}': item.score || '',
      }),
  )

  html = repeatSection(
    html,
    'skills',
    resume.sections.skills,
    (block, item) =>
      replaceAllTokens(block, {
        '{{name}}': item.name || '',
        '{{level}}': item.level || '',
      }),
  )

  html = repeatSection(
    html,
    'certifications',
    resume.sections.certifications,
    (block, item) =>
      replaceAllTokens(block, {
        '{{name}}': item.name || '',
        '{{year}}': item.year || '',
      }),
  )

  html = repeatSection(
    html,
    'languages',
    resume.sections.languages,
    (block, item) =>
      replaceAllTokens(block, {
        '{{name}}': item.name || '',
        '{{level}}': item.level || '',
      }),
  )

  html = repeatSection(
    html,
    'interests',
    resume.sections.interests,
    (block, item) =>
      replaceAllTokens(block, {
        '{{name}}': item.name || '',
      }),
  )

  html = replaceAllTokens(html, {
    '{{fullName}}': resume.basics.fullName || '',
    '{{title}}': resume.basics.title || '',
    '{{email}}': resume.basics.email || '',
    '{{phone}}': resume.basics.phone || '',
    '{{location}}': resume.basics.location || '',
    '{{website}}': resume.basics.website || '',
    '{{summary}}': resume.basics.summary || '',
  })

  return html
}

const buildSections = (resume, opts = {}) => {
  const { mode = 'full', sectionLayouts = {} } = opts
  const maxExperience = mode === 'thumbnail' ? 2 : undefined
  const maxEducation = mode === 'thumbnail' ? 1 : undefined
  const maxSkills = mode === 'thumbnail' ? 3 : undefined

  const experienceCfg = sectionLayouts.experience || {}
  const projectsCfg = sectionLayouts.projects || {}
  const educationCfg = sectionLayouts.education || {}
  const skillsCfg = sectionLayouts.skills || {}
  const certificationsCfg = sectionLayouts.certifications || {}
  const languagesCfg = sectionLayouts.languages || {}
  const interestsCfg = sectionLayouts.interests || {}

  const experienceHidden = mode === 'full' && experienceCfg.hidden
  const projectsHidden = mode === 'full' && projectsCfg.hidden
  const educationHidden = mode === 'full' && educationCfg.hidden
  const skillsHidden = mode === 'full' && skillsCfg.hidden
  const certificationsHidden = mode === 'full' && certificationsCfg.hidden
  const languagesHidden = mode === 'full' && languagesCfg.hidden
  const interestsHidden = mode === 'full' && interestsCfg.hidden

  const experienceTitle = experienceCfg.title || 'Experience'
  const projectsTitle = projectsCfg.title || 'Projects'
  const educationTitle = educationCfg.title || 'Education'
  const skillsTitle = skillsCfg.title || 'Skills'
  const certificationsTitle = certificationsCfg.title || 'Certifications'
  const languagesTitle = languagesCfg.title || 'Languages'
  const interestsTitle = interestsCfg.title || 'Interests'

  const experienceVariant = experienceCfg.variant || 'cards'
  const projectsVariant = projectsCfg.variant || 'cards'
  const educationVariant = educationCfg.variant || 'cards'
  const skillsVariant = skillsCfg.variant || 'tags'
  const certificationsVariant = certificationsCfg.variant || 'cards'
  const languagesVariant = languagesCfg.variant || 'list'
  const interestsVariant = interestsCfg.variant || 'tags'

  const experience =
    resume.sections.experience.length > 0 && !experienceHidden
      ? `
    <div class="section">
      <h3>${experienceTitle}</h3>
      ${
        experienceVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.experience,
          e => `
          <li class="item">
            <span class="item-title">${e.role || ''}</span> — <span class="item-meta">${e.company || ''}${
              e.period ? ' • ' + e.period : ''
            }</span>
            ${
              mode === 'full' && e.summary
                ? `<div class="item-content">${e.summary}</div>`
                : ''
            }
          </li>
        `,
          maxExperience,
        )}
      </ul>`
          : experienceVariant === 'paragraph'
            ? mapItems(
                resume.sections.experience,
                e => `
        <div class="item">
          <strong>${e.role || ''} at ${e.company || ''}</strong> ${e.period ? ' — ' + e.period : ''}
          ${mode === 'full' && e.summary ? `<div class="item-content">${e.summary}</div>` : ''}
        </div>
      `,
                maxExperience,
              )
            : mapItems(
                resume.sections.experience,
                e => `
        <div class="item">
          <div class="item-title">${e.role || ''}</div>
          <div class="item-meta">${e.company || ''} — ${e.period || ''}</div>
          ${
            mode === 'full'
              ? `<div class="item-content">${e.summary || ''}</div>`
              : `<div class="item-content">${(e.summary || '').substring(0, 60)}...</div>`
          }
        </div>
      `,
                maxExperience,
              )
      }
    </div>`
      : ''

  const projects =
    mode === 'full' && resume.sections.projects.length > 0 && !projectsHidden
      ? `
    <div class="section">
      <h3>${projectsTitle}</h3>
      ${
        projectsVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.projects,
          p => `
          <li class="item">
            <span class="item-title">${p.name || ''}</span>
            ${p.tech ? `<span class="item-meta"> — ${p.tech}</span>` : ''}
            ${p.description ? `<div class="item-content">${p.description}</div>` : ''}
          </li>
        `,
        )}
      </ul>`
          : projectsVariant === 'paragraph'
            ? mapItems(
                resume.sections.projects,
                p => `
        <div class="item">
          <strong>${p.name || ''}</strong> ${p.tech ? ' — ' + p.tech : ''}
          ${p.description ? `<div class="item-content">${p.description}</div>` : ''}
        </div>
      `,
              )
            : mapItems(
                resume.sections.projects,
                p => `
        <div class="item">
          <div class="item-title">${p.name || ''}</div>
          <div class="item-meta">${p.tech || ''}</div>
          <div class="item-content">${p.description || ''}</div>
        </div>
      `,
              )
      }
    </div>`
      : ''

  const education =
    resume.sections.education.length > 0 && !educationHidden
      ? `
    <div class="section">
      <h3>${educationTitle}</h3>
      ${
        educationVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.education,
          e => `
          <li class="item">
            <span class="item-title">${e.degree || ''}</span>, <span class="item-meta">${e.school || ''}${
              e.period ? ' — ' + e.period : ''
            }${e.score ? ' (' + e.score + ')' : ''}</span>
          </li>
        `,
          maxEducation,
        )}
      </ul>`
          : mapItems(
              resume.sections.education,
              e => `
        <div class="item">
          <div class="item-title">${e.degree || ''}</div>
          <div class="item-meta">${e.school || ''} — ${e.period || ''}${e.score ? ' (' + e.score + ')' : ''}</div>
        </div>
      `,
              maxEducation,
            )
      }
    </div>`
      : ''

  const skills =
    resume.sections.skills.length > 0 && !skillsHidden
      ? `
    <div class="section">
      <h3>${skillsTitle}</h3>
      ${
        skillsVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.skills,
          s => `
          <li class="item">
            <span class="item-title">${s.name || ''}</span>${s.level ? ' — ' + s.level : ''}
          </li>
        `,
          maxSkills,
        )}
      </ul>`
          : skillsVariant === 'paragraph'
            ? `<div class="item-content">
        ${mapItems(
          resume.sections.skills,
          s => `${s.name || ''}${s.level ? ' (' + s.level + ')' : ''}`,
          maxSkills,
        )}
      </div>`
            : `<div class="skills-list">
        ${mapItems(
          resume.sections.skills,
          s => `
          <span class="skill-tag">${s.name || ''}${s.level ? ' (' + s.level + ')' : ''}</span>
        `,
        )}
      </div>`
      }
    </div>`
      : ''

  const certifications =
    mode === 'full' && resume.sections.certifications.length > 0 && !certificationsHidden
      ? `
    <div class="section">
      <h3>${certificationsTitle}</h3>
      ${
        certificationsVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.certifications,
          c => `
          <li class="item">
            <span class="item-title">${c.name || ''}</span>${c.year ? ' — ' + c.year : ''}
          </li>
        `,
        )}
      </ul>`
          : mapItems(
              resume.sections.certifications,
              c => `
        <div class="item">
          <div class="item-title">${c.name || ''}</div>
          <div class="item-meta">${c.year || ''}</div>
        </div>
      `,
            )
      }
    </div>`
      : ''

  const languages =
    mode === 'full' && resume.sections.languages.length > 0 && !languagesHidden
      ? `
    <div class="section">
      <h3>${languagesTitle}</h3>
      ${
        languagesVariant === 'tags'
          ? `<div class="skills-list">
        ${mapItems(
          resume.sections.languages,
          l => `
          <span class="skill-tag">${l.name || ''}${l.level ? ' (' + l.level + ')' : ''}</span>
        `,
        )}
      </div>`
          : `<ul>
        ${mapItems(
          resume.sections.languages,
          l => `
          <li class="item">
            <span class="item-title">${l.name || ''}</span>${l.level ? ' — ' + l.level : ''}
          </li>
        `,
        )}
      </ul>`
      }
    </div>`
      : ''

  const interests =
    mode === 'full' && resume.sections.interests.length > 0 && !interestsHidden
      ? `
    <div class="section">
      <h3>${interestsTitle}</h3>
      ${
        interestsVariant === 'list'
          ? `<ul>
        ${mapItems(
          resume.sections.interests,
          i => `
          <li class="item">
            <span class="item-title">${i.name || ''}</span>
          </li>
        `,
        )}
      </ul>`
          : `<div class="skills-list">
        ${mapItems(
          resume.sections.interests,
          i => `
          <span class="skill-tag">${i.name || ''}</span>
        `,
        )}
      </div>`
      }
    </div>`
      : ''

  return {
    experience,
    projects,
    education,
    skills,
    certifications,
    languages,
    interests,
  }
}

export const renderTemplateSkeletonHtml = (template) => {
  const defaultCustomTemplate = {
    primaryColor: '#1e40af',
    accentColor: '#2563eb',
    fontFamily: 'Inter, system-ui, Arial',
    customCSS: '',
  }

  const style = baseStyleFull(template, defaultCustomTemplate)

  const basics = `
    <div class="header">
      <div class="name">{{fullName}}</div>
      <div class="title">{{title}}</div>
      <div class="contact">
        {{email}} {{phone}} {{location}} {{website}}
      </div>
    </div>
    {{summary}}
  `

  const experience = `
    <div class="section">
      <h3>Experience</h3>
      {{#experience}}
      <div class="item">
        <div class="item-title">{{role}}</div>
        <div class="item-meta">{{company}} — {{period}}</div>
        <div class="item-content">{{summary}}</div>
      </div>
      {{/experience}}
    </div>
  `

  const projects = `
    <div class="section">
      <h3>Projects</h3>
      {{#projects}}
      <div class="item">
        <div class="item-title">{{name}}</div>
        <div class="item-meta">{{tech}}</div>
        <div class="item-content">{{description}}</div>
      </div>
      {{/projects}}
    </div>
  `

  const education = `
    <div class="section">
      <h3>Education</h3>
      {{#education}}
      <div class="item">
        <div class="item-title">{{degree}}</div>
        <div class="item-meta">{{school}} — {{period}} {{score}}</div>
      </div>
      {{/education}}
    </div>
  `

  const skills = `
    <div class="section">
      <h3>Skills</h3>
      <div class="skills-list">
        {{#skills}}
        <span class="skill-tag">{{name}} {{level}}</span>
        {{/skills}}
      </div>
    </div>
  `

  const certifications = `
    <div class="section">
      <h3>Certifications</h3>
      {{#certifications}}
      <div class="item">
        <div class="item-title">{{name}}</div>
        <div class="item-meta">{{year}}</div>
      </div>
      {{/certifications}}
    </div>
  `

  const languages = `
    <div class="section">
      <h3>Languages</h3>
      {{#languages}}
      <div class="item">
        <div class="item-title">{{name}}</div>
        <div class="item-meta">{{level}}</div>
      </div>
      {{/languages}}
    </div>
  `

  const interests = `
    <div class="section">
      <h3>Interests</h3>
      <div class="skills-list">
        {{#interests}}
        <span class="skill-tag">{{name}}</span>
        {{/interests}}
      </div>
    </div>
  `

  let base = `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name="viewport" content="width=device-width, initial-scale=1"/>${style}</head><body>
    ${basics}
    ${experience}
    ${projects}
    ${education}
    ${skills}
    ${certifications}
    ${languages}
    ${interests}
  </body></html>`

  if (template === 'classic') return base
  if (template === 'minimal') {
    return base.replace('<body>', `<body style="font-size:13px; line-height:1.5">`)
  }
  if (template === 'modern') {
    return base.replace('<body>', `<body style="max-width:820px; margin:0 auto;">`)
  }
  if (template === 'elegant') {
    return base.replace('<style>', `<style> body { letter-spacing: .2px } .name { font-size: 36px }`)
  }
  if (template === 'tech') {
    return base.replace('<style>', `<style> body { background:#fafafa } .item { background:#fff; border:1px solid #eee; padding: 12px; border-radius: 4px; }`)
  }
  return base
}

export const renderFullResumeHtml = (resume) => {
  const { template, customTemplate } = resume

  if (template === 'uploaded' && resume.uploadedTemplateHtml) {
    const uploaded = renderUploadedTemplateHtml(resume)
    if (uploaded) return uploaded
  }
  const style = baseStyleFull(template, customTemplate || {})

  const basics = buildBasics(resume, {})
  const sections = buildSections(resume, {
    mode: 'full',
    sectionLayouts: template === 'custom' ? customTemplate.sectionLayouts || {} : {},
  })

  const base = `<!DOCTYPE html><html><head><meta charset='utf-8'/><meta name="viewport" content="width=device-width, initial-scale=1"/>${style}</head><body>
    ${basics}
    ${sections.experience}
    ${sections.projects}
    ${sections.education}
    ${sections.skills}
    ${sections.certifications}
    ${sections.languages}
    ${sections.interests}
  </body></html>`

  if (template === 'classic') return base
  if (template === 'minimal') {
    return base.replace('<body>', `<body style="font-size:13px; line-height:1.5">`)
  }
  if (template === 'modern') {
    return base.replace('<body>', `<body style="max-width:820px; margin:0 auto;">`)
  }
  if (template === 'elegant') {
    return base.replace('<style>', `<style> body { letter-spacing: .2px } .name { font-size: 36px }`)
  }
  if (template === 'tech') {
    return base.replace('<style>', `<style> body { background:#fafafa } .item { background:#fff; border:1px solid #eee; padding: 12px; border-radius: 4px; }`)
  }
  if (template === 'custom') return base
  return base
}

export const renderThumbnailResumeHtml = (resume) => {
  const { template, customTemplate } = resume
  const style = baseStyleThumbnail(template, customTemplate || {})
  const basics = buildBasics(resume, { summaryLimit: 100 })
  const sections = buildSections(resume, { mode: 'thumbnail' })

  const base = `<!DOCTYPE html><html><head><meta charset='utf-8'/>${style}</head><body>
    ${basics}
    ${sections.experience}
    ${sections.education}
    ${sections.skills}
  </body></html>`

  if (template === 'classic') return base
  if (template === 'minimal') return base.replace('<body>', `<body style="font-size:9px; line-height:1.4">`)
  if (template === 'modern') return base.replace('<body>', `<body style="max-width:100%; margin:0 auto;">`)
  if (template === 'elegant') return base.replace('<style>', `<style> body { letter-spacing: .1px } .name { font-size: 15px } .section h3 { text-transform: uppercase; font-size: 10px; }`)
  if (template === 'tech') return base.replace('<style>', `<style> body { background:#fafafa } .item { background:#fff; border:1px solid #eee; padding: 4px 6px; }`)
  if (template === 'custom') return base
  return base
}


